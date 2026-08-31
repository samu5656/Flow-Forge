import { createIssue,findIssuesByProject, findIssueById,updateIssue, deleteIssue } from "../repositories/issue.repository.js"

export const createIssueService = async(data,projectId)=>{
    return createIssue({...data,projectId});
};

export const findIssuesByProjectService = async(issueId,projectId)=>{
    const issues = await findIssuesByProject(projectId);

    if(!issues){ return null}

    return issues;

}

export const findIssueByIdService = async(issueId,projectId)=>{
    const issue = await findIssueById(issueId,projectId);

    if(!issue){
        return null;
    }

    return issue;
}

export const updateIssueService = async(issueId,projectId,data)=>{
    const existingIssue = await findIssueById(issueId,projectId);

    if(!existingIssue){
        return null;
    }
//returns count:1
    return updateIssue(issueId,projectId,data);
}


export const deleteIssueService = async(issueId,projectId)=>{
    const existingIssue = await findIssueById(issueId,projectId);

    if(!existingIssue){
        return null;
    }

    await deleteIssue(issueId,projectId);

    return existingIssue;
}