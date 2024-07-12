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
