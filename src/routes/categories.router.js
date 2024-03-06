import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 카테고리 등록 API
router.post('/categories', authMiddleware, async (req, res) => { 
    const {name} = req.body
    try {
        if (!name) { 
            const err = new Error('데이터 형식이 올바르지 않습니다.');
            err.status = 400;
            throw err;
          }



        const lastCategory = await prisma.categories.findFirst({
            orderBy: {
              order: 'desc',
            },
          });
          const newOrder = lastCategory ? lastCategory.order + 1 : 1;
      

        const newCategory = await prisma.categories.create({
            data: {
              name : name,
              order : newOrder
            },
          });

          return res.status(201).json({ message: "카테고리를 등록하였습니다.", category: newCategory });

      } catch (err) {
        next(err);
      }
    });





export default router;
