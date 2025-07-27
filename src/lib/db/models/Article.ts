import mongoose from 'mongoose';

export interface IArticle {
  _id: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  category: string;
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  language: string;
  wordCount: number;
  status: 'draft' | 'published' | 'archived';
  author: mongoose.Types.ObjectId;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new mongoose.Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    keywords: [{
      type: String,
      trim: true,
    }],
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tone: {
      type: String,
      enum: ['professional', 'casual', 'friendly', 'formal'],
      default: 'professional',
    },
    language: {
      type: String,
      default: 'English',
    },
    wordCount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    featuredImage: {
      type: String,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate reading time before saving
articleSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Index for better query performance
articleSchema.index({ author: 1, createdAt: -1 });
articleSchema.index({ status: 1, category: 1 });
articleSchema.index({ keywords: 1 });

export default mongoose.models.Article || mongoose.model<IArticle>('Article', articleSchema); 