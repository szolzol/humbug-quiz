import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowsClockwise, ArrowUpRight } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  category: string;
  sourceUrl?: string;
  sourceName?: string;
}

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
}

// Helper functions for localStorage with language-specific keys
const getStoredFlipState = (questionId: string, language: string): boolean => {
  // Check consent first
  try {
    const consent = localStorage.getItem("cookie_consent");
    if (consent !== "accepted") return false;

    const stored = localStorage.getItem(`flip_${language}_${questionId}`);
    return stored === "true";
  } catch {
    return false;
  }
};

// Check if user has given consent for functional cookies
const hasFunctionalConsent = (): boolean => {
  try {
    const consent = localStorage.getItem("cookie_consent");
    return consent === "accepted";
  } catch {
    return false;
  }
};

const setStoredFlipState = (
  questionId: string,
  language: string,
  isFlipped: boolean
) => {
  if (!hasFunctionalConsent()) return;
  try {
    localStorage.setItem(`flip_${language}_${questionId}`, String(isFlipped));
  } catch {
    // Ignore localStorage errors
  }
};

const getStoredAnswers = (
  questionId: string,
  language: string
): Set<number> => {
  if (!hasFunctionalConsent()) return new Set();
  try {
    const stored = localStorage.getItem(`answers_${language}_${questionId}`);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
};

const setStoredAnswers = (
  questionId: string,
  language: string,
  answers: Set<number>
) => {
  if (!hasFunctionalConsent()) return;
  try {
    localStorage.setItem(
      `answers_${language}_${questionId}`,
      JSON.stringify(Array.from(answers))
    );
  } catch {
    // Ignore localStorage errors
  }
};

export function QuestionCard({ question, index }: QuestionCardProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [isFlipped, setIsFlipped] = useState(() =>
    getStoredFlipState(question.id, currentLanguage)
  );
  const [selectedAnswers, setSelectedAnswers] = useState<Set<number>>(() =>
    getStoredAnswers(question.id, currentLanguage)
  );

  // Reset state when language changes
  useEffect(() => {
    setIsFlipped(getStoredFlipState(question.id, currentLanguage));
    setSelectedAnswers(getStoredAnswers(question.id, currentLanguage));
  }, [currentLanguage, question.id]);

  // Persist flip state to localStorage
  useEffect(() => {
    setStoredFlipState(question.id, currentLanguage, isFlipped);
  }, [isFlipped, question.id, currentLanguage]);

  // Persist selected answers to localStorage
  useEffect(() => {
    setStoredAnswers(question.id, currentLanguage, selectedAnswers);
  }, [selectedAnswers, question.id, currentLanguage]);

  const handleAnswerClick = (e: React.MouseEvent, answerIndex: number) => {
    e.stopPropagation();
    setSelectedAnswers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(answerIndex)) {
        newSet.delete(answerIndex);
      } else {
        newSet.add(answerIndex);
      }
      return newSet;
    });
  };

  // Determine number of columns based on answer count
  const answerCount = question.answers.length;
  const columns =
    answerCount > 20 ? 4 : answerCount > 12 ? 3 : answerCount > 6 ? 2 : 1;

  return (
    <motion.div
      className="relative w-full aspect-[9/16] md:aspect-[4/3] perspective-1000"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}>
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}>
        {/* Flip Button - Always visible on top */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(!isFlipped);
          }}
          className="absolute top-3 right-3 z-50 bg-background/90 hover:bg-background text-foreground rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
          aria-label="Flip card">
          <ArrowsClockwise size={24} weight="bold" />
        </button>

        {/* Front of card */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 border-2 border-accent shadow-xl overflow-hidden"
          style={{ pointerEvents: isFlipped ? "none" : "auto" }}>
          {/* Diagonal HUMBUG! Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="text-primary-foreground/[0.07] font-black text-[6rem] md:text-[10rem] tracking-tighter whitespace-nowrap select-none"
              style={{
                transform: "rotate(-45deg)",
                fontFamily: "Space Grotesk, sans-serif",
              }}>
              HUMBUG!
            </div>
          </div>

          <CardContent className="flex flex-col justify-between h-full p-4 md:p-6 relative z-10">
            {/* Top section with flip instruction and arrow - aligned with button */}
            <div className="flex items-center justify-end pr-14 md:pr-16 text-primary-foreground/80 text-base md:text-base">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-right md:whitespace-nowrap">
                  {t("questions.flipCard")}
                </span>
                <motion.div
                  animate={{
                    x: [0, 5, 0],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}>
                  <ArrowUpRight
                    size={18}
                    weight="bold"
                    className="flex-shrink-0"
                  />
                </motion.div>
              </div>
            </div>

            {/* Center section with question */}
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="text-primary-foreground/80 !text-base md:!text-lg font-bold mb-3 md:mb-4 uppercase tracking-wide">
                {question.category}
              </div>
              <h3 className="text-primary-foreground font-bold !text-xl md:!text-2xl leading-tight px-2 md:px-4">
                {question.question}
              </h3>
            </div>

            {/* Bottom section with answer count and source */}
            <div className="text-center space-y-1">
              <div className="text-primary-foreground/80 text-base md:text-base font-medium">
                {t("questions.totalAnswers", {
                  count: question.answers.length,
                })}
              </div>
              {question.sourceUrl && (
                <div className="text-primary-foreground/60 text-sm">
                  <span>Source: </span>
                  <a
                    href={question.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/80 hover:text-primary-foreground underline transition-colors"
                    onClick={(e) => e.stopPropagation()}>
                    {question.sourceName || "Wikipedia"}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-card border-2 border-border shadow-xl overflow-hidden"
          style={{ pointerEvents: isFlipped ? "auto" : "none" }}>
          {/* Diagonal HUMBUG! Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="text-card-foreground/[0.05] font-black text-[6rem] md:text-[10rem] tracking-tighter whitespace-nowrap select-none"
              style={{
                transform: "rotate(-45deg)",
                fontFamily: "Space Grotesk, sans-serif",
              }}>
              HUMBUG!
            </div>
          </div>

          <CardContent
            className="flex flex-col h-full p-3 md:p-4 relative z-10"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-card-foreground/80 !text-sm md:!text-base font-bold mb-2 uppercase tracking-wide text-center">
              {t("questions.correctAnswers")}
              <span className="ml-2 text-xs md:text-sm font-normal">
                ({selectedAnswers.size} / {question.answers.length})
              </span>
            </div>
            <div
              className={`flex-1 overflow-y-auto pr-1 grid ${
                columns === 4
                  ? "grid-cols-2 md:grid-cols-4"
                  : columns === 3
                  ? "grid-cols-2 md:grid-cols-3"
                  : columns === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              } gap-1.5 md:gap-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent`}>
              {question.answers.map((answer, answerIndex) => (
                <button
                  key={answerIndex}
                  className={`rounded-md px-2 md:px-2.5 py-1.5 md:py-2 text-center text-xs md:text-[11px] cursor-pointer transition-all duration-200 w-full ${
                    selectedAnswers.has(answerIndex)
                      ? "bg-green-500/30 border border-green-500/50"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={(e) => handleAnswerClick(e, answerIndex)}>
                  <span className="text-card-foreground font-medium">
                    {answer}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-muted-foreground text-[10px] md:text-xs text-center leading-tight">
              {t("questions.clickToMark")}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
