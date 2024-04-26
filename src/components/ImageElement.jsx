import React from 'react'

export default function ImageElement({ origin, converted, loading }) {
    return (
        <div className="flex flex-row justify-around items-start py-2">
            {origin && <ImageContainer image={origin} />}
            {(converted) ?
                <>
                    <ImageContainer image={converted} download />

                </> :
                <div role='img' className='max-w-[50%] w-full h-full flex flex-row justify-center items-center font-semibold text-white'>{loading ? "Loading" : "waiting for convert"}</div>}
        </div>
    )
}

const getSize = (size) => {
    const kb = size / 1024
    const mb = kb / 1024
    return (mb > 1) ? `${mb.toFixed(2)} mb` : `${kb.toFixed(2)} kb`
}
const ImageContainer = ({ image, download }) => {
    return (
        <div className='flex flex-col w-full'>
            <a download={download} href={URL.createObjectURL(image)} className='flex-auto h-32 w-full pointer-events-none inline-block' >
                <img src={URL.createObjectURL(image)} alt="origin" className='w-full h-full object-center inline-block object-contain' />
            </a>
            <div className='h-fit'>
                <p className='text-white text-center'>size: {getSize(image.size)}</p>
                {!download && <p className='text-white text-center'>file name: {image.name}</p>}
                {download && <a download={download} href={URL.createObjectURL(image)} className='w-fit text-white underline'>download</a>}
            </div>
        </div>
    )
}
const handleDownload = (e) => {
    e.target.closest('div').querySelector('a').click()
}
