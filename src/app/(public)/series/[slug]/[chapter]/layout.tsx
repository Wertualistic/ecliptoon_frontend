import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string; chapter: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  try {
    const res = await fetch(`${apiUrl}/chapters/${resolvedParams.chapter}`);
    if (res.ok) {
      const chapter = await res.json();
      
      const chapterTitle = chapter.title ? ` - ${chapter.title}` : '';
      const pageTitle = `${chapter.series_title} - ${chapter.chapter_number}-bob${chapterTitle} o'zbek tilida o'qish - ecliptoon`;
      const description = `ecliptoon orqali ${chapter.series_title} manhvasining ${chapter.chapter_number}-bobini o'zbek tilida sifatli tarjimada o'qing. O'zbekcha manhva va komikslar platformasi.`;

      const keywords = [
        `${chapter.series_title} ${chapter.chapter_number}-bob`,
        `${chapter.series_title} ${chapter.chapter_number}-bob o'zbekcha`,
        `${chapter.series_title} o'zbekcha manhwa`,
        `${chapter.series_title} o'zbekcha komiks`,
        'o\'zbekcha manhwa',
        'o\'zbekcha komiks',
        'tarjima manhwa'
      ];

      return {
        title: pageTitle,
        description,
        keywords,
        openGraph: {
          title: pageTitle,
          description,
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title: pageTitle,
          description,
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch chapter metadata', error);
  }

  // Fallback
  return {
    title: 'Manhwa o\'qish - ecliptoon',
    description: 'Sevimli manhwa va mangalaringiz o\'zbek tilida!',
  };
}

export default function ChapterLayout({ children }: Props) {
  return <>{children}</>;
}
