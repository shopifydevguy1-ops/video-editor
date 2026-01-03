'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api/client';
import { AspectRatio } from '@ai-video-editor/shared';
import { Sparkles, Loader2 } from 'lucide-react';

export default function GeneratorPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.instance.post<{ projectId: string }>(
        '/generate/video',
        {
          topic: topic.trim(),
          aspectRatio,
        },
      );

      router.push(`/editor/${response.data.projectId}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to generate video. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-10 h-10 text-primary-500" />
              <h1 className="text-4xl font-bold">AI Video Generator</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Generate faceless videos automatically from any topic
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 'How to start a YouTube channel', 'Benefits of meditation', 'Top 5 productivity tips'"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Describe what you want your video to be about
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['16:9', '9:16', '1:1', '4:5'] as AspectRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      disabled={loading}
                      className={`px-4 py-3 rounded border-2 transition ${
                        aspectRatio === ratio
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium">{ratio}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {ratio === '16:9' && 'YouTube, Landscape'}
                        {ratio === '9:16' && 'Shorts, Reels, TikTok'}
                        {ratio === '1:1' && 'Square'}
                        {ratio === '4:5' && 'Instagram Post'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Video
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-gray-700/50 rounded">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ AI generates an engaging script</li>
                <li>✓ Script is broken into scenes</li>
                <li>✓ Text-to-speech narration is created</li>
                <li>✓ Video layers are automatically assembled</li>
                <li>✓ Project opens in editor for customization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

