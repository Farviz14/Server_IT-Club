import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { verifyAdminToken } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

// ====================
// Protected Routes (Admin Only)
// ====================

// Get all members
router.get("/", verifyAdminToken, async (req, res) => {
    try {
        const collection = await db.collection("members");
        const results = await collection.find({}).toArray();
        res.status(200).send({ message: "Members fetched successfully", data: results });
    } catch (error) {
        res.status(500).send({ message: "Error fetching members", error });
    }
});

// Get a member by ID
router.get("/:id", verifyAdminToken, async (req, res) => {
    try {
        const collection = await db.collection("members");
        const member = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (!member) {
            return res.status(404).send({ message: "Member not found" });
        }

        res.status(200).send({ message: "Member fetched successfully", data: member });
    } catch (error) {
        res.status(500).send({ message: "Error fetching member", error });
    }
});

// Add a new member
router.post("/", verifyAdminToken, async (req, res) => {
    try {
        const newMember = req.body;

        if (!newMember.fullName || !newMember.email || !newMember.studentID) {
            return res.status(400).send({ message: "Invalid member data" });
        }

        const collection = await db.collection("members");
        const result = await collection.insertOne(newMember);
        res.status(201).send({ message: "Member added successfully", data: result });
    } catch (error) {
        res.status(500).send({ message: "Error adding member", error });
    }
});

// Update a member by ID
router.patch("/:id", verifyAdminToken, async (req, res) => {

    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = { $set: req.body };

        const collection = await db.collection("members");
        const result = await collection.updateOne(query, updates);

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: "Member not found" });
        }

        res.status(200).send({ message: "Member updated successfully", data: result });
    } catch (error) {
        res.status(500).send({ message: "Error updating member", error });
    }
});

// Delete a member by ID
router.delete("/:id", verifyAdminToken, async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };

        const collection = await db.collection("members");
        const result = await collection.deleteOne(query);

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Member not found" });
        }

        res.status(200).send({ message: "Member deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting member", error });
    }
});

export default router;
