import dbConnect from '@/lib/db/mongodb';
import Article from '@/lib/db/models/Article';
import User from '@/lib/db/models/User';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ArticleDetailClient from './ArticleDetailClient';
interface ArticlePageProps {
  params: Promise<{ id: string }>;
}
type ArticleDoc = {
  _id: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  category: string;
  tone: string;
  language: string;
  wordCount: number;
  status: string;
  author: { name?: string } | null;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
};
function extractContent(content: string): string {
  let raw = content;
  
  // Coba parse JSON terlebih dahulu
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.content === 'string') {
      raw = parsed.content;
      console.log('Successfully extracted content from JSON');
    }
  } catch (error) {
    console.log('Content is not JSON, trying to extract manually');
    
    // Coba ekstrak content manual dari format yang mirip JSON
    const contentMatch = raw.match(/"content"\s*:\s*"([\s\S]*?)"\s*,\s*"summary"/);
    if (contentMatch && contentMatch[1]) {
      raw = contentMatch[1];
      console.log('Successfully extracted content manually');
    }
  }
  
  // Normalisasi: pastikan antar paragraf ada double newline
  const normalized = raw
    .replace(/\\n/g, '\n') // escape to real newline
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n'); // maksimal 2 newline berturut-turut
    
  console.log('Content length after extraction:', normalized.length);
  return normalized.trim();
}
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();
  const article = await Article.findById(id).lean();
  if (!article) return {};
  const a = article as unknown as ArticleDoc;
  return {
    title: a.seoTitle || a.title,
    description: a.seoDescription || a.summary,
  };
}
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  await dbConnect();
  const article = await Article.findById(id).populate('author').lean();
  if (!article) return notFound();
  // Convert to plain object for client component
  const plainArticle = JSON.parse(JSON.stringify(article));
  const cleanContent = extractContent(plainArticle.content);
  return <ArticleDetailClient article={plainArticle} cleanContent={cleanContent} />;
} 