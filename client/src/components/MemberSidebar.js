import React,{memo, Fragment, useState} from 'react'
import {  memberSidebar } from '../ultils/contants'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { AiOutlineDown} from 'react-icons/ai'
import { useSelector } from 'react-redux'

const activedStyle = 'px-4 py-2 flex items-center gap-2 bg-blue-500'
const notActivedStyle = 'px-4 py-2 flex items-center gap-2 hover:bg-blue-100'

const MemberSidebar = () => {
    const [actived, setActived] = useState([])
    const { current } = useSelector(state => state.user)
    const handleShowTabs = (tabID) => {
        if(actived.some(el => el === tabID)) setActived(prev => prev.filter(el => el !== tabID))
        else setActived(prev => [...prev, tabID])
    } 
    return (
        <div className=' bg-white h-full py-4 w-[250px] flex-none'>
            <div className='flex flex-col w-full py-4 justify-center items-center'>
            <img src='https://api.multiavatar.com/default.png' 
            alt='logo' className='w-16 h-16 object-cover'></img>
            <small className='font-semibold text-sm'>{`${current?.name}`}</small>
            </div>
            <div>
                {memberSidebar.map(el => (
                   <Fragment key={el.id}>
                    {el.type === 'single' && <NavLink 
                    to={el.path}
                    className={({isActive}) => clsx(isActive && activedStyle, !isActive && notActivedStyle)}
                    >
                        <span>{el.icon}</span>
                        <span>{el.text}</span>
                        </NavLink>}
                    {el.type === 'parent' && <div onClick={() => handleShowTabs(+el.id)} className=' flex flex-col '>
                        <div className='flex items-center justify-between px-4 py-2 hover:bg-blue-100 cursor-pointer'>
                        <div className='flex items-center gap-2'>
                        <span>{el.icon}</span>
                        <span>{el.text}</span>
                        </div>
                        <AiOutlineDown />
                        </div>
                        { actived.some(id => +id === +el.id) && <div  className='flex flex-col'>
                            {el.submenu.map(item =>(
                                <NavLink key={el.text} to={item.path}
                               onClick={e => e.stopPropagation()}
                                className={({isActive}) => clsx(isActive && activedStyle, !isActive && notActivedStyle, 'pl-10')}
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

export default memo(MemberSidebar) 