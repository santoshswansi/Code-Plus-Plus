import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { executeCode } from "./execute.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/run", async (req, res) => {
    const { language, code, input } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: "Language and code are required!" });
    }

    try {
        const output = await executeCode(language, code, input);
        res.json({ output });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = 4001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
