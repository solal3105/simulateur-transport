import type { MetadataRoute } from 'next'

/** Tout le site est ouvert aux moteurs ; les pages qui ne doivent pas apparaître le disent elles-mêmes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://tcl-2040.com/sitemap.xml',
  }
}
