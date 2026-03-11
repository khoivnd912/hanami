import { apiFetch } from "@/lib/fetch";
import { AboutSectionClient, type AboutContent, type ShowcaseItem } from "./AboutSectionClient";

export async function AboutSection() {
  const [content, galleryData] = await Promise.all([
    apiFetch<AboutContent>("/site-content/about"),
    apiFetch<{ items: ShowcaseItem[] }>("/site-content/gallery"),
  ]);
  const showcase = (galleryData?.items ?? []).slice(0, 3);
  return <AboutSectionClient content={content} showcase={showcase} />;
}
