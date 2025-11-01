# OD-CHECK 출석체크 시스템 설계 가이드

## 📋 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [데이터베이스 설계](#3-데이터베이스-설계)
4. [기능별 상세 설계](#4-기능별-상세-설계)
5. [단계별 구현 가이드](#5-단계별-구현-가이드)
6. [기술 스택 선택 이유](#6-기술-스택-선택-이유)
7. [보안 고려사항](#7-보안-고려사항)
8. [배포 및 운영](#8-배포-및-운영)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목적
QR 코드 기반 출석체크 시스템으로, 참가자들이 스마트폰으로 QR 코드를 스캔하여 출석을 체크하고, 관리자는 출석 기록과 지각비를 관리할 수 있는 시스템입니다.

### 1.2 주요 기능
- ✅ QR 코드 기반 출석체크
- ✅ 사용자 로그인 및 인증
- ✅ 출석 기록 자동 저장
- ✅ 지각 시간 자동 계산 및 지각비 산정
- ✅ 관리자 대시보드 (출석 현황, 지각비 현황)
- ✅ 리포트 및 통계 기능

### 1.3 사용자 역할
1. **참가자 (Participant)**: QR 코드 스캔 → 로그인 → 출석체크
2. **관리자 (Admin)**: 출석 현황 확인, 지각비 관리, 리포트 생성

---

## 2. 시스템 아키텍처

### 2.1 전체 구조
```
┌─────────────────┐
│   사용자(참가자)  │
│   스마트폰       │
└────────┬────────┘
         │ QR 코드 스캔
         ▼
┌─────────────────┐
│  프론트엔드      │
│  (React/Vue)    │
└────────┬────────┘
         │ HTTP API
         ▼
┌─────────────────┐
│   백엔드 서버    │
│   (Node.js)     │
└────────┬────────┘
         │ SQL 쿼리
         ▼
┌─────────────────┐
│   데이터베이스   │
│   (PostgreSQL)  │
└─────────────────┘
```

### 2.2 기술 스택
- **프론트엔드**: React (또는 Vue.js)
- **백엔드**: Node.js + Express
- **데이터베이스**: PostgreSQL
- **인증**: JWT (JSON Web Token)
- **QR 코드**: qrcode 라이브러리

---

## 3. 데이터베이스 설계

### 3.1 테이블 구조 설명

#### 📌 users (사용자 테이블)
- **역할**: 참가자 및 관리자 정보 저장
- **주요 필드**:
  - `id`: 사용자 고유 식별자 (UUID)
  - `email`: 로그인용 이메일
  - `name`: 사용자 이름
  - `role`: 역할 (participant/admin)

#### 📌 sessions (세션 테이블)
- **역할**: 정기 모임의 기본 정보 저장 (예: "매주 수요일 모임")
- **주요 필드**:
  - `id`: 세션 고유 식별자
  - `title`: 세션 제목
  - `description`: 설명
  - `timezone`: 시간대

#### 📌 occurrences (회차 테이블)
- **역할**: 각 회차별 실제 모임 정보 저장
- **주요 필드**:
  - `id`: 회차 고유 식별자
  - `session_id`: 어떤 세션의 회차인지
  - `scheduled_start`: 예정 시작 시간
  - `scheduled_end`: 예정 종료 시간
  - `qr_token`: 이 회차의 QR 코드 토큰

#### 📌 attendance_logs (출석 로그 테이블)
- **역할**: 실제 출석 체크 기록 저장
- **주요 필드**:
  - `id`: 로그 고유 식별자
  - `user_id`: 출석한 사용자
  - `occurrence_id`: 어떤 회차에 출석했는지
  - `check_in_time`: 실제 체크인 시간
  - `ip_inet`, `user_agent`: 보안/감사용 정보

#### 📌 attendance_settings (출석 정책 테이블)
- **역할**: 각 세션별 지각비 정책 저장
- **주요 필드**:
  - `grace_minutes`: 지각 허용 시간 (분)
  - `billing_unit_minutes`: 지각비 계산 단위 (분)
  - `fee_per_unit_won`: 단위당 지각비 (원)

#### 📌 penalties (지각비 내역 테이블)
- **역할**: 계산된 지각비 기록 저장
- **주요 필드**:
  - `user_id`: 지각비 대상자
  - `occurrence_id`: 어떤 회차에서 발생했는지
  - `minutes_late`: 지각 시간 (분)
  - `amount_won`: 지각비 금액 (원)

### 3.2 테이블 관계도
```
sessions (1) ──< (N) occurrences
users (1) ──< (N) attendance_logs
users (1) ──< (N) penalties
occurrences (1) ──< (N) attendance_logs
occurrences (1) ──< (N) penalties
sessions (1) ──< (1) attendance_settings
```

---

## 4. 기능별 상세 설계

### 4.1 참가자 출석체크 플로우

```
1. QR 코드 스캔
   └─> QR 코드에 포함된 정보: occurrence_id (또는 qr_token)
   
2. 프론트엔드로 이동
   └─> URL: https://yourdomain.com/checkin?token=xxxxx
   
3. 로그인 페이지 표시
   └─> 이메일/비밀번호 입력
   
4. 로그인 성공
   └─> JWT 토큰 발급 및 저장
   
5. 출석체크 버튼 클릭
   └─> API 호출: POST /api/checkin
   └─> 요청 본문: { userId, occurrenceId }
   
6. 서버 처리
   ├─> 중복 체크인 방지 (이미 출석했는지 확인)
   ├─> 출석 시간 기록
   └─> 지각 여부 계산
   
7. 응답
   └─> 성공 메시지 및 출석 정보 반환
```

### 4.2 지각비 계산 로직

```javascript
// 의사코드 (Pseudocode)
function calculatePenalty(checkInTime, scheduledStartTime, settings) {
  // 1. 지각 시간 계산 (분 단위)
  const minutesLate = (checkInTime - scheduledStartTime) / 60000;
  
  // 2. 지각 허용 시간(grace_minutes)보다 늦었는지 확인
  if (minutesLate <= settings.grace_minutes) {
    return { penalty: 0, minutesLate: 0 };
  }
  
  // 3. 실제 지각 시간 = 전체 지각 시간 - 허용 시간
  const actualLateMinutes = minutesLate - settings.grace_minutes;
  
  // 4. 지각비 단위 수 계산 (올림 처리)
  const units = Math.ceil(actualLateMinutes / settings.billing_unit_minutes);
  
  // 5. 지각비 계산
  const penaltyAmount = units * settings.fee_per_unit_won;
  
  return {
    minutesLate: Math.floor(actualLateMinutes),
    penaltyAmount: penaltyAmount,
    units: units
  };
}
```

### 4.3 관리자 대시보드 기능

#### 📊 대시보드 메인
- 오늘 출석 현황 (출석자 수 / 전체 참가자 수)
- 이번 주 출석률 통계
- 지각비 미납자 현황
- 최근 출석 기록 리스트

#### 👥 출석 관리
- 날짜별 출석 현황 조회
- 사용자별 출석 기록 조회
- 출석 기록 수정/삭제 (관리자 권한)

#### 💰 지각비 관리
- 사용자별 지각비 현황
- 회차별 지각비 내역
- 지각비 계산 및 자동 등록
- 지각비 납부 상태 관리

#### 📄 리포트
- 월별 출석 리포트 (CSV/Excel 다운로드)
- 지각비 정산서 생성
- 통계 차트 (출석률, 지각률 등)

#### ⚙️ 설정
- 세션 생성 및 수정
- 회차(occurrence) 생성
- 출석 정책 설정 (지각 허용 시간, 지각비 단가)
- QR 코드 생성 및 발급

---

## 5. 단계별 구현 가이드

### 5.1 1단계: 환경 설정 및 데이터베이스 구성

#### 목표
- 개발 환경 준비
- PostgreSQL 데이터베이스 생성 및 스키마 적용

#### 작업 내용
1. **Node.js 및 PostgreSQL 설치 확인**
   ```bash
   node --version
   psql --version
   ```

2. **데이터베이스 생성**
   ```sql
   CREATE DATABASE od_check;
   ```

3. **스키마 적용**
   ```bash
   psql -d od_check -f sql/schema.sql
   ```

4. **환경 변수 설정 (.env 파일 생성)**
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=od_check
   JWT_SECRET=your_secret_key_here
   PORT=3000
   ```

### 5.2 2단계: 백엔드 기본 API 구현

#### 목표
- Express 서버 설정
- 데이터베이스 연결
- 기본 API 엔드포인트 구현

#### 작업 내용
1. **서버 초기화** (이미 완료됨)
   - Express 앱 생성
   - 미들웨어 설정 (JSON 파싱, CORS 등)
   - 데이터베이스 연결 모듈

2. **인증 API 구현**
   - POST `/api/auth/login`: 로그인
   - POST `/api/auth/register`: 회원가입
   - GET `/api/auth/me`: 현재 사용자 정보

3. **출석체크 API 구현**
   - GET `/api/checkin/:token`: QR 토큰으로 회차 정보 조회
   - POST `/api/checkin`: 출석체크 처리
   - GET `/api/attendance/:occurrenceId`: 특정 회차 출석 현황

4. **관리자 API 구현**
   - GET `/api/admin/dashboard`: 대시보드 데이터
   - GET `/api/admin/attendance`: 출석 기록 조회
   - GET `/api/admin/penalties`: 지각비 현황
   - POST `/api/admin/occurrences`: 회차 생성
   - POST `/api/admin/sessions`: 세션 생성

### 5.3 3단계: 인증 시스템 구현

#### 목표
- JWT 기반 인증 구현
- 로그인/회원가입 기능
- 권한 관리 (참가자/관리자)

#### 작업 내용
1. **JWT 라이브러리 설치**
   ```bash
   npm install jsonwebtoken bcrypt
   ```

2. **인증 미들웨어 생성**
   - JWT 토큰 검증 미들웨어
   - 권한 체크 미들웨어 (관리자만 접근)

3. **비밀번호 암호화**
   - bcrypt를 사용한 비밀번호 해싱
   - 로그인 시 비밀번호 비교

### 5.4 4단계: 출석체크 로직 구현

#### 목표
- 출석체크 처리 로직
- 지각비 자동 계산
- 중복 체크인 방지

#### 작업 내용
1. **출석체크 API 로직**
   - occurrenceId로 회차 정보 조회
   - scheduled_start와 현재 시간 비교
   - 지각 여부 판단 및 지각비 계산

2. **지각비 계산 함수**
   - attendance_settings에서 정책 조회
   - 지각 시간 계산
   - 지각비 금액 계산
   - penalties 테이블에 기록

3. **에러 처리**
   - 이미 출석한 경우 처리
   - 회차 정보 없음 처리
   - 권한 없음 처리

### 5.5 5단계: 프론트엔드 구현

#### 목표
- 사용자 인터페이스 구축
- QR 코드 스캔 페이지
- 로그인 페이지
- 관리자 대시보드

#### 작업 내용
1. **프로젝트 초기화**
   ```bash
   npx create-react-app frontend
   # 또는
   npm create vite@latest frontend -- --template react
   ```

2. **필요 라이브러리 설치**
   ```bash
   npm install axios react-router-dom qrcode.react
   ```

3. **페이지 구성**
   - `/login`: 로그인 페이지
   - `/checkin/:token`: 출석체크 페이지
   - `/admin/dashboard`: 관리자 대시보드
   - `/admin/attendance`: 출석 관리
   - `/admin/penalties`: 지각비 관리

4. **API 통신 모듈**
   - axios 인스턴스 설정
   - 인증 토큰 자동 포함
   - 에러 처리

### 5.6 6단계: QR 코드 생성 및 관리

#### 목표
- QR 코드 생성 기능
- QR 코드 토큰 관리

#### 작업 내용
1. **QR 코드 생성 라이브러리 설치**
   ```bash
   npm install qrcode
   ```

2. **QR 코드 생성 API**
   - POST `/api/admin/qrcode`: 새로운 QR 코드 생성
   - QR 코드에 occurrence_id 또는 토큰 포함
   - 토큰을 occurrences 테이블에 저장

3. **QR 코드 표시**
   - 관리자 페이지에서 QR 코드 이미지 생성
   - PNG 또는 SVG 형식으로 다운로드 가능

### 5.7 7단계: 관리자 기능 구현

#### 목표
- 출석 현황 조회
- 지각비 관리
- 리포트 생성

#### 작업 내용
1. **출석 현황 조회 API**
   - 날짜 범위별 조회
   - 사용자별 조회
   - 통계 계산 (출석률, 지각률 등)

2. **지각비 관리 API**
   - 사용자별 지각비 합계
   - 회차별 지각비 내역
   - 지각비 수정/삭제 (관리자만)

3. **리포트 생성**
   - CSV/Excel 형식으로 데이터 내보내기
   - 월별 출석 리포트
   - 지각비 정산서

### 5.8 8단계: 보안 및 최적화

#### 목표
- 보안 강화
- 성능 최적화
- 에러 처리 개선

#### 작업 내용
1. **보안 강화**
   - SQL 인젝션 방지 (이미 parameterized query 사용)
   - XSS 방지
   - CORS 설정
   - Rate limiting (과도한 요청 방지)

2. **성능 최적화**
   - 데이터베이스 인덱스 최적화
   - API 응답 캐싱 (필요시)
   - 프론트엔드 코드 최적화

3. **에러 처리**
   - 전역 에러 핸들러
   - 사용자 친화적 에러 메시지
   - 로깅 시스템

---

## 6. 기술 스택 선택 이유

### 6.1 Node.js + Express
- **이유**: JavaScript로 풀스택 개발 가능, 학습 곡선 완만
- **장점**: 빠른 개발, 풍부한 라이브러리 생태계

### 6.2 PostgreSQL
- **이유**: 안정적이고 강력한 관계형 데이터베이스
- **장점**: ACID 준수, 복잡한 쿼리 지원, UUID 지원

### 6.3 React
- **이유**: 컴포넌트 기반 개발, 재사용성 높음
- **장점**: 큰 커뮤니티, 풍부한 자료

---

## 7. 보안 고려사항

### 7.1 인증 및 권한
- ✅ 비밀번호는 bcrypt로 해싱
- ✅ JWT 토큰에 만료 시간 설정
- ✅ 관리자 권한 체크 미들웨어

### 7.2 데이터 보호
- ✅ SQL 인젝션 방지 (parameterized query)
- ✅ XSS 방지 (입력값 검증 및 이스케이프)
- ✅ CSRF 방지 (토큰 사용)

### 7.3 QR 코드 보안
- ✅ 토큰을 무작위 UUID로 생성
- ✅ 토큰 만료 시간 설정 (선택사항)
- ✅ IP 주소 및 User-Agent 기록

---

## 8. 배포 및 운영

### 8.1 배포 전 체크리스트
- [ ] 환경 변수 설정 (.env 파일)
- [ ] 데이터베이스 백업 설정
- [ ] 에러 로깅 시스템 구축
- [ ] 성능 테스트
- [ ] 보안 취약점 점검

### 8.2 배포 옵션
1. **클라우드 플랫폼**
   - Heroku
   - Railway
   - AWS EC2

2. **데이터베이스 호스팅**
   - AWS RDS
   - Supabase
   - Railway PostgreSQL

### 8.3 모니터링
- 서버 상태 모니터링
- 데이터베이스 성능 모니터링
- 에러 추적 (Sentry 등)

---

## 9. 다음 단계 및 개선 사항

### 향후 개선 가능한 기능
- 📧 이메일 알림 (출석 체크 완료, 지각비 납부 알림)
- 📱 모바일 앱 개발 (React Native)
- 🔔 푸시 알림
- 📊 고급 통계 및 차트
- 💬 알림 시스템
- 🎨 다크 모드 지원

---

## 10. 학습 가이드 (코딩 초보자용)

### 10.1 필수 학습 내용
1. **JavaScript 기초**
   - 변수, 함수, 객체, 배열
   - 비동기 처리 (Promise, async/await)

2. **Node.js 기초**
   - 모듈 시스템 (require, module.exports)
   - Express 기본 사용법
   - RESTful API 개념

3. **데이터베이스**
   - SQL 기본 문법
   - PostgreSQL 기본 사용법

4. **React 기초**
   - 컴포넌트
   - 상태 관리 (useState, useEffect)
   - API 호출 (axios)

### 10.2 추천 학습 자료
- MDN Web Docs (JavaScript)
- Express 공식 문서
- React 공식 문서
- PostgreSQL 튜토리얼

---

이 가이드는 프로젝트를 체계적으로 진행할 수 있도록 도와줍니다. 각 단계를 순차적으로 진행하며, 필요시 이 문서를 참고하세요!

