import prisma from "../../lib/prisma.js";
import logger from "../../config/logger.js";

export const executeTool = async(name,args,{projectId,organizationId})=>{
    logger.info(`AI triggered tool : ${name} with args: ${JSON.stringify(args)}`);

    switch(name){
        case "createIssue":{
            const {title,description,priority="MEDIUM"}=args;

            const newIssue = await prisma.issue.create({
                data:{
                    title,
                    description:description||null,
                    priority,
                    projectId
                }
            });
            return{
                success:true,
                message:`Issue '${newIssue.title}' created successfully.`,
                issueId: newIssue.id,
                status: newIssue.status,
                priority:newIssue.priority
            };
        }
        case "createTask":{
            const {issueId, title} = args;

            const issue = await prisma.issue.findFirst({
                where: {id: issueId,projectId}
            });

            if(!issue){
                return{
                    succes:false,
                    error:`Issue with ID ${issueId} not found in this project.`
                };
            }

            const newTask = await prisma.task.create({
                data:{
                    title,
                    issueId,
                    completed:false
                }
            });

            return{
                success:true,
                message:`Task '${newTask.title}' added to issue '${issue.title}'.`,
                taskId:newTask.id
            };
        }
        default:
            return{
                success:false,
                error:`Unknown tool: ${name}`
            }
    }
}