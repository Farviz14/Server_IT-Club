import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { verifyAdminToken } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

// Fetch all attendance sessions (only dates)
router.get("/sessions", verifyAdminToken, async (req, res) => {
    try {
        const attendanceCollection = await db.collection("attendance");
        const sessions = await attendanceCollection
            .find({}, { projection: { sessionDate: 1 } })
            .toArray();

        res.status(200).send({
            message: "Attendance sessions fetched successfully",
            data: sessions,
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching attendance sessions",
            error,
        });
    }
});

// Fetch attendance records by session date
router.get("/date/:date", verifyAdminToken, async (req, res) => {
    try {
        const attendanceCollection = await db.collection("attendance");
        const session = await attendanceCollection
            .aggregate([
                {
                    $match: {
                        sessionDate: new Date(req.params.date),
                    },
                },
                {
                    $lookup: {
                        from: "members",
                        localField: "records.memberId",
                        foreignField: "_id",
                        as: "memberDetails",
                    },
                },
            ])
            .toArray();

        if (!session || session.length === 0) {
            return res
                .status(404)
                .send({ message: "Attendance session not found for the specified date!" });
        }

        res.status(200).send({
            message: "Attendance session fetched successfully",
            data: session[0],
        });
    } catch (error) {
        res.status(500).send({
            message: "Error fetching attendance session",
            error,
        });
    }
});

// Take attendance for a new session
router.post("/", verifyAdminToken, async (req, res) => {
    try {
        const { sessionDate, records } = req.body;

        if (!sessionDate || !Array.isArray(records)) {
            return res.status(400).send({ message: "Invalid input data!" });
        }

        const attendanceCollection = await db.collection("attendance");

        // Check if attendance already exists for the date
        const existingSession = await attendanceCollection.findOne({
            sessionDate: new Date(sessionDate),
        });

        if (existingSession) {
            return res.status(400).send({
                message: "Attendance for this date already exists!",
            });
        }

        // Insert new attendance session
        const result = await attendanceCollection.insertOne({
            sessionDate: new Date(sessionDate),
            records: records.map((record) => ({
                memberId: new ObjectId(record.memberId),
                status: record.status,
            })),
        });

        res.status(201).send({
            message: "Attendance session created successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).send({
            message: "Error creating attendance session",
            error,
        });
    }
});

// Update attendance records by session date
router.patch("/date/:date", verifyAdminToken, async (req, res) => {
    try {
        const { records } = req.body;

        if (!records || !Array.isArray(records)) {
            return res.status(400).send({ message: "Invalid attendance data!" });
        }

        const attendanceCollection = await db.collection("attendance");
        const query = { sessionDate: new Date(req.params.date) };

        const existingSession = await attendanceCollection.findOne(query);

        if (!existingSession) {
            return res
                .status(404)
                .send({ message: "Attendance session not found for the specified date!" });
        }

        // Update specific records without overwriting the whole array
        const updatedRecords = existingSession.records.map((record) => {
            const updatedRecord = records.find(
                (r) => r.memberId === record.memberId.toString()
            );
            return updatedRecord ? { ...record, status: updatedRecord.status } : record;
        });

        const result = await attendanceCollection.updateOne(query, {
            $set: { records: updatedRecords },
        });

        res.status(200).send({
            message: "Attendance session updated successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).send({
            message: "Error updating attendance session",
            error,
        });
    }
});

export default router;
