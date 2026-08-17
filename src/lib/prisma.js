import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

//This gives rest of our applications reusable prisma client 
// Repository
//     ↓
// prisma
//     ↓
// Prisma Client
//     ↓
// PostgreSQL