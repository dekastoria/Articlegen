"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

export default function AiIdeasPage() {
  const [topic, setTopic] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getIdeas = async () => {
    setLoading(true);
    setError("");
    setTitles([]);
    setKeywords([]);
    try {
      const res = await fetch("/api/ai-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error("Failed to get ideas");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setTitles([]);
        setKeywords([]);
        return;
      }
      setTitles(data.titles || []);
      setKeywords(data.keywords || []);
    } catch (e: unknown) {
      if (typeof e === "object" && e && "message" in e) {
        setError((e as { message?: string }).message || "Unknown error");
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Ideas Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Optional: Topic or niche (e.g. crypto, health, etc)"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              disabled={loading}
            />
            <Button onClick={getIdeas} disabled={loading}>
              {loading ? "Loading..." : "Get Ideas"}
            </Button>
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {titles.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Rekomendasi Judul Artikel</h3>
              <ul className="list-decimal pl-5 space-y-1">
                {titles.map((title, i) => (
                  <li key={i}>{title}</li>
                ))}
              </ul>
            </div>
          )}
          {keywords.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">SEO Keywords</h3>
              <ul className="list-disc pl-5 flex flex-wrap gap-x-4 gap-y-1">
                {keywords.map((kw, i) => (
                  <li key={i}>{kw}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 