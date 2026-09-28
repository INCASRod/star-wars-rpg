/* Shared hook registry between mount.js and the card/npc NodeViews.
   ------------------------------------------------------------------
   archiveJSON (and its helpers archSkills/archTalents/archEquipment/archNum)
   live inside the vendored file's closure and are unreachable from the
   bundle -- and per the brief, must NOT be reimplemented here (one copy, in
   the console, called through a hook). mountConsoleEditor sets
   hooks.onArchiveExport to whatever the index.html patch passes in; the
   stat card NodeView reads it at click time. If nothing has set it (e.g. the
   read-only step-3 mount, or a future context with no hook wired), the
   Archive button simply doesn't render -- never a silent no-op click. */
var hooks = {
  onArchiveExport: null, /* (block, docRow) => void */
}

module.exports = hooks
