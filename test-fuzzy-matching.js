/**
 * Fuzzy Matching Demo
 * Tests the answer matching algorithm with various inputs
 */

// Copy of fuzzy matching logic from api/rooms.ts
function fuzzyMatchAnswer(userAnswer, correctAnswers) {
  const normalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/^(the|a|an|le|la|les|el|il|un|una)\s+/i, "")
      .replace(
        /\s+(fc|cf|afc|bfc|cfc|united|city|town|rovers|athletic|albion|wanderers)$/i,
        ""
      )
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const extractKeyWords = (str) => {
    return str
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .map((w) => w.toLowerCase());
  };

  const normalizedUser = normalize(userAnswer);
  const userWords = extractKeyWords(normalizedUser);

  for (const correct of correctAnswers) {
    const normalizedCorrect = normalize(correct);

    if (normalizedUser === normalizedCorrect) {
      return true;
    }

    const correctWords = extractKeyWords(normalizedCorrect);

    if (correctWords.length === 0) continue;

    const matchingWords = userWords.filter((word) =>
      correctWords.some((cWord) => {
        if (word === cWord) return true;

        if (word.length >= 3 && cWord.length >= 3) {
          return levenshteinDistance(word, cWord) <= 1;
        }

        return false;
      })
    );

    const overlapRatio = matchingWords.length / correctWords.length;

    if (
      overlapRatio === 1.0 ||
      (correctWords.length >= 2 && overlapRatio >= 0.75)
    ) {
      return true;
    }
  }

  return false;
}

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Test cases
console.log("🧪 Fuzzy Answer Matching Tests\n");

const tests = [
  // Movies - missing "The"
  {
    correct: ["The Shawshank Redemption", "The Matrix"],
    user: "Shawshank Redemption",
    expected: true,
    reason: "Missing 'The' prefix",
  },
  {
    correct: ["The Matrix"],
    user: "Matrix",
    expected: true,
    reason: "Missing 'The' prefix",
  },

  // Football clubs - missing suffixes
  {
    correct: ["Manchester United", "Real Madrid"],
    user: "Manchester",
    expected: true,
    reason: "Missing 'United' suffix",
  },
  {
    correct: ["Bayern Munich FC"],
    user: "Bayern Munich",
    expected: true,
    reason: "Missing 'FC' suffix",
  },
  {
    correct: ["Arsenal FC"],
    user: "Arsenal",
    expected: true,
    reason: "Missing 'FC' suffix",
  },

  // Typos - 1 character off
  {
    correct: ["Barcelona"],
    user: "Barcelone",
    expected: true,
    reason: "1-char typo (Barcelone vs Barcelona)",
  },
  {
    correct: ["Madrid"],
    user: "Madric",
    expected: true,
    reason: "1-char typo (Madric vs Madrid)",
  },

  // Case sensitivity
  {
    correct: ["Real Madrid"],
    user: "REAL MADRID",
    expected: true,
    reason: "Different case",
  },

  // Multiple words - 75% match threshold
  {
    correct: ["Manchester United FC"],
    user: "Manchester United",
    expected: true,
    reason: "2/3 words match",
  },

  // Wrong answers
  {
    correct: ["Real Madrid", "Barcelona"],
    user: "Liverpool",
    expected: false,
    reason: "Completely different answer",
  },
  {
    correct: ["The Matrix"],
    user: "Star Wars",
    expected: false,
    reason: "Wrong movie",
  },

  // Numbers and special chars
  {
    correct: ["1. Real Madrid (991 pts)"],
    user: "Real Madrid",
    expected: true,
    reason: "Extra numbering and points removed",
  },

  // Partial words
  {
    correct: ["Cristiano Ronaldo (664M)"],
    user: "Cristiano",
    expected: false,
    reason: "Only first name (50% match)",
  },
  {
    correct: ["Cristiano Ronaldo"],
    user: "Ronaldo",
    expected: false,
    reason: "Only last name (50% match)",
  },
];

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  const result = fuzzyMatchAnswer(test.user, test.correct);
  const status = result === test.expected ? "✅ PASS" : "❌ FAIL";

  if (result === test.expected) {
    passed++;
  } else {
    failed++;
  }

  console.log(
    `${index + 1}. ${status}: "${test.user}" vs ["${test.correct.join(
      '", "'
    )}"]`
  );
  console.log(`   Expected: ${test.expected}, Got: ${result}`);
  console.log(`   Reason: ${test.reason}\n`);
});

console.log(
  `\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`
);

if (failed === 0) {
  console.log("🎉 All tests passed!");
} else {
  console.log("⚠️  Some tests failed");
}
