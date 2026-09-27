import { NavTabs } from "@/components/shared/nav-tabs";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex items-center justify-center px-4 py-3 sm:px-6">
        <NavTabs />
      </div>
    </header>
  );
}
