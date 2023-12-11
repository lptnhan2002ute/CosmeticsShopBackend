import axios from "../axios";

export const apiRegister = (data) => axios({
    url: '/user/register',
    method: 'post',
    data,
    withCredentials: true
})

export const apiLogin = (data) => axios({
    url: '/user/login',
    method: 'post',
    data
})

export const apiForgetPassword = (data) => axios({
    url: '/user/forgetpassword',
    method: 'post',
    data
})

export const apiResetPassword = (data) => axios({
    url: '/user/resetpassword',
    method: 'put',
    data
})

export const apiGetCurrent = () => axios({
    url: '/user/current',
    method: 'get',
})

export const apiGetUsers = (params) => axios({
    url: '/user',
    method: 'get',
    params
})

export const apiUpdateCart = (data) => axios({
    url: '/user/add/cart',
    method: 'put',
    data
})

export const apiRemoveCart = (pid) => axios({
    url: '/user/remove-cart/' + pid,
    method: 'delete',
})
export const apiGetUserCart = () => axios({
    url: '/user/current-cart',
    method: 'get',
})
export const apiUpdateUser = (data, uid) => axios({
    url: '/user/'+uid,
    method: 'put',
    data
})
export const apiDeleteUser = (uid) => axios({
    url:'/user/'+uid,
    method: 'delete',
})
export const apiUpdateUser1 = (data) => axios({
    url:'/user/currentUser',
    method: 'put',
    data
})