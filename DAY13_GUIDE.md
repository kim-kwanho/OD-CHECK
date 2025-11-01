# 📅 13일차 가이드 - 버그 수정 및 에러 처리

## 🎯 오늘의 목표
발견된 문제들을 해결하고 안정성을 높입니다.

---

## 📋 주요 작업

### 1. 전체 기능 테스트

**테스트 체크리스트**:
- [ ] 회원가입/로그인
- [ ] 출석체크 (정상/지각)
- [ ] 관리자 대시보드
- [ ] 출석 현황 조회
- [ ] 지각비 조회
- [ ] 세션/회차 생성
- [ ] QR 코드 생성

### 2. 에러 케이스 테스트

**확인 항목**:
- 네트워크 오류
- 서버 오류 (500)
- 권한 오류 (401, 403)
- 잘못된 입력
- 중복 요청

### 3. 에러 처리 개선

**전역 에러 처리**:
```javascript
// services/api.js
api.interceptors.response.use(
  response => response,
  error => {
    // 에러 로깅
    console.error('API Error:', error);
    
    // 사용자 친화적 메시지
    if (error.response) {
      // 서버 응답이 있는 경우
      const message = error.response.data?.message || '오류가 발생했습니다.';
      // Toast 또는 Alert 표시
    } else {
      // 네트워크 오류
      alert('네트워크 오류가 발생했습니다.');
    }
    
    return Promise.reject(error);
  }
);
```

### 4. 로깅 추가

**디버깅용 로그**:
```javascript
console.log('API Request:', url, data);
console.log('API Response:', response.data);
```

### 5. 버그 수정

**일반적인 버그**:
- 날짜 포맷 문제
- 시간대 문제
- null/undefined 처리
- 배열 인덱스 오류

---

## ✅ 완료 체크

- [ ] 모든 기능 테스트 완료
- [ ] 에러 케이스 처리
- [ ] 사용자 친화적 에러 메시지
- [ ] 버그 수정 완료
- [ ] 코드 정리

---

## 🌟 다음 단계

14일차: 리포트 및 추가 기능

