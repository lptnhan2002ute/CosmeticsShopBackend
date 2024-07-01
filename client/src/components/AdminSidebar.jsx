import React, { memo, Fragment, useState } from 'react'
import logo from '../../src/assets/logo.svg.png'
import { adminSidebar } from '../ultils/contants'
import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { AiOutlineDown } from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { logout } from '../store/users/userSlice'
import { removeSessionId } from '../store/chatSlice'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

const activedStyle = 'px-4 py-2 flex items-center gap-2 bg-pink-400'
const notActivedStyle = 'px-4 py-2 flex items-center gap-2 hover:bg-pink-200'

const AdminSidebar = () => {
    const dispatch = useDispatch()
    const [actived, setActived] = useState([])
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
    const handleShowTabs = (tabID) => {
        if (actived.some(el => el === tabID)) setActived(prev => prev.filter(el => el !== tabID))
        else setActived(prev => [...prev, tabID])
    }
    return (
        <div className=' bg-white h-full py-4'>
            <div onClick={handleLogout} className='flex flex-col p-4 justify-center gap-2 items-center cursor-pointer'>
                <img src={logo} alt='logo' className='w-[200px] object-contain'></img>
                <small>Admin Workspace</small>
            </div>
            <div>
                {adminSidebar.map(el => (
                    <Fragment key={el.id}>
                        {el.type === 'single' && <NavLink
                            to={el.path}
                            className={({ isActive }) => clsx(isActive && activedStyle, !isActive && notActivedStyle)}
                        >
                            <span>{el.icon}</span>
                            <span>{el.text}</span>
                        </NavLink>}
                        {el.type === 'parent' && <div onClick={() => handleShowTabs(+el.id)} className=' flex flex-col '>
                            <div className='flex items-center justify-between px-4 py-2 hover:bg-pink-200 cursor-pointer'>
                                <div className='flex items-center gap-2'>
                                    <span>{el.icon}</span>
                                    <span>{el.text}</span>
                                </div>
                                <AiOutlineDown />
                            </div>
                            {actived.some(id => +id === +el.id) && <div className='flex flex-col'>
                                {el.submenu.map(item => (
                                    <NavLink key={el.text} to={item.path}
                                        onClick={e => e.stopPropagation()}
                                        className={({ isActive }) => clsx(isActive && activedStyle, !isActive && notActivedStyle, 'pl-10')}
                                    >
                                        {item.text}
                                    </NavLink>
                                ))}
                            </div>}
                        </div>}
                    </Fragment>
                ))}
            </div>
        </div>
    )
}

export default memo(AdminSidebar) 