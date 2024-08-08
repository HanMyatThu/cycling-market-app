import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";

interface PassResetToken extends Document {
  owner: mongoose.Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const passResetSchema = new mongoose.Schema<PassResetToken, {}, Methods>({
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
    expires: 3600, //60 * 60
    default: Date.now(),
  },
});

passResetSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const salt = await bcrypt.genSalt(10);
    this.token = await bcrypt.hash(this.token, salt);
  }

  next();
});

passResetSchema.methods.compareToken = async function (
  token: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(token, this.token);
  return isMatch;
};

export const PasswordResetTokenModel = mongoose.model(
  "passwordresettokens",
  passResetSchema
);
