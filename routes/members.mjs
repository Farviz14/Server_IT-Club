import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { verifyAdminToken } from "../middlewares/authMiddleware.mjs";

const router = express.Router();



// Validate Full Name (only letters, spaces, /, and - are allowed)
const isValidFullName = (name) => /^[a-zA-Z\s/-]+$/.test(name);

// Validate Nickname (only letters, spaces, /, and - are allowed)
const isValidNickname = (nickname) => /^[a-zA-Z\s/-]+$/.test(nickname);

// Validate Student ID (starts with 23, ends with a letter, and has 8 characters)
const isValidStudentID = (id) => /^23[a-zA-Z0-9]{5}[a-zA-Z]$/.test(id);

// Validate Email using Regex
const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

// Validate Singapore Phone Number (must start with 8 or 9 and be 8 digits)
const isValidPhoneNumber = (number) => /^[89]\d{7}$/.test(number);

// Check if Full Name already exists
const isFullNameExists = async (collection, fullName) => {
    return !!(await collection.findOne({ fullName }));
};

// Check if Nickname already exists
const isNicknameExists = async (collection, nickname) => {
    return !!(await collection.findOne({ nickname }));
};

// Check if Student ID already exists
const isStudentIDExists = async (collection, studentID) => {
    return !!(await collection.findOne({ studentID }));
};

// Check if Email already exists
const isEmailExists = async (collection, email) => {
    return !!(await collection.findOne({ email }));
};

// Check if Phone Number already exists
const isPhoneNumberExists = async (collection, phoneNumber) => {
    return !!(await collection.findOne({ phoneNumber }));
};


// Get all members
router.get("/memberhome", async (req, res) => {
    try {
        const collection = await db.collection("members");
        const results = await collection.find({}).toArray();
        res.status(200).send({ message: "Members fetched successfully", data: results });
    } catch (error) {
        res.status(500).send({ message: "Error fetching members", error });
    }
});


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
        const collection = await db.collection("members");

        // Validation Checks
        if (!isValidFullName(newMember.fullName)) {
            return res.status(400).send({ message: "Invalid characters in full name!" });
        }
        if (!isValidNickname(newMember.nickname)) {
            return res.status(400).send({ message: "Invalid characters in nickname!" });
        }
        if (!isValidStudentID(newMember.studentID)) {
            return res.status(400).send({ message: "Invalid Student ID format!" });
        }
        if (!isValidEmail(newMember.email)) {
            return res.status(400).send({ message: "Invalid email format!" });
        }
        if (!isValidPhoneNumber(newMember.phoneNumber)) {
            return res.status(400).send({ message: "Invalid phone number!" });
        }

        // Uniqueness Checks
        if (await isFullNameExists(collection, newMember.fullName)) {
            return res.status(400).send({ message: "Full Name already exists." });
        }
        if (await isNicknameExists(collection, newMember.nickname)) {
            return res.status(400).send({ message: "Nickname already exists." });
        }
        if (await isStudentIDExists(collection, newMember.studentID)) {
            return res.status(400).send({ message: "Student ID already exists." });
        }
        if (await isEmailExists(collection, newMember.email)) {
            return res.status(400).send({ message: "Email already exists." });
        }
        if (await isPhoneNumberExists(collection, newMember.phoneNumber)) {
            return res.status(400).send({ message: "Phone Number already exists." });
        }

        // Insert Member
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

        // Validation Checks
        if (updates.$set.fullName && !isValidFullName(updates.$set.fullName)) {
            return res.status(400).send({ message: "Invalid characters in full name!" });
        }
        if (updates.$set.nickname && !isValidNickname(updates.$set.nickname)) {
            return res.status(400).send({ message: "Invalid characters in nickname!" });
        }
        if (updates.$set.studentID && !isValidStudentID(updates.$set.studentID)) {
            return res.status(400).send({ message: "Invalid Student ID format!" });
        }
        if (updates.$set.email && !isValidEmail(updates.$set.email)) {
            return res.status(400).send({ message: "Invalid email format!" });
        }
        if (updates.$set.phoneNumber && !isValidPhoneNumber(updates.$set.phoneNumber)) {
            return res.status(400).send({ message: "Invalid phone number!" });
        }

        // Uniqueness Checks (Only check for changes)
        const existingMember = await collection.findOne(query);
        if (!existingMember) {
            return res.status(404).send({ message: "Member not found" });
        }

        if (
            updates.$set.fullName &&
            updates.$set.fullName !== existingMember.fullName &&
            (await isFullNameExists(collection, updates.$set.fullName))
        ) {
            return res.status(400).send({ message: "Full Name already exists." });
        }

        if (
            updates.$set.nickname &&
            updates.$set.nickname !== existingMember.nickname &&
            (await isNicknameExists(collection, updates.$set.nickname))
        ) {
            return res.status(400).send({ message: "Nickname already exists." });
        }

        if (
            updates.$set.studentID &&
            updates.$set.studentID !== existingMember.studentID &&
            (await isStudentIDExists(collection, updates.$set.studentID))
        ) {
            return res.status(400).send({ message: "Student ID already exists." });
        }

        if (
            updates.$set.email &&
            updates.$set.email !== existingMember.email &&
            (await isEmailExists(collection, updates.$set.email))
        ) {
            return res.status(400).send({ message: "Email already exists." });
        }

        if (
            updates.$set.phoneNumber &&
            updates.$set.phoneNumber !== existingMember.phoneNumber &&
            (await isPhoneNumberExists(collection, updates.$set.phoneNumber))
        ) {
            return res.status(400).send({ message: "Phone Number already exists." });
        }

        // Update Member
        const result = await collection.updateOne(query, updates);
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
