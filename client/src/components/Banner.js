import React from 'react'
import { Carousel } from 'antd'


const Banner = () => {
    return (
        <Carousel autoplay >
            <div className='w-full'>
                <img
                    src='https://blog.dktcdn.net/files/kinh-nghiem-kinh-doanh-my-pham-1.jpg'
                    alt='banner'
                    className='h-[393px] w-full object-cover'
                />
            </div>
            <div className='w-full'>
                <img
                    src='https://shopsanpham.com/wp-content/uploads/2022/08/my-pham-magicskin-scaled.jpg'
                    alt='banner'
                    className='h-[393px] w-full object-cover'
                />
            </div>
            <div className='w-full'>
                <img
                    src='https://tranhdecors.com/wp-content/uploads/edd/2023/11/Banner-chuc-tet-Nguyen-Dan-2024.jpg'
                    alt='banner'
                    className='h-[393px] w-full object-cover'
                />
            </div>
        </Carousel>

    )
}

export default Banner