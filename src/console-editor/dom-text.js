/* edText/esc/nl -- mirrored verbatim from public/console/index.html's own
   copies. edText is the fix for the uppercase trap: innerText returns the
   RENDERED text, so a field styled text-transform:uppercase (.b-h1, every
   card's .np-l label, .st-h .cl) comes back uppercased and that uppercase
   gets written to the database on every edit, silently rewriting the GM's
   own capitalisation. textContent is not a substitute -- it drops the
   newlines that multi-paragraph card values depend on. So: read innerText
   with the transform switched off for the length of the read, then restore
   the element's own inline style exactly as found.

   See scripts/console-edtext.test.js for the real-DOM, real-CSS proof that
   this actually neutralises the transform, including a deliberate-failure
   run showing the test catches the bug if the neutralisation is removed. */

function edText(n) {
  var had = n.style.textTransform
  n.style.textTransform = 'none'
  var v = n.innerText
  if (had) n.style.textTransform = had
  else n.style.removeProperty('text-transform')
  return v
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  })
}

function nl(s) {
  return esc(s).replace(/\n/g, '<br>')
}

module.exports = { edText: edText, esc: esc, nl: nl }
