import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Video } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Card from '@/components/Card';

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
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      
      <Hero />

      {/* Video Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Featured Tutorials
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of professional bouquet-making courses
          </p>
        </div>

        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video: Video) => (
              <Link key={video.id} href={`/videos/${video.id}`}>
                <Card>
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {video.thumbnail_url ? (
                      <Image
                        src={video.thumbnail_url}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                        <svg
                          className="w-16 h-16"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-black mb-2 line-clamp-1">
                      {video.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-2xl font-bold text-black">
                        GH$ {(video.price / 100).toLocaleString()}
                      </span>
                      {video.duration && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {Math.floor(video.duration / 60)} min
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
              <p className="text-gray-600 text-lg mb-2">No tutorials available yet</p>
              <p className="text-gray-500 text-sm">Check back soon for exciting new content!</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Bouquet Tutorial Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
