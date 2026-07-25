import { GetCurrentAuthUserResponse } from '@workspace/api-zod';
import { Router, type IRouter, type Request, type Response } from 'express';

const router: IRouter = Router();

router.get('/auth/user', (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

export default router;
