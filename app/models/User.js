import mongoose from "mongoose";
//for storing info in db
const UserSchema = new mongoose.Schema(
  {
    _id: { type: string, required: true },
    nane: { type: string, required: true },
    email: { type: string, required: true },
    image: { type: string, required: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
