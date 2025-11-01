# 📅 7일차 가이드 - 관리자 대시보드 기본 구조

## 🎯 오늘의 목표
관리자 전용 페이지의 기본 틀을 만들고, 관리자 권한 체크와 네비게이션 메뉴를 구현합니다.

---

## 📋 체크리스트

### 1단계: 관리자 API 서비스 만들기

#### 1-1. adminService.js 생성

`frontend/src/services/adminService.js` 파일 생성:

```javascript
import api from './api';

// 대시보드 데이터
export const getDashboardData = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// 출석 기록 조회
export const getAttendance = async (startDate, endDate, userId) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (userId) params.userId = userId;

  const response = await api.get('/admin/attendance', { params });
  return response.data;
};

// 지각비 현황 조회
export const getPenalties = async (userId, occurrenceId) => {
  const params = {};
  if (userId) params.userId = userId;
  if (occurrenceId) params.occurrenceId = occurrenceId;

  const response = await api.get('/admin/penalties', { params });
  return response.data;
};

// 지각비 요약
export const getPenaltySummary = async () => {
  const response = await api.get('/admin/penalties/summary');
  return response.data;
};

// 세션 생성
export const createSession = async (title, description, timezone) => {
  const response = await api.post('/admin/sessions', {
    title,
    description,
    timezone,
  });
  return response.data;
};

// 회차 생성
export const createOccurrence = async (sessionId, scheduledStart, scheduledEnd) => {
  const response = await api.post('/admin/occurrences', {
    sessionId,
    scheduledStart,
    scheduledEnd,
  });
  return response.data;
};
```

---

### 2단계: 관리자 권한 체크 컴포넌트

#### 2-1. ProtectedRoute 컴포넌트 생성

`frontend/src/components/ProtectedRoute.jsx` 파일 생성:

```javascript
import { Navigate } from 'react-router-dom';
import { getUser } from '../services/authService';

function ProtectedRoute({ children, requireAdmin = false }) {
  const user = getUser();

  // 로그인 체크
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 관리자 권한 체크
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

---

### 3단계: 관리자 레이아웃 컴포넌트

#### 3-1. AdminLayout 컴포넌트 생성

`frontend/src/components/AdminLayout.jsx` 파일 생성:

```javascript
import { Link, useLocation } from 'react-router-dom';
import { logout, getUser } from '../services/authService';
import './AdminLayout.css';

function AdminLayout({ children }) {
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🎯 OD-CHECK</h2>
          <p className="admin-name">{user?.name}님</p>
        </div>

        <ul className="sidebar-menu">
          <li>
            <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>
              📊 대시보드
            </Link>
          </li>
          <li>
            <Link to="/admin/attendance" className={isActive('/admin/attendance')}>
              ✅ 출석 관리
            </Link>
          </li>
          <li>
            <Link to="/admin/penalties" className={isActive('/admin/penalties')}>
              💰 지각비 관리
            </Link>
          </li>
          <li>
            <Link to="/admin/sessions" className={isActive('/admin/sessions')}>
              📅 세션 관리
            </Link>
          </li>
          <li>
            <Link to="/admin/occurrences" className={isActive('/admin/occurrences')}>
              🎯 회차 관리
            </Link>
          </li>
        </ul>

        <div className="sidebar-footer">
          <Link to="/" className="home-link">🏠 홈으로</Link>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </nav>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
```

#### 3-2. AdminLayout CSS

`frontend/src/components/AdminLayout.css` 파일 생성:

```css
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.admin-sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #34495e;
}

.sidebar-header h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.admin-name {
  margin: 0;
  color: #bdc3c7;
  font-size: 14px;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.sidebar-menu li {
  margin: 0;
}

.sidebar-menu a {
  display: block;
  padding: 15px 20px;
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.sidebar-menu a:hover {
  background: #34495e;
  color: white;
}

.sidebar-menu a.active {
  background: #3498db;
  color: white;
  border-left-color: #2980b9;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #34495e;
}

.home-link {
  display: block;
  padding: 10px;
  color: #bdc3c7;
  text-decoration: none;
  margin-bottom: 10px;
  text-align: center;
  border-radius: 5px;
  transition: background 0.3s;
}

.home-link:hover {
  background: #34495e;
}

.logout-button {
  width: 100%;
  padding: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.logout-button:hover {
  background: #c0392b;
}

.admin-content {
  margin-left: 250px;
  flex: 1;
  padding: 30px;
}
```

---

### 4단계: 관리자 대시보드 페이지

#### 4-1. AdminDashboard 페이지 생성

`frontend/src/pages/admin/AdminDashboard.jsx` 파일 생성:

```javascript
import { useState, useEffect } from 'react';
import { getDashboardData } from '../../services/adminService';
import './AdminDashboard.css';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData();
        setData(result);
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!data) {
    return <div className="error">데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>대시보드</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>전체 참가자</h3>
            <p className="stat-number">{data.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>오늘 출석</h3>
            <p className="stat-number">{data.todayAttendance}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>이번 주 출석</h3>
            <p className="stat-number">{data.weekAttendance}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>미납 지각비 현황 (상위 10명)</h2>
        {data.unpaidPenalties && data.unpaidPenalties.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>총 지각비</th>
              </tr>
            </thead>
            <tbody>
              {data.unpaidPenalties.map((item) => (
                <tr key={item.id || item.email}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.total_amount?.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>미납 지각비가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
```

#### 4-2. AdminDashboard CSS

`frontend/src/pages/admin/AdminDashboard.css` 파일 생성:

```css
.admin-dashboard h1 {
  margin-bottom: 30px;
  color: #333;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 48px;
}

.stat-info h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.dashboard-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dashboard-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error {
  text-align: center;
  padding: 40px;
  color: #dc3545;
}
```

---

### 5단계: 라우팅 설정

#### 5-1. App.jsx에 관리자 라우트 추가

```javascript
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkin/:token" element={<CheckinPage />} />
        
        {/* 관리자 라우트 */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
```

---

## ✅ 7일차 완료 체크

- [ ] 관리자 API 서비스 완성
- [ ] ProtectedRoute 컴포넌트 생성
- [ ] AdminLayout 컴포넌트 생성
- [ ] 네비게이션 메뉴 완성
- [ ] 관리자 대시보드 페이지 생성
- [ ] 대시보드 데이터 표시
- [ ] 관리자 권한 체크 작동
- [ ] 관리자로 로그인하여 접속 테스트

---

## 🎓 오늘 배운 것

1. **권한 체크**: 관리자만 접근할 수 있는 페이지 만들기
2. **레이아웃 컴포넌트**: 공통 레이아웃 재사용
3. **보호된 라우트**: 로그인/권한 체크 후 접근 허용
4. **사이드바 네비게이션**: 관리자 메뉴 구조

---

## 🌟 다음 단계 (8일차 예고)

내일은:
- 출석 현황 페이지를 만듭니다
- 날짜별/사용자별 필터를 구현합니다
- 출석 기록을 테이블로 표시합니다

---

**7일차 완료를 축하합니다! 🎉**

관리자 대시보드의 기본 구조가 완성되었습니다!

