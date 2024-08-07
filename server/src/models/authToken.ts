import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";

interface AuthTokenDocument extends Document {
  owner: mongoose.Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const authTokenSchema = new mongoose.Schema<AuthTokenDocument, {}, Methods>({
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
