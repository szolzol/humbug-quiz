import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { QuestionCard } from "@/components/QuestionCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { BackgroundMusicPlayer } from "@/components/BackgroundMusicPlayer";
import { CategoryFilter } from "@/components/CategoryFilter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginButton } from "@/components/LoginButton";
import { InstallPrompt } from "@/components/InstallPrompt";
import { CookieConsent } from "@/components/CookieConsent";
import { QuestionPackSelector } from "@/components/QuestionPackSelector";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Users,
  Target,
  Crown,
  ArrowDown,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import gameRulesAudioHu from "@/assets/audio/humbug-rules.mp3";
import gameRulesAudioEn from "@/assets/audio/humbug-rules-en.mp3";
import humbugMainTheme from "@/assets/audio/humbug_main_theme.mp3";
import humbugMoodImage from "@/assets/images/humbug-mood.png";

// Studio light animation configurations
const studioLights = [
  {
    gradients: [
      "radial-gradient(circle at 20% 30%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)",
      "radial-gradient(circle at 80% 60%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)",
      "radial-gradient(circle at 50% 80%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)",
      "radial-gradient(circle at 20% 30%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)",
    ],
    duration: 12,
    delay: 0,
  },
  {
    gradients: [
      "radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
      "radial-gradient(circle at 30% 70%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
      "radial-gradient(circle at 70% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
      "radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
    ],
    duration: 15,
    delay: 2,
  },
];

const questionsStudioLights = [
  {
    gradients: [
      "radial-gradient(circle at 10% 20%, rgba(234, 179, 8, 0.25) 0%, transparent 40%)",
      "radial-gradient(circle at 90% 30%, rgba(234, 179, 8, 0.25) 0%, transparent 40%)",
      "radial-gradient(circle at 50% 70%, rgba(234, 179, 8, 0.25) 0%, transparent 40%)",
      "radial-gradient(circle at 10% 20%, rgba(234, 179, 8, 0.25) 0%, transparent 40%)",
    ],
    duration: 10,
    delay: 0,
  },
  {
    gradients: [
      "radial-gradient(circle at 85% 15%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)",
      "radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)",
      "radial-gradient(circle at 70% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)",
      "radial-gradient(circle at 85% 15%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)",
    ],
    duration: 12,
    delay: 1,
  },
  {
    gradients: [
      "radial-gradient(circle at 50% 10%, rgba(234, 179, 8, 0.15) 0%, transparent 35%)",
      "radial-gradient(circle at 50% 90%, rgba(234, 179, 8, 0.15) 0%, transparent 35%)",
      "radial-gradient(circle at 50% 10%, rgba(234, 179, 8, 0.15) 0%, transparent 35%)",
    ],
    duration: 8,
    delay: 2,
  },
];

// Reusable animated light component
const AnimatedLight = ({
  gradients,
  duration,
  delay,
}: (typeof studioLights)[0]) => (
  <motion.div
    animate={{ background: gradients }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
    className="fixed inset-0 pointer-events-none z-0"
  />
);

const AnimatedQuestionsLight = ({
  gradients,
  duration,
  delay,
}: (typeof questionsStudioLights)[0]) => (
  <motion.div
    animate={{ background: gradients }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
    className="absolute inset-0 pointer-events-none"
  />
);

function App() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, login, refreshSession } = useAuth();
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPack, setSelectedPack] = useState<string>(() => {
    // Initialize pack from URL on mount
    const path = window.location.pathname;
    const match = path.match(/^\/pack\/([^/]+)/);
    if (match && match[1]) {
      console.log(`🔗 Initializing from URL: pack = ${match[1]}`);
      return match[1];
    }
    return "free"; // Default to free pack
  });

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const path = window.location.pathname;
      const match = path.match(/^\/pack\/([^/]+)/);
      if (match && match[1]) {
        console.log(`⬅️ Browser back/forward: switching to pack ${match[1]}`);
        setSelectedPack(match[1]);
      } else if (path === "/") {
        console.log(`⬅️ Browser back/forward: switching to default pack`);
        setSelectedPack("free");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Switch to free pack when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      console.log(`🔓 User logged out, switching to free pack`);
      handlePackChange("free");
    }
  }, [isAuthenticated]);

  // Update URL when pack changes
  const handlePackChange = (newPack: string) => {
    console.log(`🔄 Pack changed to: ${newPack}`);
    setSelectedPack(newPack);

    // Update URL without reload
    const newUrl = `/pack/${newPack}`;
    if (window.location.pathname !== newUrl) {
      window.history.pushState({ pack: newPack }, "", newUrl);
      console.log(`🔗 URL updated to: ${newUrl}`);
    }
  };

  // Handle OAuth callback - refresh session when redirected with ?auth=success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");

    if (authStatus === "success") {
      console.log("🔄 Auth callback detected, refreshing session...");
      refreshSession();
      // Clean up URL but preserve the pack path
      const path = window.location.pathname;
      window.history.replaceState({}, document.title, path);
    }
  }, [refreshSession]);

  // Browser compatibility detection
  useEffect(() => {
    // Check for OKLCH color space support
    const supportsOklch = CSS.supports("color", "oklch(0.5 0.1 180)");

    // Check for backdrop-filter support
    const supportsBackdropFilter = CSS.supports(
      "backdrop-filter",
      "blur(10px)"
    );

    // Check for 3D transform support
    const supports3D = CSS.supports("transform-style", "preserve-3d");

    // Detect low-end device
    const isLowEndDevice =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    // Add classes to document for CSS fallbacks
    if (!supportsOklch) {
      document.documentElement.classList.add("no-oklch");
      console.warn(
        "⚠️ Browser Compatibility: Your browser does not support OKLCH color space. Using RGB fallbacks."
      );
    }

    if (!supportsBackdropFilter) {
      document.documentElement.classList.add("no-backdrop-filter");
      console.warn(
        "⚠️ Browser Compatibility: Your browser does not support backdrop-filter. Visual effects may be limited."
      );
    }

    if (!supports3D) {
      console.warn(
        "⚠️ Browser Compatibility: Your browser has limited 3D transform support. Card flip animations may not work properly."
      );
    }

    if (isLowEndDevice) {
      console.info(
        "ℹ️ Performance: Low-end device detected. Some animations may be disabled for better performance."
      );
    }

    // Log comprehensive browser support info
    const browserInfo = {
      oklch: supportsOklch,
      backdropFilter: supportsBackdropFilter,
      transform3D: supports3D,
      hardwareCores: navigator.hardwareConcurrency || "unknown",
      userAgent: navigator.userAgent,
    };

    console.log("🔍 Browser Compatibility Check:", browserInfo);

    // Show user-friendly notification for critical missing features
    if (!supportsOklch || !supportsBackdropFilter) {
      const message =
        t("browserCompatibility.warning") ||
        "Your browser may not display all visual effects correctly. For the best experience, please use a modern browser (Chrome 111+, Safari 15.4+, or Firefox 113+).";

      // Only show warning once per session
      if (!sessionStorage.getItem("compatibility-warning-shown")) {
        setTimeout(() => {
          // You can replace this with a proper toast notification component
          console.warn("📢 " + message);
        }, 2000);
        sessionStorage.setItem("compatibility-warning-shown", "true");
      }
    }
  }, [t]);

  // State for API-loaded questions
  const [apiQuestions, setApiQuestions] = useState<
    Array<{
      id: string;
      category: string;
      question_en: string;
      question_hu: string;
      answers: Array<{ answer_en: string; answer_hu: string }>;
      source_name?: string;
      source_url?: string;
    }>
  >([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  // Load questions from API when pack changes
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);
        // Use absolute URL with origin to ensure proper routing
        const timestamp = Date.now();
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const url = `${origin}/api/questions/${selectedPack}?_t=${timestamp}`;
        console.log(`🔄 Fetching questions from absolute URL: ${url}`);
        console.log(`   Origin: ${origin}`);
        console.log(`   Selected pack: ${selectedPack}`);

        const response = await fetch(url, {
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Accept: "application/json",
          },
        });
        console.log(
          `📡 Response status: ${response.status} ${response.statusText}`
        );
        console.log(`📡 Response headers:`, {
          contentType: response.headers.get("content-type"),
          packSlug: response.headers.get("x-pack-slug"),
          cacheControl: response.headers.get("cache-control"),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API Error Response:`, errorText);
          throw new Error(
            `Failed to fetch questions: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log(
          `📦 Loaded ${data.questions?.length || 0} questions for pack: ${
            data.packSlug || selectedPack
          }`
        );
        console.log(`📋 First question:`, {
          id: data.questions?.[0]?.id,
          en: data.questions?.[0]?.question_en?.substring(0, 60),
          hu: data.questions?.[0]?.question_hu?.substring(0, 60),
        });

        // Force new array reference to ensure React detects the change
        const newQuestions = [...(data.questions || [])];
        console.log(
          `🔄 Setting ${
            newQuestions.length
          } questions to state (array ref: ${typeof newQuestions})`
        );
        setApiQuestions(newQuestions);
        console.log(
          `✅ State updated! apiQuestions should now have ${newQuestions.length} items`
        );
      } catch (error) {
        console.error("Error fetching questions:", error);
        // Fallback to JSON questions if API fails
        const fallbackQuestions = t("allQuestions", {
          returnObjects: true,
        }) as Array<{
          id: string;
          category: string;
          question: string;
          answers: string[];
        }>;
        // Convert fallback to API format
        setApiQuestions(
          fallbackQuestions.map((q) => ({
            id: q.id,
            category: q.category,
            question_en: q.question,
            question_hu: q.question,
            answers: q.answers.map((a) => ({ answer_en: a, answer_hu: a })),
          }))
        );
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedPack, t]);

  // Transform API questions to app format based on current language
  // This will re-compute when apiQuestions or i18n.language changes
  const currentLang = i18n.language as "en" | "hu";
  const questions = React.useMemo(() => {
    console.log(
      `🌐 Transforming ${apiQuestions.length} questions for language: ${currentLang}`
    );
    if (apiQuestions.length > 0) {
      console.log(`   First question ID: ${apiQuestions[0].id}`);
      console.log(`   EN: ${apiQuestions[0].question_en.substring(0, 60)}...`);
      console.log(`   HU: ${apiQuestions[0].question_hu.substring(0, 60)}...`);
    }
    return apiQuestions.map((q) => ({
      id: q.id,
      category: q.category,
      question: currentLang === "hu" ? q.question_hu : q.question_en,
      answers: q.answers.map((a) =>
        currentLang === "hu" ? a.answer_hu : a.answer_en
      ),
      sourceName: q.source_name,
      sourceUrl: q.source_url,
    }));
  }, [apiQuestions, currentLang]);

  // Get unique categories
  // Limit visible questions based on authentication status
  const visibleQuestions = isAuthenticated ? questions : questions.slice(0, 4);

  const uniqueCategories = Array.from(
    new Set(visibleQuestions.map((q) => q.category))
  ).sort();

  // Count questions per category (only from visible questions)
  const categoryCounts = visibleQuestions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Toggle category selection
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategories([]);
  };

  // Filter questions based on selected categories
  const filteredQuestions =
    selectedCategories.length === 0
      ? visibleQuestions
      : visibleQuestions.filter((q) => selectedCategories.includes(q.category));

  // Map questions with translated categories
  const translatedQuestions = filteredQuestions.map((q) => ({
    ...q,
    category: t(`categories.${q.category}`),
  }));

  // Debug: Log the final rendered questions
  React.useEffect(() => {
    console.log(`🎯 Final rendering state:`, {
      selectedPack,
      totalQuestions: questions.length,
      visibleQuestions: visibleQuestions.length,
      filteredQuestions: filteredQuestions.length,
      translatedQuestions: translatedQuestions.length,
      firstQuestion: translatedQuestions[0]
        ? {
            id: translatedQuestions[0].id,
            question: translatedQuestions[0].question.substring(0, 60),
          }
        : null,
    });
  }, [selectedPack, translatedQuestions, questions.length]);

  // Feature cards configuration
  const features = [
    {
      icon: <Brain size={48} weight="fill" />,
      titleKey: "features.feature1.title",
      descriptionKey: "features.feature1.description",
    },
    {
      icon: <Users size={48} weight="fill" />,
      titleKey: "features.feature2.title",
      descriptionKey: "features.feature2.description",
    },
    {
      icon: <Crown size={48} weight="fill" />,
      titleKey: "features.feature3.title",
      descriptionKey: "features.feature3.description",
    },
    {
      icon: <Target size={48} weight="fill" />,
      titleKey: "features.feature4.title",
      descriptionKey: "features.feature4.description",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Blueish background tint overlay for atmospheric effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.02] pointer-events-none z-0" />

      {/* Studio Light Animations */}
      {studioLights.map((light, index) => (
        <AnimatedLight key={index} {...light} />
      ))}

      {/* Combined Hero + Game Rules Section with Shared Background */}
      <div className="relative overflow-hidden">
        {/* Shared Background Image - covers both hero and game rules */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-fixed opacity-70 hero-background"
          style={{
            backgroundImage: `url(${humbugMoodImage})`,
            backgroundPosition: "center 40%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/90" />

        {/* Hero Section */}
        <motion.section
          className="relative min-h-[35vh] flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}>
          <div className="container mx-auto px-6 py-8 relative z-10">
            {/* Top Navigation Bar */}
            <div className="absolute top-4 left-2 right-2 md:left-6 md:right-6 z-20 flex items-center justify-between">
              {/* Left side - Question Pack Hamburger Menu */}
              <QuestionPackSelector
                variant="hamburger"
                currentPack={selectedPack}
                onPackChange={handlePackChange}
              />

              {/* Right side - Language & Login */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <LoginButton />
              </div>
            </div>

            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1.2,
                  delay: 0.3,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                className="mb-4">
                <h1
                  className="text-6xl md:text-8xl font-black tracking-tight"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-2xl">
                    {t("hero.title")}
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1.0,
                  delay: 0.6,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                className="text-xl md:text-3xl font-bold text-foreground/90 mb-6 tracking-wide"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                {t("hero.subtitle")}
              </motion.p>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.9,
                  delay: 0.9,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                {t("hero.description")}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 1.2,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:!bg-none hover:!bg-transparent hover:border-2 hover:border-primary hover:text-white hover:shadow-2xl"
                  onClick={() => {
                    document
                      .getElementById("questions-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}>
                  <ArrowDown className="mr-2" size={24} weight="bold" />
                  {t("hero.ctaButton")}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-16 h-16 bg-primary/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-20 right-10 w-24 h-24 bg-accent/20 rounded-full blur-xl"
          />
        </motion.section>

        {/* Game Rules */}
        <section className="relative py-14">
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto">
              <AudioPlayer
                src={
                  i18n.language === "hu" ? gameRulesAudioHu : gameRulesAudioEn
                }
                title={t("rules.audioTitle")}
              />

              <Button
                onClick={() => setIsRulesOpen(!isRulesOpen)}
                className="w-full flex items-center justify-between text-sm font-medium py-2 h-auto mt-0 rounded-t-none border-t-0 bg-yellow-500/20 hover:bg-muted/50"
                variant="ghost">
                <span className="text-foreground">
                  {t("rules.detailedRules")}
                </span>
                <motion.div
                  animate={{ rotate: isRulesOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}>
                  {isRulesOpen ? (
                    <CaretUp size={20} />
                  ) : (
                    <CaretDown size={20} />
                  )}
                </motion.div>
              </Button>

              <AnimatePresence>
                {isRulesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden">
                    <Card className="bg-card/30 border-border/30 rounded-t-none border-t-0 mt-0">
                      <CardContent className="p-8 pt-4">
                        <div className="space-y-6 text-card-foreground">
                          {[1, 2, 3, 4, 5].map((section, idx) => (
                            <div key={section}>
                              {idx > 0 && (
                                <Separator className="bg-border/50 mb-6" />
                              )}
                              <h3 className="text-xl font-semibold mb-3 text-primary">
                                {t(`rules.section${section}.title`)}
                              </h3>
                              <p className="leading-relaxed">
                                {t(`rules.section${section}.content`)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Game Features */}
        <section className="relative py-24">
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">{t("features.title")}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}>
                  <Card className="h-full bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <div className="text-primary mb-4 flex justify-center">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="text-muted-foreground">
                        {t(feature.descriptionKey)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {/* End of Combined Hero + Game Rules + Features Section */}

      {/* Sample Questions */}
      <section
        id="questions-section"
        className="py-24 bg-gradient-to-b from-background to-muted/50 relative overflow-hidden">
        {/* Studio Light Effects */}
        {questionsStudioLights.map((light, index) => (
          <AnimatedQuestionsLight key={index} {...light} />
        ))}
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">{t("questions.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("questions.subtitle")}
            </p>
          </motion.div>

          {/* Question Pack Selector - Inline Version */}
          <div className="max-w-3xl mx-auto mb-8">
            <QuestionPackSelector
              variant="inline"
              currentPack={selectedPack}
              onPackChange={handlePackChange}
            />
          </div>

          {/* Background Music Player */}
          <div className="max-w-3xl mx-auto mb-12">
            <BackgroundMusicPlayer
              src={humbugMainTheme}
              title={t("questions.backgroundMusic")}
            />
          </div>

          {/* Category Filter - Only visible for authenticated users */}
          {isAuthenticated && (
            <CategoryFilter
              categories={uniqueCategories}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onClearAll={handleClearAll}
              categoryCounts={categoryCounts}
              totalQuestions={visibleQuestions.length}
            />
          )}

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {questionsLoading ? (
              // Loading state
              <div className="col-span-full flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              /* Show first 4 cards for anonymous users, all for authenticated */
              (isAuthenticated
                ? translatedQuestions
                : translatedQuestions.slice(0, 4)
              ).map((question, index) => (
                <QuestionCard
                  key={`${selectedPack}-${question.id}`}
                  question={question}
                  index={index}
                />
              ))
            )}

            {/* Hero-style CTA Section for anonymous users */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="col-span-full">
                <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-12 text-center shadow-2xl">
                  {/* Decorative animated background */}
                  <motion.div
                    animate={{
                      background: [
                        "radial-gradient(circle at 20% 30%, rgba(234, 179, 8, 0.1) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 70%, rgba(234, 179, 8, 0.1) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 30%, rgba(234, 179, 8, 0.1) 0%, transparent 50%)",
                      ],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 pointer-events-none"
                  />

                  <div className="relative z-10 max-w-3xl mx-auto">
                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-primary">
                        +{questions.length - 4} {t("auth.moreCards")}
                      </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="text-4xl md:text-5xl font-black mb-4"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                        {t("auth.ctaTitle")}
                      </span>
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      viewport={{ once: true }}
                      className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                      {t("auth.ctaDescription")}
                    </motion.p>

                    {/* Benefits List */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      viewport={{ once: true }}
                      className="flex flex-col md:flex-row gap-4 justify-center mb-8 text-sm md:text-base">
                      <div className="flex items-center gap-2 text-foreground">
                        <svg
                          className="w-5 h-5 text-primary flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{t("auth.benefit1")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <svg
                          className="w-5 h-5 text-primary flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{t("auth.benefit2")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <svg
                          className="w-5 h-5 text-primary flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{t("auth.benefit3")}</span>
                      </div>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      viewport={{ once: true }}>
                      <Button
                        onClick={login}
                        size="lg"
                        className="bg-primary hover:bg-accent text-background font-bold text-lg px-10 py-7 shadow-xl hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 18 18"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-3">
                          <g fill="none" fillRule="evenodd">
                            <path
                              d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                              fill="#4285F4"
                            />
                            <path
                              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                              fill="#34A853"
                            />
                            <path
                              d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                              fill="#EA4335"
                            />
                          </g>
                        </svg>
                        {t("auth.signInWithGoogle")}
                      </Button>
                    </motion.div>

                    {/* Trust badge */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      viewport={{ once: true }}
                      className="text-xs text-muted-foreground mt-4">
                      {t("auth.trustBadge")}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-card/20 border-t border-border/30">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}>
            <h3 className="text-2xl font-bold mb-4 text-primary">
              {t("footer.title")}
            </h3>
            <p
              className="text-sm text-muted-foreground mb-2"
              dangerouslySetInnerHTML={{ __html: t("footer.creators") }}
            />
            <p className="text-sm text-muted-foreground mb-2">
              <span
                dangerouslySetInnerHTML={{ __html: t("footer.otherProject") }}
              />{" "}
              -{" "}
              <a
                href="https://szolzol.github.io/darkoba-vue/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-accent transition-colors underline">
                Play DarQba
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              {t("footer.copyright")}
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Install Prompt for Mobile PWA */}
      <InstallPrompt />

      {/* GDPR Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}

export default App;
