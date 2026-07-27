'use client'

import { createClient }         from '@/lib/supabase/client'
import type { RollEntry }       from '@/hooks/useRollFeed'
import type { PurchaseMeta }    from '@/lib/logRoll'
import { fetchActiveDataset }   from '@/lib/activeDataset'
import { persistCareerSkills }  from '@/lib/characters'

export function useGmPurchaseRefund() {
  const supabase = createClient()

  async function handleRefundPurchase(entry: RollEntry): Promise<void> {
    const meta = entry.roll_meta as PurchaseMeta | null
    if (!meta || meta.refunded || !entry.character_id) return

    // Fetch current character stats for XP restore and stat reversal
    const { data: char } = await supabase
      .from('characters')
      .select('*')
      .eq('id', entry.character_id)
      .single()
    if (!char) return

    // Reverse any stat changes stored in stat_delta (talent purchases only)
    const statReversal: Record<string, number> = {}
    if (meta.stat_delta) {
      for (const [key, delta] of Object.entries(meta.stat_delta)) {
        const current = (char as Record<string, unknown>)[key]
        if (typeof current === 'number') {
          statReversal[key] = current - delta
        }
      }
    }

    const ops: PromiseLike<unknown>[] = [
      // Restore XP and reverse any stat changes
      supabase.from('characters')
        .update({ xp_available: (char.xp_available as number) + meta.xp_cost, ...statReversal })
        .eq('id', entry.character_id),
      // Record the refund in xp_transactions for audit trail
      supabase.from('xp_transactions').insert({
        character_id: entry.character_id,
        amount:       meta.xp_cost,
        reason:       `GM refund: ${entry.roll_label ?? 'purchase'}`,
      }),
      // Mark the roll_log entry as refunded (triggers UPDATE realtime event)
      supabase.from('roll_log')
        .update({ roll_meta: { ...meta, refunded: true } })
        .eq('id', entry.id),
    ]

    // Remove the purchased item from its table
    if (meta.purchase_type === 'skill' && meta.skill_key != null && meta.prev_rank != null) {
      ops.push(
        supabase.from('character_skills')
          .update({ rank: meta.prev_rank })
          .eq('character_id', entry.character_id)
          .eq('skill_key', meta.skill_key)
      )
    } else if (meta.purchase_type === 'talent' && meta.talent_id) {
      ops.push(
        supabase.from('character_talents').delete().eq('id', meta.talent_id)
      )
    } else if (meta.purchase_type === 'force' && meta.force_ability_id) {
      ops.push(
        supabase.from('character_force_abilities').delete().eq('id', meta.force_ability_id)
      )
    } else if (meta.purchase_type === 'specialization' && meta.specialization_key) {
      ops.push((async () => {
        const characterId = entry.character_id as string
        await supabase.from('character_specializations')
          .delete()
          .eq('character_id', characterId)
          .eq('specialization_key', meta.specialization_key)

        // Resync career-skill status: the refunded spec's career skills are
        // revoked UNLESS another still-owned spec (or the career) also grants
        // them — same union invariant as the purchase path, recomputed
        // against the post-delete owned-spec set.
        const ds = await fetchActiveDataset(supabase)
        const [{ data: remainingSpecs }, { data: careerRow }, { data: allSkills }] = await Promise.all([
          supabase.from('character_specializations').select('specialization_key').eq('character_id', characterId),
          supabase.from('ref_careers').select('career_skill_keys').eq('key', char.career_key).eq('dataset_source', ds).maybeSingle(),
          supabase.from('ref_skills').select('key'),
        ])
        const remainingKeys = (remainingSpecs ?? []).map(s => s.specialization_key)
        const { data: specRows } = remainingKeys.length
          ? await supabase.from('ref_specializations').select('career_skill_keys').in('key', remainingKeys).eq('dataset_source', ds)
          : { data: [] as { career_skill_keys: string[] }[] }
        await persistCareerSkills(
          characterId, careerRow?.career_skill_keys, specRows ?? [], (allSkills ?? []).map(s => s.key),
        )
      })())
    }

    try {
      await Promise.all(ops)
    } catch (err) {
      console.error('[useGmPurchaseRefund] refund failed:', err)
      throw err
    }
  }

  return { handleRefundPurchase }
}
