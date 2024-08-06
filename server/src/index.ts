import express, { Application, RequestHandler } from "express";
import authRouter from "routes/auth";
import { connectDb } from "src/db";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDb();

// api routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Hello from Server",
  });
});

app.listen(8000, () => {
  console.log("Server is connected to port 8000");
});
