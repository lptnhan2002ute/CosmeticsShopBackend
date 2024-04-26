import React, { useCallback, useEffect, useState} from 'react'
import { apiDeleteCategory, apiGetCategory, apiUpdateCategory, apiCreateCategory } from '../../apis'
import { InputForm, ButtonAdmin } from '../../components'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import clsx from 'clsx'
import Dialog from '@mui/material/Dialog'

const ManageCategory = () => {
    const {handleSubmit, register, formState: { errors }, setValue, watch} = useForm({
        categoryName: '',
    })
    const [category, setCategory] = useState(null)
    const [update, setUpdate] = useState(false)
    const[editE, seteditE] = useState(null)
    const[showDialog, setShowDialog] = useState(false)
    

    const handleCreate = async() => {
        const response = await apiCreateCategory(watch())
        if (response.success) {
            setShowDialog(false)
            toast.success('Thêm thành công')
            fetchUsers()
        } else toast.error('Thêm thất bại')
        
    }
    const handleShowdialog = () => {
        setShowDialog(true)
    }
    const handleEdit = (el) => {
        setValue('categoryName', el.categoryName)
        seteditE(el)
    }
    const fetchUsers = async (params) => {
        const response = await apiGetCategory(params)
        if (response.success) setCategory(response)
    }
    const render = useCallback(() => {
        setUpdate(!update)
    },[update])
    useEffect(() => { 
       fetchUsers()
    },[update])
   const handleUpdate = async (data) => {
    const response = await apiUpdateCategory(data, editE._id)
    if (response.success) {
        seteditE(null)
        render()
        toast.success('Cập nhật thành công')
    }else toast.error('Cập nhật thất bại')
   }
   const handlerDeleteCategory = (pcid) => {
      Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa???',
        text: 'Bạn đã sẵn sàng xóa chưa???',
        showCancelButton: true
      }).then(async(result) => {
        if(result.isConfirmed) {
            const response = await apiDeleteCategory(pcid)
            if (response.success){
            render()
            toast.success('Xóa thành công')
         } else toast.error('Xóa thất bại')
        }
      })
}
    return (
        <div className={clsx('w-full', editE && 'pl-2')}>
            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                <div className='p-[20px] w-[400px]'>
                <InputForm 
                            label='Tên danh mục sản phẩm'
                            placeholder='Nhập tên danh mục sản phẩm'
                            fw
                            register={register}
                            errols={errors}
                            id={'categoryName'}
                            validate={{required: 'Yêu cầu nhập '}}
                />
                <div className='justify-end flex pt-2'>
                <div className='w-[80px] h-[40px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer' onClick={handleCreate}>Thêm</div>
                </div>
                </div>
            </Dialog>
            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <span>Quản lý danh mục sản phẩm</span>
            </h1>
            <div className='w-full p-4'>
                <form onSubmit={handleSubmit(handleUpdate)} >
                   {editE && <ButtonAdmin type='submit'>Cập nhật</ButtonAdmin> }
                <table className=' mb-6 text-left w-full'>
                    <thead className='font-bold bg-main text-[13px] text-white'>
                       <tr className='border border-main'>
                       <th className='px-4 py-2 '>STT</th>
                       <th className='px-6 py-2 '>Tên danh mục sản phẩm</th>
                       <th className='px-8 py-2 '>Lựa chọn</th>
                       </tr>
                    </thead>
                    <tbody>
                       {category?.productCategory?.map((el, index) => (
                            <tr key={el._id} className='border border-main '>
                            <td className='py-2 px-6'>{index+1}</td>
                            <td className='py-2 px-4'>{editE?._id === el._id 
                            ? <InputForm 
                            fw
                            register={register}
                            errols={errors}
                            defaultValue={editE?.categoryName}
                            id={'categoryName'}
                            validate={{required: 'Yêu cầu nhập '}}
                            /> : <span>{el.categoryName}</span>}</td>
                            <td className='py-2 px-4'>
                                {editE?._id === el._id ? <span onClick={() => seteditE(null)} className='px-2 text-main hover:underline cursor-pointer'>Hủy</span>
                                : <span onClick={() => handleEdit(el)} className='px-2 text-main hover:underline cursor-pointer'>Sửa</span>}
                                <span onClick={() => handlerDeleteCategory(el._id)} className='px-2 text-main hover:underline cursor-pointer'>Xóa</span>
                            </td>
                        </tr>
                       ))}
                    </tbody>
                </table>
                </form>
                <div className='w-[100px] h-[50px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer' onClick={handleShowdialog}>Thêm mới</div>
            </div>
        </div>
    )
}

export default ManageCategory