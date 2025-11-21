import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Video, Purchase } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's purchased videos
  const { data: purchases } = await supabase
    .from('purchases')
    .select(`
      *,
      videos (*)
    `)
    .eq('user_id', user.id)
    .eq('payment_status', 'success')
    .order('created_at', { ascending: false });

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Dashboard
            </h1>
            <div className="flex gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
              >
                Browse Videos
              </Link>
              {profile?.is_admin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Admin Panel
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Information
          </h2>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            {profile?.full_name && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Name:</span> {profile.full_name}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Role:</span>{' '}
              {profile?.is_admin ? 'Administrator' : 'User'}
            </p>
          </div>
        </div>

        {/* Purchased Videos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            My Purchased Videos
          </h2>
          {purchases && purchases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((purchase: Purchase & { videos: Video }) => {
                const video = purchase.videos;
                return (
                  <Link
                    key={purchase.id}
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {video.description}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Purchased
                        </span>
                        {video.duration && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {Math.floor(video.duration / 60)}min
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No videos purchased yet
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Browse our collection to find videos you&apos;d like to learn from
              </p>
              <Link
                href="/"
                className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Browse Videos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
