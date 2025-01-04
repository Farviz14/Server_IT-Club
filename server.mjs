import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import members from "./routes/members.mjs";
import admins from "./routes/admins.mjs";

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/members", members);
app.use("/admins", admins);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
