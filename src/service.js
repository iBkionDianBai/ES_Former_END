// 接口文件

import axios from 'axios'

const API_BASE_URL = '/' // The base URL for your API

const apiService = axios.create({
  baseURL: API_BASE_URL
})

// // 举例post,get方法写法
// export const login = (username, password) => {
//   return apiService.post('/login', { username, password })
// }
//
// export const getUser = userId => {
//   return apiService.post(`/users/${userId}`)
// }
//
// // 刻石搜索  /KeShiWenBen/queryKeShiWenBen
// // data是传过去的参数
// export const getKeshi = data => {
//   return apiService.post(`/KeShiWenBen/queryKeShiWenBen`, {data})
//   }
// //简牍搜索   /JianDuwenBen/queryJianDuwenBenPage
// export const getJianDu = data => {
//   return apiService.get(`/JianDuwenBen/queryJianDuwenBenPage`, {data})
//   }
//
//   //秦始皇本纪搜索 /QSH_BenJiWenXian/queryQshBenJiWenKianPage
//   export const getQSHBenJi = data => {
//   return apiService.post(`/QSH_BenJiWenXian/queryQshBenJiWenKianPage?pageNum=1&pageSize=10`, {data})
//   }
//
//   //秦考古搜索
//   export const getQinKaoGu = data => {
//     return apiService.post(`/QinKaoGuenKian/queryQinKaoGuwenKianPage`, {data})
//     }

/**
 * 异步上传Word文档
 * @param {FormData} formData 只需包含 file 字段
 * @returns {Promise}
 */
export const uploadDocumentAsync = (formData) => {
  return apiService.post('/document/upload/async', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default apiService



