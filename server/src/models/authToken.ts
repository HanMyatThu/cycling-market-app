import mongoose from "mongoose";

const authTokenSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 86400, //60 * 60 * 24
    default: Date.now(),
  },
});

export const authToken = mongoose.model("authtokens", authTokenSchema);
