'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User as UserIcon, Hash, Copy } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

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

export default function ArticleDetailClient({ article, cleanContent }: { article: ArticleDoc; cleanContent: string }) {
  const [tab, setTab] = useState<'view' | 'html'>('view');
  const htmlCode = cleanContent.replace(/\n/g, '<br/>');
  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    toast.success('HTML code copied!');
  };
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">{article.title}</CardTitle>
          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(article.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {article.author?.name || 'Unknown'}
            </span>
            <span className="capitalize">{article.tone}</span>
            <span>{article.wordCount} words</span>
            <Badge variant="outline">{article.category}</Badge>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {article.keywords?.map((keyword: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                <Hash className="h-3 w-3 mr-1" />{keyword}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-t-md font-medium border-b-2 ${tab === 'view' ? 'border-primary text-primary bg-muted' : 'border-transparent text-muted-foreground bg-transparent'}`}
              onClick={() => setTab('view')}
            >
              View
            </button>
            <button
              className={`px-4 py-2 rounded-t-md font-medium border-b-2 ${tab === 'html' ? 'border-primary text-primary bg-muted' : 'border-transparent text-muted-foreground bg-transparent'}`}
              onClick={() => setTab('html')}
            >
              HTML Code
            </button>
          </div>
          {/* Tab Content */}
          {tab === 'view' ? (
            <div className="prose prose-lg max-w-none mb-6">
              <p className="italic text-muted-foreground mb-4">{article.summary}</p>
              <ReactMarkdown>{cleanContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">HTML Code</span>
                <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1 rounded bg-muted hover:bg-primary/10 text-xs font-medium">
                  <Copy className="h-4 w-4" /> Copy
                </button>
              </div>
              <textarea
                className="w-full rounded border p-2 font-mono text-xs bg-muted"
                rows={Math.max(10, Math.min(30, htmlCode.split('<br/>').length + 2))}
                value={htmlCode}
                readOnly
              />
            </div>
          )}
          {article.seoTitle && (
            <div className="mt-8 border-t pt-4 text-xs text-muted-foreground">
              <div><b>SEO Title:</b> {article.seoTitle}</div>
              <div><b>SEO Description:</b> {article.seoDescription}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 