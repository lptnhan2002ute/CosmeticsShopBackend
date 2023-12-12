import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ButtonAdmin, InputForm } from '../../components'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { apiUpdateUser1 } from '../../apis'
import { getCurrent } from '../../store/users/asyncAction'
import { toast } from 'react-toastify'

const Personal = () => {
    const {register, formState: {errors, isDirty}, handleSubmit, reset} = useForm()
    const { current } = useSelector(state => state.user)
    const dispatch = useDispatch()
    useEffect(() => {
        reset({
            name: current?.name,
            phone: current?.phone,
        })
    },[current])
    const handleUpdateInfor = async (data) => {
        const formData = new FormData()
        for(let i of Object.entries(data)) formData.append(i[0], i[1])
        console.log([...formData])
        const response = await apiUpdateUser1(formData)
        if (response.success) {
            dispatch(getCurrent())
            toast.success('Cập nhật thông tin thành công')
        } else toast.error('Cập nhật thất bại')

    }
    return (
        <div className='w-full relative px-4'>
            <header className='text-3xl font-semibold py-4 border-b border-b-main'>
                Thông tin cá nhân
            </header>
            <form onSubmit={handleSubmit(handleUpdateInfor)} className='w-3/5 mx-auto py-8 flex flex-col gap-4'>
            <InputForm 
                    label='Tên của bạn:'
                    register={register}
                    errols={errors}
                    id='name'
                    validate={{
                        required: "Cần điền vào trường này"
                    }}
                    style='flex-auto rounded-[6px]'
                    placeholder='Nhập tên của bạn'
                    />
                <InputForm 
                    label='Số điện thoại:'
                    register={register}
                    errols={errors}
                    id='phone'
                    validate={{
                        required: "Cần điền vào trường này",
                        pattern: {
                            value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/gm,
                            message: "Không phải số điện thoại"
                        }
                    }}
                    style='flex-auto rounded-[6px]'
                    placeholder='Nhập số điện thoại của bạn'
                    />    
                <div className='flex items-center gap-2'>
                   <span className='font-medium'>Email:</span>
                   <span className='text-main'>{current?.email}</span>
                </div>    
                <div className='flex items-center gap-2'>
                   <span className='font-medium'>Trạng thái tài khoản:</span>
                   <span className='text-main'>{current?.status ? 'Đã hoạt động' : 'Đã khóa'}</span>
                </div>
                <div className='flex items-center gap-2'>
                   <span className='font-medium'>Quyền:</span>
                   <span className='text-main'>{current?.role}</span>
                </div>
                <div className='flex items-center gap-2'>
                   <span className='font-medium'>Ngày tạo tài khoản:</span>
                   <span className='text-main'>{moment(current?.createdAt).format('DD/MM/YYYY')}</span>
                </div>
                {isDirty && <div className='w-full flex justify-end'><ButtonAdmin type='submit'>Cập nhật thông tin</ButtonAdmin></div>          }
            </form>
        </div>
    )
}

export default Personal