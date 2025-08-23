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

/**
 * 高级搜索接口
 * @param {Object} params 搜索参数
 * @param {string} params.searchConditions 组合搜索条件
 * @param {string} [params.startDate] 开始日期
 * @param {string} [params.endDate] 结束日期
 * @param {string} [params.types] 搜索类型（多个用/分隔）
 * @returns {Promise}
 */
export const advancedSearch = (params) => {
  return apiService.post('/api/v1/search/advanced', {
    params: params  // 自动拼接为URL查询参数
  });
};

export default apiService



