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

export const getTeam = async (
    req,
    res,
    next
) => {
    try {
        const team =
            await getTeamService(
                req.params.teamId,
                req.params.organizationId
            );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        next(error);
    }
};

export const updateTeam = async (
    req,
    res,
    next
) => {
    try {
        const team =
            await updateTeamService(
                req.params.teamId,
                req.params.organizationId,
                req.body
            );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        next(error);
    }
};


export const deleteTeam = async (
    req,
    res,
    next
) => {
    try {
        const team =
            await deleteTeamService(
                req.params.teamId,
                req.params.organizationId
            );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Team deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};