"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { signOutUser } from "@/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
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
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
      >
        <img
          src="https://api.dicebear.com/10.x/critters/svg?mouthVariant=smile&seed=8mxqcxk1"
          alt="avatar"
          className="size-9 shrink-0 rounded-full border-2 border-border bg-muted object-cover ring-2 ring-primary/20"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">
              {user?.name ?? "Account"}
            </span>
            {user?.email && (
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onClick={handleSignOut}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
