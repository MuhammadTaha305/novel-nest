const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Novel_Inventory';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database collections
let db;
let bookCollections;
let usersCollection;
let chapterCollection;
let userHistoryCollection;
let userLoginsCollection;

const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db("Novel_Inventory");
    bookCollections = db.collection("Novels");
    usersCollection = db.collection("Users");
    chapterCollection = db.collection("Chapters");
    userHistoryCollection = db.collection("userHistory");
    userLoginsCollection = db.collection("userLogins");

    // Ensure indexes for constraints and performance
    // Users: unique email
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    // Books: unique book_title per authorName (fix: use authorName instead of authorId)
    await bookCollections.createIndex({ book_title: 1, authorName: 1 }, { unique: true });
    // Books: index for authorId queries
    await bookCollections.createIndex({ authorId: 1 });
    // Chapters: unique chapterNumber per bookId
    await chapterCollection.createIndex({ bookId: 1, chapterNumber: 1 }, { unique: true });
    // Chapters: index for bookId queries
    await chapterCollection.createIndex({ bookId: 1 });
    // UserHistory: index for userId and bookId queries
    await userHistoryCollection.createIndex({ userId: 1, bookId: 1 });

    return {
      db,
      bookCollections,
      usersCollection,
      chapterCollection,
      userHistoryCollection,
      userLoginsCollection
    };
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return {
    db,
    bookCollections,
    usersCollection,
    chapterCollection,
    userHistoryCollection,
    userLoginsCollection
  };
};

module.exports = {
  connectDB,
  getDB,
  client
};