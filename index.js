const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.guksi.mongodb.net/book-catalog?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const bookCollection = client.db("book-catalog").collection("book");

    app.get("/books", async (req, res) => {
      const cursor = bookCollection.find({});
      const book = await cursor.toArray();
      res.send({ status: true, data: book });
    });

    app.post("/book", async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    // Fetch the latest 10 books
    app.get("/books/latest", async (req, res) => {
      try {
        const latestBooks = await bookCollection
          .find({})
          .sort({ _id: -1 })
          .limit(10)
          .toArray();
        res.json(latestBooks);
      } catch (error) {
        console.error("Failed to fetch latest books:", error);
        res.status(500).json({ message: "Failed to fetch latest books" });
      }
    });

    app.post("/addBook", async (req, res) => {
      const book = req.body;
      try {
        const result = await bookCollection.insertOne(book);
        if (result.insertedCount === 1) {
          const insertedBook = result.ops[0];
          console.log("Book added successfully");
          res.json(insertedBook);
        } else {
          console.error("Failed to add book");
          res.json({ error: "Failed to add book" });
        }
      } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // app.post("/addBook", async (req, res) => {
    //   const {
        // title,
        // author,
        // genre,
        // publication_date,
        // price,
        // rating,
        // status,
        // features,
    //   } = req.body;

    //   try {
    //     const result = await bookCollection.insertOne({
    //       title,
    //       author,
    //       genre,
    //       publication_date,
    //       price,
    //       rating,
    //       status,
    //       features,
    //     });

    //     if (result.insertedCount === 1) {
    //       const insertedBook = result.ops[0]; // Get the inserted book object

    //       console.log("Book added successfully");
    //       res.json(insertedBook);
    //     } else {
    //       console.error("Failed to add book");
    //       res.json({ error: "Failed to add book" });
    //     }
    //   } catch (error) {
    //     console.error("Error adding book:", error);
    //     res.status(500).json({ error: "Internal server error" });
    //   }
    // });

    app.get("/comment/:id", async (req, res) => {
      const bookId = req.params.id;
      const result = await bookCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
