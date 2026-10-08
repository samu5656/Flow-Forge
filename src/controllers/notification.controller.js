import {getUserNotifications,readNotification} from "../services/notification.service.js";

export const getNotifications = async (req, res, next) => {
    try{
        const notifications = await getUserNotifications(req.user.id);
        res.status(200).json({notifications});
    }catch(err){
        next(err);
    }
}

export const markAsRead = async(req,res,next)=>{
    try{
        await readNotification(req.params.id,req.user.id);
        res.status(200).json({success:true,message: "Notification marked as read"});
    }catch(err){
        next(err);
    }
}