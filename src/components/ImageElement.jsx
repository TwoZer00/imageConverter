import React from 'react'

export default function ImageElement({ origin, converted, loading }) {
    return (
        <div className="flex flex-row justify-between w-full h-28 p-2">
            {origin && <ImageContainer image={origin} />}
            {(converted) ? <ImageContainer image={converted} /> : <div role='img' className='max-w-[50%] w-full h-full flex flex-row justify-center items-center font-semibold text-white'>{loading ? "Loading" : "waiting for convert"}</div>}
        </div>
    )
}

const getSize = (size) => {
    const kb = size / 1024
    const mb = kb / 1024
    return (mb > 1) ? `${mb.toFixed(2)} mb` : `${kb.toFixed(2)} kb`
}
const ImageContainer = ({ image }) => {
    return (
        <div className='flex flex-col items-center h-full w-full'>
            <img src={URL.createObjectURL(image)} alt="origin" className='max-w-[50%] w-full object-contain h-full' />
            <p className='text-white text-center'>{getSize(image.size)}</p>
        </div>
    )
}
