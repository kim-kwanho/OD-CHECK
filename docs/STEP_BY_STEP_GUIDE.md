# 단계별 실습 가이드 - 코딩 초보자를 위한 상세 가이드

이 문서는 코딩 초보자를 위해 각 단계를 매우 상세하게 설명합니다.

---

## 📚 사전 준비사항

### 1. 필요한 프로그램 설치

#### Node.js 설치
1. [Node.js 공식 웹사이트](https://nodejs.org/) 접속
2. LTS 버전 다운로드 및 설치
3. 설치 확인:
   ```bash
   node --version
   npm --version
   ```

#### PostgreSQL 설치
1. [PostgreSQL 공식 웹사이트](https://www.postgresql.org/download/) 접속
2. Windows 버전 다운로드 및 설치
3. 설치 시 비밀번호 설정 (잘 기억해두세요!)
4. 설치 확인:
   ```bash
   psql --version
   ```

#### 코드 에디터 (선택사항)
- Visual Studio Code 추천
- [VS Code 다운로드](https://code.visualstudio.com/)

---

## 🔧 1단계: 프로젝트 환경 설정

### 1.1 프로젝트 구조 확인

현재 프로젝트 구조는 다음과 같습니다:
```
OD-CHECK/
├── server/              # 백엔드 서버 코드
│   ├── db.js           # 데이터베이스 연결
│   ├── index.js        # Express 서버 메인 파일
│   └── package.json    # 서버 의존성 관리
├── sql/                # SQL 스크립트
│   ├── schema.sql      # 데이터베이스 스키마
│   └── sample_data.sql # 샘플 데이터
├── src/                # 추가 소스 파일
├── package.json        # 루트 패키지 관리
└── test.http          # API 테스트 파일
```

### 1.2 데이터베이스 생성 및 설정

#### Step 1: PostgreSQL 접속
```bash
psql -U postgres
```
(설치 시 설정한 비밀번호 입력)

#### Step 2: 데이터베이스 생성
```sql
CREATE DATABASE od_check;
```
```sql
\c od_check  -- 데이터베이스 선택
```

#### Step 3: 스키마 적용
터미널에서:
```bash
psql -U postgres -d od_check -f sql/schema.sql
```

#### Step 4: 샘플 데이터 삽입 (선택사항)
```bash
psql -U postgres -d od_check -f sql/sample_data.sql
```

### 1.3 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=od_check

# 서버 설정
PORT=3000

# JWT 비밀키 (나중에 사용)
JWT_SECRET=your_super_secret_key_change_this_in_production
```

**⚠️ 중요**: `.env` 파일은 절대 Git에 커밋하지 마세요! (이미 .gitignore에 추가되어 있을 것입니다)

---

## 🚀 2단계: 기본 API 구현하기

### 2.1 필요한 라이브러리 설치

서버 디렉토리에서:
```bash
cd server
npm install express pg dotenv jsonwebtoken bcrypt cors
```

**각 패키지 설명**:
- `express`: 웹 서버 프레임워크
- `pg`: PostgreSQL 클라이언트
- `dotenv`: 환경 변수 관리
- `jsonwebtoken`: JWT 토큰 생성/검증
- `bcrypt`: 비밀번호 암호화
- `cors`: Cross-Origin 요청 허용

### 2.2 서버 기본 구조 개선

`server/index.js` 파일을 다음과 같이 개선합니다:

```javascript
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // 모든 도메인에서 API 호출 허용
app.use(express.json()); // JSON 요청 본문 파싱

// 기본 라우트
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

// API 라우트 (나중에 추가할 예정)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/checkin', require('./routes/checkin'));
// app.use('/api/admin', require('./routes/admin'));

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버가 실행 중입니다 → http://localhost:${PORT}`);
});
```

### 2.3 인증 API 구현

#### Step 1: 라우트 폴더 생성
```bash
mkdir server/routes
mkdir server/middleware
```

#### Step 2: 인증 라우트 파일 생성

`server/routes/auth.js` 파일 생성:

```javascript
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
    // 주의: 현재 users 테이블에 password 컬럼이 없다면 추가해야 합니다!
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
    // JWT 토큰은 미들웨어에서 검증 (나중에 추가)
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
```

#### Step 3: 인증 미들웨어 생성

`server/middleware/auth.js` 파일 생성:

```javascript
const jwt = require('jsonwebtoken');
const pool = require('../db');

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: '인증 토큰이 필요합니다.' 
      });
    }

    const token = authHeader.split(' ')[1]; // "Bearer TOKEN" 형식

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 정보를 req.user에 저장
    req.user = decoded;
    
    next(); // 다음 미들웨어로 진행
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: '유효하지 않은 토큰입니다.' 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다.' 
      });
    }
    return res.status(500).json({ message: '서버 오류' });
  }
};

// 관리자 권한 체크 미들웨어
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: '관리자 권한이 필요합니다.' 
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
```

#### Step 4: 데이터베이스 스키마 업데이트

`users` 테이블에 `password_hash` 컬럼 추가:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
```

#### Step 5: 인증 라우트 연결

`server/index.js`에 추가:

```javascript
// API 라우트
app.use('/api/auth', require('./routes/auth'));
```

---

## ✅ 3단계: 출석체크 API 구현

### 3.1 출석체크 라우트 생성

`server/routes/checkin.js` 파일 생성:

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');

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

    // 지각 여부 계산
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
```

### 3.2 출석체크 라우트 연결

`server/index.js`에 추가:

```javascript
app.use('/api/checkin', require('./routes/checkin'));
```

---

## 📊 4단계: 관리자 API 구현

### 4.1 관리자 라우트 생성

`server/routes/admin.js` 파일 생성:

```javascript
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
    // (실제로는 납부 상태를 관리하는 컬럼이 필요할 수 있음)
    const unpaidPenalties = await pool.query(
      `SELECT 
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
```

### 4.2 관리자 라우트 연결

`server/index.js`에 추가:

```javascript
app.use('/api/admin', require('./routes/admin'));
```

---

## 🧪 5단계: API 테스트

### 5.1 서버 실행

```bash
cd server
node index.js
```

서버가 정상적으로 실행되면:
```
✅ 서버가 실행 중입니다 → http://localhost:3000
PostgreSQL 연결 성공 ✅
```

### 5.2 Postman 또는 test.http 파일로 테스트

`test.http` 파일을 업데이트하여 다양한 API를 테스트할 수 있습니다.

---

## 🎯 다음 단계

이제 백엔드 API가 완성되었습니다! 다음은 프론트엔드를 구축하는 단계입니다.

1. **프론트엔드 프로젝트 생성**
2. **로그인 페이지 구현**
3. **출석체크 페이지 구현**
4. **관리자 대시보드 구현**

각 단계는 별도의 가이드 문서로 제공될 예정입니다.

---

## ❓ 자주 묻는 질문 (FAQ)

### Q1: 서버가 실행되지 않아요
- `.env` 파일이 제대로 설정되었는지 확인하세요
- PostgreSQL이 실행 중인지 확인하세요
- 포트 3000이 이미 사용 중인지 확인하세요

### Q2: 데이터베이스 연결 오류가 발생해요
- PostgreSQL 서비스가 실행 중인지 확인하세요
- `.env` 파일의 데이터베이스 정보가 정확한지 확인하세요
- 데이터베이스가 생성되었는지 확인하세요

### Q3: API 요청 시 401 오류가 발생해요
- JWT 토큰이 헤더에 올바르게 포함되었는지 확인하세요
- 토큰 형식: `Authorization: Bearer YOUR_TOKEN`
- 토큰이 만료되지 않았는지 확인하세요

---

이 가이드를 따라하면 백엔드의 핵심 기능을 구현할 수 있습니다!

