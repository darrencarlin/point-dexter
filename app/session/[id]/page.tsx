import ClientSessionPage from "./page.client";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ClientSessionPage id={id} />;
}
