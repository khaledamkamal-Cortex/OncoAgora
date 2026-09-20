// Convert common YouTube / Vimeo link formats into embeddable player URLs.
// Admins can paste any link (watch page, share link, shorts, unlisted Vimeo
// with hash, or an already-correct embed URL) and it will play.
export function toEmbedUrl(url) {
  if (!url) return ''
  const u = url.trim()

  // YouTube: watch?v=, youtu.be/, embed/, shorts/, live/
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/)
  if (m) return `https://www.youtube.com/embed/${m[1]}`

  // Vimeo player links (keep unlisted hash if present)
  m = u.match(/player\.vimeo\.com\/video\/(\d+)(?:[^#]*[?&]h=([A-Za-z0-9]+))?/)
  if (m) return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ''}`

  // Vimeo page links: vimeo.com/ID or vimeo.com/ID/HASH (unlisted)
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([A-Za-z0-9]+))?/)
  if (m) return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ''}`

  // Anything else (self-hosted, other platforms): use as given.
  return u
}
