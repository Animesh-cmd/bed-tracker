import express from "express"
import pg from "pg"
const app = express();

app.use(express.json());

const STATUS = ['available', 'occupied', 'maintenance', 'reserved'];

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
    }
}

main();

app.get("/health", function (_req, res){
    res.status(200).json({
        "status": "All good!"
    });
});

app.post("/wards", async function (req, res) {
    const { name } = req.body;
    if(!name) return res.status(400).json({
        error: "Name is required"
    });

    const {rows} = await pool.query("INSERT INTO wards (name) VALUES ($1) RETURNING *", [name]);

    res.status(201).json(rows[0]);

});

app.get("/wards", async function (_req, res) {
    try {
        const { rows } = await pool.query("SELECT * FROM wards ORDER BY name")
        res.json(rows);
    } catch (error) {
        console.error("Error while fetching data: ", error);
        res.status(500).json({
            error: "Failed to fetch data."
        });
    }
});

app.post("/wards/:wardId/beds", async function (req, res) {
    const { label } = req.body;
    if(!label) return res.status(400).json({
        error: "label is required"
    });

    const { rows } = await pool.query(
        "INSERT INTO beds (ward_id, label) VALUES ($1, $2) RETURNING *",
        [req.params.wardId, label]
    );

    res.status(200).json(rows[0]);
});

app.get("/wards/:wardId/beds", async function (req, res) {
    const { rows } = await pool.query(
        "SELECT * FROM beds WHERE ward_id = $1 ORDER by label", 
        [req.params.wardId]
    );

    res.json(rows);
});

app.patch("/beds/:id/status", async function(req, res) {
    const { status, updatedBy} = req.body;
    if(!STATUS.includes(status))
        return res.status(400).json({
            error: `status must be one of ${STATUS}`
        });

    const time = await pool.query("SELECT NOW() AS current_time");
    const updated_at = time.rows[0].current_time;

    const { rows } = await pool.query(
        `UPDATE beds
        SET status = $1, updated_by = $2, updated_at = $3, version = version + 1
        WHERE id = $4
        RETURNING *`,
        [status, updatedBy ?? null, updated_at, req.params.id]
    );
});

app.listen(3000, function() {
    console.log("Server running on port 3000");
});