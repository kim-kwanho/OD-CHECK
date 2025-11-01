# 📅 9일차 가이드 - 지각비 관리 페이지

## 🎯 오늘의 목표
관리자가 지각비 현황을 확인할 수 있는 페이지를 만들고, 사용자별/회차별 지각비를 표시합니다.

---

## 📋 주요 작업

### 1. AdminPenalties 페이지 생성

**파일**: `frontend/src/pages/admin/AdminPenalties.jsx`

**주요 기능**:
- 지각비 목록 표시
- 사용자별 지각비 합계
- 회차별 지각비 내역
- 금액 포맷팅 (천 단위 구분)
- 통계 정보 표시

**핵심 코드**:
```javascript
const [penalties, setPenalties] = useState([]);
const [summary, setSummary] = useState([]);

// 지각비 내역
const fetchPenalties = async () => {
  const data = await getPenalties(userId, occurrenceId);
  setPenalties(data.penalties);
};

// 지각비 요약
const fetchSummary = async () => {
  const data = await getPenaltySummary();
  setSummary(data.summary);
};
```

### 2. 금액 포맷팅
```javascript
const formatCurrency = (amount) => {
  return amount.toLocaleString('ko-KR') + '원';
};
```

### 3. 통계 표시
- 총 지각비 합계
- 지각비 건수
- 평균 지각비

---

## ✅ 완료 체크

- [ ] 지각비 목록 표시
- [ ] 사용자별 합계 표시
- [ ] 회차별 내역 표시
- [ ] 금액 포맷팅
- [ ] 통계 정보

---

## 🌟 다음 단계

10일차: 세션 관리 페이지

