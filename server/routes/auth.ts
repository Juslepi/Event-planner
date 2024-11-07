import express from "express";
import bcrypt from "bcrypt";
import { getDb } from "../db/db";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const authRouter = express.Router();
const secretKey = process.env.SECRET;

export const getUserCollection = () => {
  const db = getDb();
  const collection = db.collection("users");
  return collection;
};

if (!secretKey) {
  throw new Error("Failed to load environment variables");
}

// Register
authRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || username.length < 4) {
    res.status(400).send("Username must be at least 4 characters");
  }
  else if (!password || password.length < 6) {
    res.status(400).send("Password must be at least 6 characters");
  }
  const encryptedPassword = await bcrypt.hash(password, 10);

  
  // Check for existing user
  const collection = getUserCollection();
  let user;
  try {
    user = await collection.findOne({ username });
  } catch (error) {
    res.status(500).send("Server error");
    console.error(error);
  }

  if (user) {
    return res.status(409).send("Username already exists");
  }

  try {
    collection.insertOne({ username, password: encryptedPassword });
    res.status(201).send("User created");
  } catch (error) {
    res.status(500).send("Server error");
    console.error(error);
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !passowrd ) {
    res.status(400).send("Invalid credentials");
  }
  const collection = getUserCollection();

  const user = await collection.findOne({ username: username });
  if (!user) {
    return res.send("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (isValidPassword) {
    const token = jwt.sign({ user }, secretKey);
    res.send(token);
  } else {
    res.status(401).send("Invalid credentials");
  }
});

export default authRouter;
