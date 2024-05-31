import axios from "../axios";

export const apiRegister = (data) => axios({
    url: '/user/register',
    method: 'post',
    data,
    withCredentials: true,
})

export const apiLogin = (data) => axios({
    url: '/user/login',
    method: 'post',
    data,
    withCredentials: true,
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
    withCredentials: true,
})

export const apiGetUsers = (params) => axios({
    url: '/user',
    method: 'get',
    params,
    withCredentials: true,
})

export const apiUpdateCart = (data) => axios({
    url: '/user/add/cart',
    method: 'put',
    data,
    withCredentials: true,
})

export const apiRemoveCart = (pid) => axios({
    url: '/user/remove-cart/' + pid,
    method: 'delete',
    withCredentials: true,
})
export const apiGetUserCart = () => axios({
    url: '/user/current-cart',
    method: 'get',
    withCredentials: true,
})
export const apiUpdateUser = (data, uid) => axios({
    url: '/user/' + uid,
    method: 'put',
    data,
    withCredentials: true,
})
export const apiDeleteUser = (uid) => axios({
    url: '/user/' + uid,
    method: 'delete',
    withCredentials: true,
})
export const apiUpdateUser1 = (data) => axios({
    url: '/user/customer',
    method: 'put',
    data,
    withCredentials: true,
})

export const apiOrder = (data) => axios({
    url: "/bill",
    method: "post",
    data,
    withCredentials: true,
})

export const apiGetOrderUser = () => axios({
    url: "/bill",
    method: "get",
    withCredentials: true,
})

export const apiGetAllOrder = () => axios({
    url: "/bill/admin",
    method: "get",
    withCredentials: true,
})

export const apiGetAllOrderByTime = (query) => axios({
    url: `/bill/list${query}`,
    method: "get",
    withCredentials: true,
})

export const apiUpdateOrder = (data, oid) => axios({
    url: `/bill/status/${oid}`,
    method: "put",
    data,
    withCredentials: true,
})

export const apiGetOrderById = (oid) => axios({
    url: `/bill/order/${oid}`,
    method: "get",
    withCredentials: true,
})


export const apiDeleteOrder = (oid) => axios({
    url: `/bill/${oid}`,
    method: "delete",
    withCredentials: true,
})

export const apiCreateVnpayUrl = (data) => axios({
    url: '/bill/create_vnpay_payment',
    method: "post",
    data,
    withCredentials: true,
})

export const apiVnpayIpn = (params) => axios({
    url: "/bill/vnpay_ipn",
    method: "get",
    params,
    withCredentials: true,
})

export const apiUpdateWishlist = (pid) => axios({
    url: '/user/wishlist/' + pid,
    method: "put",
    withCredentials: true,
})


export const apiChangePassword = (data) => axios({
    url: '/user/customer/resetpassword',
    method: 'put',
    data,
    withCredentials: true,
})

export const apiStartSession = (data) => axios({
    url: '/chat/start',
    method: 'post',
    data,
    withCredentials: true,
})

export const apiSendMessage = (data) => axios({
    url: '/chat/send',
    method: 'post',
    data,
    withCredentials: true,
})

export const apiGetMessages = (sessionID) => axios({
    url: `/chat/messages/${sessionID}`,
    method: "get",
    withCredentials: true,
})

export const apiCloseSession = (data, sessionID) => axios({
    url: `/chat/close/${sessionID}`,
    method: "put",
    data,
    withCredentials: true,
})

