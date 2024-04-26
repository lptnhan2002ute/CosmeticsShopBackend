import React, {memo} from 'react'

const Button2 = ({ children, handleOnClick, style, fw }) => {
    return ( 
        <button type='button' className={style ? style :`my-2 px-4 py-2 rounded-md text-white bg-main text-semibold ${fw ? 'w-full' : 'w-fit'}`}
        onClick={() => { handleOnClick && handleOnClick()}}
            >
            {children}
        </button>
    )
}

export default memo(Button2) 