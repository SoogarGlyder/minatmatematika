// File: src/app/tryout/[topicSlug]/[packetSlug]/page.jsx
// URL beta lama; sekarang tryout terstruktur menjadi mode CBT utama di /cbt/...
import { redirect } from 'next/navigation';

export default async function TryoutRedirect({ params }) {
  const { topicSlug, packetSlug } = await params;
  redirect(`/cbt/${topicSlug}/${packetSlug}`);
}
