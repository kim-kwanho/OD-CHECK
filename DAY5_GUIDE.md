# 📅 5일차 가이드 - 출석체크 페이지 만들기 (1)

## 🎯 오늘의 목표
QR 코드를 스캔하면 나타나는 출석체크 페이지를 만들고, 회차 정보를 가져와서 표시합니다.

---

## 📋 체크리스트

### 1단계: 출석체크 API 서비스 만들기

#### 1-1. checkinService.js 생성

`frontend/src/services/checkinService.js` 파일 생성:

```javascript
import api from './api';

// QR 토큰으로 회차 정보 조회
export const getOccurrenceByToken = async (token) => {
  const response = await api.get(`/checkin/${token}`);
  return response.data;
};

// 출석체크
export const checkIn = async (occurrenceId) => {
  const response = await api.post('/checkin', { occurrenceId });
  return response.data;
};

// 특정 회차 출석 현황 조회
export const getAttendance = async (occurrenceId) => {
  const response = await api.get(`/checkin/attendance/${occurrenceId}`);
  return response.data;
};
```

---

### 2단계: 출석체크 페이지 기본 구조

#### 2-1. CheckinPage 컴포넌트 생성

`frontend/src/pages/CheckinPage.jsx` 파일 생성:

```javascript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOccurrenceByToken } from '../services/checkinService';
import { getUser } from '../services/authService';
import './CheckinPage.css';

function CheckinPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [occurrence, setOccurrence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    // 로그인 확인
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 회차 정보 가져오기
    const fetchOccurrence = async () => {
      try {
        const data = await getOccurrenceByToken(token);
        setOccurrence(data.occurrence);
      } catch (err) {
        setError(err.response?.data?.message || '회차 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOccurrence();
  }, [token, user, navigate]);

  if (loading) {
    return (
      <div className="checkin-container">
        <div className="loading">불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkin-container">
        <div className="error-box">
          <h2>❌ 오류</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  if (!occurrence) {
    return null;
  }

  return (
    <div className="checkin-container">
      <div className="checkin-box">
        <h1>출석체크</h1>
        
        <div className="occurrence-info">
          <h2>{occurrence.sessionTitle}</h2>
          
          <div className="info-item">
            <span className="label">예정 시작 시간:</span>
            <span className="value">
              {new Date(occurrence.scheduledStart).toLocaleString('ko-KR')}
            </span>
          </div>
          
          <div className="info-item">
            <span className="label">예정 종료 시간:</span>
            <span className="value">
              {new Date(occurrence.scheduledEnd).toLocaleString('ko-KR')}
            </span>
          </div>
        </div>

        {/* 다음 단계: 출석체크 버튼 추가 */}
      </div>
    </div>
  );
}

export default CheckinPage;
```

#### 2-2. CheckinPage CSS

`frontend/src/pages/CheckinPage.css` 파일 생성:

```css
.checkin-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.checkin-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
}

.checkin-box h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.occurrence-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.occurrence-info h2 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-item .label {
  font-weight: 600;
  color: #555;
}

.info-item .value {
  color: #333;
}

.loading {
  text-align: center;
  color: white;
  font-size: 18px;
}

.error-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  max-width: 400px;
}

.error-box h2 {
  color: #dc3545;
  margin-bottom: 20px;
}

.error-box button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
```

---

### 3단계: 라우팅에 CheckinPage 추가

#### 3-1. App.jsx 수정

```javascript
import CheckinPage from './pages/CheckinPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkin/:token" element={<CheckinPage />} />
      </Routes>
    </Router>
  );
}
```

---

### 4단계: 테스트를 위한 회차 생성

#### 4-1. 관리자 API로 회차 생성

먼저 관리자로 로그인한 후, Postman이나 test.http로:

```
POST http://localhost:3000/api/admin/sessions
Authorization: Bearer 관리자_토큰
Content-Type: application/json

{
  "title": "테스트 세션",
  "description": "테스트용 세션입니다"
}
```

세션 ID를 받은 후:

```
POST http://localhost:3000/api/admin/occurrences
Authorization: Bearer 관리자_토큰
Content-Type: application/json

{
  "sessionId": "세션_ID",
  "scheduledStart": "2025-01-20T10:00:00+09:00",
  "scheduledEnd": "2025-01-20T12:00:00+09:00"
}
```

응답에서 `qrToken`을 받아서:

```
http://localhost:5173/checkin/받은_qrToken
```

이 URL로 접속하면 출석체크 페이지가 나타나야 합니다.

---

## ✅ 5일차 완료 체크

- [ ] 출석체크 API 서비스 완성
- [ ] CheckinPage 컴포넌트 생성
- [ ] QR 토큰으로 회차 정보 가져오기 성공
- [ ] 회차 정보가 화면에 표시됨
- [ ] 로그인 확인 기능 작동
- [ ] 에러 처리 작동
- [ ] 테스트 회차 생성 및 페이지 접속 성공

---

## 🎓 오늘 배운 것

1. **URL 파라미터**: `/checkin/:token` 같은 동적 라우팅
2. **useParams**: URL에서 파라미터 가져오기
3. **useEffect**: 컴포넌트 로드 시 데이터 가져오기
4. **조건부 렌더링**: 로딩/에러/성공 상태에 따라 다른 화면 표시

---

## 🌟 다음 단계 (6일차 예고)

내일은:
- 출석체크 버튼을 추가합니다
- 실제로 출석체크를 할 수 있게 합니다
- 지각 여부 및 지각비를 표시합니다

---

**5일차 완료를 축하합니다! 🎉**

이제 출석체크 페이지의 기본 구조가 완성되었습니다!

