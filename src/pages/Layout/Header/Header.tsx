import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Bell, Briefcase, LogOut, Monitor, Moon, Settings, Sun, User } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../../store/Auth/Auth";
import { useNavigate } from "react-router-dom";
import { useTheme,type Theme } from "../../../components/theme-provider";

type Tab = "profile" | "setting";

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
];


export function Header() {
  const [tab, setTab] = useState<Tab>("profile");
  const { theme, setTheme } = useTheme();
  const { LogoutZustand } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await LogoutZustand();
    } catch (error) {
      console.log(error);
    }
    navigate("/");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-border">
      <header className="border-b bg-card">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-foreground">
              DebtBook
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>

            <DropdownMenu onOpenChange={() => setTab("profile")}>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                  aria-label="Account menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="https://i.pravatar.cc/80?img=12"
                      alt="Profile"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-72 p-0 overflow-hidden rounded-xl shadow-lg bg-card text-card-foreground border border-border"
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage
                      src="https://i.pravatar.cc/80?img=12"
                      alt="Profile"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      test2
                    </p>
                    <p className="text-xs text-muted-foreground">Owner</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex border-b border-border">
                  <button
                    onClick={() => setTab("profile")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                      tab === "profile"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>

                  <button
                    onClick={() => setTab("setting")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                      tab === "setting"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    Setting
                  </button>
                </div>

                {tab === "profile" && (
                  <div className="py-1">
                    <a href="/myprofile">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer">
                        <User className="h-4 w-4 text-muted-foreground" />
                        My Profile
                      </button>
                    </a>
                  </div>
                )}

                {tab === "setting" && (
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      Theme Mode
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {themeOptions.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all text-sm font-medium cursor-pointer",
                            theme === value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </div>
  );
}