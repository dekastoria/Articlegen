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

    // Get user's articles
    const articles = await Article.find({ author: session.user.id });

    // Calculate stats
    const totalArticles = articles.length;
    const publishedArticles = articles.filter(article => article.status === 'published').length;
    const draftArticles = articles.filter(article => article.status === 'draft').length;
    const totalWords = articles.reduce((sum, article) => sum + article.wordCount, 0);
    const averageReadingTime = totalArticles > 0 
      ? Math.round(articles.reduce((sum, article) => sum + article.readingTime, 0) / totalArticles)
      : 0;

    // Get most used category
    const categoryCounts: { [key: string]: number } = {};
    articles.forEach(article => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });
    
    const mostUsedCategory = Object.keys(categoryCounts).length > 0
      ? Object.entries(categoryCounts).reduce((a, b) => categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b)[0]
      : 'None';

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalWords,
        averageReadingTime,
        mostUsedCategory,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 