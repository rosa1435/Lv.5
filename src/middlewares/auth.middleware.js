import jwt from 'jsonwebtoken';
import { prisma } from "../utils/prisma/index.js";

export default async function(req, res, next) {
    const {authorization} = req.cookies;
    if (!authorization) throw new Error('요청한 사용자의 토큰이 존재하지 않습니다.');

    const [tokenType, token] = authorization.split(' ');
    if(tokenType !== 'bearer') throw new Error('요청한 사용자의 토큰이 존재하지 않습니다.');
}