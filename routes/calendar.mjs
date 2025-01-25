import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { verifyAdminToken } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

// Get all events/reminders
router.get("/membercalendar", async (req, res) => {
    try {
        const collection = await db.collection("calendar");
        const results = await collection.find({}).toArray();
        res.status(200).send({ message: "Events fetched successfully", data: results });
    } catch (error) {
        res.status(500).send({ message: "Error fetching events", error });
    }
});

// Get all events/reminders
router.get("/", verifyAdminToken, async (req, res) => {
    try {
        const collection = await db.collection("calendar");
        const results = await collection.find({}).toArray();
        res.status(200).send({ message: "Events fetched successfully", data: results });
    } catch (error) {
        res.status(500).send({ message: "Error fetching events", error });
    }
});

// Get a single event by ID
router.get("/:id", verifyAdminToken, async (req, res) => {
    try {
        const collection = await db.collection("calendar");
        const event = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (!event) {
            return res.status(404).send({ message: "Event not found" });
        }

        res.status(200).send({ message: "Event fetched successfully", data: event });
    } catch (error) {
        res.status(500).send({ message: "Error fetching event", error });
    }
});

// Add a new event/reminder
router.post("/", verifyAdminToken, async (req, res) => {
    try {
        const newEvent = req.body;

        // Validation checks
        if (!newEvent.title || !newEvent.date || !newEvent.type) {
            return res.status(400).send({ message: "Title, date, and type are required!" });
        }

        const collection = await db.collection("calendar");
        const result = await collection.insertOne(newEvent);

        res.status(201).send({ message: "Event added successfully", data: result });
    } catch (error) {
        res.status(500).send({ message: "Error adding event", error });
    }
});

// Update an event/reminder by ID
router.patch("/:id", verifyAdminToken, async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = { $set: req.body };

        const collection = await db.collection("calendar");
        const result = await collection.updateOne(query, updates);

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: "Event not found" });
        }

        res.status(200).send({ message: "Event updated successfully", data: result });
    } catch (error) {
        res.status(500).send({ message: "Error updating event", error });
    }
});

// Delete an event/reminder by ID
router.delete("/:id", verifyAdminToken, async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };

        const collection = await db.collection("calendar");
        const result = await collection.deleteOne(query);

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Event not found" });
        }

        res.status(200).send({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting event", error });
    }
});

export default router;
