import { redirect } from "next/navigation";
//DEMO: dil seçilmemişse karşılama ekranı göster. Auth'a dönerken bu blok kaldırılır.
import { readDemoUser } from "@/lib/demo";
import { WelcomeScreen } from "@/app/_components/welcome-screen";

export default async function Page() {
  //DEMO start
  const demoUser = await readDemoUser();
  if (!demoUser) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <WelcomeScreen />
      </div>
    );
  }
  //DEMO end

  redirect("/programs");
}
