import { redirect } from "next/navigation";

// Sign-up is the last step of onboarding; kept for old links.
export default function Page() {
  redirect("/onboarding");
}
