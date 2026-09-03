export type Photo = { dataUrl: string; name: string }

export function compressImage(dataUrl: string, maxSize = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const ratio = img.width / img.height
      let w: number
      let h: number
      if (img.width >= img.height) {
        w = Math.min(img.width, maxSize)
        h = Math.round(w / ratio)
      } else {
        h = Math.min(img.height, maxSize)
        w = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('canvas'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('image'))
    img.src = dataUrl
  })
}

export async function filesToPhotos(files: FileList | File[]): Promise<Photo[]> {
  const list = Array.from(files)
  const out: Photo[] = []
  for (const file of list) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('read'))
      reader.readAsDataURL(file)
    })
    const compressed = await compressImage(dataUrl)
    out.push({ dataUrl: compressed, name: file.name })
  }
  return out
}
