export const updateLEDStrip = async (connection, req, res) => {
    const { id } = req.params;
    const { LED_strip_name, LED_alive, LED_active, colour_ID } = req.body;

    if (!LED_strip_name || LED_alive === undefined || LED_active === undefined || !colour_ID) {
        return res.status(400).send("Invalid input data");
    }

    try {
        const [result] = await connection.execute(
            "UPDATE LED_strip SET LED_strip_name = ?, LED_alive = ?, LED_active = ?, colour_ID = ? WHERE LED_strip_ID = ?",
            [LED_strip_name, LED_alive, LED_active, colour_ID, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).send("LED strip not found");
        } else {
            res.send("LED strip updated successfully");
        }
    } catch (error) {
        console.error("Failed to update LED strip:", error);
        res.status(500).send("Failed to update LED strip");
    }
};

export const getLEDStrips = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT * FROM LED_strip");
        res.json(rows);
    } catch (error) {
        console.error("Failed to fetch LED strips:", error);
        res.status(500).send("Failed to fetch LED strips");
    }
};
