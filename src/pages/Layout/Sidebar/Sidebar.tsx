import { LayoutDashboard, Folder, Landmark, Contact } from "lucide-react";
import { cn } from "../../../lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Debts", icon: Landmark, path: "/debts" },
  { label: "Folders", icon: Folder, path: "/folders" },
  { label: "Contacts", icon: Contact, path: "/contacts" },
];

function NavItem({
  item,
  variant,
}: {
  item: (typeof navItems)[number];
  variant: "sidebar" | "bottom";
}) {
  const Icon = item.icon;
  const isActive =
    typeof window !== "undefined" && window.location.pathname === item.path;

  if (variant === "sidebar") {
    return (
      <a
        href={item.path}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
      </a>
    );
  }

  return (
    <a
      href={item.path}
      className={cn(
        "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center w-10 h-7 rounded-full transition-all",
          isActive ? "bg-primary/10 text-primary" : ""
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
      </span>
      <span className="text-[10px] font-medium leading-none">{item.label}</span>
    </a>
  );
}

export default function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex fixed top-14 left-0 h-[calc(100vh-56px)] w-60 text-sidebar-foreground bg-sidebar border-r border-sidebar-border flex-col">
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.label} item={item} variant="sidebar" />
          ))}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around px-2 h-16 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} variant="bottom" />
        ))}
      </nav>
    </>
  );
}
