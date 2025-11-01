# 📅 10일차 가이드 - 세션 및 회차 관리 (1)

## 🎯 오늘의 목표
관리자가 세션을 만들고 관리할 수 있는 기능을 구현합니다.

---

## 📋 주요 작업

### 1. AdminSessions 페이지 생성

**파일**: `frontend/src/pages/admin/AdminSessions.jsx`

**주요 기능**:
- 세션 목록 표시
- 세션 생성 폼
- 세션 수정 기능
- 세션 삭제 기능 (선택사항)

**핵심 코드**:
```javascript
const [sessions, setSessions] = useState([]);
const [showForm, setShowForm] = useState(false);
const [formData, setFormData] = useState({
  title: '',
  description: '',
  timezone: 'Asia/Seoul'
});

const handleCreate = async () => {
  await createSession(
    formData.title,
    formData.description,
    formData.timezone
  );
  // 목록 새로고침
};
```

### 2. 세션 목록 표시
- 세션 제목
- 설명
- 생성일
- 회차 수 (나중에 추가 가능)

### 3. CRUD 작업
- Create: 세션 생성
- Read: 세션 목록 조회
- Update: 세션 수정 (선택사항)
- Delete: 세션 삭제 (선택사항)

---

## ✅ 완료 체크

- [ ] 세션 목록 표시
- [ ] 세션 생성 폼
- [ ] 세션 생성 API 연동
- [ ] 폼 유효성 검사
- [ ] 성공/에러 메시지

---

## 🌟 다음 단계

11일차: 회차 관리 및 QR 코드 생성

