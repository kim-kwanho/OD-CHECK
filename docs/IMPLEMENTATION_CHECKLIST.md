# 구현 체크리스트

이 문서는 프로젝트 진행 상황을 확인하고 다음 단계를 파악하는 데 도움이 됩니다.

## ✅ 완료된 작업 체크

### 1단계: 환경 설정
- [ ] Node.js 설치 완료
- [ ] PostgreSQL 설치 완료
- [ ] 프로젝트 디렉토리 구조 확인
- [ ] `.env` 파일 생성 및 설정
- [ ] 데이터베이스 생성 (`od_check`)
- [ ] 스키마 적용 (`sql/schema.sql`)
- [ ] 마이그레이션 적용 (`sql/migration_add_password.sql`)

### 2단계: 백엔드 기본 설정
- [ ] `server/package.json` 확인
- [ ] 필요한 npm 패키지 설치
  - [ ] express
  - [ ] pg
  - [ ] dotenv
  - [ ] jsonwebtoken
  - [ ] bcrypt
  - [ ] cors
- [ ] `server/index.js` 업데이트 (CORS, 미들웨어 설정)
- [ ] `server/db.js` 확인 (데이터베이스 연결)

### 3단계: 인증 시스템
- [ ] `server/routes/auth.js` 파일 생성
  - [ ] 회원가입 API (`POST /api/auth/register`)
  - [ ] 로그인 API (`POST /api/auth/login`)
  - [ ] 사용자 정보 조회 API (`GET /api/auth/me`)
- [ ] `server/middleware/auth.js` 파일 생성
  - [ ] JWT 토큰 검증 미들웨어
  - [ ] 관리자 권한 체크 미들웨어
- [ ] 인증 라우트 연결 (`server/index.js`)

### 4단계: 출석체크 API
- [ ] `server/routes/checkin.js` 파일 생성
  - [ ] QR 토큰으로 회차 정보 조회 (`GET /api/checkin/:token`)
  - [ ] 출석체크 처리 (`POST /api/checkin`)
  - [ ] 출석 현황 조회 (`GET /api/checkin/attendance/:occurrenceId`)
- [ ] 출석체크 라우트 연결 (`server/index.js`)

### 5단계: 관리자 API
- [ ] `server/routes/admin.js` 파일 생성
  - [ ] 대시보드 데이터 (`GET /api/admin/dashboard`)
  - [ ] 세션 생성 (`POST /api/admin/sessions`)
  - [ ] 회차 생성 (`POST /api/admin/occurrences`)
  - [ ] 출석 기록 조회 (`GET /api/admin/attendance`)
  - [ ] 지각비 현황 조회 (`GET /api/admin/penalties`)
  - [ ] 지각비 요약 (`GET /api/admin/penalties/summary`)
- [ ] 관리자 라우트 연결 (`server/index.js`)

### 6단계: 테스트
- [ ] 서버 실행 확인 (`node server/index.js`)
- [ ] 데이터베이스 연결 확인
- [ ] 회원가입 API 테스트
- [ ] 로그인 API 테스트
- [ ] 출석체크 API 테스트
- [ ] 관리자 API 테스트

## 📋 다음 단계 (프론트엔드)

### 7단계: 프론트엔드 프로젝트 생성
- [ ] React 프로젝트 생성 (`npx create-react-app frontend` 또는 Vite)
- [ ] 필요한 라이브러리 설치
  - [ ] axios (API 통신)
  - [ ] react-router-dom (라우팅)
  - [ ] qrcode.react (QR 코드 표시)
  - [ ] qrcode (QR 코드 생성, 관리자용)

### 8단계: 로그인 페이지
- [ ] 로그인 컴포넌트 생성
- [ ] 회원가입 컴포넌트 생성
- [ ] API 통신 모듈 설정 (axios)
- [ ] JWT 토큰 저장/관리 (localStorage)

### 9단계: 출석체크 페이지
- [ ] QR 코드 스캔 페이지 (URL 파라미터로 토큰 받기)
- [ ] 회차 정보 표시
- [ ] 출석체크 버튼 및 처리
- [ ] 출석 완료 메시지 표시

### 10단계: 관리자 대시보드
- [ ] 대시보드 레이아웃
- [ ] 출석 현황 표시
- [ ] 지각비 현황 표시
- [ ] 세션/회차 관리 페이지
- [ ] QR 코드 생성 및 표시

## 🐛 문제 해결 가이드

### 서버가 실행되지 않을 때
1. `.env` 파일 확인
2. PostgreSQL 서비스 실행 확인
3. 포트 3000 사용 중인지 확인
4. `node_modules` 재설치: `npm install`

### 데이터베이스 연결 오류
1. PostgreSQL 서비스 실행 확인
2. `.env` 파일의 데이터베이스 정보 확인
3. 데이터베이스 존재 여부 확인: `psql -U postgres -l`
4. 사용자 권한 확인

### API 오류 (401, 403 등)
1. JWT 토큰이 헤더에 올바르게 포함되었는지 확인
2. 토큰 형식 확인: `Authorization: Bearer TOKEN`
3. 토큰 만료 여부 확인
4. 사용자 권한 확인 (관리자 API인 경우)

## 📚 참고 자료

- [PROJECT_DESIGN_GUIDE.md](./PROJECT_DESIGN_GUIDE.md) - 전체 설계 가이드
- [STEP_BY_STEP_GUIDE.md](./STEP_BY_STEP_GUIDE.md) - 단계별 상세 가이드
- Express 공식 문서: https://expressjs.com/
- PostgreSQL 공식 문서: https://www.postgresql.org/docs/
- React 공식 문서: https://react.dev/

## 💡 팁

- 각 단계를 완료할 때마다 체크박스에 체크하세요
- 문제가 발생하면 위의 문제 해결 가이드를 참고하세요
- 코드를 수정할 때는 백업을 해두세요
- 작은 단계로 나누어 하나씩 테스트하세요

---

**진행 상황을 업데이트하며 단계별로 진행하세요!**

