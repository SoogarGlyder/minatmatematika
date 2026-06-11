import sanitizeHtml from 'sanitize-html';

export function stripHtml(html) {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {}
  });
}