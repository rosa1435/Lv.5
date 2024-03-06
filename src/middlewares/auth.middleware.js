import jwt from 'jsonwebtoken';
import { prisma } from "../utils/prisma/index.js";

export default async function(req, res, next) {
    try{
        const {authorization} = req.cookies;
        if (!authorization) throw new Error('로그인이 필요한 서비스입니다.');

        const [tokenType, token] = authorization.split(' ');
        if(tokenType !== 'Bearer') throw new Error('로그인이 필요한 서비스입니다.');

        const decodesToken = jwt.verify(token, 'custom-secret-key');
        const userId = decodesToken.userId;
        const user = await prisma.users.findFirst({
            where: {id: +userId}
        });

        if(!user) throw new Error('토큰 사용자가 존재하지 않습니다.')

        if(user.userType !== 'OWNER') throw new Error('사장님만 사용할 수 있는 API입니다.');

        req.user = user;
        next();

    } catch (error) {
        if(error.name === 'TokenExpiredError')
        return res.status(401).json({  message: '토큰이 만료되었습니다.'})

        return res.status(400).json({ message: error.message})
    }
}