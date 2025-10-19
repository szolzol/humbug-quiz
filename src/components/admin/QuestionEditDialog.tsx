/**
 * Question Edit Dialog
 * Dialog for creating/editing questions with answers
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Trash2, Save, Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Answer {
  id?: number;
  answer_en: string;
  answer_hu: string;
  order_index: number;
  is_alternative: boolean;
}

interface Question {
  id: number;
  setId: number;
  setName: string;
  questionEn: string;
  questionHu: string;
  category: string;
  difficulty: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  timesPlayed: number;
  timesCompleted: number;
  answerCount: number;
}

interface QuestionEditDialogProps {
  question: Question | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionUpdated: () => void;
}

const CATEGORIES = [
  "entertainment",
  "travel",
  "sports",
  "technology",
  "gastronomy",
  "culture",
];

const DIFFICULTIES = ["easy", "medium", "hard"];

export function QuestionEditDialog({
  question,
  open,
  onOpenChange,
  onQuestionUpdated,
}: QuestionEditDialogProps) {
  // Question fields
  const [questionEn, setQuestionEn] = useState("");
  const [questionHu, setQuestionHu] = useState("");
  const [category, setCategory] = useState<string>("entertainment");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Answers
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);

  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load question data and answers when dialog opens
  useEffect(() => {
    if (question && open) {
      setQuestionEn(question.questionEn);
      setQuestionHu(question.questionHu);
      setCategory(question.category);
      setDifficulty(question.difficulty || "medium");
      setSourceName(question.sourceName || "");
      setSourceUrl(question.sourceUrl || "");
      setIsActive(question.isActive);

      // Load answers
      loadAnswers(question.id);
    } else if (!question && open) {
      // Reset for new question
      setQuestionEn("");
      setQuestionHu("");
      setCategory("entertainment");
      setDifficulty("medium");
      setSourceName("");
      setSourceUrl("");
      setIsActive(true);
      setAnswers([]);
    }
  }, [question, open]);

  const loadAnswers = async (questionId: number) => {
    setIsLoadingAnswers(true);
    try {
      const response = await fetch(
        `/api/admin/questions/${questionId}/answers`
      );
      if (!response.ok) throw new Error("Failed to load answers");

      const data = await response.json();
      setAnswers(data.answers || []);
    } catch (error) {
      console.error("Error loading answers:", error);
      toast.error("Failed to load answers");
      setAnswers([]);
    } finally {
      setIsLoadingAnswers(false);
    }
  };

  const handleAddAnswer = () => {
    setAnswers([
      ...answers,
      {
        answer_en: "",
        answer_hu: "",
        order_index: answers.length + 1,
        is_alternative: false,
      },
    ]);
  };

  const handleRemoveAnswer = (index: number) => {
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleAnswerChange = (
    index: number,
    field: keyof Answer,
    value: string | boolean
  ) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  };

  const validateForm = () => {
    if (!questionEn.trim()) {
      toast.error("English question is required");
      return false;
    }
    if (!questionHu.trim()) {
      toast.error("Hungarian question is required");
      return false;
    }
    if (answers.length === 0) {
      toast.error("At least one answer is required");
      return false;
    }
    for (let i = 0; i < answers.length; i++) {
      if (!answers[i].answer_en.trim() || !answers[i].answer_hu.trim()) {
        toast.error(
          `Answer ${i + 1} must have both English and Hungarian text`
        );
        return false;
      }
    }
    if (sourceUrl && !sourceUrl.match(/^https?:\/\//)) {
      toast.error("Source URL must start with http:// or https://");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        question_en: questionEn,
        question_hu: questionHu,
        category,
        difficulty,
        source_name: sourceName || null,
        source_url: sourceUrl || null,
        is_active: isActive,
        answers: answers.map((a, idx) => ({
          id: a.id,
          answer_en: a.answer_en,
          answer_hu: a.answer_hu,
          order_index: idx + 1,
          is_alternative: a.is_alternative,
        })),
      };

      console.log("📤 Saving question payload:", payload);

      const url = question
        ? `/api/admin?resource=questions&id=${question.id}`
        : `/api/admin?resource=questions`;
      const method = question ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Server error response:", error);
        throw new Error(
          error.message || error.error || "Failed to save question"
        );
      }

      toast.success(
        question
          ? "Question updated successfully"
          : "Question created successfully"
      );
      onQuestionUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving question:", error);
      toast.error(error.message || "Failed to save question");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!question) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin?resource=questions&id=${question.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete question");
      }

      toast.success("Question deleted successfully");
      onQuestionUpdated();
      onOpenChange(false);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error("Error deleting question:", error);
      toast.error(error.message || "Failed to delete question");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {question ? "Edit Question" : "Create Question"}
            </DialogTitle>
            <DialogDescription>
              {question
                ? "Update question details and answers"
                : "Create a new question with answers"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Question Text */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="question-en">Question (English) *</Label>
                <Textarea
                  id="question-en"
                  value={questionEn}
                  onChange={(e) => setQuestionEn(e.target.value)}
                  placeholder="Enter question in English..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="question-hu">Question (Hungarian) *</Label>
                <Textarea
                  id="question-hu"
                  value={questionHu}
                  onChange={(e) => setQuestionHu(e.target.value)}
                  placeholder="Enter question in Hungarian..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>

            {/* Category and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source-name">Source Name</Label>
                <Input
                  id="source-name"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g., Wikipedia"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="source-url">Source URL</Label>
                <Input
                  id="source-url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is-active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Only active questions appear in quizzes
                </p>
              </div>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* Answers Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Answers * (at least 1 required)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAnswer}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Answer
                </Button>
              </div>

              {isLoadingAnswers ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Loading answers...
                </div>
              ) : answers.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                  No answers yet. Click "Add Answer" to create one.
                </div>
              ) : (
                <div className="space-y-3">
                  {answers.map((answer, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 space-y-2 bg-card">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAnswer(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            value={answer.answer_en}
                            onChange={(e) =>
                              handleAnswerChange(
                                index,
                                "answer_en",
                                e.target.value
                              )
                            }
                            placeholder="English answer"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Input
                            value={answer.answer_hu}
                            onChange={(e) =>
                              handleAnswerChange(
                                index,
                                "answer_hu",
                                e.target.value
                              )
                            }
                            placeholder="Hungarian answer"
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={answer.is_alternative}
                          onCheckedChange={(checked) =>
                            handleAnswerChange(index, "is_alternative", checked)
                          }
                        />
                        <Label className="text-xs text-muted-foreground">
                          Alternative spelling/version
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {question && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving || isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving || isDeleting}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isDeleting}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question and all its answers.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
