import prisma from "../lib/prisma.js"
import{
    createNotification,
    findUnreadNotifications,
    markNotificationAsRead
} from "../repositories/notification.repository.js";

import {addEmailJob} from "../queues/email.queue.js";

export const getUserNotifications = async (userId) => {
    return await findUnreadNotifications(userId);
}

export const readNotification = async (notificationId, userId) => {
    return await markNotificationAsRead(notificationId, userId);
}

export const notifyUser = async ({userId,email,type,title,message})=>{
    await createNotification({userId,type,title,message});

    const user = await prisma.user.findUnique({
        where:{id:userId},
        select:{email:true}
    })

    if(user && user.email){
        await addEmailJob({to:user.email,subject:title,text:message
        });
                console.log(`[Notification Service] Queued email for ${user.email}`);
    }
}
