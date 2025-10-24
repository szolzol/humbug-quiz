# Skinning System Documentation

## Overview

The question pack skinning system allows unlimited visual themes for question packs. Skins are stored in the database and applied dynamically to question cards.

## Architecture

### Database Schema

```sql
-- question_sets table has a skin column
ALTER TABLE question_sets
ADD COLUMN skin VARCHAR(20) DEFAULT 'standard' NOT NULL;
```

### Available Skins

Currently implemented skins:

- **standard** - Classic yellow HUMBUG theme
- **premium** - Purple-gold horror theme with shimmer effects

## Adding New Skins

### 1. Define Skin in QuestionCard.tsx

Add your new skin to the `SKIN_STYLES` object:

```typescript
const SKIN_STYLES = {
  standard: {
    /* ... */
  },
  premium: {
    /* ... */
  },
  // Add your new skin here:
  ocean: {
    front: {
      gradient: "bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-700",
      border: "border-cyan-400/50",
      watermark: "text-cyan-500/[0.07]",
      text: "text-cyan-50",
      textMuted: "text-cyan-100/80",
      categoryText: "text-cyan-200/90",
      watermarkText: "OCEAN WAVES 🌊",
    },
    back: {
      gradient: "bg-gradient-to-br from-blue-950 via-cyan-950 to-teal-950",
      border: "border-cyan-500/50",
      watermark: "text-cyan-500/[0.05]",
      text: "text-cyan-100",
      textMuted: "text-cyan-200/90",
      textLight: "text-cyan-300/70",
      button: "bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/20",
      buttonSelected: "bg-cyan-500/30 border border-cyan-400/50",
      borderColor: "border-cyan-500/30",
      watermarkText: "OCEAN WAVES 🌊",
    },
    shimmer: true, // Enable shimmer effect
  },
} as const;
```

### 2. Update TypeScript Type

Update the `packSkin` type in `QuestionCardProps`:

```typescript
interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  packSkin?: "standard" | "premium" | "ocean"; // Add your new skin here
}
```

And in `App.tsx`:

```typescript
const [packs, setPacks] = useState<
  Array<{
    slug: string;
    skin?: "standard" | "premium" | "ocean"; // Add here too
  }>
>([]);
```

And in `QuestionPackSelector.tsx`:

```typescript
interface QuestionPack {
  // ... other fields
  skin?: "standard" | "premium" | "ocean"; // And here
}
```

### 3. Update Database

Set the skin for your question pack:

```sql
UPDATE question_sets
SET skin = 'ocean'
WHERE slug = 'your-pack-slug';
```

### 4. Done!

That's it! The skin will automatically apply to all cards in that pack.

## Skin Configuration Properties

### Front Card (Question Side)

- `gradient` - Background gradient classes
- `border` - Border color classes
- `watermark` - Watermark text color
- `text` - Main text color (question text)
- `textMuted` - Secondary text color (answer count, instructions)
- `categoryText` - Category label color
- `watermarkText` - Watermark content (text/emoji)

### Back Card (Answer Side)

- `gradient` - Background gradient classes
- `border` - Border color classes
- `watermark` - Watermark text color
- `text` - Main text color (answer text)
- `textMuted` - Secondary text color (header)
- `textLight` - Tertiary text color (hints)
- `button` - Unselected answer button styles
- `buttonSelected` - Selected answer button styles
- `borderColor` - Section divider border color
- `watermarkText` - Watermark content (text/emoji)

### Effects

- `shimmer` - Boolean to enable/disable shimmer animation

## Benefits

✅ **Unlimited Skins** - Add as many as you want  
✅ **Database-Driven** - No code deployment needed to change pack skins  
✅ **Type-Safe** - Full TypeScript support  
✅ **Centralized** - All styling in one configuration object  
✅ **Future-Proof** - Easy to extend with new properties

## Future Enhancements

Potential future additions:

- Dynamic shimmer colors per skin
- Custom animations per skin
- Sound themes tied to skins
- Admin UI for creating skins visually
- Skin preview mode
- User-selectable skins (override pack default)
