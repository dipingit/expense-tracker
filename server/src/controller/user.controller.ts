import { Request, Response } from "express";
import { prisma } from "../prisma";

//update profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "User ID not found in token",
            });
        }

        // Check if email is being updated and if it's already taken by another user
        if (email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });

            if (existingUser && existingUser.id !== userId) {
                return res.status(409).json({
                    error: "Email already taken",
                    message: "This email is already registered by another user",
                });
            }
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email: email.toLowerCase() }),
            },
        });

        res.status(200).json({
            message: "Profile updated successfully",
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
        });
    }
};
