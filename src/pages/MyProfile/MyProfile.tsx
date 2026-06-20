import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, LogOut, Edit2, Mail, Calendar, Globe, Check, X } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";

import { useMe } from "../../store/me/Me";
import { useAuth } from "../../store/Auth/Auth";
import { ProfileSkeleton } from "./ProfileSkeleton/ProfileSkeleton";

interface ProfileViewProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeLanguage: "en" | "ru" | "tj";
  onChangeLanguage: (lang: "en" | "ru" | "tj") => void;
  onBackToLedger: () => void;
}

export default function ProfileView({
  darkMode,
  onToggleDarkMode,
  activeLanguage,
  onChangeLanguage,
  onBackToLedger,
}: ProfileViewProps) {
  const navigate = useNavigate();

  const {
    user,
    loading,
    error,
    getProfile,
    editProfile,
  } = useMe();

  const { LogoutZustand } = useAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const handleSaveName = async () => {
    if (!tempName.trim() || tempName.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await editProfile({ name: tempName.trim() });
    } catch {
      alert("Failed to update name");
    }

    setIsEditingName(false);
  };

  const handleLogout = async () => {
    await LogoutZustand();
      navigate("/");
  };

  if (loading && !user) return <ProfileSkeleton />;

  return (
    <div className="w-full mx-auto space-y-6 p-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings
          </p>
        </div>

        <Button variant="outline" onClick={onBackToLedger}>
          Back
        </Button>
      </div>

      <Card className="p-6 space-y-4">

        <div className="flex items-center justify-between">
          {isEditingName ? (
            <div className="flex gap-2 w-full">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
              />

              <Button size="icon" onClick={handleSaveName}>
                <Check className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="destructive"
                onClick={() => setIsEditingName(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {user?.name}
              </h2>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setTempName(user?.name || "");
                  setIsEditingName(true);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          {user?.email}
        </div>

        {user?.created_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Joined {new Date(user.created_at).toDateString()}
          </div>
        )}

        <Badge>Owner</Badge>
      </Card>

      <Separator />

      {/* SETTINGS */}
      <Card className="p-6 space-y-6">

        {/* DARK MODE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Dark Mode
          </div>

          <Switch checked={darkMode} onCheckedChange={onToggleDarkMode} />
        </div>

        <Separator />

        {/* LANGUAGE */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Globe className="w-4 h-4" />
            Language
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["en", "ru", "tj"].map((lang) => (
              <Button
                key={lang}
                variant={activeLanguage === lang ? "default" : "outline"}
                onClick={() => onChangeLanguage(lang as any)}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* ERROR */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* LOGOUT */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}