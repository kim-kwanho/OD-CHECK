# 📅 6일차 가이드 - 출석체크 페이지 완성

## 🎯 오늘의 목표
실제로 출석체크를 할 수 있도록 버튼을 추가하고, 지각 여부 및 지각비를 표시합니다.

---

## 📋 체크리스트

### 1단계: 출석체크 기능 구현

#### 1-1. CheckinPage에 출석체크 버튼 추가

`frontend/src/pages/CheckinPage.jsx` 수정:

```javascript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOccurrenceByToken, checkIn } from '../services/checkinService';
import { getUser } from '../services/authService';
import './CheckinPage.css';

function CheckinPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [occurrence, setOccurrence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const user = getUser();

  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

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

  const handleCheckIn = async () => {
    if (!occurrence) return;

    setChecking(true);
    setError('');
    
    try {
      const data = await checkIn(occurrence.id);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || '출석체크에 실패했습니다.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="checkin-container">
        <div className="loading">불러오는 중...</div>
      </div>
    );
  }

  if (error && !occurrence) {
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

  if (!occurrence) return null;

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

          <div className="info-item">
            <span className="label">현재 시간:</span>
            <span className="value">
              {new Date().toLocaleString('ko-KR')}
            </span>
          </div>
        </div>

        {result ? (
          <div className="result-box">
            <div className={`result-icon ${result.penalty ? 'warning' : 'success'}`}>
              {result.penalty ? '⚠️' : '✅'}
            </div>
            <h2>{result.message}</h2>
            
            {result.minutesLate > 0 && (
              <div className="late-info">
                <p>지각 시간: {result.minutesLate}분</p>
              </div>
            )}

            {result.penalty && (
              <div className="penalty-info">
                <h3>지각비 안내</h3>
                <p>지각 시간: {result.penalty.minutes_late}분</p>
                <p className="penalty-amount">
                  지각비: {result.penalty.amount_won.toLocaleString()}원
                </p>
              </div>
            )}

            <div className="checkin-time">
              <p>출석 시간: {new Date(result.checkIn.check_in_time).toLocaleString('ko-KR')}</p>
            </div>

            <button 
              onClick={() => navigate('/')} 
              className="home-button"
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckIn}
              disabled={checking}
              className="checkin-button"
            >
              {checking ? '출석체크 중...' : '출석체크하기'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckinPage;
```

---

### 2단계: CSS 스타일 추가

#### 2-1. CheckinPage.css에 스타일 추가

```css
/* 기존 스타일 + 추가 */

.checkin-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.checkin-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.checkin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.result-box {
  text-align: center;
  padding: 20px;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.result-icon.success {
  color: #28a745;
}

.result-icon.warning {
  color: #ffc107;
}

.result-box h2 {
  margin-bottom: 20px;
  color: #333;
}

.late-info {
  background: #fff3cd;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.late-info p {
  margin: 0;
  color: #856404;
  font-weight: 600;
}

.penalty-info {
  background: #f8d7da;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #dc3545;
}

.penalty-info h3 {
  margin-top: 0;
  color: #721c24;
}

.penalty-info p {
  margin: 10px 0;
  color: #721c24;
}

.penalty-amount {
  font-size: 24px;
  font-weight: bold;
  color: #dc3545 !important;
}

.checkin-time {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.checkin-time p {
  color: #666;
  font-size: 14px;
}

.home-button {
  margin-top: 20px;
  padding: 12px 30px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.home-button:hover {
  background: #5a6268;
}
```

---

### 3단계: 테스트

#### 3-1. 정상 출석 테스트

1. 회차 시작 시간 전에 출석체크
2. 정상 출석 메시지 확인
3. 지각비 없음 확인

#### 3-2. 지각 출석 테스트

1. 회차 시작 시간 10분 후에 출석체크
2. 지각 메시지 확인
3. 지각 시간 표시 확인
4. 지각비 계산 확인

#### 3-3. 중복 출석체크 방지 테스트

1. 한 번 출석체크 완료
2. 같은 페이지에서 다시 출석체크 시도
3. 에러 메시지 확인

---

## ✅ 6일차 완료 체크

- [ ] 출석체크 버튼 추가
- [ ] 출석체크 API 연동 완료
- [ ] 성공 메시지 표시
- [ ] 지각 여부 판단 및 표시
- [ ] 지각비 계산 및 표시
- [ ] 에러 처리 완료
- [ ] 중복 출석체크 방지
- [ ] 모든 테스트 케이스 통과

---

## 🎓 오늘 배운 것

1. **비동기 처리**: async/await로 API 호출
2. **상태 관리**: 여러 상태(loading, result, error) 관리
3. **조건부 렌더링**: 결과에 따라 다른 화면 표시
4. **에러 처리**: 사용자에게 친절한 에러 메시지

---

## 🌟 다음 단계 (7일차 예고)

내일은:
- 관리자 대시보드 기본 구조를 만듭니다
- 관리자 권한 체크를 구현합니다
- 네비게이션 메뉴를 만듭니다

---

**6일차 완료를 축하합니다! 🎉**

참가자용 출석체크 기능이 완성되었습니다. 이제 관리자 기능을 만들어봅시다!

