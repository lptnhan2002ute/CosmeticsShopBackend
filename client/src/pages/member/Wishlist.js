import React, { memo } from 'react'
import { useSelector } from 'react-redux'
import { Product } from '../../components'

const Wishlist = () => {
    const { current } = useSelector(state => state.user)
    return (
        <div className='w-full relative px-4'>
            <header className='text-3xl font-semibold py-4 border-b border-b-main'>
                My Wishlist
            </header>
            <div className='p-4 w-full grid gird-cols-5 gap-4'>
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