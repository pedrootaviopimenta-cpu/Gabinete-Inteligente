"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  SquareCheckBig
} from "lucide-react";
import { modules } from "@/lib/modules";

const icons = {
  oficios: FileText,
  "ministerio-publico": ShieldCheck,
  pareceres: Scale,
  "normas-municipais": ScrollText,
  checklists: SquareCheckBig
};

export function AppShell({
  children,
  username
}: Readonly<{ children: React.ReactNode; username: string }>) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gi-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-gi-navy text-gi-white shadow-premium lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gi-gold/40 bg-white/10 text-gi-gold">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gi-white">Gabinete Inteligente</p>
                <p className="text-xs font-medium text-gi-gold">GI Municipal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegação principal">
            <NavLink href="/dashboard" icon={LayoutDashboard} label="Painel" pathname={pathname} />
            <NavLink
              href="/admin/solicitacoes"
              icon={ClipboardList}
              label="Solicitações"
              pathname={pathname}
            />
            {modules.map((module) => {
              const Icon = icons[module.slug];

              return (
                <NavLink
                  key={module.slug}
                  href={module.href}
                  icon={Icon}
                  label={module.shortName}
                  pathname={pathname}
                />
              );
            })}
            <NavLink
              href="/configuracoes"
              icon={Settings}
              label="Configurações"
              pathname={pathname}
            />
          </nav>

          <div className="border-t border-white/10 p-3">
            <div className="mb-3 rounded-md border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gi-gold">
                Usuário autorizado
              </p>
              <p className="mt-1 truncate text-sm text-white/82">{username}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="group flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-white/78 transition hover:bg-white/10 hover:text-gi-white gi-focus-ring"
            >
              <LogOut className="h-4 w-4 text-gi-gold/85 group-hover:text-gi-gold" aria-hidden={true} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-gi-line bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1 border-l-4 border-gi-gold pl-4">
            <p className="gi-eyebrow">
              Plataforma de apoio institucional
            </p>
            <p className="text-sm text-gi-muted">
              Produção documental assistida, governança e revisão humana obrigatória.
            </p>
          </div>
        </header>

        <div className="border-b border-gi-line bg-gi-navy px-4 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto" aria-label="Navegação compacta">
            <MobileLink href="/dashboard" label="Painel" pathname={pathname} />
            <MobileLink href="/admin/solicitacoes" label="Solicitações" pathname={pathname} />
            {modules.map((module) => (
              <MobileLink
                key={module.slug}
                href={module.href}
                label={module.shortName}
                pathname={pathname}
              />
            ))}
            <MobileLink href="/configuracoes" label="Configurações" pathname={pathname} />
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex h-9 flex-none items-center rounded-md border border-white/15 bg-white/5 px-3 text-sm font-medium text-white/85 transition hover:border-gi-gold hover:bg-white/10 gi-focus-ring"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}

type NavLinkProps = {
  href: Route;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  pathname: string;
};

function NavLink({ href, icon: Icon, label, pathname }: NavLinkProps) {
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`group flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition gi-focus-ring ${
        isActive
          ? "bg-gi-gold text-gi-navy shadow-sm"
          : "text-white/78 hover:bg-white/10 hover:text-gi-white"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${isActive ? "text-gi-navy" : "text-gi-gold/85 group-hover:text-gi-gold"}`}
        aria-hidden={true}
      />
      <span>{label}</span>
    </Link>
  );
}

function MobileLink({ href, label, pathname }: { href: Route; label: string; pathname: string }) {
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex h-9 flex-none items-center rounded-md border px-3 text-sm font-medium transition gi-focus-ring ${
        isActive
          ? "border-gi-gold bg-gi-gold text-gi-navy"
          : "border-white/15 bg-white/5 text-white/85"
      }`}
    >
      {label}
    </Link>
  );
}
