import axios from "../axios";

export const apiCreateFlashSale = (data) => axios({
  url: '/flashsale/create',
  method: 'post',
  data,
  withCredentials: true,
})

export const apiUpdateFlashSale = (data, fid) => axios({
  url: '/flashsale/update/' + fid,
  method: 'put',
  data,
  withCredentials: true,
})

export const apiDeleteFlashSale = (fid) => axios({
  url: '/flashsale/delete/' + fid,
  method: 'delete',
  withCredentials: true
})

export const apiGetAllFlashSale = (page = 1, saleName = undefined, startDate = undefined, endDate = undefined) => axios({
  url: `/flashsale?page=${page}${saleName ? `&saleName=${saleName}` : ''}${startDate ? `&startDate=${startDate}&endDate=${endDate}` : ''}`,
  method: 'get',
  withCredentials: true
})