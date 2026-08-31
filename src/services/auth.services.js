import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserById } from "../repositories/user.repository.js";
import { generateAccessToken} from "../utils/jwt.js";
import { generateRefreshToken } from "../utils/refreshToken.js";
import AppError from "../utils/AppError.js";
import authConfig from "../config/auth.js";
import { hashToken } from "../utils/tokenHash.js";
import { createRefreshToken } from "../repositories/refreshToken.repository.js";
import { findRefreshToken } from "../repositories/refreshToken.repository.js";
export const loginUser = async ({ email, password }) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
        throw new AppError("Invalid email or password", 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const tokenHash = hashToken(refreshToken);

    await createRefreshToken({
        tokenHash,
        userId: user.id,
        expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        )
    })

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        accessToken,
        refreshToken
    };
};

export const registerUser = async ({
    username, email, password
}) => {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw new AppError("Email is already registered", 409);
    }
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser({
        username,
        email,
        passwordHash
    });

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
    }
}

export const getCurrentUser = async (userId) => {
    const user = await findUserById(userId);

    if (!user) {
        throw new AppError("User not found", 404)
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    }
}

export const refreshAccessToken = async (refreshToken) => {
    // let payload;

    // try {
    //     payload = jwt.verify(refreshToken, authConfig.refreshTokenSecret);
    // } catch {
    //     throw new AppError("Invalid or expired refresh Token", 401);
    // }
    // if (payload.type !== "refresh") {
    //     throw new AppError("Invalid refresh token", 409);
    // }

    // const user = await findUserById(payload.sub);

    // if (!user) {
    //     throw new AppError("User not found", 401);
    // }

    // return generateAccessToken(user);

    const tokenHash = hashToken(refreshToken);
    const storedToken = await findRefreshToken(tokenHash);

    if(!storedToken || storedToken.revokedAt){
        throw new AppError("Invalid or expired refresh Token",401);
    }

    if(storedToken.expiresAt<new Date()){
        throw new AppError("Invalid or expired refresh Token",401);
    }

    const user = storedToken.user;

    if(!user){
        throw new AppError("User not found",401);
    }

    return generateAccessToken(user);
}