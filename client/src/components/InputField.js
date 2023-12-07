import React from 'react'
import clsx from 'clsx'

const InputField = ({value, setValue, nameKey, type, invalidFields, setInvalidFields, style, fullWidth, placeholder, isHideLabel}) => {
    return (

        <div className={clsx('flex flex-col relative mb-2', fullWidth && 'w-full')}>
           {!isHideLabel && value?.trim() !== '' && <label className='animate-slide-top-small text-[10px] absolute top-[5px] left-[12px] block bg-white px-1' htmlFor={nameKey}>{nameKey.slice(0,1)?.toUpperCase() + nameKey?.slice(1)}</label>}
           <input 
           type={type || 'text'}
           className={clsx('px-4 py-2 rounded-sm border border-main w-full mt-3 placeholder:text-sm placeholder:italic outline-none', style)}
           placeholder={placeholder || nameKey.slice(0,1)?.toUpperCase() + nameKey?.slice(1)}
           value={value}
           onChange={e => setValue(prev => ({...prev, [nameKey]: e.target.value}))}
           onFocus={() => setInvalidFields && setInvalidFields([])}
           />
           
            {invalidFields?.some(el => el.name === nameKey) && <small className='text-main italic'>{invalidFields.find
            (el => el.name === nameKey)?.mess}</small>}
        </div>
    )
}

export default InputField