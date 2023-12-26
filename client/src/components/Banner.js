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
                    src='https://blog.dktcdn.net/files/kinh-nghiem-kinh-doanh-my-pham-1.jpg'
                    alt='banner'
                    className='h-[393px] w-full object-cover'
                />
            </div>
            <div className='w-full'>
                <img
                    src='https://blog.dktcdn.net/files/kinh-nghiem-kinh-doanh-my-pham-1.jpg'
                    alt='banner'
                    className='h-[393px] w-full object-cover'
                />
            </div>
        </Carousel>

    )
}

export default Banner