import React, { memo, useState } from 'react'
import { formatMoney } from '../ultils/helpers'
import label from '../assets/label.png'
import labelBlue from '../assets/label.png'
import { renderStarFromNumber } from '../ultils/helpers'
import { SelectOption } from '.'
import icons from '../ultils/icon'
import path from '../ultils/path'
import Swal from 'sweetalert2'
import withBaseComponent from '../hocs/withBaseComponent'
import { showModal } from '../store/appSlice'
import DetailProduct from '../pages/public/DetailProduct'
import { apiUpdateCart, apiGetUserCart, apiUpdateWishlist } from '../apis'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { updateCart } from "../store/users/userSlice"
import { getCurrent } from '../store/users/asyncAction'
import { ClockCircleOutlined } from '@ant-design/icons'
import { Statistic } from 'antd';

const { Countdown } = Statistic;

const { BsCartPlus, AiFillEye, BsFillSuitHeartFill } = icons

const Product = ({ productData, isNew, navigate, dispatch }) => {
    const [isShowOption, setIsShowOption] = useState(false)
    const { current } = useSelector(state => state.user)

    const handleClickOptions = async (e, flag) => {
        e.stopPropagation()

        if (flag === 'CART') {
            if (!current) return Swal.fire({
                title: 'Almost...',
                text: ' Please login first',
                icon: 'info',
                cancelButtonText: 'Not now!',
                showCancelButton: true,
                confirmButtonText: 'Go login page!'
            }).then((rs) => {
                if (rs.isConfirmed) navigate(`/${path.LOGIN}`)
            })
            const response = await apiUpdateCart({ pid: productData._id })
            if (response.success) {
                toast.success(response.mess)
                const getCarts = await apiGetUserCart()
                dispatch(updateCart({ products: getCarts.userCart.cart.products }))
            }
            else toast.error(response.mess)
        }
        if (flag === 'WISHLIST') {
            const response = await apiUpdateWishlist(productData._id)
            if (response.success) {
                await dispatch(getCurrent())
                toast.success(response.mess)
            } else toast.error(response.mess)
        }
        if (flag === 'QUICK_VIEW') {
            dispatch(showModal({ isShowModal: true, modalChildren: <DetailProduct data={{ pid: productData?._id, category: productData?.category?.categoryName }} isQuickView /> }))
        }
    }
    return (
        <div className='w-full text-base px-[10px]'>
            <div
                className='w-full min-h-[438px] border p-[15px] flex flex-col items-center'
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
                        <span title='Quick view' onClick={(e) => handleClickOptions(e, 'QUICK_VIEW')}><SelectOption icon={<AiFillEye />} /> </span>
                        <span title='Add to Cart' onClick={(e) => handleClickOptions(e, 'CART')}><SelectOption icon={<BsCartPlus />} /> </span>
                        <span title='Add wishList' onClick={(e) => handleClickOptions(e, 'WISHLIST')}>
                            <SelectOption icon={
                                <BsFillSuitHeartFill color={current?.wishlist?.some(item => item._id === productData?._id) ? 'red' : 'gray'} />
                            } />
                        </span>
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
                    <div className='w-full flex items-center justify-between'>
                        <span className={`${productData?.isFlashsale && 'text-sm text-gray-700 line-through'}`}>{`${formatMoney(productData?.originalPrice)} VNĐ`}</span>
                        {productData?.isFlashsale && <span className='text-main'>{`${formatMoney(productData?.price)} VNĐ`}</span>}
                    </div>
                    {
                        productData?.isFlashsale && (
                            <div className='w-full flex items-center justify-between bg-main text-white p-2'>
                                <span className='font-semibold'>Flash Sale</span>
                                <Countdown valueStyle={{ color: 'white', fontSize: 16 }} value={Date.now() + productData?.timeRemaining} />
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default withBaseComponent(memo(Product))