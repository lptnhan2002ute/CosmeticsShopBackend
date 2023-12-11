import React,{memo, useEffect, useState} from 'react'
import { InputForm, Select, ButtonAdmin } from '../../components'
import { useForm } from 'react-hook-form'
import {useSelector } from 'react-redux'
import { apiGetAllBrand, apiUpdateProduct } from '../../apis'
import { toast } from 'react-toastify'
import {Spin} from 'antd'
import { useNavigate } from 'react-router-dom'



const UpdateProduct = ({editProduct, render, setEditProduct}) => {
    const{categories} = useSelector(state => state.app)
    const[brand, setBrand] = useState([])
    const [loading, setLoading] = useState(false)
    const fetchBrands = async () => { 
        const response = await apiGetAllBrand()
        if (response.success) setBrand(response.brandList)
    }
    const handleBack = () => {
        setEditProduct(null)
    }
    useEffect(() =>{
        reset({
            productName: editProduct?.productName || '',
            price: editProduct?.price || '',
            description: editProduct?.description || '',
            stockQuantity: editProduct?.stockQuantity || '',
            category: editProduct?.category.categoryName || '',
            brand: editProduct?.brand.brandName || ''
        })
    },[editProduct])
    useEffect(() => {
        fetchBrands()
      },[]) 
    const {register, formState: {errors}, reset, handleSubmit, setError} = useForm()
    const handleCreateProduct = async (data) => {
            setLoading(true)
            try {
                const response = await apiUpdateProduct(data, editProduct._id)
                if (response.success){
                 toast.success('Sửa sản phẩm thành công')
                 setEditProduct(null)
                 render()
                } else toast.error(response.mess)
                setLoading(false)
            } catch (error) {
                setLoading(false)
            }
    }
    return (
        <Spin size='large' spinning={loading}>
             <div className='w-full flex flex-col gap-4 relative'>
            <div className='h-[69px] w-full'></div>
            <div className='p-4 border-b w-full flex justify-between items-center border-main fixed top-0 bg-gray-100'>
            <h1 className='text-3xl font-bold tracking-tight '>Cập nhật sản phẩm</h1>
            </div>

            <form onSubmit={handleSubmit(handleCreateProduct)}>
                    <InputForm 
                    label='Tên sản phẩm'
                    register={register}
                    errols={errors}
                    id='productName'
                    validate={{
                        required: "Cần điền vào trường này"
                    }}
                    fw
                    placeholder='Tên của sản phẩm'
                    style='h-[78px] rounded-[6px] '
                    />
                    <div className='w-full flex gap-4 my-6 '>
                    <InputForm 
                    label='Giá sản phẩm'
                    register={register}
                    errols={errors}
                    id='price'
                    validate={{
                        required: "Cần điền vào trường này"
                    }}
                    style='flex-auto rounded-[6px]'
                    placeholder='Giá của sản phẩm'
                    type='number'
                    fw
                    />
                    <InputForm 
                    label='Số lượng sản phẩm'
                    register={register}
                    errols={errors}
                    id='stockQuantity'
                    validate={{
                        required: "Cần điền vào trường này"
                    }}
                    style='flex-auto rounded-[6px]'
                    placeholder='Số lượng của sản phẩm'
                    type='number'
                    fw
                    />

                    </div>    
                    <div className='my-4'>
                        <Select 
                        label='Category'
                        options={categories?.map(el => ({code: el._id, value: el.categoryName}))}
                        register={register}
                        id='category'
                        validate={{required: 'Vui lòng nhập trường này'}}
                        style='flex-auto mt-4 h-[90px] rounded-[6px]'
                        errors={errors}
                        fullwidth
                        />
                        <Select 
                        label='Brand'
                        options={brand?.map(el => ({code: el?._id, value: el?.brandName}))}
                        register={register}
                        id='brand'
                        validate={{required: 'Vui lòng nhập trường này'}}
                        style='flex-auto mt-4 h-[90px] rounded-[6px]'
                        errors={errors}
                        fullwidth
                        />
                        <div className='mt-4'>
                        <InputForm 
                    label='Mô tả sản phẩm'
                    register={register}
                    errols={errors}
                    id='description'
                    validate={{
                        required: "Cần điền vào trường này"
                    }}
                    fw
                    placeholder='Mô tả của sản phẩm'
                    style='h-[78px] rounded-[6px]'
                    />
                        </div>
                    </div>
                    <div className='my-6 flex items-center'>
                    <ButtonAdmin type='submit'>Cập nhật sản phẩm</ButtonAdmin>
                    <div onClick={handleBack} className='px-[10px] py-[8px] w-[80px] bg-orange-500 text-white rounded-[6px] ml-[50px] cursor-pointer flex items-center justify-center'>Trở về</div>
                    </div>
                </form>
        </div>
        </Spin>
        
    )
}

export default memo(UpdateProduct) 