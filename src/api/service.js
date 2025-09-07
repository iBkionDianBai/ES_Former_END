// 接口文件

import axios from 'axios'

const API_BASE_URL = 'http://129.211.189.196:8800' // The base URL for your local API
// const API_BASE_URL = 'http://localhost:8080'
const apiService = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

// 请求拦截器：自动添加token到请求头
apiService.interceptors.request.use(
  (config) => {
    // 从sessionStorage获取token
    const token = sessionStorage.getItem('token');
    
    if (token) {
      // 设置Authorization头
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理token过期等情况
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 如果返回401未授权，可能是token过期
    if (error.response && error.response.status === 401) {
      // 清除过期的token
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('username');
      
      // 跳转到登录页（这里使用window.location而不是navigate，因为这是在service层）
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

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
 * 普通搜索接口
 * @param {Object} params 搜索参数
 * @param {Array} params.conditions 搜索条件数组，支持多条件搜索，返回基本信息列表（id、title）
 * @param {number} params.currentPage 当前页码
 * @param {number} params.pageSize 每页条数
 * @param {string} [params.sortField] 排序字段
 * @param {string} [params.sortOrder] 排序方向（asc/desc）
 * @param {boolean} [params.enableHighlight] 是否启用高亮
 * @returns {Promise}
 */
export const simpleSearch = (params) => {
  return apiService.post('/api/v1/simple-search/search', params);
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

/**
 * 管理员权限验证接口
 * @returns {Promise}
 */
export const checkAdminPermission = () => {
  return apiService.get('/api/user-permission/admin-check');
};

/**
 * 获取用户信息接口
 * @returns {Promise}
 */
export const getUserInfo = () => {
  return apiService.get('/api/user-permission/user-info');
};

/**
 * 获取用户管理列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页码（从1开始）
 * @param {number} params.pageSize 每页大小
 * @param {string} [params.username] 用户名（模糊查询）
 * @param {string} [params.email] 邮箱（模糊查询）
 * @param {string} [params.phone] 手机号（模糊查询）
 * @param {number} [params.isAdmin] 是否为管理员（0-普通用户 1-管理员）
 * @param {number} [params.isBanned] 是否被封禁（0-正常 1-封禁）
 * @param {string} [params.startTime] 开始时间，格式：yyyy-MM-dd HH:mm:ss
 * @param {string} [params.endTime] 结束时间，格式：yyyy-MM-dd HH:mm:ss
 * @returns {Promise}
 */
export const getUserManagementList = (params) => {
  return apiService.get('/api/user-management/list', { params });
};

/**
 * 批量更新用户状态
 * @param {Array} userIds 用户ID数组
 * @param {number} isBanned 封禁状态 0-正常 1-封禁
 * @param {number} isAdmin 管理员状态 0-普通用户 1-管理员
 * @returns {Promise}
 */
export const batchUpdateUserStatus = (userIds, isBanned = null, isAdmin = null) => {
  const params = {
    userIds: userIds.join(',')
  };
  
  if (isBanned !== null) {
    params.isBanned = isBanned;
  }
  
  if (isAdmin !== null) {
    params.isAdmin = isAdmin;
  }
  
  return apiService.put('/api/user-management/batch-status', null, { params });
};

/**
 * 批量启用用户
 * @param {Array} userIds 用户ID数组
 * @returns {Promise}
 */
export const batchEnableUsers = (userIds) => {
  return batchUpdateUserStatus(userIds, 0);
};

/**
 * 批量禁用用户
 * @param {Array} userIds 用户ID数组
 * @returns {Promise}
 */
export const batchDisableUsers = (userIds) => {
  return batchUpdateUserStatus(userIds, 1);
};

/**
 * 批量设置管理员权限
 * @param {Array} userIds 用户ID数组
 * @returns {Promise}
 */
export const batchSetAdminRole = (userIds) => {
  return batchUpdateUserStatus(userIds, null, 1);
};

/**
 * 批量取消管理员权限
 * @param {Array} userIds 用户ID数组
 * @returns {Promise}
 */
export const batchRemoveAdminRole = (userIds) => {
  return batchUpdateUserStatus(userIds, null, 0);
};

/**
 * 批量删除用户
 * @param {Array} userIds 用户ID数组
 * @returns {Promise}
 */
export const batchDeleteUsers = (userIds) => {
  return apiService.delete('/api/user-management/batch', {
    params: { userIds: userIds.join(',') }
  });
};

/**
 * 更新用户状态
 * @param {number} userId 用户ID
 * @param {number} status 状态（0-禁用 1-启用）
 * @returns {Promise}
 */
export const updateUserStatus = (userId, status) => {
  return apiService.post('/api/user-management/update-status', { userId, status });
};

/**
 * 删除用户
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export const deleteUser = (userId) => {
  return apiService.delete(`/api/user-management/${userId}`);
};

/**
 * 封禁用户
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export const banUser = (userId) => {
  return apiService.put(`/api/user-management/${userId}/ban`);
};

/**
 * 解封用户
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export const unbanUser = (userId) => {
  return apiService.put(`/api/user-management/${userId}/unban`);
};

/**
 * 设置管理员权限
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export const setAdminRole = (userId) => {
  return apiService.put(`/api/user-management/${userId}/set-admin`);
};

/**
 * 取消管理员权限
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export const removeAdminRole = (userId) => {
  return apiService.put(`/api/user-management/${userId}/remove-admin`);
};

export default apiService



