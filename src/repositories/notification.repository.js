import prisma from "../lib/prisma.js";

export const createNotification = async (data) => {
    return prisma.notification.create({
        data
    });
};

export const findUnreadNotifications = async(userId)=>{
    return prisma.notification.findMany({
        where:{userId, isRead:false},
        orderBy:{createdAt:'desc'}
    });
}

export const markNotificationAsRead = async(notificationId, userId)=>{
    return prisma.notification.updateMany({
        where:{id:notificationId, userId},
        data:{isRead:true}
    });
}