import type { MetadataRoute } from "next";
import { socialMedias } from "./server/get-texts-by-slugs";

export default function sitemap(): MetadataRoute.Sitemap {
  const socialMediaEntries: MetadataRoute.Sitemap = socialMedias.map(
    (media) => ({
      url: `https://www.projectinbio.com/recursos/link-na-bio-para-${media}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.5,
    })
  );

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: "https://www.projectinbio.com/",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  return [...staticEntries, ...socialMediaEntries];
}
