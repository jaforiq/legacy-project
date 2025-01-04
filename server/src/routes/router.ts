import { Router } from "express";
import { getAllUsers } from "../controllers/controllers";
const router = Router();

router.get('/users', getAllUsers)


export default router;