export const MAX_IMAGE_UPLOAD_BYTES = 1.5 * 1024 * 1024

export interface ImageFileLike {
  size: number
  type: string
}

export function getImageUploadError(file: ImageFileLike) {
  if (!file.type.startsWith('image/')) {
    return '请选择图片文件'
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return '图片不能超过 1.5 MB，请先压缩后再上传'
  }

  return null
}

export function readImageFileAsDataUrl(file: File) {
  const validationError = getImageUploadError(file)

  if (validationError) {
    return Promise.reject(new Error(validationError))
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''

      if (!result) {
        reject(new Error('图片读取失败，请重新选择'))
        return
      }

      resolve(result)
    }
    reader.onerror = () => reject(new Error('图片读取失败，请重新选择'))
    reader.readAsDataURL(file)
  })
}

export function sanitizeStoreImageSource(value: string) {
  const imageSource = value.trim()

  if (!imageSource) {
    return ''
  }

  if (imageSource.startsWith('/images/') || imageSource.startsWith('data:image/')) {
    return imageSource
  }

  return ''
}