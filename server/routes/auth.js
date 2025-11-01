// server/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'participant' } = req.body;

    // 입력값 검증
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: '이메일, 비밀번호, 이름은 필수입니다.' 
      });
    }

    // 이메일 중복 체크
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        message: '이미 등록된 이메일입니다.' 
      });
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const result = await pool.query(
      `INSERT INTO users (email, name, role, password_hash) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role`,
      [email, name, role, hashedPassword]
    );

    res.status(201).json({
      message: '회원가입 성공!',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('회원가입 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: '이메일과 비밀번호를 입력해주세요.' 
      });
    }

    // 사용자 조회
    const result = await pool.query(
      'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        message: '이메일 또는 비밀번호가 잘못되었습니다.' 
      });
    }

    const user = result.rows[0];

    // password_hash가 없으면 기존 사용자 (비밀번호 없이 로그인 불가)
    if (!user.password_hash) {
      return res.status(401).json({ 
        message: '비밀번호가 설정되지 않은 계정입니다. 관리자에게 문의하세요.' 
      });
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        message: '이메일 또는 비밀번호가 잘못되었습니다.' 
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 비밀번호 해시는 응답에서 제외
    delete user.password_hash;

    res.json({
      message: '로그인 성공!',
      token: token,
      user: user
    });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 현재 사용자 정보 조회
router.get('/me', async (req, res) => {
  try {
    // JWT 토큰은 미들웨어에서 검증
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer TOKEN" 형식

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
    console.error('사용자 정보 조회 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;

