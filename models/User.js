const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true, trim: true },
  countryCode: { type: String, required: true, trim: true },
  email: {
    type: String, required: true, unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['admin', 'design', 'cashier', 'merchant', 'promotor'], default: 'admin' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  active: { type: Boolean, default: true },
  address:{type: String,  trim: true},
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);