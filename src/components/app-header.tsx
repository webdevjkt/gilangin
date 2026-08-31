import { Link, useRouterState } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

export function AppHeader() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none">ServisKu</h1>
            <p className="text-xs text-muted-foreground">Booking & Antrian Pekerja</p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className={`rounded-md px-3 py-1.5 transition-colors ${
              path === "/" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Booking
          </Link>
          <Link
            to="/admin"
            className={`rounded-md px-3 py-1.5 transition-colors ${
              path === "/admin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Dashboard Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
