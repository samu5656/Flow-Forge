import multer from "multer";
import path from "path";

//configure where the file go and what they are named
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        //save all uploads to the 'uploads' folder 
        cb(null,"uploads/");
    },
    filename: (req,file,cb)=>{
        //create a totaly unique filename so 2 users uploading profile.png dont overwrite
        const uniqueSuffix = Date.now+"-"+Math.round(Math.random()*1E9);
        cb(null,file.fieldname+"-"+uniqueSuffix+path.extname(file.originalname));
    }
})

// We tell Multer to accept files, but limit them to 5 Megabytes to prevent server crashing
export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});