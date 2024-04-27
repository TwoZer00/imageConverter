import React, { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'

export default function ImageElement ({ origin, loading }) {
  const [converted, setConverted] = useState()
  useEffect(() => {
    const handleConvert = async () => {
      const formData = new FormData()
      formData.append('image', origin)
      const convertedFile = await fetch('https://image-converter-k56z.onrender.com/api/image/converter', {
        method: 'POST',
        body: formData
      }).then(res => res.blob())
      setConverted(convertedFile)
    }
    if (loading && !converted) handleConvert()
  }, [converted, loading, origin])
  return (
    <div className='flex flex-row justify-around items-start py-2'>
      {origin && <ImageContainer image={origin} />}
      {(converted)
        ? <ImageContainer image={converted} download />
        : <div role='img' className='max-w-[50%] w-full h-full flex flex-row justify-center items-center font-semibold text-white'>{loading ? 'Loading' : 'waiting for convert'}</div>}
    </div>
  )
}

const getSize = (size) => {
  const kb = size / 1024
  const mb = kb / 1024
  return (mb > 1) ? `${mb.toFixed(2)} mb` : `${kb.toFixed(2)} kb`
}
const ImageContainer = ({ image, download }) => {
  if (image) {
    return (
      <div className='flex flex-col w-full'>
        <a download={download} href={URL.createObjectURL(image)} className='flex-auto h-32 w-full pointer-events-none inline-block'>
          <img src={URL.createObjectURL(image)} alt='origin' className='w-full h-full object-center inline-block object-contain' />
        </a>
        <div className='h-fit flex flex-col items-center'>
          <p className='text-white text-center first-letter:uppercase'>size: {getSize(image?.size)}</p>
          {!download && <p title={image?.name} className='text-white first-letter:uppercase text-center max-w-[32ch] overflow-hidden text-nowrap text-ellipsis'>file name: {image.name}</p>}
          {download && <a download={download} href={URL.createObjectURL(image)} className=' first-letter:uppercase w-fit text-white underline'>download</a>}
        </div>
      </div>
    )
  } else {
    return null
  }
}

ImageContainer.propTypes = {
  image: PropTypes.instanceOf(File).isRequired,
  download: PropTypes.bool
}

ImageElement.propTypes = {
  origin: PropTypes.instanceOf(File),
  converted: PropTypes.instanceOf(File),
  loading: PropTypes.bool
}
