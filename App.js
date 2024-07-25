const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET; // JWT 시크릿 키
const MONGODB_URI = process.env.MONGODB_URI; // MongoDB 연결 문자열

// Body parser 미들웨어 설정
app.use(bodyParser.json());

// MongoDB 연결
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// 사용자 스키마 및 모델 정의
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// 회원가입 라우트
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 새로운 사용자 생성
  const newUser = new User({
    username,
    password: hashedPassword
  });

  try {
    await newUser.save();
    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    res.status(500).json({ error: '회원가입 실패', details: err });
  }
});

// 로그인 라우트
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: '사용자를 찾을 수 없음' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: '잘못된 비밀번호' });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: '로그인 성공', token });
  } catch (err) {
    res.status(500).json({ error: '로그인 실패', details: err });
  }
});

// 인증 미들웨어
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: '토큰이 없음' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: '잘못된 토큰' });
  }
};

// 보호된 라우트 예시
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: '인증된 사용자만 접근 가능', user: req.user });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
