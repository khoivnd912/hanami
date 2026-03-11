import { apiFetch } from "@/lib/fetch";
import { GallerySectionClient, type GalleryItem } from "./GallerySectionClient";

export async function GallerySection() {
  const data = await apiFetch<{ items: GalleryItem[] }>("/site-content/gallery");
  const items = Array.isArray(data?.items) && data.items.length > 0 ? data.items : null;
  return <GallerySectionClient items={items} />;
}
