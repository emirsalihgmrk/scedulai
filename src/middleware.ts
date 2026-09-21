import { NextResponse, type NextRequest } from "next/server";

//DEMO — Bu middleware demo modu için değiştirildi. Aşağıdaki DEMO bloğu
// kaldırılıp yorumdaki gerçek auth mantığı geri açılınca better-auth'a dönülür.
export function middleware(request: NextRequest) {
  //DEMO start — auth kapalı; kimlik demo_user cookie'sinden gelir.
  const { pathname } = request.nextUrl;
  const hasDemoUser = request.cookies.has("demo_user");

  // Kayıt/giriş sayfaları demo'da devre dışı → karşılama ekranına gönder.
  if (pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Dil seçilmeden /programs'a girilmesin.
  if (pathname.startsWith("/programs") && !hasDemoUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
  //DEMO end

  // --- Gerçek auth mantığı (DEMO bloğu silinince aktifleştir) ---
  // import { getSessionCookie } from "better-auth/cookies";
  // const hasSession = getSessionCookie(request);
  // if (hasSession) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/programs";
  //   url.search = "";
  //   return NextResponse.redirect(url);
  // }
  // return NextResponse.next();
}

export const config = {
  //DEMO: /programs matcher demo guard için eklendi (auth'ta yalnız "/auth/:path*" idi).
  matcher: ["/auth/:path*", "/programs/:path*"],
};
