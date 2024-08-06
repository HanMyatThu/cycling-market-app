import bcrypt from "bcryptjs";
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

authTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const salt = await bcrypt.genSalt(10);
    this.token = await bcrypt.hash(this.token, salt);
  }

  next();
});

authTokenSchema.methods.compareToken = async function (
  token: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(token, this.token);
  return isMatch;
};

export const authToken = mongoose.model("authtokens", authTokenSchema);
