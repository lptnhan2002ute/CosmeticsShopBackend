import React, { useState, useCallback, useEffect } from 'react'
import { InputField, Button, Loading } from '../../components'
import { apiRegister, apiLogin, apiForgetPassword } from '../../apis/user'
import Swal from 'sweetalert2'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { validate } from '../../ultils/helpers'
import path from '../../ultils/path'
import { login } from '../../store/users/userSlice'
import { showModal } from '../../store/appSlice'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'



const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [searchParams] = useSearchParams()
    console.log(searchParams.get('redirect'))
    const [payload, setPayload] = useState({
        email: '',
        password: '',
        name: '',
        phone: ''

    })
    const [invalidFields, setInvalidFields] = useState([])
    const [isRegister, setIsRegister] = useState(false)
    const [isForgetPassword, setIsForgetPassword] = useState(false)
    const resetPayload = () => {
        setPayload({
            email: '',
            password: '',
            name: '',
            phone: ''
        })
    }
    const [email, setEmail] = useState('')
    const handleForgetPassword = async () => {
        const response = await apiForgetPassword({ email })
        if (response.success) {
            toast.success(response.mess)
        }
        else {
            // setIsForgetPassword(false)
            toast.info(response.mess, { theme: "colored" })
        }

    }

    useEffect(() => { resetPayload() }, [isRegister])
    const handleSubmit = useCallback(async () => {
        const { name, phone, ...data } = payload

        // const data = isRegister ? payload : { email = payload.email, password = payload.password }
        const invalids = isRegister ? validate(payload, setInvalidFields) : validate(data, setInvalidFields)
        if (invalids === 0) {
            if (isRegister) {
                dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }))
                const response = await apiRegister(payload)
                dispatch(showModal({ isShowModal: false, modalChildren: null }))
                if (response.success) {
                    Swal.fire('Congratulation!', response.mess, 'success').then(() => {
                        setIsRegister(false)
                        resetPayload()
                    })
                }
                else {
                    Swal.fire('OOPS@', response.mess, 'error')
                }

            } else {
                dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }))
                const res = await apiLogin(data)
                dispatch(showModal({ isShowModal: false, modalChildren: null }))
                if (res.success) {
                    if (res.userData.status) {
                        dispatch(login({ isLoggedIn: true, token: res.accessToken, userData: res.userData }))
                        setTimeout(async () => {
                            searchParams.get('redirect') ? await navigate(searchParams.get('redirect')): await navigate(`/${path.HOME}`);
                        }, 100); // 100ms
                    }
                    else {
                        Swal.fire('OOPS@', 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Admin!', 'error')
                    }
                }
                else {
                    Swal.fire('OOPS@', res.mess, 'error')
                }
            }
        }
    }, [payload, isRegister])
    return (
        <div className='w-screen h-screen relative'>
            {isForgetPassword && <div className='absolute animate-slide-right top-0 left-0 bottom-0 right-0 bg-overlay flex flex-col items-center py-8 z-50'>
                <div className='flex flex-col gap-4 '>
                    <label className='text-white' htmlFor="email">Enter your email:</label>
                    <input type="text"
                        id="email"
                        className='rounded w-[1000px] h-[50px] pl-2 text-main items-center border border-main outline-none placeholder:text-sm placeholder:text-main'
                        placeholder='Exp: email@gmail.com'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className='flex items-center justify-end mt-4 w-main gap-4'>
                    <Button
                        name='Submit'
                        handleOnClick={handleForgetPassword}
                        style='my-2 px-4 py-2 rounded-md text-white bg-blue-500 text-semibold' />
                    <Button
                        name='Cancel'
                        handleOnClick={() => setIsForgetPassword(false)}
                        style='my-2 px-4 py-2 rounded-md text-white bg-orange-500 text-semibold'
                    />
                </div>
            </div>}
            <img
                src='https://png.pngtree.com/background/20230401/original/pngtree-planet-universe-starry-sky-mountains-background-picture-image_2252507.jpg'
                alt=''
                className='w-full h-full object-cover'
            />
            <div className=' absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center'>
                <div className='p-8 bg-white rounded-md min-w-[500px] flex flex-col items-center'>
                    <h1 className='text-[20px] font-semibold text-main mb-8'>{isRegister ? 'Đăng Ký' : 'Đăng Nhập'}</h1>
                    {isRegister && <InputField
                        value={payload.name}
                        setValue={setPayload}
                        nameKey='name'
                        invalidFields={invalidFields}
                        setInvalidFields={setInvalidFields}
                        fullWidth
                    />}
                    <InputField
                        value={payload.email}
                        setValue={setPayload}
                        nameKey='email'
                        invalidFields={invalidFields}
                        setInvalidFields={setInvalidFields}
                        fullWidth
                    />
                    {isRegister && <InputField
                        value={payload.phone}
                        setValue={setPayload}
                        nameKey='phone'
                        invalidFields={invalidFields}
                        setInvalidFields={setInvalidFields}
                        fullWidth
                    />}
                    <InputField
                        value={payload.password}
                        setValue={setPayload}
                        nameKey='password'
                        type='password'
                        invalidFields={invalidFields}
                        setInvalidFields={setInvalidFields}
                        fullWidth
                    />
                    <Button
                        name={isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
                        handleOnClick={handleSubmit}
                        fw
                    />
                    <div className='flex items-center justify-between my-2 w-full text-sm'>
                        {!isRegister && <span onClick={() => setIsForgetPassword(true)} className='text-main hover:underline cursor-pointer'>Quên Mật Khẩu?</span>}
                        {!isRegister && <span className='text-main hover:underline cursor-pointer'
                            onClick={() => setIsRegister(true)}
                        >Tạo tài khoản</span>}
                        {isRegister && <span className='text-blue-500 hover:underline cursor-pointer w-full text-center'
                            onClick={() => setIsRegister(false)}
                        >Về Trang Đăng Nhập</span>}
                    </div>
                    <Link className='text-blue-500 text-sm hover:underline cursor-pointer' to={`/${path.HOME}`}>Về trang chủ?</Link>
                </div>
            </div>
        </div>
    )
}


export default Login