"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { signOutUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default function AccountView() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;

  const handleSignOut = async () => {
    setSigningOut(true);
    const result = await signOutUser();
    if (result.ok) {
      router.push("/auth/login");
      router.refresh();
      return;
    }
    setSigningOut(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">
          {user?.name ?? "Account"}
        </span>
        {user?.email && (
          <span className="text-sm text-muted-foreground">{user.email}</span>
        )}
      </div>
      <Button
        variant="destructive"
        size="sm"
        disabled={signingOut}
        onClick={handleSignOut}
        className="self-start"
      >
        <LogOut />
        Log out
      </Button>
    </div>
  );
}
