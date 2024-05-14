import axios from "../axios";

export const apiGetProducts = (params) => axios({
    url: '/product/',
    method: 'get',
    params
})
export const apiGetProduct = (pid) => axios({
    url: '/product/' + pid,
    method: 'get',
})
// export const apiGetProductCategory = (params) => axios({
//     url: '/product',
//     method: 'get',
//     params
// })

export const apiGetRecommendedProducts = (uid) => axios({
    url: '/product/recommendation/' + uid,
    method: 'get',
})

export const apiGetProductCategory = (params) => axios({
    headers: { 'Content-type': 'application/json' },
    url: `/product`,
    method: 'get',
    params
})

export const apiGetAllBrand = () => axios({
    url: '/brand',
    method: 'get',
})
export const apiCreateProduct = (formData) => axios({
    url: '/product',
    method: 'post',
    data: formData,
})
export const apiGetProductsSearch = (params) => axios({
    url: '/product',
    method: 'get',
    params
})
export const apiUpdateProduct = (data, pid) => axios({
    url: '/product/' + pid,
    method: 'put',
    data
})
export const apiDeleteProduct = (pid) => axios({
    url: '/product/' + pid,
    method: 'delete',
})

export const apiRatings = (data) => axios({
    url: '/product/ratings',
    method: 'put',
    data
})
export const apiGetCategory = (params) => axios({
    url: '/productCategory',
    method: 'get',
    params
})
export const apiUpdateCategory = (data, pcid) => axios({
    url: '/productCategory/' + pcid,
    method: 'put',
    data
})
export const apiDeleteCategory = (pcid) => axios({
    url: '/productCategory/' + pcid,
    method: 'delete',
})
export const apiCreateCategory = (data) => axios({
    url: '/productCategory',
    method: 'post',
    data
})
export const apiGetVoucher = (page = 1, startDate = undefined, endDate = undefined) => axios({
    url: `/voucher?page=${page}${startDate && `&startDate=${startDate}&endDate=${endDate}`}`,
    method: 'get',
})
export const apiCreateVoucher = (data) => axios({
    url: '/voucher',
    method: 'post',
    data
})
export const apiUpdateVoucher = (data, vid) => axios({
    url: '/voucher/' + vid,
    method: 'put',
    data
})
export const apiSearchNameVoucher = (data) => axios({
    url: 'voucher/search',
    method: 'post',
    data
})
export const apiDeleteVoucher = (vid) => axios({
    url: '/voucher/' + vid,
    method: 'delete',
})
export const apiIdVoucher = (vid) => axios({
    url: '/voucher/' + vid,
    method: 'get',
})
export const apiCheckVoucher = (data) => axios({
    url: 'voucher/check',
    method: 'post',
    data
})
