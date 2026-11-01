/**
 * Function Declarations format expected by Google Gemini SDK.
 * Defines the tool name, description, and JSON schema for its arguments.
 */

export const createIssueDeclaration = {
    name: "createIssue",
    description:"Creates a new issue in the current project with title,priority, and optional description.",
    parameters:{
        type:"OBJECT",
        properties:{
            title:{
                type: "STRING",
                description: "Short summary of issue (e.g.'fix login redirect bug')."
            },
            description:{
                type:"STRING",
                description:"Detailed description of the issue."
            },
            priority:{
                type:"STRING",
                enum:["LOW","MEDIUM","HIGH","CRITICAL"],
                description:"Priority level of the issue.Defaults medium if not specified"
            }
        },
        required: ["title"]
    }
};

export const createTaskDeclaration = {
    name:"createTask",
    description:"Created a new checklist subtask under a specific issue.",
    parameters:{
        type:"OBJECT",
        properties:{
            issueId:{
                type:"STRING",
                description:"The unique ID of the issue to attach the task to."
            },
            title:{
                type:"STRING",
                description:"Title of the task to be completed (eg:'Update unit tests')."
            }
        },
        required:["issueId","title"]
    }
};

export const projectAITools = [
    {
        functionDeclarations: [createIssueDeclaration,createTaskDeclaration]
    }
];