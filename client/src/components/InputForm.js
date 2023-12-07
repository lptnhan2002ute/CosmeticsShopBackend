import React, { memo } from 'react'
import clsx from 'clsx'

const InputForm = ({label, disabled, register, errols, id, validate, type='text', placeholder, fw, defaultValue}) => {
    return (
        <div className='flex flex-col h-[78px] gap-2'>
            {label && <label htmlFor={id}>{label}</label>}
            <input 
            type={type}
            id={id}
            {...register(id, validate)}
            disabled={disabled}
            placeholder={placeholder}
            className={clsx('form-input', fw && 'w-full')}
            defaultValue={defaultValue}
            />
            {errols[id] && <small className='text-xs text-red-500'>{errols[id]?.message}</small>}
        </div>
    )
}

export default memo(InputForm)