import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    jobId: String,
    fullName: String,
    email: String,
    phone: String,
    fileCV: String,
    viewed: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: "initial"
    }
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const CV = mongoose.model('CV', schema, "cvs");

export default CV;
