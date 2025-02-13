const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/local',
    createProxyMiddleware({
      target: 'http://localhost:8080', // 백엔드 서버 주소
      changeOrigin: true, // 요청 헤더의 호스트 정보를 변경
      pathRewrite: { '^/local': '' }, // '/local' 제거
    })
  );
};
