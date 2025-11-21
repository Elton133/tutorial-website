'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Video } from '@/lib/types';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

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
        .single();

      if (videoError) throw videoError;
      setVideo(videoData);

      // Check if user has purchased this video
      const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .eq('payment_status', 'success')
        .single();

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

  const handlePayment = async () => {
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

      // Initialize payment with Paystack
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: video.id,
          amount: video.price,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Redirect to Paystack payment page
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (error: unknown) {
      console.error('Payment error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while processing payment');
      }
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Video not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player or Payment Prompt */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-video bg-black">
            {hasAccess ? (
              <ReactPlayer
                url={video.video_url}
                controls
                width="100%"
                height="100%"
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      disablePictureInPicture: true,
                    },
                  },
                }}
              />
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
                    Purchase Required
                  </h3>
                  <p className="mt-2 text-gray-300">
                    You need to purchase this video to watch it
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Details */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {video.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {video.description}
            </p>

            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₦{(video.price / 100).toLocaleString()}
                </span>
                {video.duration && (
                  <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                    Duration: {Math.floor(video.duration / 60)} minutes
                  </span>
                )}
              </div>
              {!hasAccess && (
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {paying ? 'Processing...' : 'Purchase Now'}
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
