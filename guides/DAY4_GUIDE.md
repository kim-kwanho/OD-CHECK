# 📅 4일차 가이드 - 로그인/회원가입 페이지 만들기

## 🎯 오늘의 목표
사용자가 로그인하고 회원가입할 수 있는 페이지를 만들고, 실제로 작동하도록 합니다.

---

## 📋 체크리스트

### 1단계: 로그인 페이지 만들기

#### 1-1. LoginPage 컴포넌트 생성

`frontend/src/pages/LoginPage.jsx` 파일 생성:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // 로그인 성공 시 홈으로 이동
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>로그인</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="register-link">
          계정이 없으신가요? <a href="/register">회원가입</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
```

#### 1-2. LoginPage CSS 스타일

`frontend/src/pages/LoginPage.css` 파일 생성:

```css
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-box h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
```

---

### 2단계: 회원가입 페이지 만들기

#### 2-1. RegisterPage 컴포넌트 생성

`frontend/src/pages/RegisterPage.jsx` 파일 생성:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import './RegisterPage.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'participant'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      );
      // 회원가입 성공 시 로그인 페이지로 이동
      alert('회원가입이 완료되었습니다! 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>회원가입</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="최소 6자 이상"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">역할</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="participant">참가자</option>
              <option value="admin">관리자</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="login-link">
          이미 계정이 있으신가요? <a href="/login">로그인</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
```

#### 2-2. RegisterPage CSS 스타일

`frontend/src/pages/RegisterPage.css` 파일 생성 (LoginPage.css와 비슷하게):

```css
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
}

.register-box h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
```

---

### 3단계: 라우팅 설정

#### 3-1. App.jsx에 라우트 추가

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

### 4단계: 홈 페이지에 로그인 상태 표시

#### 4-1. HomePage 수정

```javascript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUser, logout } from '../services/authService';
import './HomePage.css';

function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <h1>🎯 OD-CHECK</h1>
        <div className="nav-links">
          {user ? (
            <>
              <span>안녕하세요, {user.name}님!</span>
              <button onClick={handleLogout} className="logout-btn">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/register">회원가입</Link>
            </>
          )}
        </div>
      </nav>

      <div className="home-content">
        <h2>QR 코드 기반 출석체크 시스템</h2>
        {user && (
          <div className="user-info">
            <p>이메일: {user.email}</p>
            <p>역할: {user.role === 'admin' ? '관리자' : '참가자'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
```

---

### 5단계: 테스트

#### 5-1. 회원가입 테스트
1. http://localhost:5173/register 접속
2. 정보 입력 후 회원가입
3. 로그인 페이지로 이동하는지 확인

#### 5-2. 로그인 테스트
1. http://localhost:5173/login 접속
2. 가입한 계정으로 로그인
3. 홈으로 이동하고 사용자 정보가 표시되는지 확인

#### 5-3. 로그아웃 테스트
1. 로그인 상태에서 로그아웃 버튼 클릭
2. 로그인/회원가입 링크가 다시 보이는지 확인

---

## ✅ 4일차 완료 체크

- [ ] 로그인 페이지 완성
- [ ] 회원가입 페이지 완성
- [ ] 폼 유효성 검사 작동
- [ ] 실제로 회원가입 가능
- [ ] 실제로 로그인 가능
- [ ] 로그인 상태 유지 (localStorage)
- [ ] 로그아웃 기능 작동
- [ ] 에러 메시지 표시

---

## 🎓 오늘 배운 것

1. **useState**: 컴포넌트의 상태 관리
2. **useEffect**: 컴포넌트가 로드될 때 실행
3. **폼 처리**: 사용자 입력 받기
4. **유효성 검사**: 잘못된 입력 방지
5. **에러 처리**: 사용자에게 친절한 에러 메시지

---

## 🌟 다음 단계 (5일차 예고)

내일은:
- 출석체크 페이지를 만듭니다
- QR 코드 토큰으로 회차 정보를 가져옵니다
- 회차 정보를 화면에 표시합니다

---

**4일차 완료를 축하합니다! 🎉**

이제 사용자가 로그인할 수 있습니다. 다음은 출석체크 기능입니다!

