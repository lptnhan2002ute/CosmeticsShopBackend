import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { createSearchParams, useParams, useSearchParams } from 'react-router-dom'
import { apiGetProduct, apiGetProducts, apiGetProductCategory, apiUpdateCart, apiGetUserCart, apiRatings } from '../../apis'
import { Breadcrumb, Button2, SelectQuantity, ProductInfo, CustomSlider, VoteBar, VoteOption, Button, Comment } from '../../components'
import Slider from 'react-slick'
import { fotmatPrice, formatMoney, renderStarFromNumber } from '../../ultils/helpers'
import { productInformation } from '../../ultils/contants'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { updateCart } from '../../store/users/userSlice'
import Swal from 'sweetalert2'
import path from '../../ultils/path'
import withBaseComponent from '../../hocs/withBaseComponent'
import { showModal } from '../../store/appSlice'


const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1
};

const DetailProduct = ({ isQuickView, data, navigate, dispatch, location, totalRatings }) => {
    const titleRef = useRef()
    const params = useParams()
    // const { pid, title, category } = useParams()
    const { current } = useSelector(state => state.user)
    const [product, setProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [relatedProduct, setRelatedProduct] = useState(null)
    const [pid, setPid] = useState(null)
    const [category, setCategory] = useState(null)
    const [title, setTitle] = useState(null)
    const [updated, setUpdated] = useState(false)

    const fetchProductData = async () => {
        const response = await apiGetProduct(pid)
        if (response.success) setProduct(response.productData)
    }
    const fetchProducts = async () => {
        const payload = {
            category
        }

        const response = await apiGetProductCategory(payload)

        if (response?.success) setRelatedProduct(response.productData)
    }
    const rerender = useCallback(() => {
        setUpdated(!updated)
    }, [updated])
    useEffect(() => {
        if (pid) {
            fetchProductData()
            fetchProducts()
        }
        if (!isQuickView) titleRef.current.scrollIntoView({ block: 'center' })
    }, [pid])

    useEffect(() => {
        if (pid) {
            fetchProductData()
        }
    }, [updated])

    useEffect(() => {
        if (data) {
            setPid(data.pid)
            setCategory(data.category)
            setTitle(data.title)
        }
        else if (params && params.pid) {
            setPid(params.pid)
            setCategory(params.category)
            setTitle(params.title)
        }

    }, [data, params])
    const handleQuantity = useCallback((number) => {
        if (!Number(number) || Number(number) < 1) {
            return
        } else {
            setQuantity(number)
        }
    }, [quantity])
    const handleChangeQuantity = useCallback((flag) => {
        if (flag === 'minus' && quantity === 1) return
        if (flag === 'minus') setQuantity(prev => +prev - 1)
        if (flag === 'plus') setQuantity(prev => +prev + 1)
    }, [quantity])

    const handleAddToCart = async () => {
        if (!current) return Swal.fire({
            title: 'Almost...',
            text: ' Please login first',
            icon: 'info',
            cancelButtonText: 'Not now!',
            showCancelButton: true,
            confirmButtonText: 'Go login page!'
        }).then(async (rs) => {
            if (rs.isConfirmed) navigate({
                pathname: `/${path.LOGIN}`,
                search: createSearchParams({ redirect: location.pathname }).toString()
            })
        })
        const response = await apiUpdateCart({ pid: product._id, quantity: quantity })
        if (response.success) {
            toast.success(response.mess)
            const getCarts = await apiGetUserCart()
            dispatch(updateCart({ products: getCarts.userCart.cart.products }))
        }
        else toast.error(response.mess)
    }
    const handleSubmitVoteOption = async (value) => {
        console.log(value)
        if (!value.comment || !value.star) {
            alert('Vui lòng thêm nhận xét của bạn')
            return
        }
        const response = await apiRatings({ star: value.star, comment: value.comment, pid: product?._id, updatedAt: Date.now() })
        console.log(response)
        dispatch(showModal({ isShowModal: false, modalChildren: null }))
        rerender()

    }
    const handleVoteNow = () => {
        if (!current) return Swal.fire({
            title: 'Almost...',
            text: ' Please login first to vote',
            icon: 'info',
            cancelButtonText: 'Not now!',
            showCancelButton: true,
            confirmButtonText: 'Go login page!'
        }).then(async (rs) => {
            if (rs.isConfirmed) navigate({
                pathname: `/${path.LOGIN}`,
                search: createSearchParams({ redirect: location.pathname }).toString()
            })
        })
        else {
            dispatch(showModal({
                isShowModal: true,
                modalChildren: <VoteOption
                    productName={product?.productName}
                    handleSubmitVoteOption={handleSubmitVoteOption}
                />
            }))
        }
    }
    return (
        <div className={clsx('w-full relative')}>
            {!isQuickView && <div className='h-[81px] bg-gray-100 flex justify-center items-center bg-gray-100'>
                <div ref={titleRef} className='w-main '>
                    <h3 className='font-semibold'>{title}</h3>
                    <Breadcrumb title={title} category={Array.isArray(relatedProduct) ? relatedProduct[0].category.categoryName : ""} />
                </div>
            </div>}
            <div onClick={e => e.stopPropagation()} className={clsx('w-main bg-white m-auto mt-4 flex', isQuickView ? 'max-w-[900px] gap-8 p-8 max-h-[80vh] overflow-y-auto' : 'w-main')}>
                <div className={clsx('w-2/5 flex flex-col gap-4', isQuickView && 'w-1/2')}>
                    <img src={product?.imageUrl[0]} alt='ảnh' className='h-[458px] w-[458px] object-cover border' />
                    <div className='w-[458px]'>
                        <Slider className='image-slider' {...settings}>
                            {product?.imageUrl?.map(el => (
                                <div className='px-2' key={el}>
                                    <img src={el} alt='product' className='h-[143px] w-[143px] object-cover border' />
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
                <div className={clsx('w-2/5 flex flex-col gap-4 pr-[24px]', isQuickView && 'w-1/2')}>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-[30px] font-semibold'>
                            {`${formatMoney(fotmatPrice(product?.price))} VNĐ`}
                        </h2>
                        <span className='text-sm text-main'>{`Kho: ${product?.stockQuantity}`}</span>
                    </div>
                    <div className='flex items-center gap-1 '>
                        {renderStarFromNumber(product?.totalRatings)?.map((el, index) => (<span key={index}>{el}</span>))}
                        <span className='text-sm italic'>{`(Đã bán: ${product?.soldQuantity} sản phẩm)`}</span>
                    </div>
                    <div className='text-gray-500'>
                        {JSON.stringify(product?.description)}
                    </div>
                    <div className='flex flex-col gap-8'>
                        <div className='flex items-center gap-4'>
                            <span className='font-semibold'>Số lượng</span>
                            <SelectQuantity quantity={quantity} handleQuantity={handleQuantity}
                                handleChangeQuantity={handleChangeQuantity}
                            />
                        </div>
                        <Button2 fw handleOnClick={handleAddToCart}>
                            Thêm vào giỏ hàng
                        </Button2>
                    </div>
                </div>
                {!isQuickView && <div className='w-1/5'>
                    {productInformation.map(el => (
                        <ProductInfo
                            key={el.id}
                            title={el.title}
                            icon={el.icon}
                            sub={el.sub}
                        />
                    ))}
                </div>
                }
            </div>
            {!isQuickView && <div className='flex p-4 flex-col'>
                <div className='flex'>
                    <div className='flex-4 border flex-col flex items-center justify-center border-red-500'>
                        <span className='font-semibold text-3xl'>{`${product?.totalRatings}/5`}</span>
                        <span className='flex items-center gap-1'>{renderStarFromNumber(product?.totalRatings)?.map((el, index) => (
                            <span key={index}>{el}</span>
                        ))}</span>
                        <span className='text-sm'>{`${product?.ratings?.length} Người đánh giá`}</span>
                    </div>
                    <div className='flex-6 border gap-5 flex flex-col p-4 items-center'>
                        {Array.from(Array(5).keys()).reverse().map(el => (
                            <VoteBar
                                key={el}
                                number={el + 1}
                                ratingTotal={product?.totalRatings}
                                ratingCount={product?.ratings?.filter(i => i.star === el + 1)?.length}
                            />
                        ))}
                    </div>
                </div>
                <div className='p-4 flex flex-col gap-2 items-center justify-center text-sm'>
                    <span>Bạn có muốn đánh giá sản phẩm này không?</span>
                    <Button name='Đánh giá ngay!' handleOnClick={handleVoteNow}>Đánh giá ngay!</Button>
                </div>
                <div className='flex flex-col gap-4'>
                    {product?.ratings?.map(el => (
                        <Comment
                            key={el._id}
                            star={el.star}
                            updatedAt={el.updatedAt}
                            comment={el.comment}
                            name={el.postedBy?.name}
                            image={el.postedBy?.avatar}
                        />
                    ))}</div>
            </div>}
            {!isQuickView && <>
                <div className='w-main m-auto mt-8'>
                    <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main'>Người dùng khác cũng mua:</h3>
                    <CustomSlider products={relatedProduct} />
                </div>
                <div className='h-[100px] w-full'></div>
            </>}
        </div>
    )
}

export default withBaseComponent(memo(DetailProduct))