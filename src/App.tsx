import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { QuestionCard } from "@/components/QuestionCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { BackgroundMusicPlayer } from "@/components/BackgroundMusicPlayer";
import { CategoryFilter } from "@/components/CategoryFilter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Load questions from translations
  const questions = t("allQuestions", { returnObjects: true }) as Array<{
    id: string;
    category: string;
    question: string;
    answers: string[];
  }>;

  // Get unique categories
  const uniqueCategories = Array.from(
    new Set(questions.map((q) => q.category))
  ).sort();

  // Count questions per category
  const categoryCounts = questions.reduce((acc, q) => {
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
      ? questions
      : questions.filter((q) => selectedCategories.includes(q.category));

  // Map questions with translated categories
  const translatedQuestions = filteredQuestions.map((q) => ({
    ...q,
    category: t(`categories.${q.category}`),
  }));

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
            {/* Language Switcher - Top Right */}
            <div className="absolute top-2 right-2 md:top-4 md:right-6 z-20">
              <LanguageSwitcher />
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

          {/* Background Music Player */}
          <div className="max-w-3xl mx-auto mb-12">
            <BackgroundMusicPlayer
              src={humbugMainTheme}
              title={t("questions.backgroundMusic")}
            />
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={uniqueCategories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onClearAll={handleClearAll}
            categoryCounts={categoryCounts}
            totalQuestions={questions.length}
          />

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {translatedQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
              />
            ))}
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
    </div>
  );
}

export default App;
