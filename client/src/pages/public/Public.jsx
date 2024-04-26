import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navigation, Header, TopHeader, Footer } from '../../components'
import ChatWithAdmin from './ChatWithAdmin'

const Public = () => {
    return (
        <>
            <div className='max-h-screen overflow-y-auto flex flex-col items-center'>
                <TopHeader />
                <Header />
                <Navigation />
                <div className='w-full flex items-center flex-col'>
                    <Outlet />
                </div>
                <Footer />
            </div>
            <ChatWithAdmin />
        </>

    )
}

export default Public