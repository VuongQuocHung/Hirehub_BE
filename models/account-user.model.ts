import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String, 
    status: String,  // "initial": khởi tạo, "active": hoạt động, "inactive": tạm dừng
    googleId: { type: String, default: '' },
    avatar: String,
  },
  {
    timestamps: true
  }
)
const AccountUser = mongoose.model('AccountUser', schema, 'accounts-user');

export default AccountUser;
