const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/v3/api-docs',
    createProxyMiddleware({
      target: 'http://172.18.7.119:8080', // 后端本地开发服务器的地址
      changeOrigin: true
    })
  )
}


//  http://172.18.7.119:8080/KeShiWenBen/queryKeShiWenBen 这个地址都打不开 后端地址错了吧