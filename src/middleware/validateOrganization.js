const validateOrganization = (req,res,next)=>{
    const {name,slug} = req.body;

    if(!name || !slug){
        return res.status(400).json({
            success:false,
            message: "Name and slug are required"
        });
    }

    next();
};

export default validateOrganization;