import React from 'react'
import { motion } from 'framer-motion'
import { useSiteContent } from '../context/SiteContentContext'

interface MascotesProps {
  position: 'hero' | 'footer'
}

const Mascotes: React.FC<MascotesProps> = ({ position }) => {
  const { content } = useSiteContent()

  if (!content.configuracoes.mostrar_mascotes) {
    return null
  }

  const getMascoteConfig = () => {
    switch (position) {
      case 'hero':
        return {
          hori: {
            src: content.configuracoes.mascote_hori,
            position: 'absolute bottom-10 left-4 sm:left-8 lg:left-16',
            size: 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24',
            animation: { y: [0, -10, 0], rotate: [0, 5, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
          },
          horizon: {
            src: content.configuracoes.mascote_horizon,
            position: 'absolute bottom-10 right-4 sm:right-8 lg:right-16',
            size: 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24',
            animation: { y: [0, -12, 0], rotate: [0, -5, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }
          }
        }
      case 'footer':
        return {
          hori: {
            src: content.configuracoes.mascote_hori,
            position: 'absolute top-4 left-1/4',
            size: 'w-12 h-12',
            animation: { rotate: [0, 360], transition: { duration: 10, repeat: Infinity, ease: 'linear' } }
          },
          horizon: {
            src: content.configuracoes.mascote_horizon,
            position: 'absolute top-4 right-1/4',
            size: 'w-12 h-12',
            animation: { rotate: [0, -360], transition: { duration: 8, repeat: Infinity, ease: 'linear' } }
          }
        }
      default:
        return {}
    }
  }

  const mascoteConfig = getMascoteConfig()

  return (
    <>
      {mascoteConfig.hori && content.configuracoes.mascote_hori && (
        <motion.div
          className={`${mascoteConfig.hori.position} ${mascoteConfig.hori.size} z-30 pointer-events-none select-none`}
          animate={mascoteConfig.hori.animation}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <img
            src={content.configuracoes.mascote_hori}
            alt="Mascote Hori"
            className="w-full h-full object-contain drop-shadow-lg"
            draggable={false}
          />
        </motion.div>
      )}

      {mascoteConfig.horizon && content.configuracoes.mascote_horizon && (
        <motion.div
          className={`${mascoteConfig.horizon.position} ${mascoteConfig.horizon.size} z-30 pointer-events-none select-none`}
          animate={mascoteConfig.horizon.animation}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <img
            src={content.configuracoes.mascote_horizon}
            alt="Mascote Horizon"
            className="w-full h-full object-contain drop-shadow-lg"
            draggable={false}
          />
        </motion.div>
      )}
    </>
  )
}

export default Mascotes