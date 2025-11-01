# 📅 1일차 가이드 - 환경 설정 및 데이터베이스 준비

## 🎯 오늘의 목표
오늘은 개발 환경을 완전히 준비하고, 데이터베이스를 설정하여 서버를 실행할 수 있게 만드는 날입니다.

---

## 📋 체크리스트

### 1단계: 필요한 프로그램 설치 확인

#### ✅ Node.js 확인
터미널(또는 PowerShell)을 열고 다음 명령어를 입력하세요:

```bash
node --version
npm --version
```

**결과 확인**:
- 버전이 나오면 ✅ 설치 완료
- '명령을 찾을 수 없습니다' 오류가 나면 ❌ 설치 필요

**설치 방법** (필요한 경우):
1. https://nodejs.org 접속
2. LTS 버전 다운로드 및 설치
3. 설치 후 터미널 재시작

#### ✅ PostgreSQL 확인
```bash
psql --version
```

**결과 확인**:
- 버전이 나오면 ✅ 설치 완료
- 오류가 나면 ❌ 설치 필요

**설치 방법** (필요한 경우):
1. https://www.postgresql.org/download/windows/ 접속
2. Windows 버전 다운로드 및 설치
3. 설치 중 비밀번호 설정 (잘 기억해두세요!)

---

### 2단계: 프로젝트 의존성 설치

서버 디렉토리로 이동하여 필요한 패키지들을 설치합니다.

```bash
cd server
npm install
```

**설치되는 패키지들**:
- `express`: 웹 서버 프레임워크
- `pg`: PostgreSQL 클라이언트
- `dotenv`: 환경 변수 관리
- `cors`: Cross-Origin 요청 허용
- `jsonwebtoken`: JWT 토큰
- `bcrypt`: 비밀번호 암호화

**예상 시간**: 1-2분

**성공 확인**: `node_modules` 폴더가 생성되고 오류가 없으면 성공!

---

### 3단계: 환경 변수 설정 (.env 파일)

프로젝트 루트 디렉토리에 `.env` 파일을 만들어야 합니다.

#### .env 파일 생성 방법

1. **Visual Studio Code 사용하는 경우**:
   - 프로젝트 루트에 `.env` 파일 생성 (새 파일)
   - 아래 내용 복사하여 붙여넣기

2. **메모장 사용하는 경우**:
   - 메모장 열기
   - 아래 내용 입력
   - `.env` 이름으로 저장 (파일 확장자: 모든 파일로 선택)

#### .env 파일 내용

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=여기에_설치시_설정한_비밀번호_입력
DB_NAME=od_check

# 서버 설정
PORT=3000

# JWT 비밀키 (프로덕션에서는 반드시 변경!)
JWT_SECRET=my_super_secret_key_for_development_only_change_in_production
```

**⚠️ 중요**:
- `DB_PASSWORD`: PostgreSQL 설치 시 설정한 비밀번호로 변경하세요
- `.env` 파일은 절대 GitHub에 올라가지 않습니다 (이미 .gitignore에 추가됨)

---

### 4단계: 데이터베이스 생성 및 설정

#### 4-1. PostgreSQL 서비스 시작

Windows에서:
1. `Windows 키` + `R` 누르기
2. `services.msc` 입력 후 Enter
3. "postgresql-x64-XX" 서비스 찾기
4. 상태가 "실행 중"인지 확인 (아니면 우클릭 → 시작)

#### 4-2. 데이터베이스 생성

터미널에서:
```bash
psql -U postgres
```

비밀번호 입력 후:

```sql
-- 데이터베이스 생성
CREATE DATABASE od_check;

-- 생성 확인
\l
```

`od_check` 데이터베이스가 목록에 보이면 성공!

#### 4-3. 데이터베이스 선택 및 스키마 적용

```sql
-- 데이터베이스 선택
\c od_check

-- 스키마 파일 실행 (절대 경로로 실행)
\i C:/Users/Kwanho Kim/Desktop/OD-CHECK/sql/schema.sql

-- 또는 상대 경로로 실행하려면
\i sql/schema.sql
```

**다른 방법** (파일 경로 문제가 있는 경우):
```bash
# 터미널에서 (psql 밖으로 나온 상태)
psql -U postgres -d od_check -f sql/schema.sql
```

**성공 확인**: 에러 없이 완료되면 성공!

#### 4-4. 마이그레이션 적용 (선택사항)

기존 데이터베이스에 password_hash 컬럼이 없다면:
```bash
psql -U postgres -d od_check -f sql/migration_add_password.sql
```

#### 4-5. 테이블 생성 확인

```sql
-- psql 안에서
\dt
```

다음 테이블들이 보여야 합니다:
- users
- sessions
- occurrences
- attendance_logs
- penalties
- attendance_settings

---

### 5단계: 서버 실행 테스트

#### 5-1. 서버 시작

서버 디렉토리에서:
```bash
cd server
node index.js
```

**성공 메시지**:
```
✅ 서버가 실행 중입니다 → http://localhost:3000
PostgreSQL 연결 성공 ✅
```

**오류 발생 시**:
- "DB 연결 실패": `.env` 파일의 데이터베이스 정보 확인
- "포트 3000이 이미 사용 중": 다른 프로그램이 3000 포트 사용 중
- "모듈을 찾을 수 없습니다": `npm install` 다시 실행

#### 5-2. 브라우저에서 테스트

브라우저를 열고:
```
http://localhost:3000
```

**성공 시**: JSON 형태로 서버 상태가 표시됩니다
```json
{
  "message": "✅ 서버 정상 작동 중!",
  "dbTime": "2025-01-XX ..."
}
```

---

### 6단계: 첫 번째 API 테스트

#### 6-1. 회원가입 테스트

`test.http` 파일을 열거나, Postman을 사용하여:

**POST 요청**:
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test1234",
  "name": "테스트 사용자",
  "role": "participant"
}
```

**성공 응답**:
```json
{
  "message": "회원가입 성공!",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "테스트 사용자",
    "role": "participant"
  }
}
```

#### 6-2. 로그인 테스트

**POST 요청**:
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test1234"
}
```

**성공 응답**:
```json
{
  "message": "로그인 성공!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "테스트 사용자",
    "role": "participant"
  }
}
```

**⚠️ token 값은 복사해두세요!** 나중에 사용할 수 있습니다.

#### 6-3. 관리자 계정 만들기

관리자 계정도 하나 만들어봅시다:
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin1234",
  "name": "관리자",
  "role": "admin"
}
```

---

## ✅ 1일차 완료 체크

다음을 모두 완료했다면 1일차 성공!

- [ ] Node.js와 PostgreSQL 설치 확인 완료
- [ ] `npm install` 실행 완료 (오류 없음)
- [ ] `.env` 파일 생성 및 설정 완료
- [ ] 데이터베이스 `od_check` 생성 완료
- [ ] 스키마 적용 완료 (테이블 생성 확인)
- [ ] 서버 실행 성공 (http://localhost:3000 접속 가능)
- [ ] 회원가입 API 테스트 성공
- [ ] 로그인 API 테스트 성공
- [ ] 관리자 계정 생성 완료

---

## 🎓 오늘 배운 것

1. **환경 변수 (.env)**: 민감한 정보(비밀번호 등)를 코드에 직접 넣지 않고 파일로 관리
2. **데이터베이스 스키마**: 테이블 구조를 정의하는 설계도
3. **API**: 서버와 통신하는 인터페이스
4. **JWT 토큰**: 로그인 상태를 증명하는 인증서

---

## ❓ 문제 해결

### "PostgreSQL 연결 실패" 오류
- PostgreSQL 서비스가 실행 중인지 확인
- `.env` 파일의 비밀번호가 맞는지 확인
- `DB_NAME`이 `od_check`인지 확인

### "포트 3000이 이미 사용 중"
- 다른 프로그램을 종료하거나
- `.env` 파일에서 `PORT=3001`로 변경

### "모듈을 찾을 수 없습니다"
```bash
cd server
rm -rf node_modules
npm install
```

### psql 명령어가 안 될 때
- PostgreSQL 설치 경로 확인
- 환경 변수 PATH에 PostgreSQL bin 경로 추가

---

## 🌟 다음 단계 (2일차 예고)

내일은:
- 인증 시스템을 더 자세히 살펴봅니다
- JWT 토큰을 이해합니다
- 에러 처리를 개선합니다
- 실제로 사용할 수 있는 테스트 계정들을 만듭니다

---

**1일차 완료를 축하합니다! 🎉**

문제가 있으면 언제든지 질문하세요!

