import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Video, Purchase } from '@/lib/types';

export default async function MyVideosPage() {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-black">
            My Purchased Videos
          </h1>

          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black"
            >
              Browse Videos
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {purchases && purchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase: Purchase & { videos: Video }) => {
              const video = purchase.videos;

              return (
                <Link
                  key={purchase.id}
                  href={`/videos/${video.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 relative">
                    {video.thumbnail_url ? (
                      <Image
                        src={video.thumbnail_url}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-black mb-2">
                      {video.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {video.description}
                    </p>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-600 font-medium">
                        Purchased
                      </span>
                      {video.duration && (
                        <span className="text-gray-500">
                          {Math.floor(video.duration / 60)} min
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-black">
              No videos purchased yet
            </h3>
            <p className="mt-2 text-gray-600">
              Browse our collection to find videos you&apos;d love to learn from.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block px-6 py-3 bg-black text-white font-medium rounded-md shadow-sm hover:bg-gray-800"
            >
              Browse Videos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
