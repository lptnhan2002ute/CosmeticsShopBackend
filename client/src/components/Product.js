import React, { memo, useState } from 'react'
import { formatMoney } from '../ultils/helpers'
import label from '../assets/label.png'
import labelBlue from '../assets/label.png'
import { renderStarFromNumber } from '../ultils/helpers'
import { SelectOption } from './'
import icons from '../ultils/icon'
import { Link } from 'react-router-dom'
import path from '../ultils/path'
import withBaseComponent from '../hocs/withBaseComponent'
import { showModal } from '../store/appSlice'
import DetailProduct from '../pages/public/DetailProduct'

const { AiOutlineMenu, AiFillEye, BsFillSuitHeartFill } = icons

const Product = ({ productData, isNew, navigate, dispatch }) => {
    const [isShowOption, setIsShowOption] = useState(false)
    const handleClickOptions = (e, flag) => {
        e.stopPropagation()
        if (flag === 'MENU') navigate(`/${productData?.category?._id}/${productData?._id}/${productData?.productName}`)
        if (flag === 'WISHLIST') console.log('WISHLIST')
        if (flag === 'QUICK_VIEW') {
            dispatch(showModal({ isShowModal: true, modalChildren: <DetailProduct data={{ pid: productData?._id, category: productData?.category?.categoryName }} isQuickView /> }))
        }
    }
    return (
        <div className='w-full text-base px-[10px]'>
            <div
                className='w-full border p-[15px] flex flex-col items-center'
                onClick={e => navigate(`/${productData?.category?._id}/${productData?._id}/${productData?.productName}`)}
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
                    {isShowOption && <div
                        className='absolute bottom-0 flex justify-center left-0 right-0 gap-2 animate-slide-top'
                    >
                        <span onClick={(e) => handleClickOptions(e, 'QUICK_VIEW')}><SelectOption icon={<AiFillEye />} /> </span>
                        <span onClick={(e) => handleClickOptions(e, 'MENU')}><SelectOption icon={<AiOutlineMenu />} /> </span>
                        <span onClick={(e) => handleClickOptions(e, 'WISHLIST')}><SelectOption icon={<BsFillSuitHeartFill />} /></span>
                    </div>}
                    <img src={productData?.imageUrl[0] || 'https://www.panzerwrecks.com/wp-content/uploads/2022/09/No-product.png'}
                        alt=''
                        className='w-[274px] h-[274px] object-cover' />
                    <img src={isNew ? label : labelBlue} alt='' className='absolute top-[-15px] left-[-38px] w-[100px] h-[35px] object-cover' />
                    <span className='font-bold absolute top-[-15px] left-[-12px] text-white'>{isNew ? 'Sale' : 'New'}</span>
                </div>
                <div className='flex flex-col gap-1 mt-[15px] items-start w-full'>
                    <span className='flex h-4'>{renderStarFromNumber(productData?.totalRatings)?.map((el, index) => (
                        <span key={index}>{el}</span>
                    ))}</span>
                    <span className='line-clamp-1'>{productData?.productName}</span>
                    <span>{`${formatMoney(productData?.price)} VNĐ`}</span>
                </div>
            </div>
        </div>
    )
}

export default withBaseComponent(memo(Product))