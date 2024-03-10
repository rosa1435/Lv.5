import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 메뉴 주문
router.post("/order", authMiddleware, async (req, res, next) => {
  const { menuId, quantity } = req.body;
  const { id: userId } = req.user;

  try {
    if (req.userType !== "CUSTOMER") {
      const err = new Error("소비자만 사용할 수 있는 API입니다.");
      err.status = 401;
      throw err;
    }

    if (!menuId || !quantity) {
      const err = new Error("데이터 형식이 올바르지 않습니다.");
      err.status = 400;
      throw err;
    }

    const ordermenu = await prisma.menus.findUnique({
      where: {
        id: +menuId,
      },
    });

    if (!ordermenu) {
      const err = new Error("존재하지 않는 메뉴 입니다.");
      err.status = 404;
      throw err;
    }

    const neworder = await prisma.orders.create({
      data: {
        userId,
        menuId,
        quantity,
        total: ordermenu.price * quantity,
      },
    });

    return res.status(200).json({ message: "메뉴 주문에 성공하였습니다." });
  } catch (err) {
    next(err);
  }
});

// 사용자 주문 내역 조회
router.get("/orders/customer", authMiddleware, async (req, res, next) => {
  const { id: userId } = req.user; // 인증된 사용자의 ID 가져오기

  try {
    if (req.userType !== "CUSTOMER") {
      const err = new Error("소비자만 사용할 수 있는 API입니다.");
      err.status = 401;
      throw err;
    }

    const userOrders = await prisma.orders.findMany({
      where: {
        userId: userId, // 사용자 ID를 기반으로 주문 내역 조회
      },
      orderBy: {
        createdAt: "desc", // 주문 날짜를 기준으로 내림차순 정렬
      },
    });

    return res.status(200).json(userOrders);
  } catch (err) {
    next(err);
  }
});

export default router;
