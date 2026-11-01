import prisma from "../../lib/prisma.js";

// Fetches real project data from PostgreSQL and formats it for the AI prompt
export const getProjectContext = async (projectId, organizationId) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            organizationId
        },
        include: {
            Issue: {
                take: 20, // limit to recent 20 to conserve tokens
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    Task: {
                        select: { title: true, completed: true }
                    }
                }
            }
        }
    });

    if (!project) return "No project data available.";

    // Format to clean structured text
    const issues = project.Issue || [];
    let context = `Project Name: ${project.name}\n`;
    context += `Project Description: ${project.description || "None"}\n`;
    context += `Total Issues Tracked: ${issues.length}\n\n`;

    if (issues.length === 0) {
        context += "There are currently no issues or tasks logged in this project.\n";
    } else {
        context += "=== Recent Issues & Tasks ===\n";
        issues.forEach((issue, index) => {
            const taskSummary = issue.Task && issue.Task.length > 0
                ? issue.Task.map(t => `${t.title} (${t.completed ? "Done" : "Pending"})`).join(", ")
                : "No subtasks";

            context += `${index + 1}. [${issue.status}] [Priority: ${issue.priority || "MEDIUM"}] "${issue.title}"\n`;
            if (issue.description) {
                context += `   Description: ${issue.description}\n`;
            }
            context += `   Subtasks: ${taskSummary}\n`;
        });
    }

    return context;
};
