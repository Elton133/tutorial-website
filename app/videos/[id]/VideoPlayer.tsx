'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Video } from '@/lib/types';
import type { ComponentType } from 'react';

// Dynamically import ReactPlayer to avoid SSR issues
// Note: Using a minimal type definition for the props we use.
// Full ReactPlayerProps has many more options, but dynamic import complicates type imports.
const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading player...</div>
}) as ComponentType<{
  url: string;
  controls?: boolean;
  width?: string;
  height?: string;
  playing?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
}>;

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayerPage({ videoId }: VideoPlayerProps) {
  const [video, setVideo] = useState<Video | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccessAndLoadVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const checkAccessAndLoadVideo = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch video details
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .maybeSingle();

      console.log('Video query result:', { videoId, videoData, videoError });

      if (videoError) {
        console.error('Video query error:', videoError);
        throw new Error(`Failed to load video: ${videoError.message}`);
      }

      if (!videoData) {
        throw new Error(`Video not found with ID: ${videoId}`);
      }

      setVideo(videoData);

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile query error:', profileError);
      }

      // Admins have access to all videos
      if (profile?.is_admin) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Check if user has an active subscription
      const nowIso = new Date().toISOString();
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('current_period_end', nowIso)
        .maybeSingle();

      if (subscription) {
        setHasAccess(true);
        return;
      }

      // Fallback: if you previously sold one-off purchases, still honour them
      const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .eq('payment_status', 'success')
        .maybeSingle();

      setHasAccess(!!purchase);
    } catch (error: unknown) {
      console.error('Error loading video:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!video) return;

    setPaying(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Initialize monthly subscription with Paystack
      const response = await fetch('/api/subscription/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Subscription initialization failed:', data);
        const errorMessage = data.error || 'Subscription initialization failed';
        throw new Error(errorMessage);
      }

      // Redirect to Paystack payment page
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (error: unknown) {
      console.error('Subscription error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while starting your subscription');
      }
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-black mb-4">Video Not Found</h2>
          <p className="text-red-600 mb-2">{error || 'The video you are looking for does not exist.'}</p>
          <p className="text-gray-600 text-sm mb-6">
            Video ID: <code className="bg-gray-100 px-2 py-1 rounded">{videoId}</code>
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-black text-white rounded-md shadow-sm hover:bg-gray-800"
            >
              Browse Videos
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player or Payment Prompt */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="aspect-video bg-black">
            {hasAccess ? (
              // <ReactPlayer
              //   url={video.video_url}
              //   controls
              //   width="100%"
              //   height="100%"
              // />
              <video
          className="w-full h-full rounded-xl"
          controls
          autoPlay
        >
          <source src={video.video_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center px-4">
                  <svg
                    className="mx-auto h-24 w-24 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <h3 className="mt-4 text-xl font-semibold text-white">
                    Subscription Required
                  </h3>
                  <p className="mt-2 text-gray-300">
                    You need an active subscription to watch this video
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Details */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-black mb-4">
              {video.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {video.description}
            </p>

            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-3xl font-bold text-black">
                  GH$ {(video.price / 100).toLocaleString()}
                </span>
                {video.duration && (
                  <span className="ml-4 text-sm text-gray-500">
                    Duration: {Math.floor(video.duration / 60)} minutes
                  </span>
                )}
              </div>
              {!hasAccess && (
                <button
                  onClick={handleSubscribe}
                  disabled={paying}
                  className="px-6 py-3 bg-black text-white font-semibold rounded-md shadow-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {paying ? 'Processing...' : 'Start Monthly Subscription'}
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md shadow-sm">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
