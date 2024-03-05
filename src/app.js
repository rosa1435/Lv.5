import express from "express";
import categoryRouter from "./routes/categories.router.js";
import menuRouter from "./routes/menus.router.js";
import UsersRouter from "./routes/users.router.js";
import LogMiddleware from './middlewares/log.middleware.js';

const app = express();
const PORT = 3000;

app.use(LogMiddleware);
app.use(express.json());


app.use("/api", [categoryRouter, menuRouter, UsersRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
