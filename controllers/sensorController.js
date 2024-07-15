import { broadcast } from "../server.js";

export const getSensors = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT sensor_ID, sensor_name FROM sensor");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch sensors");
    }
};

export const logSensorData = async (connection, req, res) => {
    const { sensor_ID, distance } = req.body;

    console.log(`Received payload: sensor_ID=${sensor_ID}, distance=${distance}`);

    // Validate the sensor_ID and distance
    if (sensor_ID === undefined || distance === undefined) {
        console.error("Invalid input data: sensor_ID or distance is undefined");
        return res.status(400).send("Invalid input data: sensor_ID or distance is undefined");
    }

    try {
        await connection.execute("INSERT INTO input (sensor_ID, distance, timestamp) VALUES (?, ?, NOW())", [sensor_ID, distance]);

        const [rows] = await connection.execute(
            `SELECT i.sensor_ID, s.sensor_name, i.distance, i.timestamp 
             FROM input i 
             JOIN sensor s ON i.sensor_ID = s.sensor_ID
             ORDER BY i.timestamp DESC
             LIMIT 10`
        );
        broadcast(rows);

        res.status(200).send("Sensor data logged successfully");
    } catch (error) {
        console.error("Failed to log sensor data:", error);
        if (!res.headersSent) {
            res.status(500).send("Failed to log sensor data");
        }
    }
};


export const updateSensorStatus = async (connection, req, res) => {
    const { sensor_id, active, awake } = req.body;
    try {
        const [rows] = await connection.execute("SELECT 1 FROM alive WHERE sensor_ID = ?", [sensor_id]);
        if (rows.length === 0) {
            await connection.execute("INSERT INTO alive (sensor_ID, active, awake) VALUES (?, ?, ?)", [sensor_id, active || 0, awake || 0]);
            res.status(200).send("Sensor status inserted successfully");
        } else {
            if (active !== undefined) {
                await connection.execute("UPDATE alive SET active = ? WHERE sensor_ID = ?", [active, sensor_id]);
            }
            if (awake !== undefined) {
                await connection.execute("UPDATE alive SET awake = ? WHERE sensor_ID = ?", [awake, sensor_id]);
            }
            res.status(200).send("Sensor status updated successfully");
        }
    } catch (error) {
        console.error("Failed to update sensor status:", error);
        res.status(500).send("Failed to update sensor status");
    }
};

export const fetchSensorRanges = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT range_ID, lower_limit, upper_limit FROM sensor_range");
        res.json(rows);
    } catch (error) {
        console.error("Failed to fetch sensor ranges:", error);
        res.status(500).send("Failed to fetch sensor ranges");
    }
};

export const fetchLightDuration = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT duration FROM light_duration WHERE light_duration_ID = 1");
        if (rows.length > 0) {
            res.json({ duration: rows[0].duration });
        } else {
            res.status(404).send("No duration found");
        }
    } catch (error) {
        console.error("Failed to fetch light duration:", error);
        res.status(500).send("Failed to fetch light duration");
    }
};
