import jwt from "jsonwebtoken";
import dotenv from "dotenv"; 

dotenv.config(); 


const SECRET_KEY = process.env.SECRET_KEY;

export const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).send({ message: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.admin = verified;
        next();
    } catch (error) {
        res.status(401).send({ message: "Invalid token." });
    }
};
