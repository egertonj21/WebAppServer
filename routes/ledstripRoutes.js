import express from "express";
import { updateLEDStrip, getLEDStrips } from "../controllers/ledstripControllers.js";

const router = express.Router();

export default (connection) => {
    router.put("/:id", (req, res) => updateLEDStrip(connection, req, res));
    router.get("/", (req, res) => getLEDStrips(connection, req, res));

    return router;
};
