import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Breadcrumb, Product, } from '../../components'
import { apiGetProductCategory, apiGetRecommendedProducts } from '../../apis'
import Masonry from 'react-masonry-css'
import { Pagination, Input, Spin, Button } from 'antd'
import { useSelector } from 'react-redux'
import { Slider } from 'antd';

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
};

const { Search } = Input

const Products = () => {
    const { current } = useSelector(state => state.user);
    const [activeClick, setActiveClick] = useState(null)
    const [relatedProduct, setRelatedProduct] = useState(null)
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [value, setValue] = useState(null)
    const [showRecommend, setShowRecommend] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [lowPrice, setLowPrice] = useState(0);
    const [highPrice, setHighPrice] = useState(3000000);

    const navigate = useNavigate();

    const onChange = async (page) => {

        setPage(page);
        fetchProducts(category, 12, page, value)
    }

    const onSearch = async (value) => {

        setValue(value)
        await fetchProducts(category, 12, page, encodeURIComponent(value))
    }

    const onFocus = () => {
        setShowRecommend(true);
    }
    const onBlur = (e) => {
        console.log(e)
        setShowRecommend(false);
    }

    const handleReload = () => {
        fetchProducts(category, 12, 1)
    }

    const fetchRecommendedProducts = async () => {
        const rs = await apiGetRecommendedProducts(current._id);
        setRecommendedProducts(rs.products);
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

        payload = {
            ...payload,
            'price[gte]': lowPrice,
            'price[lte]': highPrice
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
        fetchRecommendedProducts();
    }, [])
    const changeActiveFilter = useCallback((name) => {
        if (activeClick === name) setActiveClick(null)
        else setActiveClick(name)
    }, [activeClick])
    return (
        <div className='w-full'>
            <div className='h-[81px] bg-gray-100 flex justify-center items-center'>
                <div className='w-main '>
                    <h3 className='font-semibold uppercase'>{category ? Array.isArray(relatedProduct) ? relatedProduct[0]?.category.categoryName : "" : "Danh sách sản phẩm"}</h3>
                    <Breadcrumb category={category ? Array.isArray(relatedProduct) ? relatedProduct[0]?.category.categoryName : "" : "Tất cả sản phẩm"} />
                </div>
            </div>
            <div className='w-max rounded-xl flex justify-center mt-8 m-auto items-center'>
                <Button onClick={handleReload} className="mr-[50px]">
                    <p>Tất cả sản phẩm</p>
                </Button>
                <div className='relative'>
                    <Search
                        className="w-[60vw]"
                        placeholder="Nhập tên sản phẩm..."
                        allowClear
                        enterButton="Search"
                        size="large"
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={onSearch}
                        onFocus={onFocus}
                        onBlur={onBlur}
                    />
                    <div className='w-full flex flex-col gap-2 mt-6'>
                        <p>Nhập khoảng giá phù hợp với bạn:</p>
                        <div className='flex flex-col'>
                            <div className='flex gap-4'>
                                <Input
                                    className='w-[200px]'
                                    addonAfter='VNĐ'
                                    defaultValue={0}
                                    onChange={(e) => setLowPrice(parseInt(e.target.value) || 0)}
                                />
                                ~
                                <Input
                                    className='w-[200px]'
                                    addonAfter='VNĐ'
                                    defaultValue={3000000}
                                    onChange={(e) => setHighPrice(parseInt(e.target.value) || 3000000)}
                                />
                            </div>
                            {/* <Slider
                                className='flex-1'
                                range={{ draggableTrack: true }}
                                min={0}
                                max={1000000}
                                step={10000}
                                defaultValue={[0, 300000]}
                                value={[lowPrice, highPrice]}
                                onChangeComplete={(values => {
                                    setLowPrice(values[0]);
                                    setHighPrice(values[1]);
                                })}
                            /> */}
                        </div>
                    </div>
                    {!searchText && showRecommend && recommendedProducts?.length > 0 &&
                        <div className='absolute w-[calc(100%_-_80px)] min-h-[100px] bg-white z-10 top-[60%] right-[80px]'>
                            <div className='flex flex-col gap-4 p-4 rounded-md shadow-lg border-[1px]'>
                                {recommendedProducts.slice(0, 5).map((prod, i) => (
                                    <div onMouseDown={(e) => { navigate(`/${prod.category._id}/${prod._id}/${prod.productName}`); }} className='flex cursor-pointer hover:opacity-80 items-center gap-6'>
                                        <p className='max-w-[600px] text-sm truncate'>{prod.productName}</p>
                                        <img className='w-auto h-[40px] object-contain' src={prod.imageUrl?.at(0)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div className='mt-8 w-main m-auto'>
                <Spin spinning={loading} tip="Loading..." size='large' >
                    {
                        relatedProduct?.length > 0 ? (
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
                        ) : (
                            <div className='flex w-full justify-center'>Hiện tại không có sản phẩm nào</div>
                        )
                    }
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