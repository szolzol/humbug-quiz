import { useState, useEffect } from "react";
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
  currentPack = "us-starter-pack",
  variant = "hamburger",
}: QuestionPackSelectorProps) {
  const { t, i18n } = useTranslation();
  const [packs, setPacks] = useState<QuestionPack[]>([]);
  const [selectedPack, setSelectedPack] = useState(currentPack);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentLang = i18n.language as "en" | "hu";

  useEffect(() => {
    fetchQuestionPacks();
  }, []);

  const fetchQuestionPacks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/question-sets");
      if (!response.ok) throw new Error("Failed to fetch question packs");
      const data = await response.json();
      setPacks(data.questionSets || []);
    } catch (error) {
      console.error("Error fetching question packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackSelect = (packSlug: string) => {
    setSelectedPack(packSlug);
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
      <RadioGroup value={selectedPack} onValueChange={handlePackSelect}>
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
                  selectedPack === pack.slug
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
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {t("questionPacks.selectPack", "Select Question Pack")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              "questionPacks.selectDescription",
              "Choose which question pack you want to play with"
            )}
          </p>
        </div>
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
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{t("questionPacks.title", "Question Packs")}</SheetTitle>
          <SheetDescription>
            {t(
              "questionPacks.description",
              "Select which question pack you want to play with"
            )}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">{renderPackList()}</div>
      </SheetContent>
    </Sheet>
  );
}
