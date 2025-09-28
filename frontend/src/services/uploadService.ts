// Upload service for handling image uploads
export interface UploadResponse {
  success: boolean
  url: string
  fileName: string
  error?: string
}

export class UploadService {
  private static instance: UploadService
  private uploadedFiles: Map<string, string> = new Map()

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService()
    }
    return UploadService.instance
  }

  /**
   * Upload a file and return the URL
   * For demo purposes, this creates a local URL and stores it
   * In production, this would upload to a server/cloud storage
   */
  async uploadFile(file: File, category: string = 'general'): Promise<UploadResponse> {
    try {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        throw new Error('Tipo de arquivo não suportado. Use PNG, JPG, JPEG, GIF ou SVG.')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.')
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substr(2, 9)
      const extension = file.name.split('.').pop()
      const fileName = `${category}_${timestamp}_${randomId}.${extension}`

      // Create object URL for immediate preview
      const objectUrl = URL.createObjectURL(file)

      // Store the mapping
      this.uploadedFiles.set(fileName, objectUrl)

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real application, you would:
      // 1. Upload to your backend server
      // 2. Return the server URL
      // For demo, we'll use the object URL
      const publicUrl = `/uploads/${fileName}`

      // Save to localStorage for persistence across sessions
      this.saveToLocalStorage(fileName, objectUrl, file)

      return {
        success: true,
        url: objectUrl, // Use object URL for immediate display
        fileName: fileName
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        url: '',
        fileName: '',
        error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
      }
    }
  }

  /**
   * Get the URL for an uploaded file
   */
  getFileUrl(fileName: string): string | null {
    return this.uploadedFiles.get(fileName) || null
  }

  /**
   * Delete an uploaded file
   */
  deleteFile(fileName: string): boolean {
    try {
      const url = this.uploadedFiles.get(fileName)
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
      this.uploadedFiles.delete(fileName)
      this.removeFromLocalStorage(fileName)
      return true
    } catch (error) {
      console.error('Delete error:', error)
      return false
    }
  }

  /**
   * List all uploaded files
   */
  listFiles(): Array<{ fileName: string, url: string }> {
    return Array.from(this.uploadedFiles.entries()).map(([fileName, url]) => ({
      fileName,
      url
    }))
  }

  /**
   * Validate if file is a supported image type
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp'
    ]
    return validTypes.includes(file.type)
  }

  /**
   * Save file to localStorage for persistence
   */
  private async saveToLocalStorage(fileName: string, objectUrl: string, file: File): Promise<void> {
    try {
      // Convert file to base64 for storage
      const base64 = await this.fileToBase64(file)
      const uploadData = {
        fileName,
        objectUrl,
        base64,
        timestamp: Date.now(),
        size: file.size,
        type: file.type
      }

      localStorage.setItem(`upload_${fileName}`, JSON.stringify(uploadData))

      // Update index
      const index = JSON.parse(localStorage.getItem('upload_index') || '[]')
      if (!index.includes(fileName)) {
        index.push(fileName)
        localStorage.setItem('upload_index', JSON.stringify(index))
      }
    } catch (error) {
      console.warn('Could not save to localStorage:', error)
    }
  }

  /**
   * Remove file from localStorage
   */
  private removeFromLocalStorage(fileName: string): void {
    try {
      localStorage.removeItem(`upload_${fileName}`)

      // Update index
      const index = JSON.parse(localStorage.getItem('upload_index') || '[]')
      const newIndex = index.filter((name: string) => name !== fileName)
      localStorage.setItem('upload_index', JSON.stringify(newIndex))
    } catch (error) {
      console.warn('Could not remove from localStorage:', error)
    }
  }

  /**
   * Load files from localStorage on initialization
   */
  loadFromLocalStorage(): void {
    try {
      const index = JSON.parse(localStorage.getItem('upload_index') || '[]')

      for (const fileName of index) {
        const uploadDataStr = localStorage.getItem(`upload_${fileName}`)
        if (uploadDataStr) {
          const uploadData = JSON.parse(uploadDataStr)

          // Recreate object URL from base64
          const byteCharacters = atob(uploadData.base64.split(',')[1])
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: uploadData.type })
          const objectUrl = URL.createObjectURL(blob)

          this.uploadedFiles.set(fileName, objectUrl)
        }
      }
    } catch (error) {
      console.warn('Could not load from localStorage:', error)
    }
  }

  /**
   * Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  /**
   * Clean up old uploads (call on app initialization)
   */
  cleanup(): void {
    try {
      const index = JSON.parse(localStorage.getItem('upload_index') || '[]')
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)

      for (const fileName of index) {
        const uploadDataStr = localStorage.getItem(`upload_${fileName}`)
        if (uploadDataStr) {
          const uploadData = JSON.parse(uploadDataStr)
          if (uploadData.timestamp < oneWeekAgo) {
            this.deleteFile(fileName)
          }
        }
      }
    } catch (error) {
      console.warn('Cleanup error:', error)
    }
  }
}

// Export singleton instance
export const uploadService = UploadService.getInstance()

// Initialize on module load
uploadService.loadFromLocalStorage()
uploadService.cleanup()