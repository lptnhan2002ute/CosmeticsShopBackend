import React, { memo } from 'react'
import { useSelector } from 'react-redux'
import { Product } from '../../components'

const Wishlist = () => {
    const { current } = useSelector(state => state.user)
    return (
        <div className='w-full relative px-4'>
            <header className='text-3xl font-semibold py-4 border-b border-main'>
                Danh sách yêu thích
            </header>
            <div className='py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                {current?.wishlist?.map((ele) => (
                    <div key={ele._id}>
                        <Product
                            pid={ele._id}
                            productData={ele}
                            normal={true}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default memo(Wishlist)