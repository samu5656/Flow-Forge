import { Worker } from "bullmq";
import { connection } from "../queues/connection.js";

console.log("Email worker started listening");

// The Worker listens to 'email-queue' and runs this function for every job
export const emailWorker = new Worker('email-queue', async (job) => {
    console.log(`\n[Worker] 📥 Picked up job ${job.id}`);
    console.log(`[Worker] 📧 Sending email to: ${job.data.to}`);

    console.log(`\n[Worker] 📥 Picked up job ${job.id}`);
    console.log(`[Worker] 📧 Sending email to: ${job.data.to}`);
    
    // Simulate 2 seconds of slow network work (like connecting to Gmail)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`[Worker] ✅ Successfully sent email to ${job.data.to}`);
    
    // We return data to mark the job as successful
    return { delivered: true };

},{connection});

emailWorker.on('completed',(job)=>{
        console.log(`[Worker Monitor] Job ${job.id} has completed!`);
})

emailWorker.on('failed', (job, err) => {
    console.error(`[Worker Monitor] Job ${job.id} failed:`, err.message);
});