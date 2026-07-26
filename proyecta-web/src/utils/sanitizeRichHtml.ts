const ALLOWED_TAGS = new Set([
  'a', 'blockquote', 'br', 'code', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4',
  'hr', 'img', 'li', 'ol', 'p', 'pre', 'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
])
const ALLOWED_ATTRIBUTES = new Set(['alt', 'colspan', 'href', 'rel', 'rowspan', 'src', 'style', 'target', 'title'])

function restoreEscapedMarkup(html: string) {
  // Some rich-text clipboard sources wrap an entire HTML fragment as text inside a paragraph.
  // Decode only when that text clearly contains markup; the sanitization below still controls every tag.
  const escapedMarkup = /&lt;\/?[a-z][\s\S]*?&gt;/i.test(html)
  if (!escapedMarkup) return html

  return html
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&amp;/gi, '&')
}

function isSafeUrl(value: string, allowedProtocols: string[]) {
  try {
    return allowedProtocols.includes(new URL(value, window.location.origin).protocol)
  } catch {
    return false
  }
}

export function sanitizeRichHtml(html: string) {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return ''

  const document = new DOMParser().parseFromString(restoreEscapedMarkup(html || ''), 'text/html')
  for (const element of Array.from(document.body.querySelectorAll('*'))) {
    const tagName = element.tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tagName)) {
      element.replaceWith(document.createTextNode(element.textContent || ''))
      continue
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim()
      if (!ALLOWED_ATTRIBUTES.has(name)) {
        element.removeAttribute(attribute.name)
      } else if (name === 'style' && !/^\s*text-align\s*:\s*(left|center|right|justify)\s*;?\s*$/i.test(value)) {
        element.removeAttribute(attribute.name)
      } else if (name === 'href' && !isSafeUrl(value, ['https:', 'http:', 'mailto:'])) {
        element.removeAttribute(attribute.name)
      } else if (name === 'src' && !isSafeUrl(value, ['https:'])) {
        element.removeAttribute(attribute.name)
      }
    }

    if (tagName === 'a' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer')
    }
  }

  return document.body.innerHTML
}
