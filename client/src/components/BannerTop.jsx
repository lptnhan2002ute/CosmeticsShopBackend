import React, {memo} from 'react'

const BannerTop = () => {
    return (
        <div className='w-full flex'>
            <div className='w-[405px] pr-3 '>
                <img 
              src='https://image-us.eva.vn/upload/4-2019/images/2019-12-12/lam-dep-don-tet-rinh-ngay-my-pham-tu-hai-thuong-hieu-dinh-dam-toan-cau-dang-uu-dai-khung-1-1576132862-483-width640height428.jpg' 
              alt='banner' 
              className='h-[230px] w-full object-cover rounded-2xl'
              /> 
              </div>
              <div className='w-[405px] pr-3'>
                <img 
              src='https://topprint.vn/wp-content/uploads/2021/07/mau-banner-my-pham-dep-4.jpg' 
              alt='banner' 
              className='h-[230px] w-full object-cover rounded-2xl'
              /> 
              </div>
              
              <div className='w-[405px]'>
                <img 
              src='https://duocmyphamhomi.vn/wp-content/uploads/2023/09/Dich-vu-gia-cong-my-pham-tet-nguyen-dan-2024.png' 
              alt='banner' 
              className='h-[230px] w-full object-cover rounded-2xl'
              /> 
              </div>
              
            
        </div>
    )
}

export default memo(BannerTop)