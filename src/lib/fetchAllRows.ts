// ─────────────────────────────────────────────────────────────────────────────
// fetchAllRows — pages a Supabase query past PostgREST's default 1000-row
// response cap.
//
// A plain `.select('*')` with no `.range()` silently truncates at 1000 rows
// with no error — the response is still a normal 200 with fewer rows than
// actually match. `ref_talents` (respec, non-retired) crossed that threshold
// (1170 rows), which meant `refDataCache.ts` and other callers doing an
// unpaginated fetch were silently dropping whichever ~170 rows landed past
// row 1000 in Postgres's own (unordered) scan order — surfaced as specific
// talents (e.g. WITCHCRAFT, COVEN) rendering with no name/description
// anywhere in the app despite the row existing and being correct in the DB.
//
// Supabase query builders are single-use (awaiting one consumes it), so this
// takes a builder FACTORY — `queryPage(from, to)` must return a fresh query
// with `.range(from, to)` applied — rather than a single pre-built query.
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 1000

interface PageResult<T> {
  data: T[] | null
  error: unknown
}

export async function fetchAllRows<T>(
  queryPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<T[]> {
  const rows: T[] = []
  let from = 0
  while (true) {
    const { data, error } = await queryPage(from, from + PAGE_SIZE - 1)
    if (error || !data) break
    rows.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return rows
}
