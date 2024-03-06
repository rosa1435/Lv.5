export default function (err, req, res, next) {
    // 에러 로깅
    console.error(err);
  
    // 클라이언트에 에러 메시지 응답
    res.status(err.status).json({ Message: err.message });
  };