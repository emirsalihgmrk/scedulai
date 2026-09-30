"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const result = await signOutAction();
    if (result.ok) {
      router.push("/auth/login");
      router.refresh();
      return;
    }
    setIsSigningOut(false);
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isSigningOut}
      onClick={handleSignOut}
      className="self-start"
    >
      <LogOut />
      Log out
    </Button>
  );
}
