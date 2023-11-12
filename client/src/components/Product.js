import React, {useState} from 'react'
import { formatMoney } from '../ultils/helpers'
import label from '../assets/label.png'
import labelBlue from '../assets/label.png'
import { renderStarFromNumber } from '../ultils/helpers'
import { SelectOption } from './'
import icons from '../ultils/icon'
import { Link } from 'react-router-dom'
import path from '../ultils/path'

const {AiOutlineMenu, AiFillEye, BsFillSuitHeartFill} = icons

const Product = ({productData, isNew}) => {
    const[ isShowOption, setIsShowOption ] = useState(false)
    return (
        <div className='w-full text-base px-[10px]'>
            <Link 
            className='w-full border p-[15px] flex flex-col items-center'
            to={`/${path.DETAIL_PRODUCT}/${productData?._id}/${productData?.productName}`}
            onMouseEnter={e => {
                e.stopPropagation()
                setIsShowOption(true)
            }}
            onMouseLeave={e => {
                e.stopPropagation()
                setIsShowOption(false)
            }}
            >
            <div className='w-full relative flex flex-col items-center'>
                { isShowOption && <div 
                className='absolute bottom-0 flex justify-center left-0 right-0 gap-2 animate-slide-top'
                >
                     <SelectOption icon={<AiFillEye />}/>
                     <SelectOption icon={<AiOutlineMenu />}/>
                     <SelectOption icon={<BsFillSuitHeartFill/>}/>
                </div>}
                <img src={ productData?.imageUrl[0] || 'https://www.panzerwrecks.com/wp-content/uploads/2022/09/No-product.png'}  
                alt='' 
                className='w-[274px] h-[274px] object-cover' />
                <img src={isNew ? label : labelBlue} alt='' className='absolute top-[-15px] left-[-38px] w-[100px] h-[35px] object-cover'/>
            <span className='font-bold absolute top-[-15px] left-[-12px] text-white'>{isNew ? 'Sale' : 'New'}</span>
            </div>
            <div className='flex flex-col gap-1 mt-[15px] items-start w-full'>
                <span className='flex h-4'>{renderStarFromNumber(productData?.totalRatings)?.map((el, index) =>(
                    <span key={index}>{el}</span>
                ))}</span>
                <span className='line-clamp-2'>{productData?.productName}</span>
                <span>{`${formatMoney(productData?.price)} VNĐ`}</span>
            </div>
            </Link>
        </div>
    )
}

export default Product