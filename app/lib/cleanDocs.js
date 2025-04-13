// lib/cleanDocs.js
export function cleanDocs(docs) {
  return JSON.parse(JSON.stringify(docs));
}
