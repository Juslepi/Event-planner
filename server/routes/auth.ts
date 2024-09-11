import express from "express";
import bcrypt from "bcrypt";
import { getDb } from "../db/db";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const authRouter = express.Router();
const secretKey = process.env.SECRET;

const getUserCollection = () => {
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
  const encryptedPassword = await bcrypt.hash(password, 10);

  const collection = getUserCollection();

  // Check for existing user
  let user;
  try {
    user = await collection.findOne({ username });
  } catch (error) {
    console.error(error);
  }
  if (user) {
    return res.send("Username already exists");
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
