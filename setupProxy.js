const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(
        '/v3/api-docs',
        createProxyMiddleware({
            target: 'http://129.211.189.196:8800', // 后端本地开发服务器的地址
            changeOrigin: true
        })
    );

    //  /document 路径代理，支持文档上传等接口
    app.use(
        '/document',
        createProxyMiddleware({
            target: 'http://129.211.189.196:8800',
            changeOrigin: true
        })
    );
}

//  http://172.18.7.119:8080/KeShiWenBen/queryKeShiWenBen 这个地址都打不开 后端地址错了吧