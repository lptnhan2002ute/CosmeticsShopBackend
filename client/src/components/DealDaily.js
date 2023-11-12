import React, { useState, useEffect, memo} from 'react'
import icons from '../ultils/icon'
import { apiGetProducts } from '../apis/product'
import {renderStarFromNumber} from '../ultils/helpers'
import { Countdowm } from './'

const { GiClockwork, AiOutlineMenu } = icons
let idInterval
const DealDaily = () => {
    const [dealDaily, setDealDaily] = useState(null)
    const [hour, setHour] = useState(0)
    const [minute, setMinute] = useState(0)
    const [second, setSecond] = useState(0)
    const [expireTime, setExpireTime] = useState(false)
        const fetchDealDaily = async () => {
            const response = await apiGetProducts({limit: 1, page: 1, totalRatings: 5})
            if (response.success){
                setDealDaily(response.productData[0])
                const h = 24 - new Date().getHours()
                const m = 60 - new Date().getMinutes()
                const s = 60 - new Date().getSeconds()
                setHour(h)
                setMinute(m)
                setSecond(s)
            }else{
                setHour(0)
                setMinute(59)
                setSecond(59)
            }
    
        }
        // useEffect(() => {
        //     fetchDealDaily()
        // }, []) 
        useEffect(() => {
            idInterval && clearInterval(idInterval)
            fetchDealDaily()
        },[expireTime])
        useEffect(() => {
            idInterval = setInterval(() => {
                if(second >0) setSecond(prev => prev-1)
                else{
                    if (minute>0){
                        setMinute(prev => prev-1)
                        setSecond(59)
                    }else{
                        if(hour>0) {
                            setHour(prev => prev-1)
                            setMinute(59)
                            setSecond(59)
                        }else {
                            setExpireTime(!expireTime)
                        }
                    }
                  
                } 
            }, 1000);
            return () => {
                clearInterval(idInterval)
            }
        }, [second, minute, hour, expireTime])
    return (
        <div className='border w-full flex-auto'>
            <div className='flex items-center justify-center p-4'>
            <span className='flex-2 flex justify-center'><GiClockwork size={20} color='#ff007f'/></span>
            <span className='flex-6 font-semibold text-[20px] text-center text-[#ff007f]'>Ưu Đãi</span>
            <span className='flex-2'></span>
            </div>
            <div className='w-full flex flex-col items-center pt-8 gap-2 px-4'>
            <img src={ dealDaily?.imageUrl[0] || 'https://www.panzerwrecks.com/wp-content/uploads/2022/09/No-product.png'}  
                alt='' 
                className='w-full object-contain' />
                <span className='flex h-4'>{renderStarFromNumber(dealDaily?.totalRatings, 20)}</span>
                <span className='line-clamp-2 text-center'>{dealDaily?.productName}</span>
                <span>{`${dealDaily?.price} VNĐ`}</span>
            </div>
            <div className='px-4 mt-8'>
                <div className='flex justify-center gap-2 mb-4'>
                    <Countdowm unit={'Giờ'} number={hour}/>
                    <Countdowm unit={'Phút'} number={minute}/>
                    <Countdowm unit={'Giây'} number={second}/>
                </div>
                <button
                type='button'
                className='flex gap-2 items-center justify-center w-full bg-main hover:bg-gray-800 text-white font-medium py-2'
                
                >
                    <AiOutlineMenu />
                    <span>Lựa Chọn</span>
                </button>
            </div>
        </div>
    )
}

export default memo(DealDaily)