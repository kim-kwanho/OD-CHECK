DROP TABLE IF EXISTS attendance_logs;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'participant',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  occurrence_id UUID,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  ip_inet INET,
  user_agent TEXT,
  method VARCHAR(50) DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ 정상 샘플 데이터 삽입
INSERT INTO users (id, name, email)
VALUES
('11111111-1111-1111-1111-111111111111', '김허브', 'hub123@gmail.com'),
('22222222-2222-2222-2222-222222222222', '김철수', 'chulsoo@example.com');
