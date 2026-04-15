import express from "express";
import { getCategories } from "../controller/category.controller";
import { protect, validateBearerFormat } from "../middleware/auth.middleware";


const router = express.Router();

router.get('/categories', validateBearerFormat, protect, getCategories);

export default router;