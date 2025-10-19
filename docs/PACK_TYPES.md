# Pack Types Feature Documentation

## Overview

The Pack Types feature allows question sets (packs) to be categorized by their content type, enabling different game modes, educational content, and specialized experiences beyond standard trivia quizzes.

## Database Schema

### Pack Type Enum

```sql
CREATE TYPE pack_type AS ENUM (
  'quiz',       -- Standard trivia quiz (default)
  'challenge',  -- Timed challenges or competitive mode
  'learning',   -- Educational content with explanations
  'party',      -- Party game mode with special rules
  'kids',       -- Kid-friendly content
  'expert',     -- Advanced/expert level content
  'seasonal',   -- Holiday or seasonal content
  'custom'      -- User-created or special packs
);
```

### Table Update

- **Table**: `question_sets`
- **New Column**: `pack_type pack_type DEFAULT 'quiz' NOT NULL`
- **Index**: `idx_question_sets_pack_type`

## Migration

**File**: `database/migrations/004_add_pack_type.sql`  
**Script**: `database/run-pack-type-migration.js`

**Status**: ✅ Completed on 2025-10-19

- All existing packs migrated to 'quiz' type
- 3 packs in database (all published)

## Pack Type Descriptions

### 🎯 Quiz (Default)

Standard trivia questions in the classic HUMBUG! format. Multiple-choice answers where only one is correct.

**Use cases**:

- General knowledge trivia
- Category-specific quizzes (sports, entertainment, etc.)
- Traditional party game format

### ⚡ Challenge

Timed or competitive gameplay with special scoring mechanics.

**Use cases**:

- Speed rounds
- Head-to-head competitions
- Tournament modes
- Leaderboard-based play

### 📚 Learning

Educational content with detailed explanations, sources, and learning objectives.

**Use cases**:

- Educational trivia
- Fact-learning sessions
- Quiz with explanations after answers
- Source attribution emphasis

### 🎉 Party

Specialized party game modes with unique rules or team-based play.

**Use cases**:

- Team challenges
- Role-based gameplay
- Special party mechanics
- Large group formats

### 👶 Kids

Age-appropriate content designed for younger players.

**Use cases**:

- Child-friendly questions
- Simpler vocabulary
- Educational for children
- Family-friendly content

### 🏆 Expert

Advanced difficulty content for experienced players.

**Use cases**:

- Expert-level trivia
- Specialized knowledge areas
- Championship editions
- Pro player content

### 🎄 Seasonal

Holiday or seasonal themed content.

**Use cases**:

- Christmas trivia
- Summer vacation themes
- Holiday specials
- Seasonal events

### ✨ Custom

User-created or special edition packs that don't fit other categories.

**Use cases**:

- User-generated content
- Special collaborations
- Limited editions
- Experimental formats

## Admin Panel Integration

### Pack Management UI

Admins can now:

1. **Create** new packs with pack_type selection
2. **Edit** existing pack type classification
3. **Filter** packs by type in the admin panel
4. **View** pack type in pack listings

### Form Fields

**Pack Edit Dialog**:

```typescript
{
  name_en: string;
  name_hu: string;
  description_en: string;
  description_hu: string;
  access_level: "free" | "premium" | "admin_only";
  pack_type: "quiz" |
    "challenge" |
    "learning" |
    "party" |
    "kids" |
    "expert" |
    "seasonal" |
    "custom";
  is_active: boolean;
  is_published: boolean;
}
```

## API Changes

### GET /api/question-sets

**Response includes**:

```json
{
  "success": true,
  "sets": [
    {
      "id": 1,
      "slug": "original",
      "name_en": "Original HUMBUG!",
      "name_hu": "Eredeti HUMBUG!",
      "pack_type": "quiz",
      "access_level": "free",
      ...
    }
  ]
}
```

### GET /api/admin/packs (To be implemented)

**Query Parameters**:

- `pack_type`: Filter by type (optional)
- `access_level`: Filter by access (optional)
- `is_active`: Filter by status (optional)

## Frontend Display

### User-Facing Features

1. **Pack Type Badges**: Visual indicators for pack type
2. **Filtering**: Users can filter by pack type
3. **Icons**: Type-specific icons for better UX
4. **Descriptions**: Type-appropriate descriptions

### Recommended Icons

- 🎯 Quiz: `target` or `circle-question`
- ⚡ Challenge: `lightning` or `timer`
- 📚 Learning: `book` or `graduation-cap`
- 🎉 Party: `party-popper` or `confetti`
- 👶 Kids: `baby` or `smiley`
- 🏆 Expert: `trophy` or `crown`
- 🎄 Seasonal: `calendar` or `sparkles`
- ✨ Custom: `star` or `magic-wand`

## Future Enhancements

### Gameplay Variations

Each pack type could have:

- Custom UI themes
- Different time limits
- Type-specific scoring
- Unique sound effects
- Special animations

### Statistics

Track separately by pack type:

- Average completion rates
- User preferences
- Popular types
- Engagement metrics

### Content Recommendations

- Suggest packs based on type preferences
- "More like this" feature
- Type-based collections
- Seasonal promotions

## Best Practices

### Content Creation

1. **Choose appropriate type** based on content and audience
2. **Set access level** according to content quality and target
3. **Use consistent naming** for similar pack types
4. **Add metadata** for better discovery
5. **Test thoroughly** before publishing

### Type Selection Guidelines

| Type      | Best For          | Avoid                  |
| --------- | ----------------- | ---------------------- |
| quiz      | General trivia    | Time-sensitive content |
| challenge | Competitive play  | Relaxed learning       |
| learning  | Educational goals | Quick party games      |
| party     | Large groups      | Solo study             |
| kids      | Ages 6-12         | Adult themes           |
| expert    | Specialists       | Beginners              |
| seasonal  | Events/holidays   | Evergreen content      |
| custom    | Unique formats    | Standard quizzes       |

## Migration History

| Version | Date       | Description                   | Status      |
| ------- | ---------- | ----------------------------- | ----------- |
| 004     | 2025-10-19 | Add pack_type enum and column | ✅ Complete |

## Related Files

- `database/schema.sql` - Main schema definition
- `database/migrations/004_add_pack_type.sql` - Migration SQL
- `database/run-pack-type-migration.js` - Migration script
- `docs/PACK_TYPES.md` - This file

## See Also

- [Question Management](./QUESTION_TRACKING.md)
- [Admin Panel Features](../README.md#admin-panel)
- [Database Schema](../database/SCHEMA_DOCUMENTATION.md)
