-- users 테이블 초기화 및 샘플 데이터 삽입
DELETE FROM attendance_logs; -- 먼저 로그 테이블 비우기
DELETE FROM users;

INSERT INTO users(id, name, email)
VALUES
  ('11111111-1111-1111-1111-111111111111', '김허브', 'hub123@gmail.com'),
  ('22222222-2222-2222-2222-222222222222', '김철수', 'chulsoo@example.com');

-- occurrences 테이블 초기화 및 샘플 데이터 삽입
DELETE FROM occurrences;

INSERT INTO occurrences(id, session_id, scheduled_start, scheduled_end, qr_token)
VALUES 
  ('2fb4bd8a-ac58-4d80-a2e3-c0857aa73021', 'f2e634de-55f4-466b-a60a-0e44e5d3a9b3', 
   '2025-10-08 10:00:00+09', '2025-10-08 12:00:00+09', 'token1');
