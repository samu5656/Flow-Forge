import prisma from "../../lib/prisma.js"

//fetches real project data from postgre sql and give it as prompt to ai
export const getProjectContext = async (projectId, organizationId) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId, organizationId
        },
        include: {
            issues: {
                take: 20, //limit to recent 20 to conserve tokens
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    assignee: { select: { name: true, email: true } },
                    tasks: {
                        select: { title: true, completed: true }
                    }
                }
            }
        }
    });

    if (!project) return "No project data available";

    //format to clean stuctured text
    let context = `Project Name: ${project.name}\n`;
    context += `Project Description: ${project.description || "None"}\n`;
    context += `Total Issues Tracked: ${project.issues.length}\n\n`;

    if(project.issues.length===0){
        context+="There are currently no issues or tasks logged in this project.\n";
    }else{
        context+="Recent Issues & tasks\n";
        project.issues.forEach((issue,index)=>{
            const assigneeName = issue.assignee? issue.assignee.name: "Unassigned";
            const taskSummary = issue.task.length>0?issue.tasks.map(t=>`${t.title} (${t.completed? "Done":"Pending"})`).join(","):"No subtasks";

            context+=`${index+1}.[${issue.status}] [Priority: ${issue.priority || "NORMAL"}] "$
            {issue.title}"\n`;

            context+= ` Assignee: ${assigneeName}\n`;
            context+= ` SUbtasks: ${taskSummary}\n`;
        });
    }
    return context;
};