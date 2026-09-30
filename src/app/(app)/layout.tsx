import { redirect } from "next/navigation";

import Header from "@/components/shared/header";
import { getCurrentUser } from "@/services/auth";
import { getCurrentLearningProfileService } from "@/services/learning-profile";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentLearningProfileService(),
  ]);
  if (user && !profile) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {children}
    </div>
  );
}
