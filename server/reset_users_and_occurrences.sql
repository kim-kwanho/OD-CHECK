-- 1️⃣ attendance_logs 비우기 (FK 때문에 먼저 삭제)
DELETE FROM attendance_logs;

-- 2️⃣ users 테이블 UUID 타입 확인 및 변경
ALTER TABLE users ALTER COLUMN id TYPE uuid USING id::uuid;

-- 3️⃣ users 테이블 초기화 및 샘플 데이터 삽입
DELETE FROM users;

INSERT INTO users(id, name, email)
VALUES
  ('11111111-1111-1111-1111-111111111111', '김허브', 'hub123@gmail.com'),
  ('22222222-2222-2222-2222-222222222222', '김철수', 'chulsoo@example.com');

-- 4️⃣ occurrences 테이블 UUID 타입 확인 및 필요 시 변경
ALTER TABLE occurrences ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE occurrences ALTER COLUMN session_id TYPE uuid USING session_id::uuid;

-- 5️⃣ occurrences 테이블 초기화 및 샘플 데이터 삽입
DELETE FROM occurrences;

INSERT INTO occurrences(id, session_id, scheduled_start, scheduled_end, qr_token)
VALUES
  ('2fb4bd8a-ac58-4d80-a2e3-c0857aa73021', 'f2e634de-55f4-466b-a60a-0e44e5d3a9b3', 
   '2025-10-08 10:00:00+09', '2025-10-08 12:00:00+09', 'token1');
