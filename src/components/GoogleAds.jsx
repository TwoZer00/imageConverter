import React, { useEffect } from 'react'

const GoogleAds = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.error('Error loading Google ad:', e)
    }
  }, [])

  return (
    <ins
      className='adsbygoogle'
      style={{ display: 'block', height: 'auto', width: '100%' }}
      data-ad-client='ca-pub-7731037445831235'
      data-ad-slot='5292510382'
    />
  )
}

export default GoogleAds
