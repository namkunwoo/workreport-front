const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/local', // 요청 경로를 '/api'로 설정 (React에서 '/api'를 쓰면 백엔드로 전달됨)
    createProxyMiddleware({
      target: 'http://localhost:8080', // 백엔드 서버 주소
      changeOrigin: true, 
      pathRewrite: { '^/local': '' }, // '/local' 제거 후 백엔드로 전달
    })
  );
};
