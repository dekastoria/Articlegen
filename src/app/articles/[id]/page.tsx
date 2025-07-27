import dbConnect from '@/lib/db/mongodb';
import Article from '@/lib/db/models/Article';
import User from '@/lib/db/models/User';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ArticleDetailClient from './ArticleDetailClient';

interface ArticlePageProps {
  params: { id: string };
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
  let safety = 0;
  // Recursive parse jika masih string JSON
  while (safety < 5) {
    safety++;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.content === 'string') {
        raw = parsed.content;
        continue;
      }
    } catch {}
    break;
  }
  // Hapus wrapper JSON jika masih ada { ... } di awal/akhir
  if (/^\{[\s\S]*\}$/.test(raw)) {
    raw = raw.replace(/^\{[\s\S]*?"content"\s*:\s*"/, '').replace(/"[\s\S]*\}\s*$/, '');
  }
  // Normalisasi: pastikan antar paragraf ada double newline
  let normalized = raw
    .replace(/\\n/g, '\n') // escape to real newline
    .replace(/\r\n/g, '\n');
  if (!/\n\n/.test(normalized)) {
    normalized = normalized
      .split('\n')
      .map(line => {
        if (/^\s*(#|\*|\-|\d+\.|>)/.test(line)) return line; // heading, list, blockquote
        if (line.trim() === '') return '';
        return line + '\n';
      })
      .join('\n');
    normalized = normalized.replace(/\n{2,}/g, '\n\n');
  }
  normalized = normalized.replace(/^\{+|\}+$/g, '').trim();
  return normalized;
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