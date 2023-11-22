import React, { memo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import path from '../ultils/path'
import { getCurrent } from '../store/users/asyncAction'
import { useDispatch, useSelector } from 'react-redux'
import icons from '../ultils/icon'
import { logout } from '../store/users/userSlice'


const { AiOutlineLogout } = icons


const TopHeader = () => {
    const dispatch = useDispatch()
    const { isLoggedIn, current } = useSelector(state => state.user)
    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to log out?');
        if (confirmLogout) {
            dispatch(logout());
        }
    };
    useEffect(() => {
        if (isLoggedIn) dispatch(getCurrent())
    }, [dispatch, isLoggedIn])
    return (
        <div className='w-full h-[38px] bg-main flex justify-center items-center'>
            <div className='w-main flex  items-center justify-between text-xs text-white '>
                <span className='hover:text-black cursor-pointer'>ĐẶT HÀNG TRỰC TUYẾN HOẶC GỌI CHO CHÚNG TÔI (+1800) 000 2008</span>
                {isLoggedIn ? (
                    <div className='flex gap-4 text-sm items-center'>
                        <span>{`Welcome, ${current?.name} `}</span>
                        <span
                            onClick={handleLogout}
                            className='hover:rounded-full hover:bg-blue-200 cursor-pointer hover:text-main p-2'
                        >
                            <AiOutlineLogout size={15} />
                        </span>
                    </div>
                ) : (
                    <Link className=' hover:text-black cursor-pointer' to={`/${path.LOGIN}`}>
                        Đăng Nhập hoặc Tạo Tài Khoản Mới
                    </Link>
                )}
            </div>
        </div>
    );
};

export default memo(TopHeader)