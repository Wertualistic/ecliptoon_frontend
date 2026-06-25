import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  try {
    const res = await fetch(`${apiUrl}/news/${resolvedParams.id}`);
    if (res.ok) {
      const news = await res.json();
      
      const title = `${news.title} - ecliptoon Yangiliklar`;
      const description = news.content ? news.content.substring(0, 160) : 'ecliptoon platformasidagi eng so\'nggi yangiliklar.';
      const imageUrl = news.image_url ? `${apiUrl.replace(/\/api$/, '')}/storage/${news.image_url}` : null;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'article',
          images: imageUrl ? [imageUrl] : [],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: imageUrl ? [imageUrl] : [],
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch news metadata', error);
  }

  // Fallback
  return {
    title: 'Yangiliklar - ecliptoon',
    description: 'ecliptoon platformasidagi eng so\'nggi yangiliklar.',
  };
}

export default function NewsLayout({ children }: Props) {
  return <>{children}</>;
}
