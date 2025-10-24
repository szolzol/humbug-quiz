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

// Skin configuration matching QuestionCard skins
const PACK_SELECTOR_SKINS = {
  standard: {
    background: "hover:bg-accent",
    backgroundSelected: "border-primary bg-primary/5",
    border: "border-border",
    text: "text-foreground",
    textMuted: "text-muted-foreground",
    radio: "",
    badge: "",
    premiumBadge: "bg-amber-500 text-white border-amber-500",
    shimmer: false,
  },
  premium: {
    background:
      "bg-gradient-to-br from-black via-purple-950 to-black border-purple-500/50 hover:border-purple-400/70 hover:shadow-lg hover:shadow-purple-500/20",
    backgroundSelected: "border-purple-400 shadow-lg shadow-purple-500/30",
    border: "border-purple-500/50",
    text: "text-purple-100",
    textMuted: "text-purple-300",
    radio: "border-purple-400 text-purple-400",
    badge: "bg-purple-900/50 text-purple-200 border-purple-500/30",
    premiumBadge:
      "bg-gradient-to-r from-purple-500 to-amber-500 text-white border-none",
    shimmer: true,
  },
  fire: {
    background:
      "bg-gradient-to-br from-black via-red-950 to-black border-red-500/50 hover:border-red-400/70 hover:shadow-lg hover:shadow-red-500/20",
    backgroundSelected: "border-red-400 shadow-lg shadow-red-500/30",
    border: "border-red-500/50",
    text: "text-red-100",
    textMuted: "text-red-300",
    radio: "border-red-400 text-red-400",
    badge: "bg-red-900/50 text-red-200 border-red-500/30",
    premiumBadge:
      "bg-gradient-to-r from-red-500 to-amber-500 text-white border-none",
    shimmer: true,
  },
} as const;

interface QuestionPack {
  id: number;
  slug: string;
  name_en: string;
  name_hu: string;
  description_en: string;
  description_hu: string;
  question_count: number;
  is_active: boolean;
  access_level: "free" | "premium" | "admin_only";
  skin?: "standard" | "premium";
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
      setPacks(fetchedPacks);

      // If current pack (from parent) is not in the new list, switch to first available
      if (fetchedPacks.length > 0) {
        const isCurrentPackAvailable = fetchedPacks.some(
          (p: QuestionPack) => p.slug === currentPack
        );

        if (!isCurrentPackAvailable) {
          const firstPack = fetchedPacks[0].slug;
          if (onPackChange) {
            onPackChange(firstPack);
          }
        }
      }
    } catch (error) {
      console.error("QuestionPackSelector: Error fetching packs:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentPack, onPackChange]);

  // Refetch question packs when authentication state changes
  useEffect(() => {
    fetchQuestionPacks();
  }, [isAuthenticated, fetchQuestionPacks]);

  const handlePackSelect = (packSlug: string) => {
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
            .map((pack) => {
              const isPremium = pack.access_level === "premium";
              const isAdminOnly = pack.access_level === "admin_only";
              const skin =
                PACK_SELECTOR_SKINS[pack.skin || "standard"] ||
                PACK_SELECTOR_SKINS.standard;

              return (
                <div
                  key={pack.slug}
                  className={`
                relative flex items-start space-x-3 rounded-lg border p-4 
                transition-all duration-300 cursor-pointer
                ${skin.background}
                ${
                  currentPack === pack.slug
                    ? skin.backgroundSelected
                    : skin.border
                }
              `}
                  onClick={() => handlePackSelect(pack.slug)}>
                  {/* Shimmer effect for certain skins */}
                  {skin.shimmer && (
                    <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-shimmer" />
                    </div>
                  )}

                  <RadioGroupItem
                    value={pack.slug}
                    id={pack.slug}
                    className={`mt-1 ${skin.radio}`}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={pack.slug}
                      className={`flex items-center gap-2 font-semibold cursor-pointer ${skin.text}`}>
                      {getPackName(pack)}
                      {pack.slug === "horror-tagen-special" && (
                        <span className="text-lg">👻</span>
                      )}
                      <Badge
                        variant="secondary"
                        className={`text-xs ${skin.badge}`}>
                        {pack.question_count}{" "}
                        {t("questionPacks.questions", "questions")}
                      </Badge>
                      {isPremium && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${skin.premiumBadge}`}>
                          ✨ Premium
                        </Badge>
                      )}
                      {isAdminOnly && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none">
                          👑 VIP
                        </Badge>
                      )}
                    </Label>
                    <p className={`text-sm ${skin.textMuted}`}>
                      {getPackDescription(pack)}
                    </p>
                  </div>
                </div>
              );
            })}
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
        className="w-[75vw] sm:w-[400px] md:w-[540px] p-6 pt-12 overflow-y-auto">
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
          <div className="pt-2 overflow-hidden">{renderPackList()}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
