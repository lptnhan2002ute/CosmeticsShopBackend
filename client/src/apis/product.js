import axios from "../axios";

export const apiGetProducts = (params) => axios({
    url: '/product/',
    method: 'get',
    params,
    withCredentials: true,
})
export const apiGetProduct = (pid) => axios({
    url: '/product/' + pid,
    method: 'get',
    withCredentials: true,
})
// export const apiGetProductCategory = (params) => axios({
//     url: '/product',
//     method: 'get',
//     params
// })

export const apiGetRecommendedProducts = (uid) => axios({
    url: '/product/recommendation/' + uid,
    method: 'get',
    withCredentials: true,
})

export const apiGetProductCategory = (params) => axios({
    headers: { 'Content-type': 'application/json' },
    url: `/product`,
    method: 'get',
    params,
    withCredentials: true,
})

export const apiGetAllBrand = () => axios({
    url: '/brand',
    method: 'get',
    withCredentials: true,
})
export const apiCreateProduct = (formData) => axios({
    url: '/product',
    method: 'post',
    data: formData,
    withCredentials: true,
})
export const apiGetProductsSearch = (params) => axios({
    url: '/product',
    method: 'get',
    params,
    withCredentials: true,
})
export const apiUpdateProduct = (data, pid) => axios({
    url: '/product/' + pid,
    method: 'put',
    data,
    withCredentials: true,
})
export const apiDeleteProduct = (pid) => axios({
    url: '/product/' + pid,
    method: 'delete',
    withCredentials: true,
})

export const apiRatings = (data) => axios({
    url: '/product/ratings',
    method: 'put',
    data,
    withCredentials: true,
})
export const apiGetCategory = (params) => axios({
    url: '/productCategory',
    method: 'get',
    params,
    withCredentials: true,
})
export const apiUpdateCategory = (data, pcid) => axios({
    url: '/productCategory/' + pcid,
    method: 'put',
    data,
    withCredentials: true,
})
export const apiDeleteCategory = (pcid) => axios({
    url: '/productCategory/' + pcid,
    method: 'delete',
    withCredentials: true,
})
export const apiCreateCategory = (data) => axios({
    url: '/productCategory',
    method: 'post',
    data,
    withCredentials: true,
})
export const apiGetVoucher = (page = 1, name = undefined, startDate = undefined, endDate = undefined) => axios({
    url: `/voucher?page=${page}${name ? `&name=${name}` : ''}${startDate ? `&startDate=${startDate}&endDate=${endDate}` : ''}`,
    method: 'get',
    withCredentials: true,
})
export const apiCreateVoucher = (data) => axios({
    url: '/voucher',
    method: 'post',
    data,
    withCredentials: true,
})
export const apiUpdateVoucher = (data, vid) => axios({
    url: '/voucher/' + vid,
    method: 'put',
    data,
    withCredentials: true,
})
export const apiSearchNameVoucher = (data) => axios({
    url: 'voucher/search',
    method: 'post',
    data,
    withCredentials: true,
})
export const apiDeleteVoucher = (vid) => axios({
    url: '/voucher/' + vid,
    method: 'delete',
    withCredentials: true,
})
export const apiIdVoucher = (vid) => axios({
    url: '/voucher/' + vid,
    method: 'get',
    withCredentials: true,
})
export const apiCheckVoucher = (data) => axios({
    url: 'voucher/check',
    method: 'post',
    data,
    withCredentials: true,
})
