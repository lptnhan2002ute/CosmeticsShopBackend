import axios from "../axios";

export const apiGetProducts = (params) => axios({
    url: '/product/',
    method: 'get',
    params
})
export const apiGetProduct = (pid) => axios({
    url: '/product/'+pid,
    method: 'get',
})
// export const apiGetProductCategory = (params) => axios({
//     url: '/product',
//     method: 'get',
//     params
// })
export const apiGetProductCategory = (params) => axios({
    url:`/product?categoryId=${params.category}` ,
    method: 'get',
    params
})
