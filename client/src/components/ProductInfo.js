import React , {memo}from 'react'

const ProductInfo = ({ icon, title, sub}) => {
    return (
        <div className='flex items-center p-3 gap-4 mb-[10px] border'>
            <span className='p-2 bg-gray-800 rounded-full flex items-center justify-center text-white'>{icon}</span>
            <div className='flex flex-col text-sm to-gray-500'>
                <span className='font-medium cursor-pointer hover:text-main'>{title}</span>
                <span className='text-xs'>{sub}</span>
            </div>
        </div>
    )
}

export default memo(ProductInfo)