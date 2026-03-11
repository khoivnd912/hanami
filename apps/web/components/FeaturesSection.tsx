import { apiFetch } from "@/lib/fetch";
import { FeaturesSectionClient, type FeatureItem } from "./FeaturesSectionClient";

export async function FeaturesSection() {
  const data = await apiFetch<{ features: FeatureItem[] }>("/site-content/features");
  const features = Array.isArray(data?.features) && data.features.length === 3 ? data.features : null;
  return <FeaturesSectionClient features={features} />;
}
