import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageElement from '../components/ImageElement'

export default function Init() {
  const [file, setFile] = useState()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    const allImages = files.every(file => {
      if (file.type.split('/')[0] !== 'image') {
        alert('please select image file')
        return false
      }
      return true
    })
    if (allImages) {
      const tempF = []
      files.forEach(file => {
        tempF.push({
          origin: file,
          toConverted: getImageConverter(file)
        })
      })
      setFile(tempF)
    }
    else {
      setFiles()
      alert('please select image file')
    }
  }

  const handleConvert = () => {
    setLoading(true)
    Promise.all(file.map(item => {
      return item.toConverted
    })).then(converted => {
      setFile(file.map((item, index) => {
        return {
          origin: item.origin,
          converted: converted[index]
        }
      }))
      setLoading(false)
    })
  }

  const getImageConverter = (file) => {
    return new Promise((resolve, reject) => {
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
          reject(res.statusText)
        }
      }
      ).then(blob => {
        resolve(blob)
      })
    })
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
            <p className='w-full bg-white/20 backdrop-blur shadow-lg rounded-full overflow-hidden px-4 text-white font-light italic flex items-center flex-auto'>
              <span className='overflow-x-scroll text-nowrap inline-block scroll-smooth w-full py-2'>{file && file.map(item => item.origin.name).join(", ") || 'Filename'}</span>
            </p>
            <label htmlFor='input-file' className='h-full flex-none w-fit'>
              <div className='px-2 text-nowrap flex items-center bg-cyan-400/20 shadow-lg backdrop-blur hover:brightness-125 transition font-semibold text-white first-letter:uppercase h-full rounded-full' role='button'>Select file</div>
              <input type='file' id='input-file' multiple accept='image/jpg, image/png, image/jpeg' onChange={handleChange} className='hidden' />
            </label>
            <button disabled={!files || loading} onClick={handleConvert} className='bg-indigo-400/20 flex-none w-fit shadow-lg transition backdrop-blur disabled:brightness-50 text-white font-semibold hover:brightness-125 capitalize h-full rounded-full px-2'>convert</button>
          </div>
          <section className='flex flex-col max-h-[400px] overflow-y-auto p-3 border border-dashed rounded-lg divide-y-2 gap-1 divide-dotted'>
            {file && file.map((item) => <ImageElement key={item.origin.name} origin={item.origin} converted={item.converted} loading={loading} />)}
          </section>
          <p className='flex flex-col'>
            <small className='text-center text-white'>Convert file/s may take some time, server stops when it's not being used, please be patient.</small>
            <small className='text-center text-white'>No files are being storaged. </small>
          </p>
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