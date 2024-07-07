import React, { useState, useEffect } from 'react'
import { apiGetProducts } from '../apis/product'
import { Product, CustomSlider } from '.'
import { getNewProducts } from '../store/products/asyncActions'
import { useDispatch, useSelector } from 'react-redux'
import { clsx } from 'clsx';

const tabs = [
    { id: 1, name: 'Hàng bán chạy' },
    { id: 2, name: 'Hàng mới nhất' },
    { id: 3, name: 'Hàng Flash Sale' },
]

const BestSeller = () => {
    const [bestSellers, setBestSellers] = useState([])
    const [flashsaleProducts, setFlashSaleProducts] = useState([]);
    const [activedTab, setActivedTab] = useState(1)
    const [products, setProducts] = useState([])
    const dispatch = useDispatch()
    const { newProducts } = useSelector(state => state.products)
    const { isShowModal } = useSelector(state => state.app)


    const fetchProducts = async () => {
        const response = await apiGetProducts({ sort: '-soldQuantity' })
        if (response.success) {
            setBestSellers(response.productData)
            setProducts(response.productData)
            setFlashSaleProducts(response.productData.filter(e => e.isFlashsale))
        }
    }

    useEffect(() => {
        fetchProducts()
        dispatch(getNewProducts())
    }, [])

    useEffect(() => {
        if (activedTab === 1) setProducts(bestSellers)
        if (activedTab === 2) setProducts(newProducts)
        if (activedTab === 3) setProducts(flashsaleProducts)
    }, [activedTab])

    return (
        <div className={clsx(isShowModal ? 'hidden' : '')}>
            <div className='flex text-[15px] ml-[-32px]'>
                {tabs.map(el => (
                    <span
                        key={el.id}
                        className={`font-semibold px-8 capitalize cursor-pointer border-r text-gray-400 ${activedTab === el.id ? 'text-gray-900' : ''}`}
                        onClick={() => setActivedTab(el.id)}
                    > {el.name} </span>
                ))}
            </div>
            <div className='mt-4 mx-[-10px] border-t-2 border-main pt-4'>
                {
                products.length > 0 ? (
                    <CustomSlider products={products} activedTab={activedTab} />
                ) : (
                    <div className='flex w-full justify-center items-center min-h-[438px]'>
                        Hiện tại không có sản phẩm nào
                    </div>
                )
            }
            </div>
            <div className='w-full flex gap-4 mt-4'>
                <img
                    src='https://topprint.vn/wp-content/uploads/2021/07/banner-my-pham-dep-11.png'
                    alt='banner'
                    className='flex-1 object-cover w-full h-[200px] rounded-2xl'
                />
                <img
                    src='https://myphamhanskinaz.com/wp-content/uploads/2021/09/kinh-doanh-online-nen-lay-hang-o-dau1.jpg'
                    alt='banner'
                    className='flex-1 object-cover w-full h-[200px] rounded-2xl'
                />
            </div>
        </div>
    )

}

export default BestSeller