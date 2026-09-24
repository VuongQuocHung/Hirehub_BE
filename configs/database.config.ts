import mongoose from 'mongoose';
require('dns').setServers(['8.8.8.8', '8.8.4.4'])


export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.DATABASE}`);
    console.log("ket noi thanh cong");
  } catch (error) {
    console.log("ket noi that bai");
    console.log(error);
  }
}