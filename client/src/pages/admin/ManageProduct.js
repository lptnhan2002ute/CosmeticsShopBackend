import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { apiDeleteProduct, apiGetAllBrand, apiGetProductCategory } from '../../apis/product'
import moment from 'moment'
import UpdateProduct from './UpdateProduct'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { Pagination, Input } from 'antd'


const { Search } = Input

const ManageProduct = () => {

    const { register, formState: { errors }, handleSubmit } = useForm()
    const [value, setValue] = useState(null)
    const [count, setCount] = useState(0)
    const [products, setProducts] = useState(null)
    const [editProduct, setEditProduct] = useState(null)
    const [update, setUpdate] = useState(false)
    const [page, setPage] = useState(1)
    const [brand, setBrand] = useState([])

    const fetchBrands = async () => {
        const response = await apiGetAllBrand()
        if (response.success) setBrand(response.brandList)
        console.log(response)
    }

    useEffect(() => {
        fetchBrands()
    }, [])

    const render = useCallback(() => {
        setUpdate(!update)
    })
    const onSearch = async (value) => {

        setValue(value)
        await fetchProducts(12, page, encodeURIComponent(value))
    }
    const onChange = async (page) => {

        setPage(page);
        fetchProducts(12, page, value)
    }
    const fetchProducts = async (limit, page, name) => {

        let payload = {
            limit,
            page: page
        }

        if (name) {
            payload = {
                ...payload,
                productName: name
            }
        }

        try {
            const response = await apiGetProductCategory(payload)
            if (response.success) {
                setProducts(response.productData)
                setCount(response.counts)
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetchProducts(12, page)
    }, [update])
    const handleDeleteProduct = (pid) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Are you sure you want to Delete this product?',
            icon: 'warning',
            showCancelButton: true
        }).then(async (rs) => {
            if (rs.isConfirmed) {
                const response = await apiDeleteProduct(pid)
                if (response.success) toast.success('Delete successfully!')
                else toast.error('Something went wrong...')
                render()
            }
        })
    }

    return (
        <div className='w-full flex flex-col gap-3 relative overflow-x-scroll'>
            {editProduct && <div className='absolute inset-0 min-h-screen bg-gray-100 z-50 '>
                <UpdateProduct brand={brand} editProduct={editProduct} render={render} setEditProduct={setEditProduct} />
            </div>}
            <div className='h-[69px] w-full'></div>
            <div className='p-4 border-b w-full flex justify-between items-center border-main fixed top-0 bg-gray-100'>
                <h1 className='text-3xl font-bold tracking-tight '>Quản lý sản phẩm</h1>
            </div>
            <div className='px-[20px]'>
                <div className='flex w-full justify-end items-center py-4 px-2 mb-[20px]'>

                    <Search
                        className="w-[60vw]"
                        placeholder="Nhập tên sản phẩm..."
                        allowClear
                        enterButton="Search"
                        size="large"
                        onSearch={onSearch}
                    />
                </div>
                <table className='table-auto'>
                    <thead className='border bg-main text-white border-white '>
                        <tr className='border border-main'>
                            <th className='text-center py-2'>STT</th>
                            <th className='text-center py-2'>Avatar</th>
                            <th className='text-center py-2'>Name</th>
                            <th className='text-center py-2'>Brand</th>
                            <th className='text-center py-2'>Category</th>
                            <th className='text-center py-2'>Price</th>
                            <th className='text-center py-2'>Quantity</th>
                            <th className='text-center py-2'>Sold</th>
                            <th className='text-center py-2'>Star</th>
                            <th className='text-center py-2'>UpdatedAt</th>
                            <th className='text-center py-2'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.map((el, index) => (
                            <tr className='border border-main' key={el._id}>
                                <td className='text-center py-2'>{index + 1}</td>
                                <td className='text-center py-2'>
                                    <img src={el.imageUrl[0]} alt='avatar' className='w-12 h-12 object-cover' />
                                </td>
                                <td className='text-center py-2'>{el?.productName}</td>
                                <td className='text-center py-2'>{el?.brand?.brandName}</td>
                                <td className='text-center py-2'>{el?.category?.categoryName}</td>
                                <td className='text-center py-2'>{el?.price}</td>
                                <td className='text-center py-2'>{el?.stockQuantity}</td>
                                <td className='text-center py-2'>{el?.soldQuantity}</td>
                                <td className='text-center py-2'>{el?.totalRatings}</td>
                                <td className='text-center py-2'>{moment(el?.updatedAt).format('DD/MM/YYYY')}</td>
                                <td className='text-center py-2'>
                                    <span onClick={() => setEditProduct(el)} className='text-main hover:underline cursor-pointer px-1'>Sửa</span>
                                    <span onClick={() => handleDeleteProduct(el._id)} className='text-main hover:underline cursor-pointer px-1'>Xóa</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
        </div>
    )
}

export default ManageProduct