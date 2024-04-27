import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageElement from '../components/ImageElement'

export default function Init () {
  const [file, setFile] = useState()
  const [error, setError] = useState()
  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 10) {
      setError('please select 10 images at most')
      setFile()
      return
    }
    const allImages = files.every(file => {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        return false
      }
      return true
    })
    if (allImages) {
      const tempF = []
      files.forEach(file => {
        tempF.push({
          origin: file,
          toConverted: undefined
        })
      })
      setFile(tempF)
    } else {
      setError('please select image file(jpeg, jpg and png)')
    }
  }

  const handleConvert = () => {
    const temp = []
    file.forEach(item => {
      const tempItem = { ...item }
      tempItem.loading = true
      temp.push(tempItem)
    })
    setFile(temp)
  }

  return (
    <div className='h-screen max-h-screen bg-gradient-to-b from-sky-400 to-sky-800'>
      <div className='flex flex-col h-full'>
        <header className='text-white h-12 flex flex-row justify-center items-center bg-white/30 backdrop-blur'>
          <Link href='/' className='text-white font-bold text-2xl'>
            Image to WEBP
          </Link>
        </header>
        <main className='flex flex-col flex-1 justify-center max-w-3xl mx-auto gap-2'>
          <h1 className='text-4xl font-bold text-center text-white'>Image to WEBP</h1>
          <h2 className='text-center text-gray-100'>Convert your image to webp format</h2>
          <div className='flex flex-row gap-2'>
            <p className='w-full bg-white/20 backdrop-blur shadow-lg rounded-full overflow-hidden px-4 text-white/60 flex items-center flex-auto'>
              <span className='overflow-x-scroll text-nowrap inline-block scroll-smooth w-full py-2'>{file?.map(item => item.origin.name).join(', ') || 'File name'}</span>
            </p>
            <label htmlFor='input-file' className='h-full flex-none w-fit'>
              <div className='px-2 text-nowrap flex items-center bg-cyan-400/20 shadow-lg backdrop-blur hover:brightness-125 transition font-semibold text-white first-letter:uppercase h-full rounded-full' role='button'>Select file</div>
              <input type='file' id='input-file' multiple accept='image/jpg, image/png, image/jpeg' onChange={handleChange} className='hidden' />
            </label>
            <button disabled={!file} onClick={handleConvert} className='bg-indigo-400/20 flex-none w-fit shadow-lg transition backdrop-blur disabled:brightness-50 text-white font-semibold hover:brightness-125 capitalize h-full rounded-full px-2'>convert</button>
          </div>
          <section className='flex flex-col max-h-[400px] overflow-y-auto p-3 border border-dashed rounded-lg divide-y-2 gap-1 divide-dotted'>
            {file && file.map((item) => <ImageElement key={item.origin.name} origin={item.origin} converted={item.converted} loading={item.loading} />)}
          </section>
          <p className='flex flex-col'>
            <small className='text-center text-white'>Convert file/s may take some time, server stops when it's not being used, please be patient.</small>
            <small className='text-center text-white'>No files are being storaged. </small>
          </p>
          {error &&
            <div className='absolute flex flex-col items-center justify-center h-dvh w-screen backdrop-blur-sm bg-black/20 top-0 left-0'>
              <p className='shadow-lg text-center bg-white h-24 rounded flex flex-col justify-between items-center p-4'>
                <span className='first-letter:uppercase'>{error}</span>
                <button onClick={() => setError()} className='bg-slate-600 px-2 text-white rounded hover:brightness-125 transition first-letter:uppercase'>understood</button>
              </p>
            </div>}
        </main>
        <footer className='text-white text-center h-8'>
          <a href='https://twozer00.dev' className='underline'>
            TwoZer00 &copy; {new Date().getFullYear()}
          </a>
        </footer>
      </div>
    </div>
  )
}
