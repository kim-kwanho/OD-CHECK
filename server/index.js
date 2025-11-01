// server/index.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // 모든 도메인에서 API 호출 허용
app.use(express.json()); // JSON 요청 본문 파싱

// 기본 라우트 (브라우저에서 확인 가능)
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: '✅ 서버 정상 작동 중!',
      dbTime: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ error: 'DB 연결 실패' });
  }
});

// API 라우트
app.use('/api/auth', require('./routes/auth'));
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/admin', require('./routes/admin'));

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버가 실행 중입니다 → http://localhost:${PORT}`);
});
