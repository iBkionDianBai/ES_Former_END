// 接口文件

import axios from 'axios'

// const API_BASE_URL = 'http://129.211.189.196:8800' // The base URL for your local API
const API_BASE_URL = 'http://localhost:8080'
const apiService = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

/**
 * 获取验证码
 * @returns {Promise}
 */
export const getCaptcha = () => {
  return apiService.get('/captcha');
};

/**
 * 获取RSA公钥
 * @returns {Promise} 包含公钥的响应对象
 */
export const getPublicKey = () => {
  return apiService.get('/public-key');
};

/**
 * 用户登录
 * @param {Object} loginData 登录数据
 * @param {string} loginData.username 用户名
 * @param {string} loginData.password 密码
 * @param {string} loginData.code 验证码
 * @param {string} loginData.captchaToken 验证码token
 * @returns {Promise}
 */
export const login = (loginData) => {
  return apiService.post('/login', loginData);
};

/**
 * 用户注册接口
 *
 * @param {Object} registerData - 注册数据
 * @param {string} registerData.username - 用户名（明文）
 * @param {string} registerData.password - 密码（RSA 公钥加密后字符串）
 * @param {string} [registerData.email] - 邮箱（RSA 公钥加密后字符串）
 * @param {string} [registerData.phone] - 手机号（RSA 公钥加密后字符串）
 * @param {string} [registerData.invitationCode] - 邀请码（RSA 公钥加密后字符串，可选）
 *
 * @returns {Promise<Object>} 后端返回的响应数据
 */
export const register = (registerData) => {
  return apiService.post('/register', registerData);
};

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
 * 获取文章内容
 * @param {string} articleId 文章ID
 * @returns {Promise}
 */
export const getArticleContent = (articleId) => {
  return apiService.get(`/api/v1/search/detail/${articleId}`);
};

/**
 * 高级搜索接口
 * @param {Object} params 搜索参数
 * @param {Array} params.conditions 搜索条件数组
 * @param {number} params.currentPage 当前页码
 * @param {number} params.pageSize 每页条数
 * @param {string} [params.sortField] 排序字段
 * @param {string} [params.sortOrder] 排序方向（asc/desc）
 * @param {string} [params.startDate] 开始日期
 * @param {string} [params.endDate] 结束日期
 * @returns {Promise}
 */
export const advancedSearch = (params) => {
  // 对于POST请求，建议将参数放在请求体中而非params
  return apiService.post('/api/v1/search/advanced', params);
};

export default apiService



