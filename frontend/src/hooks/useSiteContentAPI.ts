import { useState, useCallback } from 'react'
import type { SiteContent } from '../context/SiteContentContext'

export const useSiteContentAPI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadContentFromAPI = useCallback(async (): Promise<SiteContent | null> => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔗 Fazendo requisição para /api/content/public')
      const response = await fetch('/api/content/public', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📥 Resposta da API:', {
        success: result.success,
        hasData: !!result.data,
        source: result.source,
        timestamp: result.timestamp
      })

      if (result.success) {
        return result.data
      } else {
        throw new Error(result.message || 'Erro ao carregar conteúdo')
      }
    } catch (err) {
      console.error('❌ Erro ao carregar conteúdo da API:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const saveContentToAPI = useCallback(async (content: SiteContent): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      console.log('💾 Salvando conteúdo na API...')
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📤 Resposta do salvamento:', {
        success: result.success,
        message: result.message,
        persistent: result.persistent,
        timestamp: result.timestamp
      })

      if (result.success) {
        if (result.persistent) {
          console.log('✅ Conteúdo salvo com persistência:', result.message)
        } else {
          console.warn('⚠️ Conteúdo salvo temporariamente:', result.warning)
        }
        return true
      } else {
        throw new Error(result.message || 'Erro ao salvar conteúdo')
      }
    } catch (err) {
      console.error('❌ Erro ao salvar conteúdo na API:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    loadContentFromAPI,
    saveContentToAPI
  }
}

export default useSiteContentAPI