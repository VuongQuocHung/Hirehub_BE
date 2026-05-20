import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    companyName: String,
    email: String,
    password: String, 
    status: String,  // "initial": khởi tạo, "active": hoạt động, "inactive": tạm dừng
  },
  {
    timestamps: true
  }
)
const AccountCompany = mongoose.model('AccountCompany', schema, 'accounts-company');

export default AccountCompany;
