import { Worker } from "bullmq";
import { connection } from "../queues/connection.js";
import {sendEmail} from "../integrations/email/email.service.js";

console.log("Email worker started listening");

// The Worker listens to 'email-queue' and runs this function for every job
export const emailWorker = new Worker('email-queue', async (job) => {
    console.log(`\n[Worker] 📥 Picked up job ${job.id}`);
    
    await sendEmail({
        to:job.data.to,
        subject:job.data.subject,
        text: `Hello!\n\nThis is a notification from FlowForge.\n\n${job.data.subject}`
    })
    
    // We return data to mark the job as successful
    return { delivered: true };

},{connection});

emailWorker.on('completed',(job)=>{
        console.log(`[Worker Monitor] Job ${job.id} has completed!`);
})

emailWorker.on('failed', (job, err) => {
    console.error(`[Worker Monitor] Job ${job.id} failed:`, err.message);
});