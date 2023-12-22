import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiResetPassword } from '../../apis/user'
import { toast } from 'react-toastify'
import path from '../../ultils/path'
import 'react-toastify/dist/ReactToastify.css'
import { validate } from '../../ultils/helpers'
import { Button, Checkbox } from 'antd'

const ResetPassword = () => {
  const [password, setPassword] = useState(null)
  const [invalidFields, setInvalidFields] = useState([]);
  const { token } = useParams()
  const [isShowPassword, setIsShowPassWord] = useState(false)
  const [compare, setCompare] = useState(true)
  const [conFirm, setConFirm] = useState(null)
  const navigate = useNavigate()
  const handleResetPassword = async () => {
    const response = await apiResetPassword({ password, token })
    if (response.success) {
      toast.success(response.mess)
      setTimeout(async () => {
        await navigate(`/${path.HOME}`);
      }, 1000); // 3000ms
    }
    else {
      // setIsForgetPassword(false)
      toast.info(response.mess, { theme: "colored" })
    }
  }
  useEffect(() => {
    if (password && conFirm) {
      if (conFirm === password) {
        setCompare(false)
      } else {
        setCompare(true)
      }
    }
  }, [conFirm, password])
  return (
    <div className='absolute animate-slide-right top-0 left-0 bottom-0 right-0 bg-[#e2acca] rounded flex flex-col items-center py-8 z-50 h-screen justify-center'>
      <div className='p-[20px] bg-white rounded-[12px] w-[34vw]'>
        <div className='flex flex-col gap-4 '>
          <label htmlFor="password">Enter your new password:</label>
          <input type={isShowPassword ? "text" : "password"}
            id="password"
            className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
            placeholder='Type here'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input type={isShowPassword ? "text" : "password"}
            id="confirmpassword"
            className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
            placeholder='Type here'
            value={conFirm}
            onChange={e => setConFirm(e.target.value)}
          />
        </div >
        <div className='mt-2 flex justify-end w-full'>
          <Checkbox checked={isShowPassword} onChange={() => setIsShowPassWord(prev => !prev)}>
            Show
          </Checkbox>
        </div>
        <div className='flex items-center justify-end z-10 mt-4 w-full gap-4'>
          <Button
            disabled={compare}
            onClick={handleResetPassword} >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword