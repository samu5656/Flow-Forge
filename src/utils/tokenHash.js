import crypto from "crypto";

export const hashToken = (token) => {
    if (!token) {
        throw new Error("Cannot hash an undefined or empty token string");
    }
    return crypto.createHash("sha256").update(token).digest("hex")
}