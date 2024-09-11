import { MongoClient, Db, ServerApiVersion } from "mongodb";

let db: Db;
let uri = "mongodb://0.0.0.0:27017/";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectDb = async () => {
  if (!db) {
    await client.connect();
    db = client.db("event_planner");
    console.log("DB Connected.");
  }

  return db;
};

const getDb = () => {
  if (!db) {
    throw new Error("DB not connected.");
  }

  return db;
};

export { connectDb, getDb };
