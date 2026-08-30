import { success } from "zod";
import { createTeamService,getTeamService,getTeamsService } from "../services/team.service.js";

export const createTeam =async(req,res,next)=>{
    try{
        const team=await createTeamService(req.body,req.params.organizationId);
        res.status(201).json({
            success:true,
            data:team
        })
    }catch(err){
        next(err);
    }
}

export const getTeams = async(req,res,next)=>{
    try{
        const teams = await getTeamsService(req.params.organizationId);

        res.status(200).json({
            success:true,
            data:teams
        })
    }catch(err){
        next(err);
    }
}