import crypto from 'crypto';
import AppError from "../utils/AppError.js";

export const verifyGithubSignature = (req,res,next)=>{
    const signature = req.headers['x-hub-signature-256'];

    if(!signature){
        return next(new AppError("No signature found",401));
    }

    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    const hmac = crypto.createHmac('sha256',webhookSecret);
    const digest = 'sha256='+hmac.update(req.rawBody).digest('hex');


    //to use timingsafeequal we need buffers
    const signatureBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    //Because crypto.timingSafeEqual() requires both Buffers to have the same length.
    if(signatureBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(digestBuffer,signatureBuffer)){
        return next(new AppError('Github signature verification failed',401));
    }

    next();
}