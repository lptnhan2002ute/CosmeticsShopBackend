import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Breadcrumb, Product, } from '../../components'
import { apiGetProductCategory } from '../../apis'
import Masonry from 'react-masonry-css'
import { Pagination, Input, Spin, Button } from 'antd'

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
};

const { Search } = Input

const Products = () => {
    const [activeClick, setActiveClick] = useState(null)
    const [relatedProduct, setRelatedProduct] = useState(null)
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [value, setValue] = useState(null)

    const onChange = async (page) => {

        setPage(page);
        fetchProducts(category, 12, page, value)
    }

    const onSearch = async (value) => {

        setValue(value)
        await fetchProducts(category, 12, page, encodeURIComponent(value))
    }

    const handleReload = () => {
        fetchProducts(category, 12, 1)
    }

    const fetchProducts = async (category, limit, page, name) => {

        let payload = {
            limit,
            page: page
        }
        if (category) {
            if (name) {
                payload = {
                    ...payload,
                    category,
                    productName: name
                }
            } else {
                payload = {
                    ...payload,
                    category
                }
            }
        } else {
            if (name) {
                payload = {
                    ...payload,
                    productName: name
                }
            }
        }

        try {
            setLoading(true)
            const response = await apiGetProductCategory(payload)
            if (response.success) {
                setRelatedProduct(response.productData)
                setCount(response.counts)
            }
            setLoading(false)
        } catch (err) {
            console.log(err)
            setLoading(false)
        }
    }

    const { category } = useParams()
    useEffect(() => {
        fetchProducts(category, 12, 1)
    }, [])
    const changeActiveFilter = useCallback((name) => {
        if (activeClick === name) setActiveClick(null)
        else setActiveClick(name)
    }, [activeClick])
    return (
        <div className='w-full'>
            <div className='h-[81px] bg-gray-100 flex justify-center items-center'>
                <div className='w-main '>
                    <h3 className='font-semibold uppercase'>{category ? Array.isArray(relatedProduct) ? relatedProduct[0].category.categoryName : "" : "Danh sách sản phẩm"}</h3>
                    <Breadcrumb category={category ? Array.isArray(relatedProduct) ? relatedProduct[0].category.categoryName : "" : "Tất cả sản phẩm"} />
                </div>
            </div>
            <div className='w-max rounded-xl flex justify-center mt-8 m-auto items-center'>
                <Button onClick={handleReload} className="mr-[50px]">
                    <p>Tất cả sản phẩm</p>
                </Button>
                <Search
                    className="w-[60vw]"
                    placeholder="Nhập tên sản phẩm..."
                    allowClear
                    enterButton="Search"
                    size="large"
                    onSearch={onSearch}
                />
            </div>
            <div className='mt-8 w-main m-auto'>
                <Spin spinning={loading} tip="Loading..." size='large' >
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
                </Spin>
            </div>
            <div className='w-full p-[40px] flex items-center justify-center'>
                <Pagination
                    defaultPageSize={12}
                    current={page}
                    onChange={onChange}
                    total={count}
                    showSizeChanger={false}
                />
            </div>
        </div>
    )
}

export default Products