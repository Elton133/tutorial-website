import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Video } from '@/lib/types';

export default async function Home() {
  const supabase = await createClient();

  // Fetch all videos from the database
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bouquet Tutorial Platform
            </h1>
            <div className="flex gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                  >
                    Dashboard
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Learn Bouquet Making
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Premium video tutorials to master the art of bouquet creation
          </p>
        </div>
      </div>

      {/* Video Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Available Tutorials
        </h3>
        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video: Video) => (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {video.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ₦{(video.price / 100).toLocaleString()}
                    </span>
                    {video.duration && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.floor(video.duration / 60)}min
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No videos available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
