export const getActions = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT action_ID, sensor_ID, range_ID, note_ID FROM action_table");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch actions");
    }
};

export const getRanges = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT range_ID, range_name, lower_limit, upper_limit FROM sensor_range");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch ranges");
    }
};

export const getNotes = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT note_ID, note_name, note_location FROM note");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch notes");
    }
};

export const getNoteDetails = async (connection, req, res) => {
    try {
        const { sensor_ID, range_ID } = req.params;
        const [rows] = await connection.execute(
            `SELECT n.note_ID, n.note_name, n.note_location
             FROM note n
             JOIN action_table a ON n.note_ID = a.note_ID
             WHERE a.sensor_ID = ? AND a.range_ID = ?`,
            [sensor_ID, range_ID]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch note details");
    }
};

export const updateRange = async (connection, req, res) => {
    const { range_ID } = req.params;
    const { range_name, lower_limit, upper_limit } = req.body;

    if (!range_name || lower_limit === undefined || upper_limit === undefined) {
        return res.status(400).send("Invalid input data");
    }

    try {
        const [result] = await connection.execute(
            "UPDATE sensor_range SET range_name = ?, lower_limit = ?, upper_limit = ? WHERE range_ID = ?",
            [range_name, lower_limit, upper_limit, range_ID]
        );

        if (result.affectedRows === 0) {
            res.status(404).send("Range not found");
        } else {
            res.send("Range settings updated successfully");
        }
    } catch (error) {
        console.error("Failed to update range settings:", error);
        res.status(500).send("Failed to update range settings");
    }
};

export const getSensorLight = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT * FROM sensor_light");
        res.json(rows);
    } catch (error) {
        console.error("Failed to fetch sensor_light entries:", error);
        res.status(500).send("Failed to fetch sensor_light entries");
    }
};

export const getSensorLightById = async (connection, req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await connection.execute("SELECT * FROM sensor_light WHERE LED_strip_ID = ?", [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send("Sensor light entry not found");
        }
    } catch (error) {
        console.error("Failed to fetch sensor_light entry:", error);
        res.status(500).send("Failed to fetch sensor_light entry");
    }
};

export const createSensorLight = async (connection, req, res) => {
    const { sensor_ID, LED_strip_ID, range_ID, colour_ID } = req.body;

    if (!sensor_ID || !LED_strip_ID || !range_ID || !colour_ID) {
        return res.status(400).send("Invalid input data");
    }

    try {
        const [result] = await connection.execute(
            "INSERT INTO sensor_light (sensor_ID, LED_strip_ID, range_ID, colour_ID) VALUES (?, ?, ?, ?)",
            [sensor_ID, LED_strip_ID, range_ID, colour_ID]
        );
        res.status(201).send(`Sensor light entry created with ID: ${result.insertId}`);
    } catch (error) {
        console.error("Failed to create sensor_light entry:", error);
        res.status(500).send("Failed to create sensor_light entry");
    }
};

export const updateSensorLightColour = async (connection, req, res) => {
    const { LED_strip_ID, range_ID } = req.params;
    const { colour_name } = req.body;

    if (!colour_name) {
        return res.status(400).send("Invalid input data");
    }

    try {
        const [[colour]] = await connection.execute("SELECT colour_ID FROM colour WHERE colour_name = ?", [colour_name]);

        if (!colour) {
            return res.status(404).send("Specified colour does not exist");
        }

        const [result] = await connection.execute(
            "UPDATE sensor_light SET colour_ID = ? WHERE LED_strip_ID = ? AND range_ID = ?",
            [colour.colour_ID, LED_strip_ID, range_ID]
        );

        if (result.affectedRows === 0) {
            res.status(404).send("Sensor light entry not found");
        } else {
            res.send("Sensor light entry updated successfully");
        }
    } catch (error) {
        console.error("Failed to update sensor_light entry:", error);
        res.status(500).send("Failed to update sensor_light entry");
    }
};


export const getSelectedOutput = async (connection, req, res) => {
    const { sensor_ID } = req.params;
    try {
        const [rows] = await connection.execute(
            `SELECT at.range_ID, at.note_ID, at.sensor_ID
             FROM action_table at
             WHERE at.sensor_ID = ?`,
            [sensor_ID]
        );
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).send("No settings found for this sensor");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch selected outputs");
    }
};

export const updateSelectedOutput = async (connection, req, res) => {
    const { sensor_ID } = req.params;
    const { range_outputs } = req.body;

    if (!sensor_ID || !Array.isArray(range_outputs)) {
        return res.status(400).send("Invalid input data");
    }

    try {
        // Delete existing entries for the sensor
        const deleteResult = await connection.execute(
            "DELETE FROM action_table WHERE sensor_ID = ?",
            [sensor_ID]
        );
        console.log(`Deleted ${deleteResult[0].affectedRows} rows for sensor ID ${sensor_ID}`);

        // Insert new entries for the sensor if there are any range outputs specified
        if (range_outputs.length > 0) {
            const insertPromises = range_outputs.map(output => {
                if (output.range_ID && output.note_ID) { // Ensure that range_ID and note_ID are provided
                    return connection.execute(
                        "INSERT INTO action_table (sensor_ID, range_ID, note_ID) VALUES (?, ?, ?)",
                        [sensor_ID, output.range_ID, output.note_ID]
                    );
                }
                return Promise.reject(new Error("Missing range_ID or note_ID in some outputs"));
            });

            const insertResults = await Promise.all(insertPromises);
            insertResults.forEach((result, index) => {
                console.log(`Inserted row for range_ID ${range_outputs[index].range_ID} with note_ID ${range_outputs[index].note_ID}`);
            });
        }

        res.send("Selected outputs updated successfully");
    } catch (error) {
        console.error("Failed to update selected outputs:", error);
        res.status(500).send("Failed to update selected outputs");
    }
};

export const getLightDurations = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT * FROM light_duration");
        res.json(rows);
    } catch (error) {
        console.error("Failed to fetch light_duration entries:", error);
        res.status(500).send("Failed to fetch light_duration entries");
    }
};


export const createLightDuration = async (connection, req, res) => {
    const { duration } = req.body;

    if (!duration) {
        return res.status(400).send("Invalid input data");
    }

    try {
        // Delete all existing entries in the light_duration table
        await connection.execute("DELETE FROM light_duration");

        // Insert the new entry
        const [result] = await connection.execute(
            "INSERT INTO light_duration (duration) VALUES (?)",
            [duration]
        );
        res.status(201).send(`Light duration entry created with ID: ${result.insertId}`);
    } catch (error) {
        console.error("Failed to create light_duration entry:", error);
        res.status(500).send("Failed to create light_duration entry");
    }
};




export const getColours = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT * FROM colour");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch colours");
    }
};

export const getLogs = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT i.sensor_ID, s.sensor_name, i.distance, i.timestamp 
             FROM input i 
             JOIN sensor s ON i.sensor_ID = s.sensor_ID
             ORDER BY i.timestamp DESC
             LIMIT 20`
        );
        res.json(rows);
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        res.status(500).send("Failed to fetch logs");
    }
};

export const getSensorStatus = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT * FROM alive");  // Adjust the query as needed
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).send("Sensor not found");
        }
    } catch (error) {
        console.error("Failed to fetch sensor status:", error);
        res.status(500).send("Failed to fetch sensor status");
    }
};

export const getAllSensorAwakeInfo = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT * FROM all_sensors_status");
        res.json(rows);
    } catch (error) {
        console.error("Failed to fetch sensor_light entries:", error);
        res.status(500).send("Failed to fetch sensor_light entries");
    }
};

export const updateSensorStatus = async (connection, req, res) => {
    const { sensors_on } = req.body;

    if (sensors_on === undefined) {
        return res.status(400).send("Invalid input data");
    }

    try {
        // Delete all existing entries in the all_sensors_status table
        await connection.execute("DELETE FROM all_sensors_status");

        // Insert the new status
        const [result] = await connection.execute(
            "INSERT INTO all_sensors_status (sensors_on) VALUES (?)",
            [sensors_on]
        );

        res.status(201).send(`Sensor status updated with ID: ${result.insertId}`);
    } catch (error) {
        console.error("Failed to update sensor status:", error);
        res.status(500).send("Failed to update sensor status");
    }
};

export const getMute = async (connection, req, res) => {
    try {
        const [rows] = await connection.execute("SELECT * FROM mute");
        res.json(rows);
    } catch (error) {
        console.error("Failed to fetch sensor_light entries:", error);
        res.status(500).send("Failed to fetch sensor_light entries");
    }
};

export const updateMute = async (connection, req, res) => {
    const { muted } = req.body;

    if (muted === undefined) {
        return res.status(400).send("Invalid input data");
    }

    try {
        // Delete all existing entries in the mute table
        await connection.execute("DELETE FROM mute");

        // Insert the new status
        const [result] = await connection.execute(
            "INSERT INTO mute (mute) VALUES (?)",  // Change 'muted' to 'mute' if that is the correct column name
            [muted]
        );

        res.status(201).send(`Mute status updated with ID: ${result.insertId}`);
    } catch (error) {
        console.error("Failed to update mute status:", error);
        res.status(500).send("Failed to update mute status");
    }
};



