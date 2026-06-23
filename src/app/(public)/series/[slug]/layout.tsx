import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  try {
    const res = await fetch(`${apiUrl}/series/${resolvedParams.slug}`);
    if (res.ok) {
      const series = await res.json();
      
      const title = `${series.title} o'zbek tilida o'qish - ecliptoon`;
      const description = series.description || `ecliptoon orqali ${series.title} manhwasini o'zbek tilida sifatli tarjimada o'qing.`;
      const coverImage = series.cover_image ? `${apiUrl.replace('/api', '')}/storage/${series.cover_image}` : null;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'article',
          images: coverImage ? [coverImage] : [],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: coverImage ? [coverImage] : [],
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch series metadata', error);
  }

  // Fallback
  return {
    title: 'Manhwa o\'qish - ecliptoon',
    description: 'Sevimli manhwa va mangalaringiz o\'zbek tilida!',
  };
}

export default function SeriesLayout({ children }: Props) {
  return <>{children}</>;
}
