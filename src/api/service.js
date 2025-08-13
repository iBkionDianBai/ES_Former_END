// 接口文件

import axios from 'axios'

const API_BASE_URL = 'http://129.211.189.196:8800' // The base URL for your API

const apiService = axios.create({
  baseURL: API_BASE_URL
})


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



