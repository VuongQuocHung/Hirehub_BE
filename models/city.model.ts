import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: String,
  },
  {
    timestamps: true // Tự động sinh ra trường createdAt và updatedAt
  }
)

const City = mongoose.model('City', schema, 'cities');
export default City;
