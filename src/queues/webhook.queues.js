import {Queue} from 'bullmq';
import {connection} from "./connection.js";

export const webhookQueue = new Queue("webhook-queue",{connection});

export const addWebhookJob = async (webhookData)=>{
    return await webhookQueue.add('process-github-webhook',webhookData,{
        attempts:5,
        backoff:{
            type:"exponential",
            delay:2000 //2s,4s,8s,16s...
        }
    })
}