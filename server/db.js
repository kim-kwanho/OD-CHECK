// 1️⃣ dotenv 불러오기
require('dotenv').config();

// 2️⃣ pg 패키지 불러오기
const { Pool } = require('pg');

// 3️⃣ PostgreSQL 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST,       // .env에서 불러옴
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// 4️⃣ 연결 테스트
pool.connect()
  .then(() => console.log('PostgreSQL 연결 성공 ✅'))
  .catch(err => console.error('PostgreSQL 연결 실패 ❌', err));

module.exports = pool;
