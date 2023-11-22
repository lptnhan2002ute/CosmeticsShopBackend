import React from 'react'

const InputField = ({value, setValue, nameKey, type, invalidFields, setInvalidFields}) => {
    return (

        <div className='w-full flex flex-col relative'>
           {value.trim() !== '' && <label className='animate-slide-top-small text-[10px] absolute top-[5px] left-[12px] block bg-white px-1' htmlFor={nameKey}>{nameKey.slice(0,1)?.toUpperCase() + nameKey?.slice(1)}</label>}
           <input 
           type={type || 'text'}
           className='px-4 py-2 rounded-sm border w-full mt-3 placeholder:text-sm placeholder:italic outline-none'
           placeholder={nameKey.slice(0,1)?.toUpperCase() + nameKey?.slice(1)}
           value={value}
           onChange={e => setValue(prev => ({...prev, [nameKey]: e.target.value}))}
           onFocus={() => setInvalidFields([])}
           />
           
            {invalidFields?.some(el => el.name === nameKey) && <small className='text-main italic'>{invalidFields.find
            (el => el.name === nameKey)?.mess}</small>}
        </div>
    )
}

export default InputField