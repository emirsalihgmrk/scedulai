import AccountView from "./_components/account-view";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-semibold text-foreground">Account</h1>
      <AccountView />
    </main>
  );
}
