// server/routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const crypto = require('crypto');

// 모든 라우트에 인증 및 관리자 권한 체크
router.use(authenticateToken);
router.use(requireAdmin);

// 대시보드 데이터
router.get('/dashboard', async (req, res) => {
  try {
    // 오늘 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 오늘 출석 현황
    const todayAttendance = await pool.query(
      `SELECT COUNT(*) as count
       FROM attendance_logs
       WHERE check_in_time >= $1 AND check_in_time < $2`,
      [today, tomorrow]
    );

    // 전체 사용자 수
    const totalUsers = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      ['participant']
    );

    // 이번 주 출석률
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // 일요일로

    const weekAttendance = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM attendance_logs
       WHERE check_in_time >= $1`,
      [weekStart]
    );

    // 미납 지각비 현황
    const unpaidPenalties = await pool.query(
      `SELECT 
         u.id,
         u.name,
         u.email,
         SUM(p.amount_won) as total_amount
       FROM penalties p
       JOIN users u ON p.user_id = u.id
       GROUP BY u.id, u.name, u.email
       ORDER BY total_amount DESC
       LIMIT 10`
    );

    res.json({
      todayAttendance: parseInt(todayAttendance.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count),
      weekAttendance: parseInt(weekAttendance.rows[0].count),
      unpaidPenalties: unpaidPenalties.rows
    });
  } catch (err) {
    console.error('대시보드 데이터 조회 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 세션 생성
router.post('/sessions', async (req, res) => {
  try {
    const { title, description, timezone = 'Asia/Seoul' } = req.body;

    if (!title) {
      return res.status(400).json({ message: '제목은 필수입니다.' });
    }

    const result = await pool.query(
      `INSERT INTO sessions (title, description, timezone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, timezone]
    );

    // 기본 출석 정책 생성
    await pool.query(
      `INSERT INTO attendance_settings (session_id, grace_minutes, billing_unit_minutes, fee_per_unit_won)
       VALUES ($1, 5, 60, 5000)`,
      [result.rows[0].id]
    );

    res.status(201).json({ session: result.rows[0] });
  } catch (err) {
    console.error('세션 생성 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 회차 생성
router.post('/occurrences', async (req, res) => {
  try {
    const { sessionId, scheduledStart, scheduledEnd } = req.body;

    if (!sessionId || !scheduledStart || !scheduledEnd) {
      return res.status(400).json({ 
        message: 'sessionId, scheduledStart, scheduledEnd는 필수입니다.' 
      });
    }

    // QR 토큰 생성
    const qrToken = crypto.randomBytes(32).toString('hex');

    const result = await pool.query(
      `INSERT INTO occurrences (session_id, scheduled_start, scheduled_end, qr_token)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sessionId, scheduledStart, scheduledEnd, qrToken]
    );

    res.status(201).json({ 
      occurrence: result.rows[0],
      qrToken: qrToken,
      qrUrl: `/checkin/${qrToken}`
    });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(400).json({ 
        message: '이미 같은 시간대에 회차가 존재합니다.' 
      });
    }
    console.error('회차 생성 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 출석 기록 조회
router.get('/attendance', async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    let query = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email,
        o.scheduled_start,
        o.scheduled_end,
        s.title as session_title
      FROM attendance_logs al
      JOIN users u ON al.user_id = u.id
      JOIN occurrences o ON al.occurrence_id = o.id
      JOIN sessions s ON o.session_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND al.check_in_time >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND al.check_in_time <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    if (userId) {
      query += ` AND al.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    query += ` ORDER BY al.check_in_time DESC`;

    const result = await pool.query(query, params);

    res.json({ attendance: result.rows });
  } catch (err) {
    console.error('출석 기록 조회 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 지각비 현황 조회
router.get('/penalties', async (req, res) => {
  try {
    const { userId, occurrenceId } = req.query;

    let query = `
      SELECT 
        p.*,
        u.name as user_name,
        u.email,
        o.scheduled_start,
        s.title as session_title
      FROM penalties p
      JOIN users u ON p.user_id = u.id
      JOIN occurrences o ON p.occurrence_id = o.id
      JOIN sessions s ON o.session_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND p.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (occurrenceId) {
      query += ` AND p.occurrence_id = $${paramCount}`;
      params.push(occurrenceId);
      paramCount++;
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({ penalties: result.rows });
  } catch (err) {
    console.error('지각비 현황 조회 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 사용자별 지각비 합계
router.get('/penalties/summary', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         u.id,
         u.name,
         u.email,
         COUNT(p.id) as penalty_count,
         SUM(p.amount_won) as total_amount
       FROM users u
       LEFT JOIN penalties p ON u.id = p.user_id
       WHERE u.role = 'participant'
       GROUP BY u.id, u.name, u.email
       ORDER BY total_amount DESC NULLS LAST`
    );

    res.json({ summary: result.rows });
  } catch (err) {
    console.error('지각비 요약 조회 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;

