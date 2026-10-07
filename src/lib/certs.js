// Certificate template helpers.
// Templates are stored as data URLs (resized client-side) so they work in both
// demo mode (localStorage) and live mode (cert_templates table).

const MAX_WIDTH = 1600
const MAX_CHARS = 1_800_000 // ~1.3 MB binary; keeps rows and localStorage sane

export function fileToTemplateDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) return reject(new Error('Please choose an image file (PNG or JPG).'))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not read the image.'))
      img.onload = () => {
        try {
          const scale = Math.min(1, MAX_WIDTH / img.width)
          let out = reader.result
          if (scale < 1 || String(out).length > MAX_CHARS) {
            const canvas = document.createElement('canvas')
            canvas.width = Math.round(img.width * scale)
            canvas.height = Math.round(img.height * scale)
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
            out = canvas.toDataURL('image/jpeg', 0.85)
            if (out.length > MAX_CHARS) out = canvas.toDataURL('image/jpeg', 0.7)
          }
          if (out.length > MAX_CHARS) return reject(new Error('Image is too large even after compression — try a smaller file.'))
          resolve(out)
        } catch (e) { reject(e) }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// Print only the certificate area, then restore the page.
export function printCertificate() {
  document.body.classList.add('print-cert')
  const cleanup = () => {
    document.body.classList.remove('print-cert')
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
  setTimeout(cleanup, 3000)
}
