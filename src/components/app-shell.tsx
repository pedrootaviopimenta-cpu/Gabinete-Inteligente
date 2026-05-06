import Link from "next/link";
import type { Route } from "next";
import {
  Building2,
  FileText,
  LayoutDashboard,
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

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gi-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-gi-line bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gi-line px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gi-navy text-white">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gi-ink">Gabinete Inteligente</p>
                <p className="text-xs text-gi-muted">GI Municipal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegação principal">
            <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            {modules.map((module) => {
              const Icon = icons[module.slug];

              return (
                <NavLink
                  key={module.slug}
                  href={module.href}
                  icon={Icon}
                  label={module.shortName}
                />
              );
            })}
            <NavLink href="/configuracoes" icon={Settings} label="Configurações" />
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-gi-line bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gi-teal">
              Plataforma de apoio institucional
            </p>
            <p className="text-sm text-gi-muted">
              Minutas, normas e checklists com revisão humana obrigatória.
            </p>
          </div>
        </header>

        <div className="border-b border-gi-line bg-white px-4 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto" aria-label="Navegação compacta">
            <MobileLink href="/dashboard" label="Dashboard" />
            {modules.map((module) => (
              <MobileLink key={module.slug} href={module.href} label={module.shortName} />
            ))}
            <MobileLink href="/configuracoes" label="Configurações" />
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
};

function NavLink({ href, icon: Icon, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-gi-ink transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-gi-teal"
    >
      <Icon className="h-4 w-4 text-gi-muted" aria-hidden={true} />
      <span>{label}</span>
    </Link>
  );
}

function MobileLink({ href, label }: { href: Route; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-9 flex-none items-center rounded-md border border-gi-line px-3 text-sm font-medium text-gi-ink"
    >
      {label}
    </Link>
  );
}
