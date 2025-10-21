import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import {
  User,
  Crown,
  Trophy,
  CheckCircle2,
  PlayCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ChevronLeft,
  Save,
} from "lucide-react";

interface ProfileData {
  profile: {
    id: string;
    email: string;
    name: string;
    nickname: string | null;
    picture: string;
    role: "free" | "premium" | "admin" | "creator";
    createdAt: string;
  };
  packProgress: Array<{
    id: string;
    slug: string;
    nameEn: string;
    nameHu: string;
    playedCount: number;
    completedCount: number;
    totalQuestions: number;
  }>;
  stats: {
    totalPlayed: number;
    totalCompleted: number;
    thumbsUpGiven: number;
    thumbsDownGiven: number;
  };
}

export default function PlayerProfile() {
  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    fetchProfile();
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfileData(data);
      setNickname(data.profile.nickname || data.profile.name);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(t("profile.errorLoading") || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      setError(t("profile.nicknameRequired") || "Nickname is required");
      return;
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update nickname");
      }

      setSuccess(t("profile.nicknameSaved") || "Nickname saved successfully!");

      // Refresh profile data
      await fetchProfile();
    } catch (err: any) {
      console.error("Error saving nickname:", err);
      setError(
        err.message || t("profile.errorSaving") || "Failed to save nickname"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 hover:bg-red-600";
      case "creator":
        return "bg-purple-500 hover:bg-purple-600";
      case "premium":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
      case "creator":
        return <Crown className="w-3 h-3" />;
      case "premium":
        return <Trophy className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert>
          <AlertDescription>
            {error || "Failed to load profile"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { profile, packProgress, stats } = profileData;
  const currentLang = i18n.language;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            {t("profile.backToQuiz") || "Back to Quiz"}
          </Button>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={profile.picture}
                alt={profile.name}
                className="w-20 h-20 rounded-full border-4 border-primary/20"
              />
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">
                  {t("profile.title") || "Player Profile"}
                </CardTitle>
                <CardDescription className="text-base">
                  {profile.email}
                </CardDescription>
                <Badge
                  className={`mt-2 ${getRoleBadgeColor(
                    profile.role
                  )} text-white`}>
                  <span className="flex items-center gap-1">
                    {getRoleIcon(profile.role)}
                    {profile.role.toUpperCase()}
                  </span>
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nickname */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("profile.nickname") || "Nickname"}
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={
                    t("profile.nicknamePlaceholder") || "Enter your nickname"
                  }
                  maxLength={20}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveNickname}
                  disabled={
                    isSaving ||
                    !nickname.trim() ||
                    nickname === profile.nickname
                  }
                  className="gap-2">
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t("profile.save") || "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("profile.nicknameHint") ||
                  "3-20 characters, letters, numbers, spaces, and underscores only"}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 text-green-700 dark:text-green-400">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {t("profile.overallStats") || "Overall Statistics"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <PlayCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.totalPlayed}</div>
                <div className="text-sm text-muted-foreground">
                  {t("profile.played") || "Played"}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{stats.totalCompleted}</div>
                <div className="text-sm text-muted-foreground">
                  {t("profile.completed") || "Completed"}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10">
                <ThumbsUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stats.thumbsUpGiven}</div>
                <div className="text-sm text-muted-foreground">
                  {t("profile.thumbsUp") || "Thumbs Up"}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-500/10">
                <ThumbsDown className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">
                  {stats.thumbsDownGiven}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("profile.thumbsDown") || "Thumbs Down"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pack Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {t("profile.packProgress") || "Progress by Card Pack"}
            </CardTitle>
            <CardDescription>
              {t("profile.packProgressDesc") ||
                "Track your progress across different question sets"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {packProgress.map((pack) => {
                const playedPercent =
                  (pack.playedCount / pack.totalQuestions) * 100;
                const completedPercent =
                  (pack.completedCount / pack.totalQuestions) * 100;
                const packName =
                  currentLang === "hu" ? pack.nameHu : pack.nameEn;

                return (
                  <div
                    key={pack.id}
                    className="space-y-2 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{packName}</h3>
                      <Badge variant="outline">
                        {pack.completedCount}/{pack.totalQuestions}
                      </Badge>
                    </div>

                    {/* Played Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" />
                          {t("profile.played") || "Played"}
                        </span>
                        <span>
                          {pack.playedCount}/{pack.totalQuestions}
                        </span>
                      </div>
                      <Progress value={playedPercent} className="h-2" />
                    </div>

                    {/* Completed Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("profile.completed") || "Completed"}
                        </span>
                        <span>
                          {pack.completedCount}/{pack.totalQuestions}
                        </span>
                      </div>
                      <Progress
                        value={completedPercent}
                        className="h-2"
                        // @ts-ignore - custom indicator color
                        indicatorClassName="bg-green-500"
                      />
                    </div>
                  </div>
                );
              })}

              {packProgress.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t("profile.noProgress") ||
                    "No progress yet. Start playing to see your stats!"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Member Since */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              {t("profile.memberSince") || "Member since"}{" "}
              <span className="font-medium">
                {new Date(profile.createdAt).toLocaleDateString(currentLang)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
