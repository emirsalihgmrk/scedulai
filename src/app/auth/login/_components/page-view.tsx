import AuthBrandPanel from "./auth-brand-panel";
import LoginForm from "./login-form";

export default function PageView() {
  return (
    <>
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with a one-time code sent to your email.
            </p>
          </header>
          <LoginForm />
        </div>
      </main>

      <AuthBrandPanel
        eyebrow="AI Language Tutor"
        title="Pick up where your last conversation left off."
        description="Your tutor remembers the words you missed and builds tomorrow's lesson around them."
      />
    </>
  );
}
