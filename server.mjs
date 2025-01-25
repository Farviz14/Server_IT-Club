import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import members from "./routes/members.mjs";
import admins from "./routes/admins.mjs";
import calendar from "./routes/calendar.mjs"; // Import the calendar routes
import attendance from "./routes/attendance.mjs"; // Import attendance routes


dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

// Increase the request size limit to handle large payloads (e.g., Base64 images)
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Middleware
app.use(cors());

// Routes
app.use("/members", members);
app.use("/admins", admins);
app.use("/calendar", calendar); // Add the calendar routes
app.use("/attendance", attendance); // Use attendance routes


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
