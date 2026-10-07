import {Queue} from 'bullmq';
import {connection} from './connection.js';

export const emailQueue = new Queue('email-queue',{connection});

export const addEmailJob = async (emailData)=>{
        // 1st arg: Job Name, 2nd arg: The Payload, 3rd arg: Options
    return await emailQueue.add('send-welcome-email',emailData,{
        attempts:3,//production mindset-if smtp fails retry 3 times
        backoff:{
            type:"exponential",
            delay:1000 //wait 1s 2s then 4s between retries
        }
    })
}