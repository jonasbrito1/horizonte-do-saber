import React from 'react'
import { MapPin } from 'lucide-react'

interface GoogleMapProps {
  endereco: string
  embedUrl?: string
  latitude?: string
  longitude?: string
  zoom?: number
  className?: string
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  endereco,
  embedUrl,
  latitude,
  longitude,
  zoom = 15,
  className = ""
}) => {
  // Função para gerar URL do Google Maps
  const getMapUrl = () => {
    // Prioridade 1: Link direto de incorporação do Google Maps
    if (embedUrl && embedUrl.trim()) {
      // Limpar e validar URL
      const cleanUrl = embedUrl.trim()
      if (cleanUrl.includes('google.com/maps/embed') || cleanUrl.includes('maps.google.com')) {
        return cleanUrl
      }
    }

    // Prioridade 2: Coordenadas específicas
    if (latitude && longitude) {
      return `https://maps.google.com/maps?q=${latitude},${longitude}&hl=pt&z=${zoom}&output=embed`
    }

    // Prioridade 3: Endereço
    if (endereco) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(endereco)}&hl=pt&z=${zoom}&output=embed`
    }

    return null
  }

  const mapUrl = getMapUrl()

  // Se não conseguir gerar URL do mapa, mostrar placeholder
  if (!mapUrl) {
    return (
      <div className={`w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-lg flex flex-col items-center justify-center ${className}`}>
        <MapPin className="w-16 h-16 text-blue-400 mb-4" />
        <div className="text-center px-4">
          <p className="text-gray-700 font-medium mb-2">📍 Localização</p>
          <p className="text-gray-600 text-sm">
            Configure o mapa no painel administrativo<br />
            para exibir a localização aqui
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-96 rounded-lg shadow-lg overflow-hidden border ${className}`}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Localização: ${endereco}`}
      />
    </div>
  )
}

// Componente alternativo com mesma funcionalidade
export const SimpleGoogleMap: React.FC<GoogleMapProps> = ({
  endereco,
  embedUrl,
  latitude,
  longitude,
  zoom = 15,
  className = ""
}) => {
  // URL simplificada com mesma lógica de prioridades
  const getSimpleMapUrl = () => {
    // Prioridade 1: Link direto de incorporação do Google Maps
    if (embedUrl && embedUrl.trim()) {
      const cleanUrl = embedUrl.trim()
      if (cleanUrl.includes('google.com/maps/embed') || cleanUrl.includes('maps.google.com')) {
        return cleanUrl
      }
    }

    // Prioridade 2: Coordenadas específicas
    if (latitude && longitude) {
      return `https://maps.google.com/maps?q=${latitude},${longitude}&hl=pt&z=${zoom}&output=embed`
    }

    // Prioridade 3: Endereço
    if (endereco) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(endereco)}&hl=pt&z=${zoom}&output=embed`
    }

    return null
  }

  const mapUrl = getSimpleMapUrl()

  if (!mapUrl) {
    return (
      <div className={`w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-lg flex flex-col items-center justify-center ${className}`}>
        <MapPin className="w-16 h-16 text-blue-400 mb-4" />
        <div className="text-center px-4">
          <p className="text-gray-700 font-medium mb-2">📍 Localização</p>
          <p className="text-gray-600 text-sm">
            Configure o mapa no painel administrativo<br />
            (use o link direto do Google Maps ou coordenadas)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-96 rounded-lg shadow-lg overflow-hidden border ${className}`}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Localização: ${endereco}`}
      />
    </div>
  )
}