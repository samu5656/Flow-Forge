// import dotenv from "dotenv";
// dotenv.config(); 
import "dotenv/config";

const env = {
    port : Number(process.env.PORT) || 5000,
    nodeEnv : process.env.NODE_ENV || "development"
};

export default env;