import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ecliptoon.uz';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // Fetch all series slugs
  let seriesUrls: MetadataRoute.Sitemap = [];
  try {
    const seriesRes = await fetch(`${apiUrl}/series`, { next: { revalidate: 3600 } });
    if (seriesRes.ok) {
      const data = await seriesRes.json();
      const seriesList = Array.isArray(data) ? data : data.data || [];
      seriesUrls = seriesList.map((s: any) => ({
        url: `${baseUrl}/series/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error('Failed to fetch series for sitemap', err);
  }

  // Fetch all news ids
  let newsUrls: MetadataRoute.Sitemap = [];
  try {
    const newsRes = await fetch(`${apiUrl}/news`, { next: { revalidate: 3600 } });
    if (newsRes.ok) {
      const data = await newsRes.json();
      const newsList = Array.isArray(data) ? data : data.data || [];
      newsUrls = newsList.map((n: any) => ({
        url: `${baseUrl}/news/${n.id}`,
        lastModified: new Date(n.created_at || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch (err) {
    console.error('Failed to fetch news for sitemap', err);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/translators`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...seriesUrls,
    ...newsUrls,
  ];
}
