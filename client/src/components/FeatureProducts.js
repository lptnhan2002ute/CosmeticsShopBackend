import React,{ useState, useEffect } from 'react'
import { ProductCard } from './'
import { apiGetProducts } from '../apis'

const FeatureProducts = () => {
    const [ products, setProducts] = useState(null)
    const fetchProducts = async () => {
        const response = await apiGetProducts({limit: 9,page: 2})
        if (response.success) setProducts(response.productData)
    }
    useEffect(() => {
        fetchProducts()
    }, [])
    return (
        <div className='w-full'>
            <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main'>Sản Phẩm Nổi Bật</h3>
            <div className='flex flex-wrap mt-[15px] mx-[-10px]'>
                {products?.map(el => (
                    <ProductCard 
                        key= {el._id}
                        image={el.imageUrl}
                        title={el.productName}
                        totalRatings={el.totalRatings}
                        price={el.price}
                    />
                ))}
            </div>
            <div className='flex justify-between'>
                <img
                className='h-[657px] w-[49%] object-cover'
                src='https://www.chuphinhsanpham.vn/wp-content/uploads/2019/06/chup-anh-my-pham-dep-2.jpg'
                alt=''
                />
                <div className='flex flex-col justify-between gap-2 w-[24%]'>
                <img
                className='h-[338px] object-cover'
                src='https://hstatic.net/969/1000003969/10/2016/8-17/3.png'
                alt=''
                />
                <img
                className='h-[300px] object-cover'
                src='https://images.squarespace-cdn.com/content/v1/53883795e4b016c956b8d243/7bc1dc1a-1d6e-42ba-808f-c918e12a05e0/chup-anh-san-pham-Sam-8.jpg'
                alt=''
                />
                </div>
                <img
                className='h-[657px] w-[24%] object-cover'
                src='https://palstudio.vn/wp-content/uploads/2021/06/Bi-quyet-chup-anh-my-pham-chuyen-nghiep-e1624506668551.jpg'
                alt=''
                />
            </div>
        </div>
    )
}

export default FeatureProducts