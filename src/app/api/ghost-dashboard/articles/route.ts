import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Article from '@/lib/db/models/Article';

// Simple in-memory rate limiting for admin operations
const adminRateLimit = new Map<string, { count: number; resetTime: number }>();
function checkAdminRateLimit(userId: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = adminRateLimit.get(userId);
  if (!userLimit || now > userLimit.resetTime) {
    adminRateLimit.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (userLimit.count >= limit) {
    return false;
  }
  userLimit.count++;
  return true;
}
export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    // Check if user is authenticated and is admin
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Rate limiting
    if (!checkAdminRateLimit(session.user.id, 10, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const articles = await Article.find({})
      .populate('author', 'name email')
      .select('-content')
      .sort({ createdAt: -1 });
    return NextResponse.json({
      articles: articles.map(article => ({
        _id: article._id,
        title: article.title,
        author: article.author._id,
        authorName: article.author.name,
        status: article.status,
        createdAt: article.createdAt,
      }))
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    // Check if user is authenticated and is admin
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Rate limiting
    if (!checkAdminRateLimit(session.user.id, 10, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }
    const deletedArticle = await Article.findByIdAndDelete(articleId);
    if (!deletedArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
} 