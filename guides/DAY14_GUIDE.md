# 📅 14일차 가이드 - 리포트 및 추가 기능

## 🎯 오늘의 목표
데이터를 내보내고 유용한 추가 기능을 만듭니다.

---

## 📋 주요 작업

### 1. CSV 내보내기

**라이브러리 설치**:
```bash
npm install papaparse
```

**CSV 생성 함수**:
```javascript
import Papa from 'papaparse';

const exportToCSV = (data, filename) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
```

**사용 예시**:
```javascript
// 출석 기록 내보내기
const handleExport = () => {
  exportToCSV(attendance, `attendance_${new Date().toISOString()}.csv`);
};
```

### 2. 지각비 리포트 생성

**리포트 데이터 구성**:
```javascript
const generatePenaltyReport = (summary) => {
  return summary.map(item => ({
    이름: item.name,
    이메일: item.email,
    지각비건수: item.penalty_count,
    총지각비: item.total_amount,
  }));
};
```

### 3. 통계 차트 (선택사항)

**라이브러리 설치**:
```bash
npm install recharts
```

**차트 컴포넌트**:
```javascript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function AttendanceChart({ data }) {
  return (
    <BarChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="attendance" fill="#667eea" />
    </BarChart>
  );
}
```

### 4. 검색 기능

**검색 컴포넌트**:
```javascript
const [searchTerm, setSearchTerm] = useState('');

const filteredData = data.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.email.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 5. 페이지네이션 (페이징)

**간단한 페이지네이션**:
```javascript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedData = data.slice(startIndex, endIndex);
```

---

## ✅ 완료 체크

- [ ] CSV 내보내기 기능
- [ ] 지각비 리포트 생성
- [ ] 통계 차트 (선택사항)
- [ ] 검색 기능
- [ ] 페이지네이션 (선택사항)

---

## 🌟 다음 단계

15일차: 배포 준비 및 최종 점검

