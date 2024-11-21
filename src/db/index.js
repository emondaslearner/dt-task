const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL);
const port = process.env.PORT || 8000;

let collection = null;

// mongo db connection
async function connectToMongo(app) {
  try {
    await client.connect();

    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log("Application running at port 8000");
    });

    const db = client.db("dt-task");
    collection = {
      events: db.collection("events")
    };

    return collection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

// get collections
const getCollection = () => {
  if (!collection) {
    throw new Error(
      "Collection not initialized. Please call connectToMongo first."
    );
  }
  return collection;
};

module.exports = { connectToMongo, getCollection };
