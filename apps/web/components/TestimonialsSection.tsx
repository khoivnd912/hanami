import { apiFetch } from "@/lib/fetch";
import { TestimonialsSectionClient, type TestimonialItem } from "./TestimonialsSectionClient";

export async function TestimonialsSection() {
  const data = await apiFetch<{ testimonials: TestimonialItem[] }>("/site-content/testimonials");
  const testimonials = Array.isArray(data?.testimonials) && data.testimonials.length > 0 ? data.testimonials : null;
  return <TestimonialsSectionClient testimonials={testimonials} />;
}
