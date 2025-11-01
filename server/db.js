// 1️⃣ dotenv 불러오기
require('dotenv').config();

// 2️⃣ pg 패키지 불러오기
const { Pool } = require('pg');

// 3️⃣ PostgreSQL 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'od_check'
});

// 4️⃣ 연결 테스트
pool.connect()
  .then(() => console.log('PostgreSQL 연결 성공 ✅'))
  .catch(err => {
    console.error('PostgreSQL 연결 실패 ❌', err.message);
    if (!process.env.DB_PASSWORD) {
      console.error('⚠️  DB_PASSWORD가 설정되지 않았습니다. .env 파일을 확인하세요.');
    }
  });

module.exports = pool;
