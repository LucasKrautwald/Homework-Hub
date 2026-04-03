import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-16 sm:px-6">
        {children}
      </main>
    </>
  );
}
