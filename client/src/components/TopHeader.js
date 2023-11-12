import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import path from '../ultils/path'

const TopHeader = () => {
    return (
        <div className='w-full h-[38px] bg-main flex justify-center items-center'>
            <div className='w-main flex  items-center justify-between text-xs text-white '>
            <span className=' hover:text-black cursor-pointer'>ĐẶT HÀNG TRỰC TUYẾN HOẶC GỌI CHO CHÚNG TÔI (+1800) 000 2008</span>
            <Link className=' hover:text-black cursor-pointer' to={`/${path.LOGIN}`}>Đăng Nhập hoặc Tạo Tài Khoản Mới</Link>
            </div>
        </div>
    )
}

export default memo(TopHeader)