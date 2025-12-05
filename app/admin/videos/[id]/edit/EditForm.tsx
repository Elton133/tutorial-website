'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Video } from '@/lib/types';

interface EditVideoProps {
  videoId: string;
}

export default function EditVideoPage({ videoId }: EditVideoProps) {
  const [video, setVideo] = useState<Video | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const loadVideo = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        throw new Error('Unauthorized - Admin access required');
      }

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error) throw error;

      setVideo(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setPrice((data.price / 100).toString());
      setCategory(data.category || '');
    } catch (error: unknown) {
      console.error('Error loading video:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const priceInKobo = Math.round(parseFloat(price) * 100);
      if (isNaN(priceInKobo) || priceInKobo < 0) {
        throw new Error('Please enter a valid price');
      }

      const { error: updateError } = await supabase
        .from('videos')
        .update({
          title,
          description,
          price: priceInKobo,
          category: category || null,
        })
        .eq('id', videoId);

      if (updateError) throw updateError;

      router.push('/admin');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error updating video:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while updating the video');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      // Delete video file from storage
      if (video?.video_url) {
        const fileName = video.video_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('videos').remove([fileName]);
        }
      }

      // Delete thumbnail if exists
      if (video?.thumbnail_url) {
        const fileName = video.thumbnail_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('videos').remove([fileName]);
        }
      }

      // Delete video record
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (deleteError) throw deleteError;

      router.push('/admin');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error deleting video:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while deleting the video');
      }
    } finally {
      setDeleting(false);
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

  if (error && !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md shadow-sm hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Edit Video
          </h1>
          <p className="mt-2 text-gray-600">
            Update video details
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 space-y-6"
        >
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4 shadow-sm">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-black"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-black"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-black"
            >
              Description *
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-black"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-black"
            >
              Price (GH$) *
            </label>
            <input
              type="number"
              id="price"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-black"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-black"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-black"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Video'}
              </button>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
