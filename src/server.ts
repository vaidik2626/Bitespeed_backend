import express from "express";
import dotenv from "dotenv";
import { z } from "zod";
import { identify } from "./identify.js";
dotenv.config();

const app = express();
app.use(express.json());

const Body = z.object({
  email: z.string().email().optional().nullable(),
  phoneNumber: z.union([z.string(), z.number()]).optional().nullable()
}).refine(d => d.email || d.phoneNumber, { message: "Provide email or phoneNumber" });

app.post("/identify", async (req, res) => {
  try {
    const parsed = Body.parse(req.body);
    const phone = parsed.phoneNumber != null ? String(parsed.phoneNumber) : null;
    const result = await identify({ email: parsed.email, phoneNumber: phone });
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
