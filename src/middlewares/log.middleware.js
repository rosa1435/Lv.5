import winston from "winston";

// 로거 인스턴스 생성
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

// 로그 미들웨어 함수
export default function (req, res, next) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const start = new Date().getTime();

    res.on("finish", () => {
      const duration = new Date().getTime() - start;
      logger.info({
        Method: req.method,
        URL: req.url,
        Status: res.statusCode,
        Duration: `${duration}ms`,
      });
    });
  }
  next();
}
