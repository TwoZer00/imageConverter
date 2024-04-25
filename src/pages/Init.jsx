import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Init () {
  const [file, setFile] = useState()
  const [image, setImage] = useState()
  const [loading, setLoading] = useState(false)
  const handleChange = (e) => {
    setImage()
    const file = e.target.files[0]
    setFile(file)
  }

  const handleConvert = () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('image', file)
    fetch('https://image-converter-k56z.onrender.com/api/image/converter', {
      method: 'POST',
      body: formData
    }).then(res => {
      if (res.ok) {
        return res.blob()
      } else {
        setFile()
      }
    }
    ).then(blob => {
      setImage(blob)
      setLoading(false)
    })
  }

  return (
    <div className='flex flex-col h-screen bg-gradient-to-b from-sky-400 to-sky-800'>
      <header className='sticky text-white h-12 flex flex-row justify-center items-center bg-white/30 backdrop-blur'>
        <Link href='/' className='text-white font-bold text-2xl'>
          Image to WEBP
        </Link>
      </header>
      <main className='flex-1 h-full flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-1'>
        <h1 className='text-4xl font-bold text-center text-white'>Image to WEBP</h1>
        <h2 className='text-center text-gray-100'>Convert your image to webp format</h2>
        <section className='flex flex-col gap-2 w-full max-w-xl'>
          <div className='w-full flex flex-row gap-2 flex-0'>
            <div className='w-full h-10 bg-white/20 backdrop-blur shadow-lg rounded-full px-2 py-1 flex flex-row gap-2 items-center'>
              <p className='block w-full text-white italic pl-2 select-none pointer-events-none'>{file?.name || 'Filename'}</p>
            </div>
            <>
              <label htmlFor='input-file' className='h-full'>
                <div className='px-2 text-nowrap flex items-center bg-cyan-400/20 shadow-lg backdrop-blur hover:brightness-125 transition font-semibold text-white first-letter:uppercase h-full rounded-full' role='button'>Select file</div>
                <input type='file' id='input-file' onChange={handleChange} className='hidden' />
              </label>
            </>
            <button disabled={!file || loading} onClick={handleConvert} className='bg-indigo-400/20 shadow-lg transition backdrop-blur disabled:brightness-50 text-white font-semibold hover:brightness-125 capitalize h-full rounded-full px-2'>convert</button>
          </div>

          <div className='min-h-56 h-fit w-full bg-slate-400/20 shadow-lg rounded-lg backdrop-blur p-4 flex justify-between'>
            <div className='flex flex-col items-center'>
              <p className='text-white font-semibold'>Original</p>
              {file && <img src={file && URL.createObjectURL(file)} alt={file?.name} className='h-full transition max-w-24 object-contain hover:cursor-pointer hover:brightness-125' onClick={() => { window.open(URL.createObjectURL(file), '_blank') }} />}
              {file && <p className='text-white'>{getSize(file.size)}</p>}
            </div>
            <div className='flex flex-col items-center gap-0'>
              <p className='text-white font-semibold'>Converted</p>
              {loading && <div role='img' className='bg-slate-400  h-full w-32 animate-pulse flex flex-row items-center justify-center'>Loading</div>}
              {(!loading && image) && <img src={image && URL.createObjectURL(image)} alt={image?.name} className='transition h-full max-w-24 object-contain hover:cursor-pointer hover:brightness-125' onClick={() => { window.open(URL.createObjectURL(image), '_blank') }} />}
              {!loading && !image && <p className='text-white'>no image</p>}
              {(!loading && image) && <p className='text-white'>{getSize(image.size)}</p>}
              {(!loading && image) && <a href={URL.createObjectURL(image)} target='_blank' download={image.name} className='bg-cyan-400/20 shadow-lg transition backdrop-blur disabled:brightness-50 text-white font-semibold hover:brightness-125 capitalize rounded-full px-2'>download</a>}
            </div>
          </div>
        </section>
      </main>
      <footer className='text-white text-center h-8'>
        <a href='https://twozer00.dev' className='underline'>
          TwoZer00 &copy; {new Date().getFullYear()}
        </a>
      </footer>
    </div>
  )
}

const getSize = (size) => {
  const kb = size / 1024
  const mb = kb / 1024
  if (mb > 0.9) {
    return mb.toFixed(2) + ' MB'
  }
  return kb.toFixed(2) + ' KB'
}
