import React, {useCallback, useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { apiGetProduct, apiGetProducts, apiGetProductCategory } from '../../apis'
import { Breadcrumb, Button2, SelectQuantity, ProductInfo, CustomSlider } from '../../components'
import Slider from 'react-slick'
import { fotmatPrice, formatMoney, renderStarFromNumber } from '../../ultils/helpers'
import { productInformation} from '../../ultils/contants'

const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1
};

const DetailProduct = () => {
    const {pid, title, category} = useParams()
    const [product, setProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [relatedProduct, setRelatedProduct] = useState(null)
    const fetchProductData = async () => {
        const response = await apiGetProduct(pid)
        if (response.success) setProduct(response.productData)
    }
    const fetchProducts = async () => {
        const response = await apiGetProductCategory({category})
        if (response?.success) setRelatedProduct(response.productData)
    }
    useEffect(() => {
       if (pid){
        fetchProductData()
        fetchProducts() 
       }

    }, [pid])
    const handleQuantity = useCallback((number) => {
        if (!Number(number) || Number(number) < 1){
            return
        }else {
       setQuantity(number)}
    }, [quantity])
    const handleChangeQuantity = useCallback((flag) =>{
        if (flag === 'minus' && quantity === 1) return
        if (flag === 'minus') setQuantity(prev => +prev - 1)
        if (flag === 'plus') setQuantity(prev => +prev + 1)
    }, [quantity])
    return (
        <div className='w-full'>
             <div className='h-[81px] bg-gray-100 flex justify-center items-center'>
                <div className='w-main '>
                <h3 className='font-semibold'>{title}</h3>
                <Breadcrumb title={title} category={category}/>
                </div>
             </div>
             <div className='w-main m-auto mt-4 flex'>
                <div className='w-2/5 flex flex-col gap-4'>
                    <img src={product?.imageUrl[0]} alt='ảnh' className='h-[458px] w-[458px] object-cover border'/>
                    <div className='w-[458px]'>
                         <Slider className='image-slider' {...settings}>
                            {product?.imageUrl?.map(el => (
                               <div className='px-2' key={el}>
                                 <img src={el} alt='product' className='h-[143px] w-[143px] object-cover border'/>
                               </div>
                            ))}
                         </Slider>
                    </div>
                </div>
                <div className='w-2/5 flex flex-col gap-4 pr-[24px]'>
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
                        <Button2 fw>
                           Thêm vào giỏ hàng
                        </Button2>
                    </div>
                </div>
                <div className='w-1/5'>
                    {productInformation.map(el =>(
                        <ProductInfo
                        key={el.id}
                        title={el.title}
                        icon={el.icon}
                        sub={el.sub}
                        />
                    ))}
                </div>
             </div>
             <div className='w-main m-auto mt-8'>
             <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main'>Người dùng khác cũng mua:</h3>
             <CustomSlider products={relatedProduct}/>
             </div>
             <div className='h-[100px] w-full'></div>
        </div>
    )
}

export default DetailProduct
