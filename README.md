# OD-CHECK 출석체크 시스템

QR 코드 기반 출석체크 시스템으로, 참가자들이 스마트폰으로 QR 코드를 스캔하여 출석을 체크하고, 관리자는 출석 기록과 지각비를 관리할 수 있는 시스템입니다.

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [시작하기](#시작하기)
3. [프로젝트 구조](#프로젝트-구조)
4. [주요 기능](#주요-기능)
5. [API 문서](#api-문서)
6. [설계 가이드](#설계-가이드)

## 🎯 프로젝트 개요

이 프로젝트는 정기 모임의 출석체크를 자동화하고, 지각비를 관리하기 위한 시스템입니다.

### 주요 특징
- ✅ QR 코드 기반 출석체크
- ✅ 사용자 로그인 및 인증 (JWT)
- ✅ 출석 기록 자동 저장
- ✅ 지각 시간 자동 계산 및 지각비 산정
- ✅ 관리자 대시보드 (출석 현황, 지각비 현황)
- ✅ 리포트 및 통계 기능

## 🚀 시작하기

### 사전 요구사항

- Node.js (v14 이상)
- PostgreSQL (v12 이상)
- npm 또는 yarn

### 설치 및 실행

1. **의존성 설치**

```bash
cd server
npm install
```

2. **환경 변수 설정**

프로젝트 루트에 `.env` 파일 생성:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=od_check
PORT=3000
JWT_SECRET=your_super_secret_key_change_this_in_production
```

3. **데이터베이스 설정**

```bash
# PostgreSQL에 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE od_check;

# 스키마 적용
\c od_check
\i sql/schema.sql

# 기존 데이터베이스에 password_hash 컬럼 추가 (기존 DB인 경우)
\i sql/migration_add_password.sql

# 샘플 데이터 삽입 (선택사항)
\i sql/sample_data.sql
```

4. **서버 실행**

```bash
cd server
node index.js
```

서버가 정상적으로 실행되면:
```
✅ 서버가 실행 중입니다 → http://localhost:3000
PostgreSQL 연결 성공 ✅
```

5. **서버 테스트**

브라우저에서 `http://localhost:3000` 접속하여 서버가 정상 작동하는지 확인합니다.

## 📁 프로젝트 구조

```
OD-CHECK/
├── server/                 # 백엔드 서버
│   ├── routes/            # API 라우트
│   │   ├── auth.js       # 인증 관련 API
│   │   ├── checkin.js    # 출석체크 API
│   │   └── admin.js      # 관리자 API
│   ├── middleware/        # 미들웨어
│   │   └── auth.js       # 인증 미들웨어
│   ├── db.js             # 데이터베이스 연결
│   └── index.js          # 서버 메인 파일
├── sql/                   # SQL 스크립트
│   ├── schema.sql        # 데이터베이스 스키마
│   ├── migration_add_password.sql  # 마이그레이션
│   └── sample_data.sql   # 샘플 데이터
├── PROJECT_DESIGN_GUIDE.md      # 전체 설계 가이드
├── STEP_BY_STEP_GUIDE.md        # 단계별 상세 가이드
├── IMPLEMENTATION_CHECKLIST.md  # 구현 체크리스트
└── README.md             # 프로젝트 문서
```

## 🔧 주요 기능

### 참가자 기능
- QR 코드 스캔하여 출석체크
- 로그인/회원가입
- 출석 기록 확인

### 관리자 기능
- 출석 현황 조회
- 지각비 관리 및 조회
- 세션/회차 생성 및 관리
- QR 코드 생성
- 리포트 다운로드

## 📚 API 문서

### 인증 API

#### 회원가입
```
POST /api/auth/register
Body: { email, password, name, role? }
```

#### 로그인
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### 현재 사용자 정보
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
```

### 출석체크 API

#### QR 토큰으로 회차 정보 조회
```
GET /api/checkin/:token
```

#### 출석체크
```
POST /api/checkin
Headers: Authorization: Bearer {token}
Body: { occurrenceId }
```

#### 출석 현황 조회
```
GET /api/checkin/attendance/:occurrenceId
Headers: Authorization: Bearer {token}
```

### 관리자 API

#### 대시보드 데이터
```
GET /api/admin/dashboard
Headers: Authorization: Bearer {token}
```

#### 세션 생성
```
POST /api/admin/sessions
Headers: Authorization: Bearer {token}
Body: { title, description?, timezone? }
```

#### 회차 생성
```
POST /api/admin/occurrences
Headers: Authorization: Bearer {token}
Body: { sessionId, scheduledStart, scheduledEnd }
```

#### 출석 기록 조회
```
GET /api/admin/attendance?startDate=&endDate=&userId=
Headers: Authorization: Bearer {token}
```

#### 지각비 현황 조회
```
GET /api/admin/penalties?userId=&occurrenceId=
Headers: Authorization: Bearer {token}
```

#### 지각비 요약
```
GET /api/admin/penalties/summary
Headers: Authorization: Bearer {token}
```

## 📖 설계 가이드

프로젝트를 체계적으로 이해하고 개발하기 위한 가이드 문서:

1. **[PROJECT_DESIGN_GUIDE.md](./PROJECT_DESIGN_GUIDE.md)** - 전체 시스템 설계 및 아키텍처
2. **[STEP_BY_STEP_GUIDE.md](./STEP_BY_STEP_GUIDE.md)** - 단계별 구현 가이드 (코딩 초보자용)
3. **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - 구현 진행 상황 체크리스트

## 🔒 보안 고려사항

- 비밀번호는 bcrypt로 해싱
- JWT 토큰 기반 인증
- SQL 인젝션 방지 (parameterized query)
- CORS 설정

## 🛠️ 기술 스택

- **백엔드**: Node.js + Express
- **데이터베이스**: PostgreSQL
- **인증**: JWT (JSON Web Token)
- **비밀번호 암호화**: bcrypt

## 📝 라이선스

이 프로젝트는 연습용 프로젝트입니다.

## 📞 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.

---

**코딩 초보자도 따라할 수 있도록 상세한 가이드를 제공합니다. [STEP_BY_STEP_GUIDE.md](./STEP_BY_STEP_GUIDE.md)를 참고하세요!**
