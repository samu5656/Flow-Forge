import axios from "axios";
import crypto from "crypto";
import {
    findGithubAccountByUserId,
    findGithubAccountByGithubId,
    createGithubAccount,
    updateGithubAccount,
    deleteGithubAccount,
    createProjectRepository,
    findProjectRepositories,
    findProjectRepositoryById,
    deleteProjectRepository
} from "../repositories/github.repositories.js";

import prisma from "../lib/prisma.js";
import AppError from "../utils/AppError.js";
import { stat } from "fs";

const oauthStates = new Map();

//create Oauth state

export const createGithubOAuthState = (userId) => {
    const state = crypto.randomBytes(32).toString("hex");

    oauthStates.set(state, {
        userId,
        createdAt: Date.now()
    });
    return state;
}

export const validateGithubOAuthState = (state) => {
    const oauthData = oauthStates.get(state);

    if (!oauthData) {
        throw new AppError("Invalid OAuth state", 400);
    }

    const expiryTime = 5 * 60 * 1000;

    if (Date.now() - oauthData.createdAt > expiryTime) {
        oauthStates.delete(state);
        throw new AppError("OAuth State expired", 400);
    }

    //state is single use.

    oauthStates.delete(state);

    return oauthData.userId;
}

//github authorization URL

export const getGithubAuthorizationUrl = (state) => {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,

        /*
         * repo:
         * Allows access to repositories.
         *
         * read:user:
         * Allows reading GitHub user information.
         *
         * user:email:
         * Allows reading user's email.
         */

        scope: "repo read:user user:email", state
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

//exchange github auth code for access token
export const exchangeGithubCode = async (code) => {
    try {
        const response = await axios.post("https://github.com/login/oauth/access_token", {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,

            code,

            redirect_uri: process.env.GITHUB_CALLBACK_URL
        },
            {
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if(!response.data.access_token){
            throw new AppError("GitHub access token was not returned",400);
        }

        return response.data.access_token;
    }
    catch(error){

        console.error("GitHub token exchange error:",
            error.response?.data||
            error.message
        );

        if(error instanceof AppError){
            throw error;
        }

        throw new AppError("Failed to authenticate with GitHub",400);
    }
};

export const getGithubUser = async(accessToken)=>{
    try{
        const response = await axios.get("https://api.github.com/user",{
            headers:{
                Authorization:`Bearer ${accessToken}`,
                Accept:"application/vnd.github+json"
            }
        });
        return response.data;
    }catch(err){
        console.log(err)(
            "Github user API error:",err.response?.data||err.message
        )
        throw new AppError(
            "Failed to fetch GitHub user",
            400
        );
    }
}