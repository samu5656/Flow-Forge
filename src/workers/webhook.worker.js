import {Worker} from "bullmq";
import {connection} from "../queues/connection.js";
import {processWebhookEvent} from "../services/webhook.service.js";

console.log("Webhook worker started listening for jobs");

export const webhookWorker = new Worker("webhook-queue",async(job)=>{
    console.log(`Webhook Worker picked up delivery: ${job.data.deliveryId}`);

    const result = await processWebhookEvent({
        deliveryId:job.data.deliveryId,
        eventType:job.data.eventType,
        action:job.data.action,
        payload:job.data.payload
    });

    if(result.alreadyProcessed){
        console.log(`[Webhook Worker] skipped duplicate delivery`);
    }else{
        console.log(`[Webhook Worker] successfully processed event`);
    }

    return true;
},{connection});

webhookWorker.on("failed",(job,err)=>{
    console.error(`[Webhook Worker] job failed:`,err.message);
})