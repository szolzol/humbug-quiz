import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { BackgroundMusicPlayer } from "@/components/BackgroundMusicPlayer";
import humbugMainTheme from "@/assets/audio/humbug_main_theme.mp3";

interface QuestionPack {
  id: number;
  slug: string;
  name_en: string;
  name_hu: string;
  description_en: string;
  description_hu: string;
  question_count: number;
  is_active: boolean;
}

interface QuestionPackSelectorProps {
  onPackChange?: (packSlug: string) => void;
  currentPack?: string;
  variant?: "hamburger" | "inline";
}

export function QuestionPackSelector({
  onPackChange,
  currentPack = "international",
  variant = "hamburger",
}: QuestionPackSelectorProps) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [packs, setPacks] = useState<QuestionPack[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentLang = i18n.language as "en" | "hu";

  // Memoize fetchQuestionPacks to prevent unnecessary re-renders
  const fetchQuestionPacks = useCallback(async () => {
    try {
      setLoading(true);
      // Add timestamp cache-buster to ensure fresh data
      const timestamp = Date.now();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/api/question-sets?_t=${timestamp}`;
      console.log(`📦 QuestionPackSelector: Fetching packs from: ${url}`);
      console.log(`   Current pack prop: ${currentPack}`);
      console.log(`   Auth state: ${isAuthenticated}`);

      const response = await fetch(url, {
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch question packs");
      const data = await response.json();
      const fetchedPacks = data.questionSets || [];
      console.log(
        `✅ QuestionPackSelector: Fetched ${fetchedPacks.length} packs:`,
        fetchedPacks.map((p) => p.slug)
      );
      console.log(`   API says isAuthenticated: ${data.isAuthenticated}`);
      setPacks(fetchedPacks);

      // If current pack (from parent) is not in the new list, switch to first available
      if (fetchedPacks.length > 0) {
        const isCurrentPackAvailable = fetchedPacks.some(
          (p: QuestionPack) => p.slug === currentPack
        );
        console.log(
          `   Current pack "${currentPack}" available in fetched packs: ${isCurrentPackAvailable}`
        );

        if (!isCurrentPackAvailable) {
          const firstPack = fetchedPacks[0].slug;
          console.log(
            `   🔀 QuestionPackSelector: Current pack not available, switching from "${currentPack}" to "${firstPack}"`
          );
          if (onPackChange) {
            console.log(
              `   📞 QuestionPackSelector: Calling onPackChange("${firstPack}")`
            );
            onPackChange(firstPack);
          } else {
            console.warn(
              `   ⚠️ QuestionPackSelector: onPackChange callback is not defined!`
            );
          }
        } else {
          console.log(
            `   ✅ QuestionPackSelector: Current pack "${currentPack}" is still available, no change needed`
          );
        }
      } else {
        console.log(`   ⚠️ No packs available!`);
      }
    } catch (error) {
      console.error("QuestionPackSelector: Error fetching packs:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentPack, onPackChange]);

  // Refetch question packs when authentication state changes
  useEffect(() => {
    console.log(
      `🔐 QuestionPackSelector: Auth changed, isAuthenticated = ${isAuthenticated}`
    );
    fetchQuestionPacks();
  }, [isAuthenticated, fetchQuestionPacks]);

  const handlePackSelect = (packSlug: string) => {
    console.log(`📦 QuestionPackSelector: User selected pack: ${packSlug}`);
    if (onPackChange) {
      onPackChange(packSlug);
    }
    if (variant === "hamburger") {
      setIsOpen(false);
    }
  };

  const getPackName = (pack: QuestionPack) => {
    return currentLang === "hu" ? pack.name_hu : pack.name_en;
  };

  const getPackDescription = (pack: QuestionPack) => {
    return currentLang === "hu" ? pack.description_hu : pack.description_en;
  };

  const renderPackList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (packs.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {t("questionPacks.noPacks", "No question packs available")}
        </div>
      );
    }

    return (
      <RadioGroup value={currentPack} onValueChange={handlePackSelect}>
        <div className="space-y-4">
          {packs
            .filter((pack) => pack.is_active)
            .map((pack) => (
              <div
                key={pack.slug}
                className={`
                relative flex items-start space-x-3 rounded-lg border p-4 
                transition-colors hover:bg-accent cursor-pointer
                ${
                  currentPack === pack.slug
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }
              `}
                onClick={() => handlePackSelect(pack.slug)}>
                <RadioGroupItem
                  value={pack.slug}
                  id={pack.slug}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={pack.slug}
                    className="flex items-center gap-2 font-semibold cursor-pointer">
                    {getPackName(pack)}
                    <Badge variant="secondary" className="text-xs">
                      {pack.question_count}{" "}
                      {t("questionPacks.questions", "questions")}
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {getPackDescription(pack)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </RadioGroup>
    );
  };

  if (variant === "inline") {
    return (
      <div className="w-full">
        {/* Removed title and description as per user request */}
        {renderPackList()}
      </div>
    );
  }

  // Hamburger menu variant
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Menu className="h-5 w-5" />
          <span className="sr-only">
            {t("questionPacks.menu", "Question packs menu")}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[75vw] sm:w-[400px] md:w-[540px] p-6 pt-12">
        {/* Background Music Player - at the top */}
        <div className="mb-4">
          <BackgroundMusicPlayer
            src={humbugMainTheme}
            title={t("questions.backgroundMusic")}
          />
        </div>

        <Separator className="my-4" />

        {/* Question Packs Section */}
        <div className="space-y-4">
          <SheetHeader>
            <SheetTitle>
              {t("questionPacks.title", "Question Packs")}
            </SheetTitle>
            <SheetDescription>
              {t(
                "questionPacks.description",
                "Select which question pack you want to play with"
              )}
            </SheetDescription>
          </SheetHeader>

          {/* Question Packs List */}
          <div className="pt-2">{renderPackList()}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
