-- migration_add_password.sql
-- 기존 데이터베이스에 password_hash 컬럼 추가하는 마이그레이션

-- password_hash 컬럼 추가 (NULL 허용 - 기존 데이터 호환)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 인덱스 추가 (이메일 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

