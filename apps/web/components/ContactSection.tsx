import { apiFetch } from "@/lib/fetch";
import { ContactSectionClient, type ContactInfo } from "./ContactSectionClient";

export async function ContactSection() {
  const [contactData, footerData] = await Promise.all([
    apiFetch<{ contact: ContactInfo }>("/site-content/contact"),
    apiFetch<{ footer?: { facebook?: string } }>("/site-content/footer"),
  ]);
  return (
    <ContactSectionClient
      info={contactData?.contact ?? null}
      facebookUrl={footerData?.footer?.facebook ?? ""}
    />
  );
}
