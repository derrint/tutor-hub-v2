import TutorHubSignInForm from "@/components/auth/TutorHubSignInForm";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tutorHub.auth");

  return { title: `${t("title")} | TutorHub` };
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error, callbackUrl } = await searchParams;

  return (
    <TutorHubSignInForm error={error ?? null} callbackUrl={callbackUrl ?? null} />
  );
}
