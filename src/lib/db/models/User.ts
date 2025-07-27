import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  articlesGenerated: number;
  settings?: {
    language?: string;
    theme?: string;
    notification?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    articlesGenerated: {
      type: Number,
      default: 0,
    },
    settings: {
      language: { type: String, default: 'English' },
      theme: { type: String, default: 'system' },
      notification: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 