# 📅 3일차 가이드 - 프론트엔드 프로젝트 시작

## 🎯 오늘의 목표
React 프로젝트를 만들고, 기본 구조를 설정하며, 백엔드 API와 통신할 준비를 합니다.

---

## 📋 체크리스트

### 1단계: React 프로젝트 생성

#### 1-1. Vite로 React 프로젝트 만들기 (권장)

**Vite란?**
- 빠른 개발 서버를 제공하는 빌드 도구
- Create React App보다 빠르고 가벼움

**프로젝트 생성**:
```bash
# 프로젝트 루트에서 (OD-CHECK 폴더)
npm create vite@latest frontend -- --template react

# 또는 yarn 사용 시
yarn create vite frontend --template react
```

**프로젝트 구조 확인**:
```
OD-CHECK/
├── server/          # 백엔드
├── frontend/        # 프론트엔드 (새로 생성됨)
├── sql/
└── ...
```

#### 1-2. 의존성 설치

```bash
cd frontend
npm install
```

**설치 시간**: 1-2분

#### 1-3. 개발 서버 실행 테스트

```bash
npm run dev
```

**성공 시**:
- 브라우저에서 http://localhost:5173 접속
- React 로고가 보이면 성공!

**⚠️ 주의**: 서버가 3000 포트를 사용하므로, 프론트엔드는 5173 포트 사용

---

### 2단계: 필요한 라이브러리 설치

#### 2-1. API 통신 라이브러리

**axios 설치**:
```bash
npm install axios
```

**axios란?**
- HTTP 요청을 쉽게 보낼 수 있는 라이브러리
- Promise 기반

#### 2-2. 라우팅 라이브러리

**react-router-dom 설치**:
```bash
npm install react-router-dom
```

**react-router-dom이란?**
- 여러 페이지를 만들 수 있게 해주는 라이브러리
- 예: /login, /checkin, /admin 등

---

### 3단계: 프로젝트 구조 설정

#### 3-1. 폴더 구조 만들기

`frontend/src` 폴더 안에 다음 폴더들을 만듭니다:

```
frontend/src/
├── components/      # 재사용 가능한 컴포넌트
├── pages/          # 페이지 컴포넌트
├── services/       # API 통신 로직
├── utils/          # 유틸리티 함수
├── hooks/          # 커스텀 훅
└── App.jsx         # 메인 앱 컴포넌트
```

**폴더 생성 방법**:
```bash
cd frontend/src
mkdir components pages services utils hooks
```

또는 VS Code에서 직접 폴더 생성

---

### 4단계: API 통신 모듈 만들기

#### 4-1. API 기본 설정 파일 생성

`frontend/src/services/api.js` 파일 생성:

```javascript
import axios from 'axios';

// API 기본 URL
const API_BASE_URL = 'http://localhost:3000/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 이동
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**이 코드의 역할**:
- 모든 API 요청의 기본 URL 설정
- 토큰을 자동으로 헤더에 추가
- 401 에러 시 자동으로 로그인 페이지로 이동

#### 4-2. 인증 API 서비스 생성

`frontend/src/services/authService.js` 파일 생성:

```javascript
import api from './api';

// 회원가입
export const register = async (email, password, name, role = 'participant') => {
  const response = await api.post('/auth/register', {
    email,
    password,
    name,
    role,
  });
  return response.data;
};

// 로그인
export const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  
  // 토큰을 localStorage에 저장
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// 로그아웃
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 현재 사용자 정보 조회
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('token');
};

// 현재 사용자 정보 가져오기 (localStorage에서)
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
```

---

### 5단계: 라우팅 설정

#### 5-1. App.jsx 수정

`frontend/src/App.jsx` 파일을 다음과 같이 수정:

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* 나중에 추가할 라우트들 */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/checkin/:token" element={<CheckinPage />} /> */}
      </Routes>
    </Router>
  );
}

// 임시 홈 페이지 컴포넌트
function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 OD-CHECK 출석체크 시스템</h1>
      <p>프론트엔드 프로젝트가 시작되었습니다!</p>
      <p>서버가 실행 중인지 확인하세요: <a href="http://localhost:3000">http://localhost:3000</a></p>
    </div>
  );
}

export default App;
```

---

### 6단계: 첫 번째 화면 만들기

#### 6-1. 홈 페이지 개선

`frontend/src/pages/HomePage.jsx` 파일 생성:

```javascript
function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '600px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center',
          color: '#333',
          marginBottom: '20px'
        }}>
          🎯 OD-CHECK
        </h1>
        <p style={{ 
          textAlign: 'center',
          color: '#666',
          fontSize: '18px',
          marginBottom: '30px'
        }}>
          QR 코드 기반 출석체크 시스템
        </p>
        
        <div style={{ marginTop: '30px' }}>
          <h2>시작하기</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li>✅ 백엔드 서버 실행 확인</li>
            <li>✅ 프론트엔드 서버 실행 확인</li>
            <li>🔄 다음 단계: 로그인 페이지 만들기</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
```

#### 6-2. App.jsx에 HomePage 연결

```javascript
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
```

---

### 7단계: API 연결 테스트

#### 7-1. 테스트 컴포넌트 만들기

`frontend/src/components/ApiTest.jsx` 파일 생성:

```javascript
import { useState } from 'react';
import api from '../services/api';

function ApiTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testServer = async () => {
    setLoading(true);
    try {
      const response = await api.get('/');
      setResult(response.data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ddd' }}>
      <h3>API 연결 테스트</h3>
      <button 
        onClick={testServer} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {loading ? '테스트 중...' : '서버 연결 테스트'}
      </button>
      
      {result && (
        <pre style={{ 
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          overflow: 'auto'
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default ApiTest;
```

#### 7-2. HomePage에 ApiTest 추가

```javascript
import ApiTest from '../components/ApiTest';

function HomePage() {
  return (
    <div>
      {/* 기존 내용 */}
      <ApiTest />
    </div>
  );
}
```

---

### 8단계: CSS 기본 스타일 설정

#### 8-1. App.css 수정

`frontend/src/App.css` 파일에 기본 스타일 추가:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

---

## ✅ 3일차 완료 체크

- [ ] React 프로젝트 생성 완료
- [ ] 필요한 라이브러리 설치 완료 (axios, react-router-dom)
- [ ] 프로젝트 폴더 구조 설정 완료
- [ ] API 통신 모듈 만들기 완료
- [ ] 라우팅 설정 완료
- [ ] 홈 페이지 만들기 완료
- [ ] API 연결 테스트 성공
- [ ] 개발 서버가 정상 작동

---

## 🎓 오늘 배운 것

1. **React**: 사용자 인터페이스를 만드는 JavaScript 라이브러리
2. **컴포넌트**: 재사용 가능한 UI 요소
3. **라우팅**: 여러 페이지를 만드는 방법
4. **axios**: API와 통신하는 방법
5. **localStorage**: 브라우저에 데이터 저장하기

---

## 🧪 실습 과제

1. **과제 1**: 홈 페이지를 예쁘게 꾸며보세요
2. **과제 2**: API 테스트 컴포넌트를 만들어 서버 연결을 확인하세요
3. **과제 3**: 브라우저 개발자 도구를 열어 네트워크 탭에서 API 요청을 확인해보세요

---

## ❓ 문제 해결

### "npm create vite가 안 돼요"
- Node.js 버전이 14 이상인지 확인
- `npm install -g create-vite` 실행 후 다시 시도

### "포트 5173이 이미 사용 중"
- `.env` 파일에 `VITE_PORT=5174` 추가
- 또는 다른 포트 사용

### "API 연결이 안 돼요"
- 백엔드 서버가 실행 중인지 확인 (http://localhost:3000)
- CORS 설정 확인
- 브라우저 콘솔에서 에러 확인

### "axios를 찾을 수 없다"
- `npm install axios` 다시 실행

---

## 🌟 다음 단계 (4일차 예고)

내일은:
- 로그인 페이지를 만듭니다
- 회원가입 페이지를 만듭니다
- 폼 유효성 검사를 구현합니다
- 실제로 로그인이 작동하도록 합니다

---

**3일차 완료를 축하합니다! 🎉**

프론트엔드의 기초가 완성되었습니다. 이제 본격적으로 화면을 만들어봅시다!

