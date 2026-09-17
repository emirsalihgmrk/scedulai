import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/shared/user-menu";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo />
        </div>
        <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
