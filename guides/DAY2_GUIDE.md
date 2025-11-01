# 📅 2일차 가이드 - 인증 시스템 완성

## 🎯 오늘의 목표
회원가입과 로그인이 완벽하게 작동하도록 테스트하고, JWT 토큰을 이해하며, 에러 처리를 개선합니다.

---

## 📋 체크리스트

### 1단계: 지난 시간 복습

**확인사항**:
- [ ] 서버가 정상적으로 실행되는가?
- [ ] 데이터베이스 연결이 되는가?
- [ ] `.env` 파일이 올바르게 설정되었는가?

---

### 2단계: API 테스트 도구 설정

#### test.http 파일 활용

VS Code에서 `test.http` 파일을 열어 API를 테스트할 수 있습니다.
(확장 프로그램 "REST Client" 설치 필요)

#### 또는 Postman 사용

Postman을 설치하여 API를 테스트할 수 있습니다.

---

### 3단계: 회원가입 API 테스트 및 개선

#### 3-1. 기본 회원가입 테스트

**요청**:
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "user1@test.com",
  "password": "password123",
  "name": "테스트 사용자1",
  "role": "participant"
}
```

**예상 응답**:
```json
{
  "message": "회원가입 성공!",
  "user": {
    "id": "...",
    "email": "user1@test.com",
    "name": "테스트 사용자1",
    "role": "participant"
  }
}
```

#### 3-2. 다양한 케이스 테스트

**테스트 1: 필수 필드 누락**
```json
{
  "email": "user2@test.com"
  // password, name 누락
}
```
**예상**: 400 에러, "이메일, 비밀번호, 이름은 필수입니다."

**테스트 2: 중복 이메일**
같은 이메일로 두 번 회원가입 시도
**예상**: 400 에러, "이미 등록된 이메일입니다."

**테스트 3: 관리자 계정 생성**
```json
{
  "email": "admin@test.com",
  "password": "admin1234",
  "name": "관리자",
  "role": "admin"
}
```

---

### 4단계: 로그인 API 테스트 및 이해

#### 4-1. 로그인 테스트

**요청**:
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user1@test.com",
  "password": "password123"
}
```

**예상 응답**:
```json
{
  "message": "로그인 성공!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "user1@test.com",
    "name": "테스트 사용자1",
    "role": "participant"
  }
}
```

**⚠️ 중요**: `token` 값을 복사해두세요!

#### 4-2. JWT 토큰 이해하기

**JWT 토큰이란?**
- JSON Web Token의 약자
- 로그인 상태를 증명하는 인증서
- 서버가 발급해주는 "입장권" 같은 것

**토큰 구조**:
```
xxxxx.yyyyy.zzzzz
  ↓     ↓     ↓
헤더   페이로드  서명
```

**토큰 사용 방법**:
API 요청 시 헤더에 포함:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4-3. 잘못된 비밀번호 테스트

```json
{
  "email": "user1@test.com",
  "password": "wrongpassword"
}
```
**예상**: 401 에러, "이메일 또는 비밀번호가 잘못되었습니다."

#### 4-4. 존재하지 않는 이메일 테스트

```json
{
  "email": "nonexistent@test.com",
  "password": "password123"
}
```
**예상**: 401 에러

---

### 5단계: 사용자 정보 조회 API 테스트

#### 5-1. 현재 사용자 정보 조회

**요청**:
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer 여기에_로그인_시_받은_토큰_붙여넣기
```

**예상 응답**:
```json
{
  "user": {
    "id": "...",
    "email": "user1@test.com",
    "name": "테스트 사용자1",
    "role": "participant"
  }
}
```

#### 5-2. 토큰 없이 요청 시도

Authorization 헤더 없이 요청
**예상**: 401 에러, "인증 토큰이 필요합니다."

#### 5-3. 잘못된 토큰으로 요청

```
Authorization: Bearer wrongtoken
```
**예상**: 401 에러, "유효하지 않은 토큰입니다."

---

### 6단계: 데이터베이스 확인

#### 6-1. 사용자 데이터 확인

PostgreSQL에서:
```sql
\c od_check

-- 모든 사용자 조회
SELECT id, email, name, role, created_at FROM users;

-- 비밀번호 해시 확인 (실제로는 보이지 않지만 확인용)
SELECT id, email, password_hash FROM users;
```

**확인 사항**:
- [ ] 사용자들이 제대로 저장되었는가?
- [ ] password_hash가 NULL이 아닌가? (해시된 비밀번호)
- [ ] role이 올바르게 설정되었는가?

---

### 7단계: 에러 처리 개선 (선택사항)

현재 코드는 기본적인 에러 처리가 되어 있습니다.
더 자세한 에러 메시지가 필요하다면 `server/routes/auth.js`를 수정할 수 있습니다.

**개선 예시**:
- 이메일 형식 검증 추가
- 비밀번호 강도 체크 (최소 8자 등)
- 더 친절한 에러 메시지

---

### 8단계: 테스트 계정 정리

#### 권장 테스트 계정

**참가자 계정** (3-5개):
- user1@test.com / password123
- user2@test.com / password123
- user3@test.com / password123

**관리자 계정** (1-2개):
- admin@test.com / admin1234

이 계정들을 나중에 프론트엔드 테스트에 사용합니다.

---

## ✅ 2일차 완료 체크

- [ ] 회원가입 API가 정상 작동
- [ ] 로그인 API가 정상 작동
- [ ] JWT 토큰을 받을 수 있음
- [ ] 사용자 정보 조회 API 작동
- [ ] 다양한 에러 케이스 테스트 완료
- [ ] 데이터베이스에 사용자 데이터가 저장됨
- [ ] 테스트 계정 5개 이상 생성

---

## 🎓 오늘 배운 것

1. **JWT 토큰**: 로그인 상태를 증명하는 인증서
2. **비밀번호 해싱**: 비밀번호를 암호화하여 저장 (bcrypt)
3. **에러 처리**: 사용자가 이해하기 쉬운 에러 메시지 제공
4. **API 테스트**: 실제로 API가 작동하는지 확인하는 방법

---

## 🧪 실습 과제

1. **과제 1**: 다른 사람의 이메일로 로그인을 시도해보세요 (실패해야 함)

2. **과제 2**: 토큰 없이 사용자 정보를 조회해보세요 (에러가 나야 함)

3. **과제 3**: 토큰을 복사하여 Postman이나 다른 도구로 사용자 정보를 조회해보세요

4. **과제 4**: 5개의 테스트 계정을 만들어보세요 (참가자 3개, 관리자 2개)

---

## ❓ 문제 해결

### "로그인은 되는데 토큰이 이상해요"
- JWT_SECRET이 `.env`에 올바르게 설정되었는지 확인

### "비밀번호가 맞는데 로그인이 안 돼요"
- 데이터베이스에서 password_hash가 NULL인지 확인
- 기존 사용자라면 비밀번호를 다시 설정해야 할 수 있음

### "토큰으로 조회했는데 401 에러가 나요"
- 토큰 앞에 "Bearer "를 붙였는지 확인 (공백 포함!)
- Authorization 헤더 형식: `Authorization: Bearer {token}`

---

## 🌟 다음 단계 (3일차 예고)

내일은:
- React 프로젝트를 만듭니다
- 프론트엔드 프로젝트 구조를 설정합니다
- API와 통신할 준비를 합니다
- 첫 번째 화면을 만듭니다

---

**2일차 완료를 축하합니다! 🎉**

인증 시스템이 완벽하게 작동해야 프론트엔드 개발이 수월합니다!

