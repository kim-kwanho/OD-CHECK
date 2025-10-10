
--샘플 사용자 데이터
INSERT INTO users(id, name, email)
VALUES
('11111111-1111-1111-1111-111111111111', '김허브', 'hub123.gmail.net'),
('22222222-2222-2222-2222-222222222222', '김철수', 'chulsoo@example.com');

--세션 데이터
INSERT INTO sessions(id, title, description)
VALUES
('f2e634de-55f4-466b-a60a-0e44e5d3a9b3', '주간 모임', '매주 수요일 저녁 모임');

--출석 기록 데이터
INSERT INTO occurrences (id, session_id, scheduled_start, scheduled_end, qr_token)
VALUES
(gen_random_uuid(), 'f2e634de-55f4-466b-a60a-0e44e5d3a9b3', '2025-10-08 10:00:00+09', '2025-10-08 12:00:00+09', 'token1');
