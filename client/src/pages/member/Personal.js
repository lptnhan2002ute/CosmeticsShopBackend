import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ButtonAdmin, InputForm } from '../../components'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { apiUpdateUser1 } from '../../apis'
import { getCurrent } from '../../store/users/asyncAction'
import { toast } from 'react-toastify'

const Personal = () => {

    const [avatar, setAvatar] = useState(null)
    const {register, formState: {errors, isDirty}, handleSubmit, reset} = useForm()
    const { current } = useSelector(state => state.user)

    const handleChooseImage = (e) => {
        const file = e.target.files[0]
        file.preview = URL.createObjectURL(file)

        setAvatar(file)
    }
    const dispatch = useDispatch()
    useEffect(() => {
        reset({
            name: current?.name,
            phone: current?.phone,
            address: current?.address,
            birthday: moment(current?.birthday).format('YYYY-MM-DD'),
        })
    },[current])
    useEffect(() => {
        return () => {
            avatar && URL.revokeObjectURL(avatar.preview)
        }
    }, [avatar]);
    const handleUpdateInfor = async (data) => {
        const formData = new FormData()
        if (avatar) formData.append('avatar', avatar)
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
                    label='Địa chỉ của bạn:'
                    register={register}
                    errols={errors}
                    id='address'
                    style='flex-auto rounded-[6px]'
                    placeholder='Nhập địa chỉ của bạn'
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
                    <InputForm 
                    label='Ngày sinh của bạn:'
                    register={register}
                    errols={errors}
                    id='birthday'
                    type='date'
                    style='flex-auto rounded-[6px]'
                    placeholder='Nhập ngày sinh của bạn'
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
                <div className='flex flex-col gap-2 mt-4'>
                        <label className='font-semibold' htmlFor='images'>Tải ảnh lên</label>
                        <input type='file' id='images'
                        onChange={(e) => handleChooseImage(e)}
                        />
                        {
	                     <img className='h-[150px] w-[150px]' src={avatar ? avatar.preview : current.avatar !=='' ? current.avatar : 'https://api.multiavatar.com/default.png'} />
                        }
                    </div>
                {isDirty || avatar ? <div className='w-full flex justify-end'><ButtonAdmin type='submit'>Cập nhật thông tin</ButtonAdmin></div> : ''}
            </form>
        </div>
    )
}

export default Personal