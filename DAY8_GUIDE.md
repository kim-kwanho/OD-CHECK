# 📅 8일차 가이드 - 출석 현황 페이지

## 🎯 오늘의 목표
관리자가 출석 기록을 조회할 수 있는 페이지를 만들고, 날짜/사용자별 필터 기능을 구현합니다.

---

## 📋 주요 작업

### 1. AdminAttendance 페이지 생성

**파일**: `frontend/src/pages/admin/AdminAttendance.jsx`

**주요 기능**:
- 출석 기록 목록 표시
- 날짜 필터 (시작일/종료일)
- 사용자별 필터 (드롭다운)
- 테이블로 데이터 표시
- 날짜 포맷팅

**핵심 코드**:
```javascript
const [attendance, setAttendance] = useState([]);
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [selectedUserId, setSelectedUserId] = useState('');

const fetchAttendance = async () => {
  const data = await getAttendance(startDate, endDate, selectedUserId);
  setAttendance(data.attendance);
};
```

### 2. 날짜 선택 컴포넌트
- HTML5 `<input type="date">` 사용
- 한국 시간대 고려

### 3. 사용자 목록 조회
- 관리자 API에 사용자 목록 API 추가 필요 (선택사항)
- 또는 수동으로 userId 입력

---

## ✅ 완료 체크

- [ ] 출석 기록 목록 표시
- [ ] 날짜 필터 기능
- [ ] 사용자별 필터 기능
- [ ] 테이블 레이아웃
- [ ] 데이터 포맷팅 (날짜, 시간)

---

## 🌟 다음 단계

9일차: 지각비 관리 페이지

