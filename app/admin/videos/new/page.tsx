'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewVideoPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate inputs
      if (!videoFile) {
        throw new Error('Please select a video file');
      }

      const priceInKobo = Math.round(parseFloat(price) * 100);
      if (isNaN(priceInKobo) || priceInKobo < 0) {
        throw new Error('Please enter a valid price');
      }

      // Check if user is admin
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

      setUploadProgress(10);

      // Upload video file to Supabase Storage
      const videoFileName = `${Date.now()}-${videoFile.name}`;
      const { error: videoUploadError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoFile);

      if (videoUploadError) throw videoUploadError;

      setUploadProgress(50);

      // Get public URL for video
      const {
        data: { publicUrl: videoUrl },
      } = supabase.storage.from('videos').getPublicUrl(videoFileName);

      let thumbnailUrl = '';

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const thumbnailFileName = `thumbnails/${Date.now()}-${thumbnailFile.name}`;
        const { error: thumbnailUploadError } =
          await supabase.storage.from('videos').upload(thumbnailFileName, thumbnailFile);

        if (thumbnailUploadError) throw thumbnailUploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('videos').getPublicUrl(thumbnailFileName);
        thumbnailUrl = publicUrl;
      }

      setUploadProgress(75);

      // Create video record in database
      const { error: insertError } = await supabase.from('videos').insert({
        title,
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        price: priceInKobo,
        category: category || null,
      });

      if (insertError) throw insertError;

      setUploadProgress(100);

      // Redirect to admin dashboard
      router.push('/admin');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error creating video:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while creating the video');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Video
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload a new video tutorial to the platform
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6"
        >
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {uploading && (
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Uploading... {uploadProgress}%
                </p>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
              placeholder="e.g., Rose Bouquet Basics"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description *
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
              placeholder="Describe what students will learn..."
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Price (₦) *
            </label>
            <input
              type="number"
              id="price"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
              placeholder="e.g., 5000"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
              placeholder="e.g., Beginner, Advanced"
            />
          </div>

          <div>
            <label
              htmlFor="video"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Video File *
            </label>
            <input
              type="file"
              id="video"
              accept="video/*"
              required
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-900/20 dark:file:text-blue-400"
            />
            {videoFile && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="thumbnail"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Thumbnail Image (Optional)
            </label>
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-900/20 dark:file:text-blue-400"
            />
            {thumbnailFile && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Selected: {thumbnailFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Create Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
