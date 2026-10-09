import prisma from "../lib/prisma.js"
import {
    createNotification,
    findUnreadNotifications,
    markNotificationAsRead
} from "../repositories/notification.repository.js";

import { getIO } from "../socket.js";
import { addEmailJob } from "../queues/email.queue.js";

export const getUserNotifications = async (userId) => {
    return await findUnreadNotifications(userId);
}

export const readNotification = async (notificationId, userId) => {
    return await markNotificationAsRead(notificationId, userId);
}

export const notifyUser = async ({ userId, email, type, title, message }) => {
    await createNotification({ userId, type, title, message });

    try {
        const io = getIO();
        io.to(userId).emit('new_notification', {
            title,
            message,
            type
        })
        console.log(`📡 Pushed real-time socket event to user ${userId}`);
    } catch (error) {
        console.error("Socket error (ignoring):", error.message);
    }

    //Queue email notification (BullMQ)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
    })

    if (user && user.email) {
        await addEmailJob({
            to: user.email, subject: title, text: message
        });
        console.log(`[Notification Service] Queued email for ${user.email}`);
    }
}
