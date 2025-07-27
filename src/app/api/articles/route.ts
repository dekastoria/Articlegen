import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/mongodb';
import Article from '@/lib/db/models/Article';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build query
    const query: { author: string; status?: string; category?: string } = { author: session.user.id };
    if (status) query.status = status;
    if (category) query.category = category;

    // Get articles with pagination
    const skip = (page - 1) * limit;
    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude content for list view

    // Get total count
    const total = await Article.countDocuments(query);

    return NextResponse.json({
      success: true,
      articles: articles.map(article => ({
        id: article._id,
        title: article.title,
        summary: article.summary,
        category: article.category,
        tone: article.tone,
        language: article.language,
        wordCount: article.wordCount,
        readingTime: article.readingTime,
        status: article.status,
        keywords: article.keywords,
        tags: article.tags,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 