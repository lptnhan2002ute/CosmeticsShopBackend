import React, { useEffect, useState, useCallback } from 'react'
import { apiGetUsers } from '../../apis/user'
import moment from 'moment' 
import { InputField } from '../../components'

const ManageUser = () => {
    const [users, setUsers] = useState(null)
    const [queries, setQueries] = useState({
        name: ""
    })
    const[editE, seteditE] = useState(null)
    const fetchUsers = async (params) => {
        const response = await apiGetUsers(params)
        if (response.success) setUsers(response)
        else setUsers([])
    }

    useEffect(() => { 
      if (queries.name !== '')  fetchUsers(queries)
      else fetchUsers()
    },[queries])
console.log(editE)
    return(
        <div className='w-full'>
            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <span>Quản Lí Thành Viên</span>
            </h1>
            <div className='w-full p-4'>
                <div className='flex justify-end p-4'>
                    <InputField 
                    nameKey={'name'}
                    value={queries.name}
                    setValue={setQueries}
                    style='w500'
                    placeholder={'Tìm kiếm tên người dùng'}
                    isHideLabel
                    />
                </div>
                <table className='table-auto mb-6 text-left w-full'>
                    <thead className='font-bold bg-gray-700 text-[13px] text-white'>
                       <tr className='border border-gray-500'>
                       <th className='px-4 py-2 '>#</th>
                       <th className='px-4 py-2 '>Địa chỉ email</th>
                       <th className='px-4 py-2 '>Tên người dùng</th>
                       <th className='px-4 py-2 '>Quyền</th>
                       <th className='px-4 py-2 '>Số điện thoại</th>
                       <th className='px-4 py-2 '>Trạng thái</th>
                       <th className='px-4 py-2 '>Ngày tạo</th>
                       <th className='px-4 py-2 '>Action</th>
                       </tr>
                    </thead>
                    <tbody>
                       {users?.userData?.map((el, index) => (
                        <tr key={el._id} className='border border-gray-500 '>
                            <td className='py-2 px-4'>{index+1}</td>
                            <td className='py-2 px-4'>{el.email}</td>
                            <td className='py-2 px-4'>{el.name}</td>
                            <td className='py-2 px-4'>{el.role}</td>
                            <td className='py-2 px-4'>{el.phone}</td>
                            <td className='py-2 px-4'>{el.status ? 'Active' : 'Blocked'}</td>
                            <td className='py-2 px-4'>{moment(el.createdAt).format('DD/MM/YYYY')}</td>
                            <td className='py-2 px-4'>
                                <span onClick={() => seteditE(el)} className='px-2 text-main hover:underline cursor-pointer'>Edit</span>
                                <span className='px-2 text-main hover:underline cursor-pointer'>Delete</span>
                            </td>
                        </tr>
                       ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ManageUser