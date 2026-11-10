import prisma from '../lib/prisma.js';

//idempotency

export const findWebhookEventByDeliveryId = async(deliveryId)=>{
    return prisma.webhookEvent.findUnique({
        where:{deliveryId}
    });
};

export const createWebhookEvent = async(data) => {
    return prisma.webhookEvent.create({data});
}

export const getRecentWebhookEvents = async (limit = 50) => {
    return prisma.webhookEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
    });
};

export const markWebhookEventProcessed = async(id)=>{
    return prisma.webhookEvent.update({
        where:{id},
        data:{
            status:'PROCESSED',
            processedAt:new Date()
        }
    });
};

export const markWebhookEventFailed = async(id)=>{
    return prisma.webhookEvent.update({
        where:{id},
        data:{
            status:'FAILED',
            processedAt:new Date()
        }
    });
};

export const markWebhookEventPending = async(id)=>{
    return prisma.webhookEvent.update({
        where:{id},
        data:{
            status:'PENDING',
            processedAt:new Date()
        }
    });
};

export const markWebhookEventSkipped = async(id)=>{
    return prisma.webhookEvent.update({
        where:{id},
        data:{
            status:'SKIPPED',
            processedAt:new Date()
        }
    });
};
