import React, {useState, useCallback} from 'react'
import {InputField, Button} from '../../components'


const Login = () => {
    const [payload, setPayload] = useState({
        email: '',
        password:'',
        name: ''

    })
    const [isRegister, setIsRegister] = useState(false)
    const handleSubmit = useCallback(() => {
    console.log(payload)
    }, [payload])
    return (
        <div className='w-screen h-screen relative'>
            <img 
              src='https://png.pngtree.com/background/20230401/original/pngtree-planet-universe-starry-sky-mountains-background-picture-image_2252507.jpg'
              alt=''
              className='w-full h-full object-cover'
            />
            <div className=' absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center'>
            <div className='p-8 bg-white rounded-md min-w-[500px] flex flex-col items-center'>
                <h1 className='text-[20px] font-semibold text-main mb-8'>{isRegister? 'Đăng Ký' : 'Đăng Nhập'}</h1>
                {isRegister && <InputField 
                value={payload.name}
                setValue={setPayload}
                nameKey='name'
                />}
                <InputField 
                value={payload.email}
                setValue={setPayload}
                nameKey='email'
                />
                <InputField 
                value={payload.password}
                setValue={setPayload}
                nameKey='password'
                type='password' 
                />
                <Button 
                name={isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
                handleOnClick={handleSubmit}
                fw
                />
                <div className='flex items-center justify-between my-2 w-full text-sm'>
                    {!isRegister && <span className='text-main hover:underline cursor-pointer'>Quên Mật Khẩu?</span>}
                    {!isRegister && <span className='text-main hover:underline cursor-pointer'
                    onClick={() => setIsRegister(true)}
                    >Tạo tài khoản</span>}
                    {isRegister && <span className='text-main hover:underline cursor-pointer w-full text-center'
                    onClick={() => setIsRegister(false)}
                    >Về Trang Đăng Nhập</span>}
                </div>
            </div>
            </div>
        </div>
    )
}

export default Login