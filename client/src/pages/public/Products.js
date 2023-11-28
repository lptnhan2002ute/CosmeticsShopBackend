import React, { useEffect, useState, useCallback} from 'react'
import { useParams , useSearchParams } from 'react-router-dom'
import { Breadcrumb, Product,  } from '../../components'
import {  apiGetProductCategory } from '../../apis'
import Masonry from 'react-masonry-css'

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };
const Products = () => {
    const [activeClick, setActiveClick] = useState(null)
    const [relatedProduct, setRelatedProduct] = useState(null)
    const fetchProducts = async () => {
        const payload={
            category
        }
        
        const response = await apiGetProductCategory(payload)

        if (response?.success) setRelatedProduct(response.productData)
    }
    
    const { category } = useParams()
    useEffect(() => {
        fetchProducts()
    }, [])
    const changeActiveFilter = useCallback((name) => {
       if (activeClick === name) setActiveClick(null)
       else setActiveClick(name)
    },[activeClick])
    return (
        <div className='w-full'>
            <div className='h-[81px] bg-gray-100 flex justify-center items-center'>
                <div className='w-main '>
                <h3 className='font-semibold uppercase'>{Array.isArray(relatedProduct)?relatedProduct[0].category.categoryName:""}</h3>
                <Breadcrumb category={Array.isArray(relatedProduct)?relatedProduct[0].category.categoryName:""}/>
                </div>
            </div>    
            <div className='w-main border p-4 flex justify-center mt-8 m-auto'>
               <div >
                    Tìm kiếm sản phẩm theo tên
                </div>
            </div>
            <div className='mt-8 w-main m-auto'>
            <Masonry
                 breakpointCols={breakpointColumnsObj}
                 className="my-masonry-grid flex mx-[-10px]"
                 columnClassName="my-masonry-grid_column ">
                 {relatedProduct?.map(el => (
                      <Product 
                      key={el.id}
                      pid={el.id}
                      productData={el}
                      normal={true}
                      />
                 ))}
            </Masonry>
            </div>
            <div className='w-full h-[500px]'></div>    
            
        </div>
    )
}

export default Products