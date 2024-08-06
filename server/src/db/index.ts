import { connect } from "mongoose";
import "dotenv/config";

export const connectDb = async () => {
  try {
    await connect(process.env.DB_URL!);
    console.log("DB is connected");
  } catch (err) {
    console.log("Db connection error", err);
  }
};
