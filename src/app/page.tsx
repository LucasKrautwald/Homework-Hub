import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Homework Hub — La IA que organiza tu colegio",
  description:
    "Tareas, proyectos y exámenes en un solo lugar, con un asistente de IA hecho para estudiantes.",
};

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return <LandingPage />;
}
