// import axios from 'axios';

// // 设置默认请求头
// axios.interceptors.request.use(
//   (config) => {
//     const token = sessionStorage.getItem('token');
//     // console.log('是否在全局设置到token',token)
//     if (token) {
//       config.headers['Token'] = `${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default axios;