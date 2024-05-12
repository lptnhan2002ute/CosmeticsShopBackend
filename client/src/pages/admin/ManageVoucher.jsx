import React, { useCallback, useEffect, useState} from 'react'
import { apiGetVoucher, apiCreateVoucher, apiUpdateVoucher, apiSearchNameVoucher } from '../../apis'
import moment from 'moment'
import Dialog from '@mui/material/Dialog'
import { InputForm } from '../../components'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Search from 'antd/es/input/Search'

const ManageVoucher = () => {
    const {handleSubmit, reset, register, getValues, formState: { errors }, setValue, watch} = useForm({
        name: '',
    })

    const [voucher, setVoucher] = useState(null)
    const[showDialog, setShowDialog] = useState(false)
    const [dialogLabel, setDialogLabel] = useState('Thêm')

    const onSearch = async (value) => {
        if (value) {
            const response = await apiSearchNameVoucher({
                name: value
             })
             if (response.success) setVoucher([response.result])
        } else {
     await fetchVouchers()}
         
    }
    const handleClose = () =>{
        reset()
        setShowDialog(false)
    }
    const handleCreate = async() => {
        const id = getValues('_id')
        setValue('startDay', moment(getValues('startDay')).format('DD/MM/YYYY'))
        setValue('endDay', moment(getValues('endDay')).format('DD/MM/YYYY'))
        if(id){
            const response = await apiUpdateVoucher(watch(), id )
            if (response.success) {
                setShowDialog(false)
                toast.success('Sửa thành công')
                fetchVouchers()
            } else toast.error('Sửa thất bại')
        } else {
            console.log(watch())
        const response = await apiCreateVoucher(watch())
        if (response.success) {
            setShowDialog(false)
            toast.success('Thêm thành công')
            fetchVouchers()
        } else toast.error('Thêm thất bại')
        }
        reset()
    }

    const handleShowdialog = (el) => {
        if(el){
            setDialogLabel('Sửa')
             Object.keys(el).forEach(key => {
                if(key === 'startDay' || 'endDay' === key){
                    setValue(key, moment(el[key]).format('yyyy-MM-DD') )
                } else {
                    setValue(key, el[key])
                }
             })
        }
        else {
            reset()
        }
        setShowDialog(true)
    }
    const fetchVouchers = async () => {
        const response = await apiGetVoucher()
        if (response.success) setVoucher(response.voucherList)   
    }
    console.log(voucher)
    useEffect(() => { 
        fetchVouchers()
     },[])
    return (
        <div className='w-full flex flex-col gap-3 relative overflow-x-scroll p-4'>
                <Search
                        className="w-[60vw]"
                        placeholder="Nhập tên mã giảm giá..."
                        allowClear
                        enterButton="Search"
                        size="large"
                        onSearch={onSearch}
                    />
                <table className='table-auto'>
                    <thead className='border bg-main text-white border-white '>
                        <tr className='border border-main'>
                            <th className='text-center py-2'>STT</th>
                            <th className='text-center py-2'>Mã giảm giá</th>
                            <th className='text-center py-2'>Tên</th>
                            <th className='text-center py-2'>Bắt đầu</th>
                            <th className='text-center py-2'>Kết thúc</th>
                            <th className='text-center py-2'>Giảm giá</th>
                            <th className='text-center py-2'>Giảm tối đa</th>
                            <th className='text-center py-2'>Tiền tối thiểu</th>
                            <th className='text-center py-2'>Lần sử dụng</th>
                            <th className='text-center py-2'>Đã sử dụng</th>
                            <th className='text-center py-2'>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {voucher?.map((el, index) => (
                            <tr className='border border-main' key={el._id}>
                                <td className='text-center py-2'>{index + 1}</td>
                                <td className='text-center py-2'>{el?._id}</td>
                                <td className='text-center py-2'>{el?.name}</td>
                                <td className='text-center py-2'>{moment(el?.startDay).format('DD/MM/YYYY')}</td>
                                <td className='text-center py-2'>{moment(el?.endDay).format('DD/MM/YYYY')}</td>
                                <td className='text-center py-2'>
                                    <span>{el?.discount}</span>
                                    <span>%</span>
                                </td>
                                <td className='text-center py-2'>
                                    <span>{el?.maxDiscountAmount}</span>
                                    <span className='text-main'>VNĐ</span>
                                </td>
                                <td className='text-center py-2'>
                                    <span>{el?.minPurchaseAmount}</span>
                                    <span className='text-main'>VNĐ</span>
                                </td>
                                <td className='text-center py-2'>{el?.maxUsage}</td>
                                <td className='text-center py-2'>{el?.usedCount}</td>
                                <td className='text-center py-2'>
                                    <span onClick={() => handleShowdialog(el)}  className='text-main hover:underline cursor-pointer px-1'>Sửa</span>
                                    <span  className='text-main hover:underline cursor-pointer px-1'>Xóa</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='w-[100px] h-[50px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer' onClick={() => handleShowdialog(null)}>Thêm mới</div>
                <Dialog open={showDialog} onClose={handleClose}>
                <div className='p-[20px] w-[400px]'>
                <InputForm 
                            label='Tên mã giảm giá'
                            placeholder='Nhập tên mã giảm giá'
                            fw
                            register={register}
                            errols={errors}
                            id={'name'}
                            validate={{required: 'Yêu cầu nhập '}}
                />
                <InputForm 
                            type='date'
                            label='Bắt đầu'
                            placeholder='Nhập ngày bắt đầu'
                            fw
                            register={register}
                            errols={errors}
                            id={'startDay'}
                            validate={{required: 'Yêu cầu nhập '}}
                />
                <InputForm 
                            type='date'
                            label='Kết thúc'
                            placeholder='Nhập ngày kết thúc'
                            fw
                            register={register}
                            errols={errors}
                            id={'endDay'}
                            validate={{required: 'Yêu cầu nhập '}}
                />
                <InputForm 
                            label='Phần trăm giảm giá'
                            placeholder='Nhập phần trăm giảm giá'
                            fw
                            register={register}
                            errols={errors}
                            id={'discount'}
                            validate={{required: 'Yêu cầu nhập '}}
                />
                <InputForm 
                            label='Số tiền giảm giá tối đa'
                            placeholder='Nhập số tiền'
                            fw
                            register={register}
                            errols={errors}
                            id={'maxDiscountAmount'}
                            validate={{required: 'Yêu cầu nhập '}}
                />
                <InputForm 
                            label='Số tiền tối thiểu sử dụng '
                            placeholder='Nhập số tiền'
                            fw
                            register={register}
                            errols={errors}
                            id={'minPurchaseAmount'}
                            validate={{required: 'Yêu cầu nhập '}}
                />
                <InputForm 
                            label='Số lần sử dụng tối đa '
                            placeholder='Nhập số lần'
                            fw
                            register={register}
                            errols={errors}
                            id={'maxUsage'}
                            validate={{required: 'Yêu cầu nhập '}}
                />
                <InputForm 
                            label='Số lần đã sử dụng '
                            placeholder='Nhập số lần'
                            fw
                            register={register}
                            errols={errors}
                            id={'usedCount'}
                            validate={{required: 'Yêu cầu nhập '}}
                />
                <div className='justify-end flex pt-2'>
                <div className='w-[80px] h-[40px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer' onClick={handleCreate}>{dialogLabel}</div>
                </div>
                </div>
            </Dialog>
        </div>
    )
}

export default ManageVoucher