'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, FileText, Clock, Hash } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  'Technology', 'Business', 'Health & Wellness', 'Education', 'Entertainment', 'Sports', 'Travel', 'Food & Cooking', 'Science', 'Finance', 'Marketing', 'Lifestyle', 'News', 'Opinion', 'How-to Guide', 'Review', 'Interview', 'Case Study', 'Research', 'Other'
];
const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
];
const wordCounts = [
  { value: 300, label: '300 words (Short)' },
  { value: 500, label: '500 words (Medium)' },
  { value: 800, label: '800 words (Long)' },
  { value: 1200, label: '1200 words (Detailed)' },
  { value: 1500, label: '1500 words (Comprehensive)' },
];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    category: '',
    tone: 'professional',
    language: 'English',
    wordCount: 500,
    keywords: '',
    additionalInstructions: '',
    content: '',
  });

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      const res = await fetch(`/api/articles/${params.id}`);
      const data = await res.json();
      if (data.article) {
        setFormData({
          topic: data.article.title || '',
          category: data.article.category || '',
          tone: data.article.tone || 'professional',
          language: data.article.language || 'English',
          wordCount: data.article.wordCount || 500,
          keywords: (data.article.keywords || []).join(', '),
          additionalInstructions: '',
          content: data.article.content || '',
        });
      }
      setLoading(false);
    }
    if (params.id) fetchArticle();
  }, [params.id]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const keywords = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 10);
      const res = await fetch(`/api/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.topic,
          category: formData.category,
          tone: formData.tone,
          language: formData.language,
          wordCount: formData.wordCount,
          keywords,
          content: formData.content,
        }),
      });
      if (res.ok) {
        toast.success('Article updated!');
        router.push(`/articles/${params.id}`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update article');
      }
    } catch {
      toast.error('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Card className="shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-5 w-5" />
            Edit Article
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Update your article details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="topic">Article Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., The Future of Artificial Intelligence in Healthcare"
                value={formData.topic}
                onChange={e => handleInputChange('topic', e.target.value)}
                maxLength={200}
                required
              />
              <div className="text-xs text-muted-foreground text-right">{formData.topic.length}/200 characters</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={value => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label htmlFor="tone">Writing Tone</Label>
                <Select value={formData.tone} onValueChange={value => handleInputChange('tone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(tone => (
                      <SelectItem key={tone.value} value={tone.value}>{tone.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  placeholder="English"
                  value={formData.language}
                  onChange={e => handleInputChange('language', e.target.value)}
                  maxLength={50}
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="wordCount">Word Count</Label>
                <Select value={formData.wordCount.toString()} onValueChange={value => handleInputChange('wordCount', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {wordCounts.map(wc => (
                      <SelectItem key={wc.value} value={wc.value.toString()}>{wc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <Label htmlFor="keywords" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Keywords (comma-separated, max 10)
              </Label>
              <Input
                id="keywords"
                placeholder="e.g., AI, healthcare, technology, innovation"
                value={formData.keywords}
                onChange={e => handleInputChange('keywords', e.target.value)}
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground">Add relevant keywords to improve SEO optimization (max 10 keywords)</div>
            </div>
            <div className="space-y-4">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Paste or edit your article markdown here..."
                value={formData.content}
                onChange={e => handleInputChange('content', e.target.value)}
                rows={12}
                maxLength={20000}
              />
              <div className="text-xs text-muted-foreground text-right">{formData.content.length}/20000 characters</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="additionalInstructions">Additional Instructions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving || !formData.additionalInstructions.trim()}
                  onClick={async () => {
                    if (!formData.additionalInstructions.trim()) return;
                    setSaving(true);
                    try {
                      const res = await fetch(`/api/articles/${params.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          content: formData.content,
                          instructions: formData.additionalInstructions,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok && data.improved) {
                        setFormData(prev => ({ ...prev, content: data.improved }));
                        toast.success('Article rewritten with AI!');
                      } else {
                        toast.error(data.error || 'Failed to rewrite with AI');
                      }
                    } catch {
                      toast.error('Failed to rewrite with AI');
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Rewrite with AI
                </Button>
              </div>
              <Textarea
                id="additionalInstructions"
                placeholder="Any specific requirements, style preferences, or additional context..."
                value={formData.additionalInstructions}
                onChange={e => handleInputChange('additionalInstructions', e.target.value)}
                rows={3}
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground text-right">{formData.additionalInstructions.length}/1000 characters</div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Estimated time: 10-30 seconds
              </div>
              <Button type="submit" disabled={saving} className="min-w-[180px] text-base h-12">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 