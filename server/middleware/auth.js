// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: '인증 토큰이 필요합니다.' 
      });
    }

    const token = authHeader.split(' ')[1]; // "Bearer TOKEN" 형식

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 정보를 req.user에 저장
    req.user = decoded;
    
    next(); // 다음 미들웨어로 진행
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: '유효하지 않은 토큰입니다.' 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다.' 
      });
    }
    return res.status(500).json({ message: '서버 오류' });
  }
};

// 관리자 권한 체크 미들웨어
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: '관리자 권한이 필요합니다.' 
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };

