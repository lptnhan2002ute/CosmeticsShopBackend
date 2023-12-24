import React, { Fragment, useState, useEffect } from 'react'
import logo from '../assets/logo.svg.png'
import icons from '../ultils/icon'
import { Link } from 'react-router-dom'
import path from '../ultils/path'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/users/userSlice'

const Header = () => {
    const { RiPhoneFill, MdEmail, BiUserCircle, FaShoppingBag } = icons
    const { current, cart } = useSelector(state => state.user)
    const [isShowOption, setIsShowOption] = useState(false)
    const dispatch = useDispatch()
    useEffect(() => {
        const handleClickout = (e) => {
            const profile = document.getElementById('profile')
            if (!profile?.contains(e.target)) setIsShowOption(false)

        }
        document.addEventListener('click', handleClickout)
        return () => {
            document.removeEventListener('click', handleClickout)
        }
    }, [])

    return (
        <div className='w-main flex justify-between h-[120px] py-[35px]'>
            <Link to={`/${path.HOME}`}>
                <img src={logo} alt='logo' className='w-[320px] h-[73px]' />
            </Link>
            <div className='flex text-[13px]'>
                <div className='flex flex-col px-6 border-r items-center'>
                    <span className='flex gap-3 items-center'>
                        <RiPhoneFill color='#ff007f' />
                        <span className='font-semibold'>(+1800) 000 2008</span>
                    </span>
                    <span>All Week 9:00AM - 10:00PM</span>
                </div>
                <div className='flex flex-col items-center px-6 border-r'>
                    <span className='flex gap-3 items-center'>
                        <MdEmail color='#ff007f' />
                        <span className='font-semibold'>HELP@GMAIL.COM</span>
                    </span>
                    <span>Online Help 24/7</span>
                </div>
                {current && <Fragment>
                    <div className='cursor-pointer flex items-center justify-center gap-2 px-6 border-r'>
                        <FaShoppingBag color='#ff007f' />
                        <Link to="/member/my-cart">{`${cart?.length || 0} item(s)`}</Link>
                    </div>
                    <div
                        className='cursor-pointer flex items-center justify-center px-6 relative'
                        onClick={() => setIsShowOption(prev => !prev)}
                        id='profile'
                    >
                        <BiUserCircle color='#ff007f' size={24} />
                        <span>Profile</span>
                        {isShowOption && <div
                            onClick={e => e.stopPropagation()}
                            className='flex z-[100] flex-col absolute top-full left-[16px] bg-gray-100 border min-w-[150px] py-2'>
                            <Link className='w-full p-2 hover:bg-sky-100' to={`/${path.MEMBER}/${path.PERSONAL}`}>Thông tin cá nhân
                            </Link>
                            {current?.role === 'Admin' && <Link className='w-full p-2 hover:bg-sky-100' to={`/${path.ADMIN}/${path.DASHBOARD}`}>Trang Quản Lí
                            </Link>}
                            <span
                                onClick={() => dispatch(logout())}
                                className='w-full p-2 hover:bg-sky-100'>Đăng xuất</span>
                        </div>}
                    </div>
                </Fragment>}
            </div>
        </div>
    )
}

export default Header