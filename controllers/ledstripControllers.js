

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
export const updateLedStripStatus = async (connection, req, res) => {
    const { led_strip_name, active, alive, colour_id } = req.body;
    try {
        const [rows] = await connection.execute("SELECT 1 FROM LED_strip WHERE LED_strip_name = ?", [led_strip_name]);
        if (rows.length === 0) {
            if (colour_id === undefined) {
                const [colourRows] = await connection.execute("SELECT colour_ID FROM colour LIMIT 1");
                if (colourRows.length === 0) {
                    res.status(500).send("No default colour_ID found");
                    return;
                }
                colour_id = colourRows[0].colour_ID;
            }
            await connection.execute("INSERT INTO LED_strip (LED_strip_name, LED_alive, LED_active, colour_ID) VALUES (?, ?, ?, ?)", [led_strip_name, alive || 0, active || 0, colour_id]);
            res.status(200).send("LED strip status inserted successfully");
        } else {
            if (active !== undefined) {
                await connection.execute("UPDATE LED_strip SET LED_active = ? WHERE LED_strip_name = ?", [active, led_strip_name]);
            }
            if (alive !== undefined) {
                await connection.execute("UPDATE LED_strip SET LED_alive = ? WHERE LED_strip_name = ?", [alive, led_strip_name]);
            }
            if (colour_id !== undefined) {
                await connection.execute("UPDATE LED_strip SET colour_ID = ? WHERE LED_strip_name = ?", [colour_id, led_strip_name]);
            }
            res.status(200).send("LED strip status updated successfully");
        }
    } catch (error) {
        console.error("Failed to update LED strip status:", error);
        res.status(500).send("Failed to update LED strip status");
    }
};

export const fetchLedStripId = async (connection, req, res) => {
    const { led_strip_name } = req.params;
    try {
        const [rows] = await connection.execute("SELECT LED_strip_ID FROM LED_strip WHERE LED_strip_name = ?", [led_strip_name]);
        if (rows.length > 0) {
            res.json({ led_strip_id: rows[0].LED_strip_ID });
        } else {
            res.status(404).send("LED strip not found");
        }
    } catch (error) {
        console.error("Failed to fetch LED strip ID:", error);
        res.status(500).send("Failed to fetch LED strip ID");
    }
};

export const fetchColourRgb = async (connection, req, res) => {
    const { led_strip_id, range_id } = req.params;
    try {
        const [rows] = await connection.execute(
            `SELECT c.red, c.green, c.blue
             FROM sensor_light sl
             INNER JOIN LED_strip ls ON sl.LED_strip_ID = ls.LED_strip_ID
             INNER JOIN colour c ON sl.colour_ID = c.colour_ID
             WHERE sl.LED_strip_ID = ? AND sl.range_ID = ?`,
            [led_strip_id, range_id]
        );
        if (rows.length > 0) {
            res.json({ colour_rgb: rows[0] });
        } else {
            res.status(404).send("Colour not found");
        }
    } catch (error) {
        console.error("Failed to fetch colour RGB:", error);
        res.status(500).send("Failed to fetch colour RGB");
    }
};
