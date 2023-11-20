import React, {useState} from 'react'
import { Button } from '../../components'
import { useParams } from 'react-router-dom'
import { apiResetPassword } from '../../apis/user'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const { token } = useParams()
  const handleResetPassword = async() => {
    const response = await apiResetPassword({password, token})
    if (response.success) {
      toast.success(response.mess)
    }
    else {
      // setIsForgetPassword(false)
      toast.info(response.mess, { theme: "colored" })
    }
  }
  return (
    <div className='absolute animate-slide-right top-0 left-0 bottom-0 right-0 bg-overlay flex flex-col items-center py-8 z-50'>
      <div className='flex flex-col gap-4 '>
        <label htmlFor="password">Enter your new password:</label>
        <input type="text"
          id="password"
          className='w-[800px] pb-2 border-b outline-none placeholder:text-sm'
          placeholder='Type here'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div className='flex items-center justify-end mt-4 w-full gap-4'>
        <Button
          name='Submit'
          handleOnClick={handleResetPassword}
          style='my-2 px-4 py-2 rounded-md text-white bg-blue-500 text-semibold' />
       
      </div>
    </div>
  )
}

export default ResetPassword