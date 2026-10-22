import express from "express"
import pg from "pg"
const app = express();

app.use(express.json());

const pool = new pg.Pool({
    host: "localhost",
    port: 5433,
    user: "bedtracker",
    password: "devpassword",
    database: "bedtracker",
    connectionTimeoutMillis: 3000
});

async function main() {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");

        console.log("database connected successfully.");
        console.log("Database time:", result.rows[0].current_time);
    } catch (error: unknown) {
        console.error("Database connection/query failed: ");

        if(error instanceof Error)
            console.error(error.message);
        else
            console.error("Unknown error:", error);

        process.exitCode = 1;
    } finally {
        pool.end();
    }
}

main();

app.get("/health", function (req, res){
    res.status(200).json({
        "status": "All good!"
    });
});

// app.post("/wards", function (req, res) {
//     const bed = req.body;

// });

// app.get("/wards", function (req, res) {

// });

// app.post("/wards:/wardId/beds", function (req, res) {

// });

// app.get("/wards/:wardId/beds", function (req, res) {

// });

// app.patch("/beds/:id/status", function(req, res) {

// });

app.listen(3000, function() {
    console.log("Server running on port 3000");
});