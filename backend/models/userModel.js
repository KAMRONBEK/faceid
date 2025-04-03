import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = mongoose.Schema(
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
      required: true,
      enum: ['student', 'teacher', 'admin'], // Role turlarini cheklash
      default: 'student'
    },
    // Face embedding for student authentication - store only the embedding vector, not the image
    faceEmbedding: {
      type: Array, // Store as array of numbers
      required: function () {
        return this.role === 'student'; // Only required for students
      }
    }
  },
  {
    timestamps: true,
  }
);
// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  // this contain User Oject
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  // if this user obj is not modified mode next
  // else if user obj is create or modified like during update then hash password
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
