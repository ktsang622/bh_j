import { redirect } from 'next/navigation';

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Redirect to main entries page (which now shows the form)
  redirect(`/kids/${id}/entries`);
}
