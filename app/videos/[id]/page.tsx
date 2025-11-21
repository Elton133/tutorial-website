import VideoPlayer from './VideoPlayer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;
  return <VideoPlayer videoId={id} />;
}
