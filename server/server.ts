import express, { json } from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import { connectDb } from "./db/db";
import eventRouter from "./routes/eventRoute";

const app = express();
dotenv.config();
const PORT = process.env.PORT;

app.use(json());
app.use("/auth", authRouter);
app.use("/events", eventRouter);
connectDb();

app.listen(PORT, () => {
  console.log(`Server on at port: ${PORT}`);
});

// TODO - Migrate from mongo to PostgreSQL
