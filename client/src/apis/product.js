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
export const apiGetProductCategory = (params) => axios({
    headers: { 'Content-type': 'application/json' },
    url: `/product`,
    method: 'get',
    params
})

export const apiGetAllBrand = () => axios({
    url:'/brand',
    method: 'get',
})
export const apiCreateProduct = (formData) => axios({
    url:'/product',
    method: 'post',
    data: formData,
})
export const apiGetProductsSearch = (params) => axios({
    url: '/product',
    method: 'get',
    params
})
export const apiUpdateProduct = (data, pid) => axios({
    url: '/product/'+pid,
    method: 'put',
    data
})
export const apiDeleteProduct = (pid) => axios({
    url: '/product/'+pid,
    method: 'delete',
})

export const apiRatings = (data) => axios({
    url: '/product/ratings',
    method: 'put',
    data
})