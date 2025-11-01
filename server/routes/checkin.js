// server/routes/checkin.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// QR 토큰으로 회차 정보 조회
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // occurrence 조회
    const occurrenceResult = await pool.query(
      `SELECT o.*, s.title as session_title, s.description
       FROM occurrences o
       JOIN sessions s ON o.session_id = s.id
       WHERE o.qr_token = $1`,
      [token]
    );

    if (occurrenceResult.rows.length === 0) {
      return res.status(404).json({ 
        message: '유효하지 않은 QR 코드입니다.' 
      });
    }

    const occurrence = occurrenceResult.rows[0];

    res.json({
      occurrence: {
        id: occurrence.id,
        sessionTitle: occurrence.session_title,
        scheduledStart: occurrence.scheduled_start,
        scheduledEnd: occurrence.scheduled_end
      }
    });
  } catch (err) {
    console.error('회차 정보 조회 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 출석체크 처리
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { occurrenceId } = req.body;
    const userId = req.user.userId;

    if (!occurrenceId) {
      return res.status(400).json({ 
        message: 'occurrenceId는 필수입니다.' 
      });
    }

    // occurrence 정보 조회
    const occurrenceResult = await pool.query(
      `SELECT o.*, s.title
       FROM occurrences o
       JOIN sessions s ON o.session_id = s.id
       WHERE o.id = $1`,
      [occurrenceId]
    );

    if (occurrenceResult.rows.length === 0) {
      return res.status(404).json({ 
        message: '회차를 찾을 수 없습니다.' 
      });
    }

    const occurrence = occurrenceResult.rows[0];

    // 이미 출석했는지 확인
    const existingCheck = await pool.query(
      'SELECT * FROM attendance_logs WHERE user_id = $1 AND occurrence_id = $2',
      [userId, occurrenceId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: '이미 출석체크를 완료했습니다.' 
      });
    }

    // 출석 기록 저장
    const checkInResult = await pool.query(
      `INSERT INTO attendance_logs (user_id, occurrence_id, check_in_time, ip_inet, user_agent)
       VALUES ($1, $2, NOW(), $3, $4)
       RETURNING *`,
      [
        userId,
        occurrenceId,
        req.ip,
        req.get('user-agent')
      ]
    );

    const checkInTime = new Date(checkInResult.rows[0].check_in_time);
    const scheduledStart = new Date(occurrence.scheduled_start);

    // 지각 여부 계산 (분 단위)
    const minutesLate = Math.max(0, (checkInTime - scheduledStart) / 1000 / 60);

    // 출석 정책 조회
    const settingsResult = await pool.query(
      'SELECT * FROM attendance_settings WHERE session_id = $1',
      [occurrence.session_id]
    );

    let penalty = null;
    if (settingsResult.rows.length > 0) {
      const settings = settingsResult.rows[0];
      const graceMinutes = settings.grace_minutes || 5;
      
      if (minutesLate > graceMinutes) {
        const actualLateMinutes = minutesLate - graceMinutes;
        const billingUnit = settings.billing_unit_minutes || 60;
        const feePerUnit = settings.fee_per_unit_won || 5000;
        
        const units = Math.ceil(actualLateMinutes / billingUnit);
        const penaltyAmount = units * feePerUnit;

        // 지각비 기록
        const penaltyResult = await pool.query(
          `INSERT INTO penalties (user_id, occurrence_id, minutes_late, amount_won)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [userId, occurrenceId, Math.floor(actualLateMinutes), penaltyAmount]
        );

        penalty = penaltyResult.rows[0];
      }
    }

    res.json({
      message: minutesLate <= (settingsResult.rows[0]?.grace_minutes || 5) 
        ? '✅ 출석체크 완료!' 
        : '⚠️ 지각 처리되었습니다.',
      checkIn: checkInResult.rows[0],
      minutesLate: Math.floor(minutesLate),
      penalty: penalty
    });
  } catch (err) {
    console.error('출석체크 오류:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 특정 회차 출석 현황 조회
router.get('/attendance/:occurrenceId', authenticateToken, async (req, res) => {
  try {
    const { occurrenceId } = req.params;

    const result = await pool.query(
      `SELECT 
         al.*,
         u.name as user_name,
         u.email
       FROM attendance_logs al
       JOIN users u ON al.user_id = u.id
       WHERE al.occurrence_id = $1
       ORDER BY al.check_in_time ASC`,
      [occurrenceId]
    );

    res.json({ attendance: result.rows });
  } catch (err) {
    console.error('출석 현황 조회 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;

