import React, {memo} from 'react'

const Button = ({name, handleOnClick, style, iconBefore, iconAfter, fw }) => {
    return ( 
        <button type='button' className={style ? style :`my-2 px-4 py-2 rounded-md text-white bg-main text-semibold ${fw ? 'w-full' : 'w-fit'}`}
        onClick={() => { handleOnClick && handleOnClick()}}
            >
            {iconBefore}
            <span>{name}</span>
            {iconAfter}
        </button>
    )
}

export default memo(Button) 