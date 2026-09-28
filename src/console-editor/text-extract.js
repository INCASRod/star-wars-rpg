/* Plain-text extraction from a ProseMirror node, hardBreak-aware.
   ------------------------------------------------------------------
   Not scripts/console-blocks-doc.js's textOf (that file is the tested
   contract and stays untouched) -- this is a small, independent, read-only
   duplicate for outline labels and search, which only ever READ the
   document, never write to it. A node's plain .textContent is not enough:
   a hardBreak renders as nothing in .textContent, silently joining two
   lines with no separator, which breaks "first line of x" extraction and
   would misreport whether a search match crosses a real line boundary. */

function flattenText(node) {
  if (!node) return ''
  if (node.isText) return node.text || ''
  if (node.type && node.type.name === 'hardBreak') return '\n'
  var s = ''
  node.forEach(function (child) { s += flattenText(child) })
  return s
}

function firstLine(s) {
  var i = s.indexOf('\n')
  return i === -1 ? s : s.slice(0, i)
}

function truncate(s, n) {
  s = String(s || '')
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

module.exports = { flattenText: flattenText, firstLine: firstLine, truncate: truncate }
