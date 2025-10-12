import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearAll: () => void;
  categoryCounts: Record<string, number>;
  totalQuestions: number;
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearAll,
  categoryCounts,
  totalQuestions,
}: CategoryFilterProps) {
  const { t } = useTranslation();

  const isAllSelected = selectedCategories.length === 0;

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}>
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {/* All Categories Button */}
        <Button
          onClick={onClearAll}
          variant={isAllSelected ? "default" : "outline"}
          className={`
            px-4 py-2 h-auto text-sm font-medium rounded-full
            transition-all duration-300
            ${
              isAllSelected
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-2 border-primary shadow-lg hover:shadow-xl hover:scale-105"
                : "bg-transparent border-2 border-primary/30 text-foreground hover:border-primary hover:bg-primary/10 hover:scale-105"
            }
          `}>
          <span className="mr-1">#</span>
          {t("categoryFilter.all")} ({totalQuestions})
        </Button>

        {/* Category Buttons */}
        {categories.map((category) => {
          const isSelected =
            selectedCategories.length === 0 ||
            selectedCategories.includes(category);
          const count = categoryCounts[category] || 0;

          return (
            <Button
              key={category}
              onClick={() => onCategoryToggle(category)}
              variant={isSelected ? "default" : "outline"}
              className={`
                px-4 py-2 h-auto text-sm font-medium rounded-full
                transition-all duration-300
                ${
                  isSelected
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-2 border-primary shadow-lg hover:shadow-xl hover:scale-105"
                    : "bg-transparent border-2 border-primary/30 text-foreground hover:border-primary hover:bg-primary/10 hover:scale-105"
                }
              `}>
              <span className="mr-1">#</span>
              {t(`categories.${category}`)} ({count})
            </Button>
          );
        })}
      </div>

      {/* Active filter count */}
      {selectedCategories.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground mt-4">
          {t("categoryFilter.activeFilters", {
            count: selectedCategories.length,
          })}
        </motion.p>
      )}
    </motion.div>
  );
}
