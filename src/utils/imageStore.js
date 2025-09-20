const DB_NAME = 'uni-editor'
const DB_VERSION = 1
const STORE_NAME = 'images'

const urlCache = new Map()
const reverseUrlCache = new Map()
let dbPromise = null

export function hasIndexedDBSupport() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

function getDatabase() {
  if (!hasIndexedDBSupport()) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment.'))
  }

  if (dbPromise) {
    return dbPromise
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => {
        db.close()
        dbPromise = null
      }
      resolve(db)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })

  return dbPromise
}

function cacheObjectURL(id, blob) {
  if (!blob) return undefined
  const cached = urlCache.get(id)
  if (cached) return cached
  const url = URL.createObjectURL(blob)
  urlCache.set(id, url)
  reverseUrlCache.set(url, id)
  return url
}

function rememberBlobUrl(id, url) {
  if (!id || !url) return
  urlCache.set(id, url)
  reverseUrlCache.set(url, id)
}

function getIdFromUrl(url) {
  return reverseUrlCache.get(url)
}

function createImageRecord(file, id) {
  const blob = file instanceof Blob ? file : new Blob([file], { type: file?.type || 'application/octet-stream' })
  return {
    id,
    name: file?.name || id,
    type: blob.type || 'application/octet-stream',
    size: blob.size,
    createdAt: Date.now(),
    blob
  }
}

function generateImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `img_${crypto.randomUUID()}`
  }
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

async function getImageRecord(id) {
  if (!id) return null
  try {
    const db = await getDatabase()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.warn('[imageStore] Failed to read image from IndexedDB:', error)
    return null
  }
}

async function blobToDataUrl(blob) {
  if (!blob) return undefined
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function getImageDataUrl(id) {
  if (!id) return undefined
  try {
    const record = await getImageRecord(id)
    if (!record?.blob) return undefined
    return await blobToDataUrl(record.blob)
  } catch (error) {
    console.warn('[imageStore] Failed to convert image to data URL:', error)
    return undefined
  }
}

async function fetchBlobFromUrl(url) {
  if (!url) return undefined
  try {
    const response = await fetch(url)
    if (!response.ok) return undefined
    return await response.blob()
  } catch (error) {
    console.warn('[imageStore] Failed to fetch blob from URL:', error)
    return undefined
  }
}

export async function resolveImageToDataUrl(src) {
  if (!src || src.startsWith('data:')) return src

  const prefix = 'uni-image://'
  let id

  if (src.startsWith(prefix)) {
    id = src.slice(prefix.length)
  } else {
    const placeholder = getPlaceholderByUrl(src)
    if (placeholder && placeholder.startsWith(prefix)) {
      id = placeholder.slice(prefix.length)
    }
  }

  if (id) {
    const dataUrl = await getImageDataUrl(id)
    if (dataUrl) return dataUrl
  }

  if (src.startsWith('blob:')) {
    const blob = await fetchBlobFromUrl(src)
    if (blob) {
      try {
        return await blobToDataUrl(blob)
      } catch (error) {
        console.warn('[imageStore] Failed to convert fetched blob to data URL:', error)
      }
    }
  }

  return undefined
}

export async function replaceImageSrcWithDataUrls(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return

  const images = Array.from(root.querySelectorAll('img'))
  if (images.length === 0) return

  await Promise.all(images.map(async (img) => {
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:')) return
    const dataUrl = await resolveImageToDataUrl(src)
    if (dataUrl) {
      img.setAttribute('src', dataUrl)
    }
  }))
}

export async function saveImage(file) {
  if (!file) throw new Error('No file provided')

  const id = generateImageId()
  const record = createImageRecord(file, id)

  try {
    const db = await getDatabase()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)

      const store = tx.objectStore(STORE_NAME)
      const request = store.put(record)
      request.onerror = () => reject(request.error)
    })

    const url = cacheObjectURL(id, record.blob)
    return { id, url, name: record.name }
  } catch (error) {
    console.warn('[imageStore] Failed to save image:', error)
    throw error
  }
}

export async function getImageUrl(id) {
  if (!id) return undefined
  const cached = urlCache.get(id)
  if (cached) return cached

  const record = await getImageRecord(id)
  if (!record?.blob) return undefined
  return cacheObjectURL(id, record.blob)
}

export function getPlaceholderByUrl(url) {
  const id = getIdFromUrl(url)
  return id ? `uni-image://${id}` : null
}

export function getUrlByPlaceholder(placeholder) {
  if (!placeholder) return undefined
  const prefix = 'uni-image://'
  if (!placeholder.startsWith(prefix)) return undefined
  const id = placeholder.slice(prefix.length)
  return getImageUrl(id)
}

const MARKDOWN_PLACEHOLDER_RE = /!\[([^\]]*)\]\((uni-image:\/\/[^)]+)\)/gi
const HTML_PLACEHOLDER_RE = /(<img[^>]*?)src=["'](uni-image:\/\/[^"']+)["']([^>]*>)/gi
const MARKDOWN_BLOB_RE = /!\[([^\]]*)\]\((blob:[^)]+)\)/gi
const HTML_BLOB_RE = /(<img[^>]*?)src=["'](blob:[^"']+)["']([^>]*>)/gi
const UNIVERSAL_PLACEHOLDER_ID_RE = /uni-image:\/\/([^"'\s)]+)/gi

async function replaceAsync(str, regex, replacer) {
  regex.lastIndex = 0
  const matches = []
  str.replace(regex, (...args) => {
    const match = args[0]
    const groups = args.slice(1, -2)
    const offset = args[args.length - 2]
    matches.push({ match, groups, offset })
    return match
  })

  if (matches.length === 0) {
    return str
  }

  const parts = []
  let lastIndex = 0

  for (const { match, groups, offset } of matches) {
    parts.push(str.slice(lastIndex, offset))
    // eslint-disable-next-line no-await-in-loop
    const replacement = await replacer(match, ...groups)
    parts.push(typeof replacement === 'string' ? replacement : match)
    lastIndex = offset + match.length
  }

  parts.push(str.slice(lastIndex))
  return parts.join('')
}

export async function convertContentForEditor(content) {
  if (!content || !hasIndexedDBSupport()) return content || ''

  let result = await replaceAsync(content, MARKDOWN_PLACEHOLDER_RE, async (match, alt = '', placeholder) => {
    const url = await getUrlByPlaceholder(placeholder)
    if (!url) return match
    return `![${alt}](${url})`
  })

  result = await replaceAsync(result, HTML_PLACEHOLDER_RE, async (match, before = '', placeholder, after = '') => {
    const url = await getUrlByPlaceholder(placeholder)
    if (!url) return match
    return `${before}src="${url}"${after}`
  })

  return result
}

export function convertContentForStorage(content) {
  if (!content) return ''

  let result = content.replace(MARKDOWN_BLOB_RE, (match, alt = '', url) => {
    const id = getIdFromUrl(url)
    if (!id) return match
    return `![${alt}](uni-image://${id})`
  })

  result = result.replace(HTML_BLOB_RE, (match, before = '', url, after = '') => {
    const id = getIdFromUrl(url)
    if (!id) return match
    return `${before}src="uni-image://${id}"${after}`
  })

  return result
}

export function rememberUrlMapping(id, url) {
  rememberBlobUrl(id, url)
}

export function clearImageCache() {
  for (const [id, url] of urlCache.entries()) {
    URL.revokeObjectURL(url)
    reverseUrlCache.delete(url)
    urlCache.delete(id)
  }
}

async function deleteImageRecord(id) {
  if (!id) return
  try {
    const db = await getDatabase()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
      const store = tx.objectStore(STORE_NAME)
      const request = store.delete(id)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.warn('[imageStore] Failed to delete image record:', error)
  }
}

export async function removeImage(id) {
  if (!id) return
  await deleteImageRecord(id)
  const url = urlCache.get(id)
  if (url) {
    URL.revokeObjectURL(url)
    reverseUrlCache.delete(url)
    urlCache.delete(id)
  }
}

async function listImageIds() {
  try {
    const db = await getDatabase()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAllKeys()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.warn('[imageStore] Failed to list image ids:', error)
    return []
  }
}

export function extractImageIdsFromContent(content) {
  const ids = new Set()
  if (!content) return ids
  let match
  while ((match = UNIVERSAL_PLACEHOLDER_ID_RE.exec(content)) !== null) {
    const id = match[1]
    if (id) {
      ids.add(id)
    }
  }
  UNIVERSAL_PLACEHOLDER_ID_RE.lastIndex = 0
  return ids
}

let cleanupInProgress = false

export async function cleanupUnusedImages(usedIdsIterable = []) {
  if (!hasIndexedDBSupport()) return
  if (cleanupInProgress) return
  cleanupInProgress = true
  try {
    const usedIds = new Set(usedIdsIterable)
    const storedIds = await listImageIds()
    if (!Array.isArray(storedIds) || storedIds.length === 0) return
    const toRemove = storedIds.filter(id => !usedIds.has(id))
    if (toRemove.length === 0) return
    await Promise.all(toRemove.map(id => removeImage(id)))
  } catch (error) {
    console.warn('[imageStore] Failed to cleanup unused images:', error)
  } finally {
    cleanupInProgress = false
  }
}
