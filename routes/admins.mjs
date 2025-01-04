import express from "express";
import db from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// ======================
// Admin Registration
// ======================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const collection = await db.collection("admins");
        const existingAdmin = await collection.findOne({ email });
        if (existingAdmin) {
            return res.status(400).send({ message: "Admin already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = {
            FullName: name,
            Email: email,
            Password: hashedPassword,
            Role: "admin",
        };

        const result = await collection.insertOne(newAdmin);
        res.status(201).send({ message: "Admin registered successfully", data: result });
    } catch (error) {
        res.status(500).send({ message: "Error registering admin", error });
    }
});

// ======================
// Admin Login
// ======================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const collection = await db.collection("admins");
        const admin = await collection.findOne({ Email: email });
        if (!admin) {
            return res.status(404).send({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(password, admin.Password);
        if (!isMatch) {
            return res.status(403).send({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: admin._id, name: admin.FullName, role: admin.Role },
            SECRET_KEY,
            { expiresIn: "3d" }
        );

        res.status(200).send({ message: "Login successful", token });
    } catch (error) {
        res.status(500).send({ message: "Error logging in", error });
    }
});

export default router;
