import { MetadataRoute } from 'next'
import { getMassages, getTherapists } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://magnolialunar.pt'

  const massages = await getMassages() as any[]
  const therapists = await getTherapists() as any[]

  const massageUrls = massages.map((massage) => ({
    url: `${baseUrl}/massagens/${massage.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const therapistUrls = therapists.map((therapist) => ({
    url: `${baseUrl}/terapeutas/${therapist.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/massagens`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terapeutas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...massageUrls,
    ...therapistUrls,
  ]
}
