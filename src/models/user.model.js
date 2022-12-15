const { USER_ROLES } = "../helpers/constants";
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

var userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    deposit: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

/**
 * Check if userName is taken
 * @param {string} userName - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isUserNameTaken = async function (userName, excludeUserId) {
  const user = await this.findOne({
    $and: [
      { userName, _id: { $ne: excludeUserId } },
      { userName: { $ne: null } },
    ],
  });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
userSchema.statics.isPasswordMatch = async function (password, hash) {
  return await bcrypt.compare(password, hash);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
