import AuthBrandPanel from "./_components/auth-brand-panel";
import LoginForm from "./_components/login-form";
import LoginIntro from "./_components/login-intro";

export default function Page() {
  return (
    <>
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <LoginIntro />
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
