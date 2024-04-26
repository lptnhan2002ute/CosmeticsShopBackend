import React,{useEffect, useState} from 'react'
import { InputForm, Select, ButtonAdmin } from '../../components'
import { useForm } from 'react-hook-form'
import {useSelector } from 'react-redux'
import { apiGetAllBrand, apiCreateProduct } from '../../apis'
import { toast } from 'react-toastify'
import {Spin} from 'antd'

const CreateProduct = () => {
    const{categories} = useSelector(state => state.app)
    const[brand, setBrand] = useState([])
    const [avatar, setAvatar] = useState(null)
    const [imageError, setImageError] = useState(null)
    const [loading, setLoading] = useState(false)
    const handleChooseImage = (e) => {
        const file = e.target.files[0]
        file.preview = URL.createObjectURL(file)

        setAvatar(file)
        console.log('1')
    }
    const fetchBrands = async () => { 
        const response = await apiGetAllBrand()
        if (response.success) setBrand(response.brandList)
    }
    useEffect(() => {
        fetchBrands()
      },[])
    useEffect(() => {
        return () => {
            avatar && URL.revokeObjectURL(avatar.preview)
        }
    }, [avatar]);  
    
    const {register, formState: {errors}, reset, handleSubmit, setError} = useForm()
    const handleCreateProduct = async (data) => {
        if (avatar){
            const formData = new FormData()
            formData.append('images', avatar)
            Object.keys(data).forEach(key => formData.append(key, data[key]))
            setLoading(true)
            try {
                const response = await apiCreateProduct(formData)
                if (response.success){
                 toast.success('Thêm sản phẩm thành công')
                 reset() 
                 setAvatar(null)
                } else toast.error(response.mess)
                setLoading(false)
            } catch (error) {
                setLoading(false)
            }
        } else{
              setImageError('Không được để trống ảnh')

        }
    }
    return (
        <Spin size='large' spinning={loading}>
            <div className='w-full'>
            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <span>Tạo sản phẩm</span>
            </h1>
            <div className='p-4 '>
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
                        options={brand?.map(el => ({code: el._id, value: el.brandName}))}
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
                    <div className='flex flex-col gap-2 mt-8'>
                        <label className='font-semibold' htmlFor='images'>Tải ảnh lên</label>
                        <input type='file' id='images'
                        onChange={(e) => handleChooseImage(e)}
                        register={register}
                        />
                        {imageError && <small className='text-xs text-red-500'>{imageError}</small>}
                        {
	                      avatar && <img className='h-[150px] w-[150px]' src={avatar.preview} />
                        }
                    </div>
                    <div className='my-6'>
                    <ButtonAdmin type='submit'>Tạo sản phẩm mới</ButtonAdmin>
                    </div>
                </form>
            </div>
        </div>
        </Spin>
    )
}

export default CreateProduct