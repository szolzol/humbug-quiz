import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowsClockwise, ArrowUpRight } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  category: string;
  sourceUrl?: string;
  sourceName?: string;
  thumbs_up_count?: number;
  thumbs_down_count?: number;
}

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  packSkin?: "standard" | "premium";
}

// Helper functions for localStorage (no longer language-specific)
const getStoredFlipState = (questionId: string): boolean => {
  // Check consent first
  try {
    const consent = localStorage.getItem("cookie_consent");
    if (consent !== "accepted") return false;

    const stored = localStorage.getItem(`flip_${questionId}`);
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

const setStoredFlipState = (questionId: string, isFlipped: boolean) => {
  if (!hasFunctionalConsent()) return;
  try {
    localStorage.setItem(`flip_${questionId}`, String(isFlipped));
  } catch {
    // Ignore localStorage errors
  }
};

const getStoredAnswers = (questionId: string): Set<number> => {
  if (!hasFunctionalConsent()) return new Set();
  try {
    const stored = localStorage.getItem(`answers_${questionId}`);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
};

const setStoredAnswers = (questionId: string, answers: Set<number>) => {
  if (!hasFunctionalConsent()) return;
  try {
    localStorage.setItem(
      `answers_${questionId}`,
      JSON.stringify(Array.from(answers))
    );
  } catch {
    // Ignore localStorage errors
  }
};

// Skin configuration - easily extensible for new skins
const SKIN_STYLES = {
  standard: {
    front: {
      gradient: "bg-gradient-to-br from-primary via-primary/90 to-primary/80",
      border: "border-accent",
      watermark: "text-primary-foreground/[0.07]",
      text: "text-primary-foreground",
      textMuted: "text-primary-foreground/80",
      categoryText: "text-primary-foreground/80",
      watermarkText: "HUMBUG!",
    },
    back: {
      gradient: "bg-card",
      border: "border-border",
      watermark: "text-card-foreground/[0.05]",
      text: "text-card-foreground",
      textMuted: "text-card-foreground/80",
      textLight: "text-muted-foreground",
      button: "bg-muted hover:bg-muted/80",
      buttonSelected: "bg-green-500/30 border border-green-500/50",
      borderColor: "border-border",
      watermarkText: "HUMBUG!",
    },
    shimmer: false,
  },
  premium: {
    front: {
      gradient: "bg-gradient-to-br from-black via-purple-950 to-black",
      border: "border-purple-500/50",
      watermark: "text-purple-500/[0.07]",
      text: "text-purple-100",
      textMuted: "text-purple-200/80",
      categoryText: "text-purple-300/90",
      watermarkText: "HORROR! 👻",
    },
    back: {
      gradient: "bg-gradient-to-br from-black via-purple-950 to-black",
      border: "border-purple-500/50",
      watermark: "text-purple-500/[0.05]",
      text: "text-purple-100",
      textMuted: "text-purple-200/90",
      textLight: "text-purple-300/70",
      button:
        "bg-purple-950/50 hover:bg-purple-900/50 border border-purple-500/20",
      buttonSelected: "bg-purple-500/30 border border-purple-400/50",
      borderColor: "border-purple-500/30",
      watermarkText: "HORROR! 👻",
    },
    shimmer: true,
  },
} as const;

export function QuestionCard({ question, index, packSkin }: QuestionCardProps) {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  // Get skin styles (default to standard if not found)
  const skin = SKIN_STYLES[packSkin || "standard"] || SKIN_STYLES.standard;

  const [isFlipped, setIsFlipped] = useState(() =>
    getStoredFlipState(question.id)
  );
  const [selectedAnswers, setSelectedAnswers] = useState<Set<number>>(() =>
    getStoredAnswers(question.id)
  );
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);
  const [hasTrackedCompletion, setHasTrackedCompletion] = useState(false);

  // New state for feedback and completion
  const [isCompleted, setIsCompleted] = useState(false);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [feedbackCounts, setFeedbackCounts] = useState({
    thumbsUp: 0,
    thumbsDown: 0,
  });
  const [isAnimatingCompletion, setIsAnimatingCompletion] = useState(false);

  // Load feedback counts from question data (available to all users)
  useEffect(() => {
    setFeedbackCounts({
      thumbsUp: question.thumbs_up_count || 0,
      thumbsDown: question.thumbs_down_count || 0,
    });
  }, [question.thumbs_up_count, question.thumbs_down_count]);

  // Load completion status from localStorage (for unauthenticated) or database (for authenticated)
  useEffect(() => {
    const loadCompletionStatus = async () => {
      // First, check localStorage (works for everyone)
      if (hasFunctionalConsent()) {
        try {
          const stored = localStorage.getItem(`completed_${question.id}`);
          if (stored === "true") {
            setIsCompleted(true);
          }

          // Load vote from localStorage
          const storedVote = localStorage.getItem(`vote_${question.id}`);
          if (storedVote) {
            setUserVote(parseInt(storedVote) as 1 | -1);
          }
        } catch (error) {
          // Ignore localStorage errors
        }
      }

      // If authenticated, also check database (takes precedence)
      if (isAuthenticated && user) {
        try {
          const response = await fetch(
            `/api/user-actions?action=progress&questionId=${question.id}`,
            { credentials: "include" }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.isCompleted) {
              setIsCompleted(true);
            }
          }
        } catch (error) {
          console.error("Error loading progress:", error);
        }
      }
    };

    loadCompletionStatus();
  }, [isAuthenticated, user, question.id]);

  // Track when card is flipped (played) - ONLY ONCE PER USER
  useEffect(() => {
    if (isFlipped && !hasTrackedPlay) {
      // Track that the question was played (card flipped to see answers)
      const trackPlay = async () => {
        try {
          // This increments times_played in the database (once per user)
          await fetch(`/api/user-actions?action=track-play`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ questionId: question.id }),
            credentials: "include",
          });
          setHasTrackedPlay(true);
        } catch (error) {
          console.error("Failed to track play:", error);
        }
      };

      trackPlay();
    }
  }, [isFlipped, question.id, hasTrackedPlay]);

  // Persist flip state to localStorage
  useEffect(() => {
    setStoredFlipState(question.id, isFlipped);
  }, [isFlipped, question.id]);

  // Persist selected answers to localStorage
  useEffect(() => {
    setStoredAnswers(question.id, selectedAnswers);
  }, [selectedAnswers, question.id]);

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

  // RESET button: Clear all marked answers AND completion status
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAnswers(new Set());
    setStoredAnswers(question.id, new Set());
    setIsCompleted(false); // Reset completion status
    setHasTrackedCompletion(false); // Allow tracking completion again

    // Call API to reset progress in database
    if (isAuthenticated) {
      fetch("/api/user-actions?action=reset-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionId: question.id }),
        credentials: "include",
      }).catch((error) => {
        console.error("Failed to reset progress:", error);
      });
    }

    toast.success(t("questions.resetSuccess"));
  };

  // FINISHED button: Mark question as completed with animation
  const handleMarkCompleted = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isCompleted || isAnimatingCompletion) {
      return; // Already completed or animating
    }

    try {
      // Start animation: mark all answers one by one
      setIsAnimatingCompletion(true);

      const totalAnswers = question.answers.length;
      const delayBetweenAnswers = 3000 / totalAnswers; // Spread over 3 seconds

      // Animate marking each answer
      for (let i = 0; i < totalAnswers; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenAnswers)
        );
        setSelectedAnswers((prev) => {
          const newSet = new Set(prev);
          newSet.add(i);
          return newSet;
        });
      }

      // Wait a moment to show all answers marked
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mark as completed locally
      setIsCompleted(true);
      setHasTrackedCompletion(true);

      // Save to localStorage
      if (hasFunctionalConsent()) {
        try {
          localStorage.setItem(`completed_${question.id}`, "true");
        } catch (error) {
          // Ignore localStorage errors
        }
      }

      // If authenticated, also call API to track in database
      if (isAuthenticated) {
        const response = await fetch(
          "/api/user-actions?action=mark-completed",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ questionId: question.id }),
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.error("Failed to sync completion to database");
        }
      }

      // Flip back to question side after 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsFlipped(false);

      toast.success(t("questions.markedCompleted"));
    } catch (error) {
      console.error("Error marking completed:", error);
      toast.error(t("questions.errorCompleted"));
    } finally {
      setIsAnimatingCompletion(false);
    }
  };

  // Thumbs up/down feedback
  const handleFeedback = async (vote: 1 | -1) => {
    try {
      // Store vote locally first
      setUserVote(vote);
      if (hasFunctionalConsent()) {
        try {
          localStorage.setItem(`vote_${question.id}`, String(vote));
        } catch (error) {
          // Ignore localStorage errors
        }
      }

      // If authenticated, sync to database
      if (isAuthenticated) {
        const response = await fetch("/api/user-actions?action=feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questionId: question.id, vote }),
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.feedback) {
            setFeedbackCounts({
              thumbsUp: data.feedback.thumbs_up_count || 0,
              thumbsDown: data.feedback.thumbs_down_count || 0,
            });
          }
        } else {
          throw new Error("Failed to submit feedback");
        }
      } else {
        // For unauthenticated users, just show a message
        toast.info(t("questions.feedbackSaved"));
      }

      toast.success(
        vote === 1
          ? t("questions.likedQuestion")
          : t("questions.dislikedQuestion")
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Don't show error to unauthenticated users since local save worked
      if (isAuthenticated) {
        toast.error(t("questions.errorFeedback"));
      }
    }
  };

  // Determine number of columns based on answer count
  const answerCount = question.answers.length;
  const columns =
    answerCount > 20 ? 4 : answerCount > 12 ? 3 : answerCount > 6 ? 2 : 1;

  return (
    <motion.div
      className="relative w-full min-w-0 aspect-[3/4] md:aspect-[4/3] perspective-1000"
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
          className={`absolute inset-0 w-full h-full backface-hidden border-2 shadow-xl overflow-hidden ${skin.front.gradient} ${skin.front.border}`}
          style={{ pointerEvents: isFlipped ? "none" : "auto" }}>
          {/* Shimmer effect for certain skins */}
          {skin.shimmer && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-shimmer" />
            </div>
          )}

          {/* Diagonal Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className={`font-black text-[6rem] md:text-[10rem] tracking-tighter whitespace-nowrap select-none ${skin.front.watermark}`}
              style={{
                transform: "rotate(-45deg)",
                fontFamily: "Space Grotesk, sans-serif",
              }}>
              {skin.front.watermarkText}
            </div>
          </div>

          <CardContent className="flex flex-col justify-between h-full p-4 md:p-6 relative z-10">
            {/* Top section with flip instruction and arrow - aligned with button */}
            <div
              className={`flex items-center justify-end pr-14 md:pr-16 text-xs sm:text-sm md:text-base ${skin.front.textMuted}`}>
              <div className="flex items-center gap-1.5 max-w-full">
                <span className="font-medium text-right break-words md:whitespace-nowrap">
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
                  }}
                  className="flex-shrink-0">
                  <ArrowUpRight
                    size={18}
                    weight="bold"
                    className="flex-shrink-0"
                  />
                </motion.div>
              </div>
            </div>

            <div
              className={`flex-1 flex flex-col justify-center items-center text-center`}>
              <div
                className={`!text-base md:!text-lg font-bold mb-3 md:mb-4 uppercase tracking-wide ${skin.front.categoryText}`}>
                {question.category}
              </div>
              <h3
                className={`font-bold !text-xl md:!text-2xl leading-tight px-2 md:px-4 ${skin.front.text}`}>
                {question.question}
              </h3>
            </div>

            {/* Bottom section with answer count and source */}
            <div className="text-center space-y-1">
              <div
                className={`text-base md:text-base font-medium ${skin.front.textMuted}`}>
                {t("questions.totalAnswers", {
                  count: question.answers.length,
                })}
              </div>
              {question.sourceUrl && (
                <div className={`text-sm ${skin.front.textMuted}`}>
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
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-2 shadow-xl overflow-hidden ${skin.back.gradient} ${skin.back.border}`}
          style={{ pointerEvents: isFlipped ? "auto" : "none" }}>
          {/* Shimmer effect for certain skins */}
          {skin.shimmer && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-shimmer" />
            </div>
          )}

          {/* Diagonal Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className={`font-black text-[6rem] md:text-[10rem] tracking-tighter whitespace-nowrap select-none ${skin.back.watermark}`}
              style={{
                transform: "rotate(-45deg)",
                fontFamily: "Space Grotesk, sans-serif",
              }}>
              {skin.back.watermarkText}
            </div>
          </div>

          <CardContent
            className="flex flex-col h-full p-3 md:p-4 relative z-10"
            onClick={(e) => e.stopPropagation()}>
            <div
              className={`!text-sm md:!text-base font-bold mb-2 uppercase tracking-wide text-center ${skin.back.textMuted}`}>
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
                      ? skin.back.buttonSelected
                      : skin.back.button
                  }`}
                  onClick={(e) => handleAnswerClick(e, answerIndex)}>
                  <span className={`font-medium ${skin.back.text}`}>
                    {answer}
                  </span>
                </button>
              ))}
            </div>
            <div
              className={`mt-2 text-[10px] md:text-xs text-center leading-tight ${skin.back.textLight}`}>
              {t("questions.clickToMark")}
            </div>

            {/* Action buttons: RESET, FINISHED, Thumbs Up/Down */}
            <div
              className={`mt-3 pt-3 flex justify-between items-center gap-2 border-t ${skin.back.borderColor}`}>
              {/* Left side: RESET and FINISHED */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset(e);
                  }}
                  className="px-3 py-2 text-xs md:text-sm font-medium bg-muted hover:bg-muted/70 text-card-foreground rounded transition-colors flex items-center gap-1.5 cursor-pointer">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>{t("questions.reset")}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkCompleted(e);
                  }}
                  disabled={isCompleted || isAnimatingCompletion}
                  className={`px-3 py-2 text-xs md:text-sm font-medium rounded transition-colors flex items-center gap-1.5 ${
                    isCompleted
                      ? "bg-green-500/30 text-green-700 cursor-not-allowed"
                      : isAnimatingCompletion
                      ? "bg-primary/70 text-primary-foreground cursor-wait animate-pulse"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  }`}>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    {isAnimatingCompletion
                      ? t("questions.completing")
                      : t("questions.finished")}
                  </span>
                </button>
              </div>

              {/* Right side: Thumbs Up/Down (visible and clickable for everyone) */}
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeedback(1);
                  }}
                  className={`px-2 py-2 text-xs rounded transition-all flex items-center gap-1 cursor-pointer ${
                    userVote === 1
                      ? "bg-green-500/30 text-green-700 border border-green-500/50"
                      : "bg-muted hover:bg-muted/70 text-card-foreground"
                  }`}>
                  <svg
                    className="w-3 h-3"
                    fill={userVote === 1 ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xs font-medium">
                    {feedbackCounts.thumbsUp}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeedback(-1);
                  }}
                  className={`px-2 py-2 text-xs rounded transition-all flex items-center gap-1 cursor-pointer ${
                    userVote === -1
                      ? "bg-red-500/30 text-red-700 border border-red-500/50"
                      : "bg-muted hover:bg-muted/70 text-card-foreground"
                  }`}>
                  <svg
                    className="w-3 h-3 rotate-180"
                    fill={userVote === -1 ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xs font-medium">
                    {feedbackCounts.thumbsDown}
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
