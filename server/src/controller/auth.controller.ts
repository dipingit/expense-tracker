import { Request, Response } from "express";
import { prisma } from "../prisma";
import { comparePassword, generateTokens, hashPassword, verifyRefreshToken, generateAccessToken } from "../utils/auth.utils";

//user register
export const register = async(req: Request, res: Response) => {
    try{
        const {email, name, password, confirmPassword} = req.body;

        //check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {email},
        });
        if(existingUser){
            return res.status(409).json({error: 'Email already registered'});
        }
        //hashpassword
        const hashedPassword = await hashPassword(password);
        
        //create user
        const user = await prisma.user.create({
           data:{
            email,
            name: name || null,
            password: hashedPassword
           }, 
        });

        //generate tokens
        const {accessToken, refreshToken} = generateTokens(user.id, user.email);
        
        //store refresh tokens
        await prisma.user.update({
            where: {id: user.id},
            data: {
                refreshTokens: [refreshToken]
            }
        });

        res.status(201).json({
            message: 'User registered successfully',
            data:{
                id: user.id,
                email: user.email,
                name: user.name,
            },
            tokens: {accessToken, refreshToken},
        });
    }catch(error: any){
        res.status(500).json({error: error.message});
    }
};

//user login
export const login = async(req: Request, res: Response) => {
    try{
        const {email, password} = req.body;
        
        //find user
        const user = await prisma.user.findUnique({
            where: {email}
        });

        if(!user){
            return res.status(401).json({error: 'Invalid email or password'});
        }

        //compare password
        const isPasswordValid = await comparePassword(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({error: 'Invalid email or password'});
        }

        //generate tokens
        const {accessToken, refreshToken} = generateTokens(user.id, user.email);

        //store token in database
        await prisma.user.update({
            where: {id: user.id},
            data: {
                refreshTokens: {
                    push: refreshToken,
                },
            },
        });

        res.status(200).json({
            message: 'Login successful',
            data:{
                id: user.id,
                email: user.email,
                name: user.name
            },
            tokens: {accessToken, refreshToken},
        });
    }catch(error: any){
        res.status(500).json({error: error.message})
    }
};

//Refresh Token - Get new access token using refresh token
export const refreshAccessTokenHandler = async(req: Request, res: Response) => {
    try{
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Refresh token is required'
            });
        }
        //verify refresh token 
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token. Please login again'
            });
        }
        //check if user token exist in database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { refreshTokens: true, email: true }
        });

        if (!user || !user.refreshTokens.includes(refreshToken)) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Refresh token not found. please login again'
            });
        }

        const newAccessToken = generateAccessToken(decoded.userId, decoded.email);
        res.status(200).json({
            message: 'Token Refreshed Successfully',
            accessToken: newAccessToken
        });
    } catch(error: any){
        res.status(500).json({
            error: 'Internal server error',
            message: error.message || 'Token refresh failed'
        });
    }
}

//logout User
export const logoutHandler = async(req: Request, res: Response) => {
    try{
        const userId = req.userId;

        if(!userId){
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated!'
            });
        }
        await prisma.user.update({
            where: {id: userId},
            data: {
                refreshTokens: {
                    set: [],
                },
            },
        });

        return res.status(200).json({
            message: 'Logged Out Successfully!'
        });

    }catch(error: any){
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Logout Failed'
        });
    }
}

