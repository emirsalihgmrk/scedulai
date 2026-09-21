import { Logo } from "@/components/shared/logo";
//DEMO: auth kapalı, kullanıcı menüsü gizli. Auth'a dönerken alttaki satır + <UserMenu /> geri açılır.
// import { UserMenu } from "@/components/shared/user-menu";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex items-center justify-center px-4 py-3 sm:px-6 gap-2">
        <div className="flex items-center gap-2.5">
          <Logo />
        </div>
        <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {/* //DEMO: <UserMenu /> auth geri gelince açılır */}
          {/* //DEMO: demo olduğunu belirten rozet */}
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            Demo
          </span>
        </nav>
      </div>
    </header>
  );
}
