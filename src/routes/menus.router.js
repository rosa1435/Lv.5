import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();


/**메뉴 생성 API **/
router.post('/categories/:categoryId/menus', authMiddleware, async (req, res, next) => {
    const { name, description, image, price } = req.body;
    const { categoryId } = req.params;

    try {
        if (req.userType !== 'OWNER') {
            const err = new Error('사장님만 사용할 수 있는 API입니다.');
            err.status = 401;
            throw err;
        }

        // 필수 필드 확인
        if (!name || !description || !image || price === undefined || !categoryId) {
            const err = new Error('데이터 형식이 올바르지 않습니다.');
            err.status = 400;
            throw err;
        };

        // categoryId에 해당하는 카테고리 존재 여부 확인
        const existingCategory = await prisma.categories.findUnique({
            where: { id: +categoryId},
        });
        if (!existingCategory) {
            const err = new Error('존재하지 않는 카테고리 입니다.');
            err.status = 404;
            throw err;
        }

        // 메뉴 가격이 0보다 작은 경우 확인
        if (price < 0) {
            const err = new Error('메뉴 가격은 0보다 작을 수 없습니다.');
            err.status = 400;
            throw err;
        }

        const lastMenu = await prisma.menus.findFirst({
            orderBy: {
                order: 'desc',
            },
        });
        const newOrder = lastMenu ? lastMenu.order + 1 : 1;

        const newMenu = await prisma.menus.create({
            data: {
                name,
                description,
                image,
                price,
                categoryId: +categoryId,
                order: newOrder
            }
        });

        return res.status(201).json({ message: '메뉴를 등록하였습니다.' });
    } catch (err) {
        next(err)
    }
}
);

/** 카테고리속 모든 메뉴 조회 API **/
router.get('/categories/:categoryId/menus', async (req, res, next) => {
        try {
            const categoryId = parseInt(req.params.categoryId);


            // categoryId에 해당하는 카테고리 존재 여부 확인
            const existingCategory = await prisma.categories.findUnique({
                where: { id: categoryId },
            });
            if (!existingCategory) {
                const err = new Error('존재하지 않는 카테고리 입니다.');
                err.status = 404;
                throw err;
            }


            const showmenu = await prisma.menus.findMany({
                where: {
                    categoryId: categoryId,
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    price: true,
                    order: true,
                    status: true
                },
                orderBy: {
                    order: 'desc', // 게시글을 최신순으로 정렬합니다.
                },
            });


            return res.status(200).json({ data: showmenu });
        } catch (err) {
            next(err)
        }
    });

/** 특정 메뉴 조회 API **/
router.get('/categories/:categoryId/menus/:menuId', async (req, res, next) => {
        try {
            const categoryId = parseInt(req.params.categoryId);
            const menuId = parseInt(req.params.menuId);

            // categoryId에 해당하는 카테고리 존재 여부 확인
            const existingCategory = await prisma.categories.findUnique({
                where: { id: categoryId },
            });
            if (!existingCategory) {
                const err = new Error('존재하지 않는 카테고리 입니다.');
                err.status = 404;
                throw err;
            }

            // 해당 메뉴가 존재하지 않음
            const existingMenu = await prisma.menus.findUnique({
                where: { id: menuId }
            });
            if (!existingMenu) {
                const err = new Error('존재하지 않는 메뉴 입니다.');
                err.status = 404;
                throw err;
            }

            const showmenu = await prisma.menus.findMany({
                where: {
                    categoryId: categoryId,
                    id: menuId
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    price: true,
                    order: true,
                    status: true
                },
                orderBy: {
                    order: 'desc', // 게시글을 최신순으로 정렬합니다.
                },
            });


            return res.status(200).json({ data: showmenu });
        } catch (err) {
            next(err)
        }
    });

/**메뉴 수정 API **/
router.patch('/categories/:categoryId/menus/:menuId', authMiddleware, async (req, res, next) => {
        try {
            if (req.userType !== 'OWNER') {
                const err = new Error('사장님만 사용할 수 있는 API입니다.');
                err.status = 401;
                throw err;
            }

            const { name, description, price, order, status } = req.body;
            const categoryId = parseInt(req.params.categoryId);
            const menuId = parseInt(req.params.menuId);

            // 필수 필드 확인
            if (!categoryId || !menuId) {
                const err = new Error('데이터 형식이 올바르지 않습니다.');
                err.status = 400;
                throw err;
            }

            // categoryId에 해당하는 카테고리 존재 여부 확인
            const existingCategory = await prisma.categories.findUnique({
                where: { id: categoryId },
            });
            if (!existingCategory) {
                const err = new Error('존재하지 않는 카테고리 입니다.');
                err.status = 404;
                throw err;
            }

            // 해당 메뉴가 존재하지 않음
            const existingMenu = await prisma.menus.findUnique({
                where: { id: menuId }
            });
            if (!existingMenu) {
                const err = new Error('존재하지 않는 메뉴 입니다.');
                err.status = 404;
                throw err;
            }

            // 메뉴 가격이 0보다 작은 경우 확인
            if (price < 0) {
                const err = new Error('메뉴 가격은 0보다 작을 수 없습니다.');
                err.status = 400;
                throw err;
            }

            const updateMenu = await prisma.menus.update({
                where: {
                    id: menuId,
                    categoryId: categoryId
                },
                data: { // 매니저님 한테 물어보기
                    ...(name && { name }),
                    ...(description && { description }),
                    ...(price !== undefined && { price }),
                    ...(order && { order }),
                    ...(status && { status }),
                }
            });

            return res.status(200).json({ message: '메뉴를 수정하였습니다.' });
        } catch (err) {
            next(err)
        }
    }
);

/**메뉴 삭제 API **/
router.delete('/categories/:categoryId/menus/:menuId', authMiddleware,async (req, res, next) => {
        try {
            if (req.userType !== 'OWNER') {
                const err = new Error('사장님만 사용할 수 있는 API입니다.');
                err.status = 401;
                throw err;
            }

            const categoryId = parseInt(req.params.categoryId);
            const menuId = parseInt(req.params.menuId);

            // 필수 필드 확인
            if (!categoryId || !menuId) {
                const err = new Error('데이터 형식이 올바르지 않습니다.');
                err.status = 400;
                throw err;
            }

            // categoryId에 해당하는 카테고리 존재 여부 확인
            const existingCategory = await prisma.categories.findUnique({
                where: { id: categoryId },
            });
            if (!existingCategory) {
                const err = new Error('존재하지 않는 카테고리 입니다.');
                err.status = 404;
                throw err;
            }

            // 해당 메뉴가 존재하지 않음
            const existingMenu = await prisma.menus.findUnique({
                where: { id: menuId }
            });
            if (!existingMenu) {
                const err = new Error('존재하지 않는 메뉴 입니다.');
                err.status = 404;
                throw err;
            }

            await prisma.menus.delete({
                where: {
                    id: menuId
                }
            });

            return res.status(200).json({ message: '메뉴를 삭제하였습니다.' });
        } catch (err) {
            next(err)
        }
    }
);





export default router;
