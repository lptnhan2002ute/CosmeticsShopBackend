import React from 'react'
import logo from '../assets/logo.svg.png'
import icons from '../ultils/icon'
import { Link } from 'react-router-dom'
import path from '../ultils/path'

const Header = () => {
const {RiPhoneFill, MdEmail, BiUserCircle, FaShoppingBag} = icons
    return (
        <div className='w-main flex justify-between h-[120px] py-[35px]'>
            <Link to={`/${path.HOME}`}>
            <img src={logo} alt='logo' className='w-[320px] h-[73px]' />
            </Link>
            <div className='flex text-[13px]'>
                <div className='flex flex-col px-6 border-r items-center'>
                    <span className='flex gap-3 items-center'>
                        <RiPhoneFill color='#ff007f'/>
                        <span className='font-semibold'>(+1800) 000 2008</span>
                    </span>
                    <span>All Week 9:00AM - 10:00PM</span>
                </div>
                <div className='flex flex-col items-center px-6 border-r'>
                    <span className='flex gap-3 items-center'>
                        <MdEmail color='#ff007f'/>
                        <span className='font-semibold'>HELP@GMAIL.COM</span>
                    </span>
                    <span>Online Help 24/7</span>
                </div>
                <div className='flex items-center justify-center gap-2 px-6 border-r'>
                    <FaShoppingBag color='#ff007f' />
                    <span>0 item(s)</span>
                </div>
                <div className='flex items-center justify-center px-6'><BiUserCircle size={24} /></div>
            </div>
        </div>
    )
}

export default Header