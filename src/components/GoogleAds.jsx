import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

const GoogleAds = ({ adSlot }) => {
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
      style={{ display: 'block', height: '100%', width: '100%' }}
      data-ad-client='ca-pub-7731037445831235'
      data-ad-slot={adSlot}
    />
  )
}
GoogleAds.propTypes = {
  adSlot: PropTypes.string
}

export default GoogleAds
