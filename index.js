const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8czld.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("emaJohnDb");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    console.log("Database Connected");

    app.get("/products", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const cursor = productCollection.find({});
      
      let products;
      const count = await cursor.count();
      if (page) {
        products = await cursor.skip(page * size).limit(size).toArray();
      }else{
        products = await cursor.toArray();
      }
      
      res.send({ count, products });
    });

    /* POST API BY KEYS */
    app.post("/products/bykeys", async(req, res) => {
      const keys = req.body;
      const query = { key: { $in: keys } };
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    })

    /* ADD ORDERS API */
    app.post("/orders", async(req, res) => {
      const order = req.body;
      console.log("Order", order);
      const result = await orderCollection.insertOne(order);
      res.json(result);
    })
    

  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Ema John app listening on port ${port}`);
});
