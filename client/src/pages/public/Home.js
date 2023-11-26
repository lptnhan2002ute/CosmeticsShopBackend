import React from 'react'
import {Sidebar, Banner, BestSeller, DealDaily, FeatureProducts, CustomSlider} from '../../components'
import { useSelector } from 'react-redux' 


const Home = () => {
    const {newProducts} = useSelector(state => state.products)
    return (
        <>
        <div className='w-main flex mt-6'>
            <div className='flex flex-col gap-5 w-[25%] flex-auto'>
                <Sidebar />
                <DealDaily />
            </div>
            <div className='flex flex-col pl-5 gap-5 w-[75%] flex-auto'>
                <Banner />
                <BestSeller />
            </div>
        </div>
        <div className='my-8 w-main'>
            <FeatureProducts />
        </div>
        <div className='my-8 w-main'>
                <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main'>Sản Phẩm Mới</h3>
               <div className='mt-4 mx-[-10px]'>
                   <CustomSlider
                       products={newProducts}
                   />
               </div>
        </div>

        </>
    )
}

export default Home