import React, {memo} from 'react'
import icons from '../ultils/icon'


const {MdEmail} = icons
const Footer = () => {
    return (
        <div className='w-full'>
            <div className='h-[103px] bg-main w-full flex justify-center items-center'>
               <div className='w-main flex items-center justify-between'>
                   <div className='flex flex-col flex-1'>
                   <span className='text-[20px] text-gray-200'>ĐĂNG KÝ THÔNG BÁO</span>
                   <small className='text-[13px] text-black'>Đăng ký ngay và nhận được thông báo hàng tuần</small>
                   </div>
                   <div className='flex-1 flex items-center'>
                   <input 
                   className='p-4 pr-0 rounded-l-full w-full bg-white outline-none text-black
                   placeholder:italic'
                   type='text'
                   placeholder='Nhập Email của bạn'
                   />
                   <div className='h-[56px] w-[56px] bg-white rounded-r-full flex justify-center items-center text-main'>
                        <MdEmail size={20}/>
                   </div>
                   </div>
               </div>
            </div>  
            <div className='h-[407px] bg-gray-900 w-full flex justify-center items-center text-white text-[13px]'>
                <div className='w-main flex'>
                    <div className='flex-2 flex flex-col gap-2'>
                        <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px] '>Liên Hệ Shop</h3>
                        <span>
                        <span>Địa Chỉ:</span>
                        <span className='opacity-70'> Số 1 Võ Văn Ngân, Thủ Đức, Hồ Chí Minh</span>
                        </span>
                        <span>
                        <span>SĐT:</span>
                        <span className='opacity-70'> 0332391054</span>
                        </span>
                        <span>
                        <span>Mail:</span>
                        <span className='opacity-70'> moon01102003@gmail.com</span>
                        </span>
                    </div>
                    <div className='flex-1 flex flex-col gap-2'>
                    <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px] '>Thông tin</h3>
                       <span className='opacity-70'>Phòng trưng bày</span>
                       <span className='opacity-70'>Vị trí cửa hàng</span>
                       <span className='opacity-70'>Ưu đãi</span>
                       <span className='opacity-70'>Liên hệ</span>
                    </div>
                    <div className='flex-1 flex flex-col gap-2'>
                    <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px] '>Thắc mắc về Shop</h3>
                       <span className='opacity-70'>Trợ giúp</span>
                       <span className='opacity-70'>Miễn phí giao hàng</span>
                       <span className='opacity-70'>Vấn đáp</span>
                       <span className='opacity-70'>Câu hỏi thường gặp</span>
                    </div>
                    <div className='flex-1 flex flex-col gap-2'>
                    <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px] '>Thành viên sáng lập</h3>
                       <span className='opacity-70'>Thành Nhân</span>
                       <span className='opacity-70'>Võ Ngọc Quý</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(Footer)