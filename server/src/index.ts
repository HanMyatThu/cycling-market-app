import express, { Application } from "express";
import { connectDb } from "src/db";
import "dotenv/config";

import authRouter from "routes/auth";
import productRouter from "routes/product";

const app: Application = express();

app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDb();

// api routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Hello from Server",
  });
});

app.listen(8000, () => {
  console.log("Server is connected to port 8000");
});
