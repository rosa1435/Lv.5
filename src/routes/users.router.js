import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
    const {nickname, password, userType} = req.body
    try {
      if (!nickname || !password) { // 데이터형식의 오류
        const err = new Error('데이터 형식이 올바르지 않습니다.');
        err.status = 400;
        throw err;
      }
    

        if (!/^[a-zA-Z0-9]{3,15}$/.test(nickname)) { // 닉네임 형식 오류
          const err = new Error('닉네임 형식에 일치하지 않습니다.');
          err.status = 400;
          throw err;
        }

        if (password.length < 8 || password.length > 20 || password.includes(nickname)) { // 비밀번호 형식 오류
          const err = new Error('비밀번호 형식에 일치하지 않습니다.');
          err.status = 400;
          throw err;
        }
      
        const findNickname = await prisma.users.findFirst({
          where: {
            nickname: nickname
          }
    })

    if (findNickname) {  // 중복된 닉네임 오류
      const err = new Error('중복된 닉네임입니다.');
      err.status = 409;
      throw err;
    }
  
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await prisma.users.create({
            data: {
                nickname,
                password: hashedPassword,
                userType,
            }
        })

        return res.status(201).json({message: "회원가입이 완료되었습니다."})
      } catch (err) {
        next(err);
      }
    })
    

// 로그인 API
router.post('/sign-in', async (req, res, next) => {
    const {nickname, password} = req.body
    try {
      if (!nickname || !password) { // 데이터형식의 오류
        const err = new Error('데이터 형식이 올바르지 않습니다.');
        err.status = 400;
        throw err;
      }
      const user = await prisma.users.findFirst({where: {nickname}});

      if (!user) {  // 존재하지 않는 닉네임
        const err = new Error('존재하지 않는 닉네임 입니다.');
        err.status = 401;
        throw err;
      }

      const userPassword = await bcrypt.compare(password, user.password);

      if (!userPassword) {  // 존재하지 않는 패스원드
        const err = new Error('비밀번호가 일치하지 않습니다.');
        err.status = 401;
        throw err;
      }



        const token = jwt.sign(
            { userId: user.userId},
            'custom-secret-key'
        );

            res.cookie('authorization', `Bearer ${token}`);
            return res.status(201).json({message: "로그인에 성공하였습니다."})

      } catch (err) {
        next(err);
      }
    });
    
export default router;
