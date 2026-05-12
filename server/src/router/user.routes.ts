import express from "express";
import { validateRequest } from "../middleware/validation.middleware";
import { updateCurrentUserSchema } from "../utils/validation.schemas";
import { updateProfile } from "../controller/user.controller";
import { protect, validateBearerFormat } from "../middleware/auth.middleware";

const router = express.Router();

router.put(
    "/user/profile",
    validateBearerFormat,
    protect,
    validateRequest(updateCurrentUserSchema),
    updateProfile
);

export default router;
