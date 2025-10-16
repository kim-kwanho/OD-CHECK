// server.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('OD-CHECK 서버 실행 중!');
});

app.listen(3000, () => {
  console.log('서버가 http://localhost:3000 에서 실행 중입니다.');
});
