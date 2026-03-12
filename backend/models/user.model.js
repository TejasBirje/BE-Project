import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer"],
      required: true,
    },
    avatar: {
      type: String,
    },
    // URL string kept for quick display / download
    resume: {
      type: String,
    },
    // ObjectId reference to the Resume document (for ATS, interview etc.)
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    companyName: {
      type: String,
    },
    companyDescription: {
      type: String,
    },
    companyLogo: {
      type: String,
    },
  },
  { timestamps: true }
);

// Encrypt password before saving
// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// Compare entered password with hashed password
// userSchema.methods.matchPassword = function (enteredPassword) {
//     return bcrypt.compare(enteredPassword, this.password);
// };

const User = mongoose.model("User", userSchema);
export default User;
