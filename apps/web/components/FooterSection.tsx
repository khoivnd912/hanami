import { apiFetch } from "@/lib/fetch";
import { FooterSectionClient, type FooterContent } from "./FooterSectionClient";

export async function FooterSection() {
  const data = await apiFetch<{ footer: FooterContent }>("/site-content/footer");
  return <FooterSectionClient content={data?.footer ?? null} />;
}
