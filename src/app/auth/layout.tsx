export default function Layout({ children }: LayoutProps<"/auth">) {
  return <div className="grid min-h-svh lg:grid-cols-2">{children}</div>;
}