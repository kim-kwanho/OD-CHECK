-- schema.sql: OD-CHECK DB schema (Postgres)

-- UUID 확장(필요시 슈퍼유저로 실행)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- users: 참가자/관리자
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'participant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sessions: 모임 템플릿
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Seoul',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- occurrences: 실제 회차(날짜별)
CREATE TABLE IF NOT EXISTS occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  qr_token VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, scheduled_start)
);

-- attendance_logs: 체크인 로그 (서버시간으로 저장)
CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_inet INET,
  user_agent TEXT,
  method VARCHAR(50) DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, occurrence_id)
);

-- penalties: 지각비 내역
CREATE TABLE IF NOT EXISTS penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
  minutes_late INT NOT NULL,
  amount_won INT NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- attendance_settings: 지각 정책(세션별)
CREATE TABLE IF NOT EXISTS attendance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  grace_minutes INT NOT NULL DEFAULT 5,
  billing_unit_minutes INT NOT NULL DEFAULT 60,
  fee_per_unit_won INT NOT NULL DEFAULT 5000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id)
);

-- 인덱스(성능)
CREATE INDEX IF NOT EXISTS idx_occurrences_start ON occurrences (scheduled_start);
CREATE INDEX IF NOT EXISTS idx_attendance_occurrence ON attendance_logs (occurrence_id);
CREATE INDEX IF NOT EXISTS idx_penalties_user ON penalties (user_id);
