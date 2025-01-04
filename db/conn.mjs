import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://127.0.0.1:27017");

let conn;
try {
    console.log("Connecting to Local MongoDB");
    conn = await client.connect();
    console.log("Connected successfully to MongoDB");
} catch (e) {
    console.error("Failed to connect to MongoDB", e);
    process.exit(1); // Exit the process with an error code
}

const db = conn.db("it_club");

client.on('serverOpening', () => console.log('MongoDB server connection opened'));
client.on('serverClosed', () => console.log('MongoDB server connection closed'));
client.on('serverDescriptionChanged', (event) => console.log('MongoDB server description changed:', event));

export default db;
