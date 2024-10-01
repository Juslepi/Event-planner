import express from "express";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { getDb } from "../db/db";
import { getUserCollection } from "./auth";

const eventRouter = express.Router();
const SECRET = process.env.SECRET;

if (!SECRET) {
  throw new Error("Env variables missing");
}

const getEventCollection = () => {
  const db = getDb();
  const collection = db.collection("events");
  return collection;
};

// Get all events
eventRouter.get("/", async (req, res) => {
  const collection = getEventCollection();
  const events = await collection.find({}).toArray();
  res.send(events);
});

// GET current events created by user
eventRouter.get("/userEvents", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.send("Unauhtorized");
    throw new Error("Token missing");
  }

  const payload = await jwt.verify(token, SECRET);
  let userId;
  if (typeof payload === "object") {
    userId = payload.user._id;
  }

  const collection = getEventCollection();
  const events = await collection.find({ user: userId }).toArray();

  res.send(events);
});

// POST user event
eventRouter.post("/", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(500).send("Unauthorized");
    throw new Error("Token missing");
  }

  const payload = await jwt.verify(token, SECRET);
  let userId;
  if (typeof payload === "object") {
    userId = payload.user._id;
  }

  const collection = getEventCollection();
  const events = await collection.find({ user: userId }).toArray();

  const { title } = req.body;

  const newEvent = {
    title,
    user: userId,
    attendees: [],
  };

  // Data verification
  if (!title) {
    return res.status(401).send("Needs a title");
  }
  // Verify user
  const userCollection = getUserCollection();
  const user = userCollection.findOne({ _id: userId });
  if (!user) {
    return res.status(401).send("Invalid user");
  }

  try {
     await collection.insertOne(newEvent);
  } catch (error) {
    console.error(error);
  }

  res.status(201).send(newEvent);
});

export default eventRouter;
