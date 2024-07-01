import React, { memo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import path from '../ultils/path'
import { getCurrent } from '../store/users/asyncAction'
import { useDispatch, useSelector } from 'react-redux'
import icons from '../ultils/icon'
import { logout, clearMessage } from '../store/users/userSlice'
import { removeSessionId } from '../store/chatSlice'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'


const { AiOutlineLogout } = icons


const TopHeader = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isLoggedIn, current, mess } = useSelector(state => state.user)
    const handleLogout = () => {
          Swal.fire({
          title: 'Bạn có chắc chắn muốn đăng xuất???',
          text: 'Bạn đã sẵn sàng đăng xuất chưa???',
          showCancelButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            dispatch(logout());
            dispatch(removeSessionId());
            toast.success('Bạn đã đăng xuất khỏi trang web');
          }
        });
      };
    useEffect(() => {
        // const setTimeoutId = setTimeout(() => {
        //     if (isLoggedIn) dispatch(getCurrent())
        // }, 5)

        // return () => {
        //     clearTimeout(setTimeoutId)
        // }
        if (isLoggedIn) dispatch(getCurrent())
    }, [dispatch, isLoggedIn])
    useEffect(() => {
        if (mess) Swal.fire('Oops! Something went wrong', mess, 'info').then(() => {
            dispatch(clearMessage())
            navigate(`/${path.LOGIN}`)
        })
    }, [mess])
    return (
        <div className='w-full h-[38px] bg-main flex justify-center items-center pt-3 pb-3'>
            <div className='w-main flex  items-center justify-between text-xs text-white '>
                <span className='hover:text-black cursor-pointer'>ĐẶT HÀNG TRỰC TUYẾN HOẶC GỌI CHO CHÚNG TÔI (+1800) 000 2008</span>
                {isLoggedIn && current ? (
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