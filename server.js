const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
//middleware
app.use(cors());
app.use(express.json());

//database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hoxgz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// connect to database
const run = async () => {
  try {
    await client.connect();
    const database = client.db("Yooda-Hostel");
    const foodsCollection = database.collection("FoodItems");
    const studentsCollection = database.collection("Students");
    const distributionCollection = database.collection("Distributions");

    // console.log("running");

    //foods
    app.get("/foods", async (req, res) => {
      const cursor = await foodsCollection.find({});
      const count = await cursor.count();
      const page = req.query.page;
      const showItems = parseInt(req.query.showPages);
      let result;
      if (page) {
        result = await cursor
          .skip(page * showItems)
          .limit(showItems)
          .toArray();
      } else {
        result = await cursor.toArray();
      }

      res.send({
        count,
        result,
      });
    });
    //get single food
    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });
    //add food
    app.post("/foods", async (req, res) => {
      const doc = req.body;
      const result = await foodsCollection.insertOne(doc);
      res.send(result);
    });
    //delete food
    app.delete("/foods/delete/:id", async (req, res) => {
      const id = req.params.id;
      //   console.log(req.params);
      const query = { _id: ObjectId(id) };
      const result = await foodsCollection.deleteOne(query);
      res.send(result);
    });
    //update
    app.put("/food", async (req, res) => {
      const data = req.body;
      const query = { _id: ObjectId(data.id) };
      const updateDoc = {
        $set: {
          name: data.name,
          price: data.price,
        },
      };

      const result = await foodsCollection.updateOne(query, updateDoc);
      res.json(result);
    });

    //get students
    app.get("/students", async (req, res) => {
      const cursor = await studentsCollection.find({});
      const count = await cursor.count();
      const page = req.query.page;
      const showItems = parseInt(req.query.showPages);
      let result;
      if (page) {
        result = await cursor
          .skip(page * showItems)
          .limit(showItems)
          .toArray();
      } else {
        result = await cursor.toArray();
      }

      res.send({
        count,
        result,
      });
    });
    app.get("/students/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await studentsCollection.findOne(query);
      res.send(result);
    });
    app.put("/students", async (req, res) => {
      const ids = req.body;
      //   console.log(ids);

      ids.forEach(async (element) => {
        const filter = { _id: ObjectId(element) };

        const updateDoc = {
          $set: {
            status: `active`,
          },
        };

        const result = await studentsCollection.updateOne(filter, updateDoc);
        res.send(result);
      });

      //   res.json({ me: "see" });
    });
    app.post("/students", async (req, res) => {
      const doc = req.body;
      const result = await studentsCollection.insertOne(doc);
      res.send(result);
    });
    app.put("/students/inactive", async (req, res) => {
      const ids = req.body;
      //   console.log(ids);

      ids.forEach(async (element) => {
        const filter = { _id: ObjectId(element) };

        const updateDoc = {
          $set: {
            status: `inActive`,
          },
        };

        const result = await studentsCollection.updateOne(filter, updateDoc);
        res.send(result);
      });

      //   res.json({ me: "see" });
    });
    app.delete("/students/:id", async (req, res) => {
      const id = req.params.id;
      //   console.log(req.params);
      const query = { _id: ObjectId(id) };
      const result = await studentsCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/students/search/:roll", async (req, res) => {
      const roll = req.params.roll;
      //   console.log(roll);
      const query = { roll: parseInt(roll) };
      const result = await studentsCollection.find(query).toArray();
      res.send(result);
    });
    //update
    app.put("/student", async (req, res) => {
      const data = req.body;
      const query = { _id: ObjectId(data.id) };
      const updateDoc = {
        $set: {
          name: data.name,
          hall: data.hall,
          class: data.class,
          roll: data.roll,
          age: data.age,
        },
      };

      const result = await studentsCollection.updateOne(query, updateDoc);
      res.json(result);
    });
    //get by roll
    app.get("/student/roll/:roll", async (req, res) => {
      const roll = req.params.roll;
      const query = { roll: roll };
      const result = await studentsCollection.find(query).toArray();
      res.json(result);
    });

    // distribution //
    //get
    app.get("/distribution", async (req, res) => {
      const result = await distributionCollection.find().toArray();
      res.send(result);
    });
    //post
    app.post("/distribution", async (req, res) => {
      const data = req.body;

      const query = {
        studentId: data.studentId,
        date: data.date,
        shift: data.shift,
      };
      const allData = await distributionCollection.find(query).toArray();
      const filter = allData.filter((dt) => dt.studentId === data.studentId);
      let result;
      if (filter.length > 0) {
        res.json({ message: "Already served" });
      } else {
        result = await distributionCollection.insertOne(data);
        res.json(result);
      }
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

//home
app.get("/", (req, res) => {
  res.send("Yooda Hostel is Running");
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
