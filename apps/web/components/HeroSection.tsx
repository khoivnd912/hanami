import { apiFetch } from "@/lib/fetch";
import { HeroSectionClient } from "./HeroSectionClient";

export async function HeroSection() {
  const data = await apiFetch<{ heroImageUrl?: string }>("/site-content/hero");
  return <HeroSectionClient imageUrl={data?.heroImageUrl} />;
}
