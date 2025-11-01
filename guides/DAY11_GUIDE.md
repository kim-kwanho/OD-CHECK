# 📅 11일차 가이드 - 세션 및 회차 관리 (2)

## 🎯 오늘의 목표
관리자가 회차를 만들고 QR 코드를 생성할 수 있도록 합니다.

---

## 📋 주요 작업

### 1. AdminOccurrences 페이지 생성

**파일**: `frontend/src/pages/admin/AdminOccurrences.jsx`

**주요 기능**:
- 회차 목록 표시
- 회차 생성 폼
- 날짜/시간 선택
- QR 코드 생성 및 표시

### 2. 날짜/시간 선택

**라이브러리 설치** (선택사항):
```bash
npm install react-datepicker
```

**또는 HTML5 input 사용**:
```javascript
<input 
  type="datetime-local" 
  value={scheduledStart}
  onChange={(e) => setScheduledStart(e.target.value)}
/>
```

### 3. QR 코드 생성 및 표시

**라이브러리 설치**:
```bash
npm install qrcode.react
```

**QR 코드 표시**:
```javascript
import QRCode from 'qrcode.react';

<QRCode 
  value={`${window.location.origin}/checkin/${qrToken}`}
  size={200}
/>
```

**QR 코드 다운로드** (선택사항):
```javascript
const downloadQR = () => {
  const canvas = document.getElementById('qrcode');
  const url = canvas.toDataURL();
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = url;
  link.click();
};
```

### 4. 회차 생성 플로우

1. 세션 선택
2. 시작 시간 선택
3. 종료 시간 선택
4. 회차 생성
5. QR 코드 표시
6. QR 코드 다운로드 또는 인쇄

---

## ✅ 완료 체크

- [ ] 회차 생성 폼
- [ ] 날짜/시간 선택
- [ ] 회차 생성 API 연동
- [ ] QR 코드 생성
- [ ] QR 코드 표시
- [ ] QR 코드 다운로드 (선택사항)

---

## 🌟 다음 단계

12일차: UI/UX 개선

