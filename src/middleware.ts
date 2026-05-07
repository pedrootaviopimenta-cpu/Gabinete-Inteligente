import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyEdgeSessionToken } from "@/lib/edge-session";

const restrictedApiError = "Acesso restrito a usuários autorizados.";

const protectedPagePaths = [
  "/dashboard",
  "/oficios",
  "/ministerio-publico",
  "/pareceres",
  "/normas-municipais",
  "/checklists",
  "/configuracoes",
  "/minhas-solicitacoes",
  "/admin"
];

const protectedApiPaths = [
  "/api/document-requests",
  "/api/ai/draft",
  "/api/admin"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = await verifyEdgeSessionToken(
    request.cookies.get(AUTH_COOKIE_NAME)?.value
  );

  if (pathname === "/login" && isAuthenticated) {
    return withNoStoreHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  if (isProtectedApiPath(pathname) && !isAuthenticated) {
    return withNoStoreHeaders(
      NextResponse.json({ error: restrictedApiError }, { status: 401 })
    );
  }

  if (isProtectedPagePath(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return withNoStoreHeaders(NextResponse.redirect(loginUrl));
  }

  const response = NextResponse.next();

  if (isProtectedPagePath(pathname) || isProtectedApiPath(pathname) || pathname === "/login") {
    return withNoStoreHeaders(response);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/oficios/:path*",
    "/ministerio-publico/:path*",
    "/pareceres/:path*",
    "/normas-municipais/:path*",
    "/checklists/:path*",
    "/configuracoes/:path*",
    "/minhas-solicitacoes/:path*",
    "/admin/:path*",
    "/login",
    "/api/document-requests/:path*",
    "/api/ai/draft/:path*",
    "/api/admin/:path*"
  ]
};

function isProtectedPagePath(pathname: string) {
  return protectedPagePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isProtectedApiPath(pathname: string) {
  return protectedApiPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function withNoStoreHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}
