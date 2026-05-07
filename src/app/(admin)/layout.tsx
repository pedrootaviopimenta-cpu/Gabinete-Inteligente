import { AppShell } from "@/components/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAuthenticatedUser();

  return <AppShell username={user.username} role={user.role}>{children}</AppShell>;
}
