/**
 * Pack Edit Dialog
 * Dialog for creating/editing question packs
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
import { Save, X } from "lucide-react";
import { toast } from "sonner";

interface Pack {
  id: number;
  slug: string;
  name_en: string;
  name_hu: string;
  description_en: string | null;
  description_hu: string | null;
  access_level: string;
  pack_type: string;
  skin?: string;
  is_active: boolean;
  is_published: boolean;
  display_order: number;
  creator_id: number | null;
  creator_email: string | null;
  created_at: string;
  updated_at: string;
  question_count: number;
  total_plays: number;
}

interface PackEditDialogProps {
  pack: Pack | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPackUpdated: () => void;
}

const PACK_TYPES = [
  { value: "quiz", label: "🎯 Quiz", description: "Standard trivia questions" },
  {
    value: "challenge",
    label: "⚡ Challenge",
    description: "Timed/competitive mode",
  },
  {
    value: "learning",
    label: "📚 Learning",
    description: "Educational content",
  },
  { value: "party", label: "🎉 Party", description: "Special party rules" },
  { value: "kids", label: "👶 Kids", description: "Age-appropriate content" },
  { value: "expert", label: "🏆 Expert", description: "Advanced difficulty" },
  { value: "seasonal", label: "🎄 Seasonal", description: "Holiday themes" },
  { value: "custom", label: "✨ Custom", description: "User-created packs" },
];

const ACCESS_LEVELS = [
  { value: "free", label: "Free", description: "Available to all users" },
  {
    value: "premium",
    label: "Premium",
    description: "Requires premium subscription",
  },
  {
    value: "admin_only",
    label: "Admin Only",
    description: "Visible only to admins",
  },
];

const SKIN_TYPES = [
  {
    value: "standard",
    label: "🟡 Standard",
    description: "Classic yellow HUMBUG theme",
  },
  {
    value: "premium",
    label: "💜 Premium",
    description: "Purple-gold horror theme with shimmer effects",
  },
];

export function PackEditDialog({
  pack,
  open,
  onOpenChange,
  onPackUpdated,
}: PackEditDialogProps) {
  // Pack fields
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameHu, setNameHu] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionHu, setDescriptionHu] = useState("");
  const [packType, setPackType] = useState<string>("quiz");
  const [accessLevel, setAccessLevel] = useState<string>("free");
  const [skin, setSkin] = useState<string>("standard");
  const [isActive, setIsActive] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);

  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [slugError, setSlugError] = useState("");

  // Load pack data when dialog opens
  useEffect(() => {
    if (pack && open) {
      setSlug(pack.slug);
      setNameEn(pack.name_en);
      setNameHu(pack.name_hu);
      setDescriptionEn(pack.description_en || "");
      setDescriptionHu(pack.description_hu || "");
      setPackType(pack.pack_type);
      setAccessLevel(pack.access_level);
      setSkin(pack.skin || "standard");
      setIsActive(pack.is_active);
      setIsPublished(pack.is_published);
      setDisplayOrder(pack.display_order);
      setSlugError("");
    } else if (!pack && open) {
      // Reset for new pack
      setSlug("");
      setNameEn("");
      setNameHu("");
      setDescriptionEn("");
      setDescriptionHu("");
      setPackType("quiz");
      setAccessLevel("free");
      setSkin("standard");
      setIsActive(true);
      setIsPublished(false);
      setDisplayOrder(0);
      setSlugError("");
    }
  }, [pack, open]);

  // Validate slug format
  const validateSlug = (value: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!value) {
      setSlugError("Slug is required");
      return false;
    }
    if (!slugRegex.test(value)) {
      setSlugError("Slug must be lowercase letters, numbers, and hyphens only");
      return false;
    }
    setSlugError("");
    return true;
  };

  // Auto-generate slug from English name
  const generateSlug = () => {
    if (!nameEn) return;
    const generatedSlug = nameEn
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setSlug(generatedSlug);
    validateSlug(generatedSlug);
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    validateSlug(value);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!slug) {
      toast.error("Slug is required");
      return;
    }
    if (!nameEn || !nameHu) {
      toast.error("Name is required in both languages");
      return;
    }
    if (!validateSlug(slug)) {
      toast.error("Please fix slug format");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        slug,
        name_en: nameEn,
        name_hu: nameHu,
        description_en: descriptionEn || null,
        description_hu: descriptionHu || null,
        pack_type: packType,
        access_level: accessLevel,
        skin: skin,
        is_active: isActive,
        is_published: isPublished,
        display_order: displayOrder,
      };

      const url = pack
        ? `/api/admin?resource=packs&id=${pack.id}`
        : "/api/admin?resource=packs";
      const method = pack ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save pack");
      }

      toast.success(
        pack ? "Pack updated successfully" : "Pack created successfully"
      );
      onPackUpdated();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save pack"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pack ? "Edit Pack" : "Create New Pack"}</DialogTitle>
          <DialogDescription>
            {pack
              ? "Update pack information and settings"
              : "Create a new question pack with descriptions and access settings"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g., general-knowledge"
                className={slugError ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateSlug}
                disabled={!nameEn}>
                Auto-generate
              </Button>
            </div>
            {slugError && <p className="text-sm text-red-500">{slugError}</p>}
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier (lowercase, alphanumeric, hyphens only)
            </p>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_en">
                Name (English) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name_en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="General Knowledge"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_hu">
                Name (Hungarian) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name_hu"
                value={nameHu}
                onChange={(e) => setNameHu(e.target.value)}
                placeholder="Általános ismeretek"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description_en">Description (English)</Label>
              <Textarea
                id="description_en"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="A collection of general knowledge questions..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_hu">Description (Hungarian)</Label>
              <Textarea
                id="description_hu"
                value={descriptionHu}
                onChange={(e) => setDescriptionHu(e.target.value)}
                placeholder="Általános ismeretek kérdések gyűjteménye..."
                rows={4}
              />
            </div>
          </div>

          {/* Pack Type */}
          <div className="space-y-2">
            <Label htmlFor="pack_type">Pack Type</Label>
            <Select value={packType} onValueChange={setPackType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PACK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col items-start">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Access Level */}
          <div className="space-y-2">
            <Label htmlFor="access_level">Access Level</Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex flex-col items-start">
                      <span>{level.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {level.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skin Type */}
          <div className="space-y-2">
            <Label htmlFor="skin">Visual Theme (Skin)</Label>
            <Select value={skin} onValueChange={setSkin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SKIN_TYPES.map((skinType) => (
                  <SelectItem key={skinType.value} value={skinType.value}>
                    <div className="flex flex-col items-start">
                      <span>{skinType.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {skinType.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls the visual appearance of question cards and pack selector
            </p>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in pack lists
            </p>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Pack can be used in the application
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_published">Published</Label>
                <p className="text-xs text-muted-foreground">
                  Pack is visible to users (requires active)
                </p>
              </div>
              <Switch
                id="is_published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>
          </div>

          {/* Pack info (edit mode only) */}
          {pack && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Questions:</span>
                <Badge>{pack.question_count}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Plays:</span>
                <Badge>{pack.total_plays}</Badge>
              </div>
              {pack.creator_email && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created by:</span>
                  <span className="text-xs">{pack.creator_email}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : pack ? "Update Pack" : "Create Pack"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
