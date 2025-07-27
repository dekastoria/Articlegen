'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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

export default function GeneratePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    topic: '',
    category: '',
    tone: 'professional',
    language: 'English',
    wordCount: 500,
    keywords: '',
    additionalInstructions: '',
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic');
      return false;
    }
    if (formData.topic.length > 200) {
      toast.error('Topic is too long (max 200 characters)');
      return false;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }
    if (formData.additionalInstructions.length > 1000) {
      toast.error('Additional instructions are too long (max 1000 characters)');
      return false;
    }
    if (formData.wordCount < 100 || formData.wordCount > 2000) {
      toast.error('Word count must be between 100 and 2000');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsGenerating(true);
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
    try {
      const keywords = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 10);
      const response = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, keywords }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        throw new Error(data.error || 'Failed to generate article');
      }
      setProgress(100);
      toast.success('Article generated successfully!');
      router.push(`/articles/${data.article.id}`);
    } catch (error) {
      console.error('Error generating article:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate article');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Card className="shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-5 w-5" />
            Article Generation Form
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Fill in the details below to generate your article
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Article Topic */}
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
            {/* Category & Writing Tone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-4">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={value => handleInputChange('category', value)}>
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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
            {/* Language & Word Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-4">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  placeholder="English"
                  value={formData.language}
                  onChange={e => handleInputChange('language', e.target.value)}
                  maxLength={50}
                  className="w-full"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="wordCount">Word Count</Label>
                <Select value={formData.wordCount.toString()} onValueChange={value => handleInputChange('wordCount', parseInt(value))}>
                  <SelectTrigger className="w-full">
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
            {/* Keywords */}
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
            {/* Additional Instructions */}
            <div className="space-y-4">
              <Label htmlFor="additionalInstructions">Additional Instructions</Label>
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
            <Separator />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Estimated time: 30-60 seconds
              </div>
              <Button type="submit" disabled={isGenerating} className="min-w-[180px] text-base h-12">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Article
                  </>
                )}
              </Button>
            </div>
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating your article...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 