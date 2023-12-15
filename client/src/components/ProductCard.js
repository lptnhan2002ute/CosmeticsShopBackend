import React from 'react'
import { renderStarFromNumber, formatMoney} from '../ultils/helpers'

const ProductCard = ( {price, title, totalRatings, image}) => {
    return (
        <div className='w-1/3 flex-auto px-[10px] mb-[20px]'>
            <div className='flex w-full border'>
            <img src={ image } alt='products' className='w-[120px] h-[120px] object-cover p-4'/>
            <div className='flex flex-col gap-1 mt-[15px] items-start w-full text-xs'>
                <span className='line-clamp-2 capitalize text-sm'>{title?.toLowerCase()}</span>
                <span className='flex h-4'>{renderStarFromNumber(totalRatings,14)?.map((el, index) =>(
                    <span key={index}>{el}</span>
                ))}</span>
                <span>{`${formatMoney(price)} VNĐ`}</span>
            </div>  
            </div>
        </div>
    )
}

export default ProductCard