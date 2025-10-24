require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function addHorrorQuestions() {
  try {
    const setId = 4; // Horror Tagen Special Set ID

    console.log("🎃 Adding Horror Film Klub questions...\n");

    // 1. Delete existing questions and answers
    console.log("🗑️  Deleting sample question...");
    await sql`DELETE FROM questions WHERE set_id = ${setId}`;
    console.log("✅ Cleared existing questions\n");

    // 2. Add all 13 questions with their answers
    const questions = [
      {
        question_en: "Name films that the club rated 8.0 or higher!",
        question_hu:
          "Sorolj fel filmeket, amelyeket a klub 8.0 vagy magasabb átlagra értékelt!",
        category: "entertainment",
        difficulty: "medium",
        answers: [
          "Paranormal Activity I",
          "Midsommar",
          "Cloverfield Lane 10",
          "The Others",
          "Talk to Me",
          "Menu",
          "The Shining",
          "It Follows",
          "Doctor Sleep",
        ],
      },
      {
        question_en: "Name Tasi's top 8 favorite horror films!",
        question_hu: "Nevezd meg Tasi top 8 kedvenc horror filmjét!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "Doctor Sleep",
          "Marrowbone",
          "Don't Breathe",
          "Beneath",
          "A Quiet Place II",
          "Smile",
          "Knock at the Cabin",
          "Paranormal Activity: Next of Kin",
        ],
      },
      {
        question_en: "Name films that the club rated below 4.0!",
        question_hu:
          "Sorolj fel filmeket, amelyeket a klub 4.0 alatti átlagra értékelt!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "Book of Shadows: Blair Witch 2",
          "Altered",
          "Lemon Tree Passage",
          "The Innkeepers",
          "Fagyott Május",
          "Mártírok",
          "Frontière(s)",
          "Body",
          "Empty Rooms",
          "Gallows Hill",
          "The Void",
          "Sauna",
          "Ringu 2",
          "The Pyramid",
          "Malignant",
        ],
      },
      {
        question_en: "Name Keri's top 8 favorite horror films!",
        question_hu: "Sorolj fel Keri (Kervár) top 8 kedvenc horror filmjét!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "Shutter",
          "Awakening",
          "Midsommar",
          "Late Night with the Devil",
          "Paranormal Activity I",
          "Let the right one in",
          "Menu",
          "The Shining",
        ],
      },
      {
        question_en: "Name Pityu's top 8 favorite horror films!",
        question_hu: "Nevezd meg Pityu top 8 kedvenc horror filmjét!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "Paranormal Activity I",
          "Rec",
          "The Shining",
          "The Tunnel",
          "The Descent",
          "Cloverfield Lane 10",
          "Midsommar",
          "Substance",
        ],
      },
      {
        question_en: "Name Kacsa's top 8 favorite horror films!",
        question_hu: "Sorolj fel Kacsa top 8 kedvenc horror filmjét!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "Grave Encounters",
          "A night in the woods",
          "Lost Highway",
          "Cloverfield Lane 10",
          "Smile",
          "Frozen",
          "The Others",
          "mother!",
        ],
      },
      {
        question_en: "Name Bunny's top 8 favorite horror films!",
        question_hu: "Nevezd meg Bunny top 8 kedvenc horror filmjét!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "The Others",
          "Midsommar",
          "Paranormal Activity I",
          "The Shining",
          "Grave Encounters",
          "It Follows",
          "Cloverfield Lane 10",
          "Menu",
        ],
      },
      {
        question_en: "Name Gyuri's top 8 favorite horror films!",
        question_hu: "Sorolj fel Gyuri top 8 kedvenc horror filmjét!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "Paranormal Activity I",
          "The VVitch",
          "The Shining",
          "Eden Lake",
          "The Descent",
          "The Others",
          "Alien",
          "It Follows",
        ],
      },
      {
        question_en: "Name films where animals die!",
        question_hu: "Sorolj fel olyan filmeket, amelyekben hal meg állat!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "Eden Lake",
          "Hereditary",
          "Midsommar",
          "The VVitch",
          "Don't Breathe",
          "The Shining",
          "Frozen",
          "The Descent",
          "The Lighthouse",
          "The Ritual",
          "Bone Tomahawk",
          "mother!",
          "It Follows",
          "A Quiet Place",
          "His House",
        ],
      },
      {
        question_en: "Which films were made before 2000?",
        question_hu: "Mely filmek készültek a megnézettek közül 2000 előtt?",
        category: "entertainment",
        difficulty: "medium",
        answers: [
          "The Shining",
          "Alien",
          "Ringu",
          "The Blair Witch Project",
          "Stir of Echoes",
          "House on Haunted Hill",
          "The Cure",
          "Lost Highway",
        ],
      },
      {
        question_en:
          "Name films that were divisive in the club (1.7+ deviation)!",
        question_hu:
          "Sorolj fel olyan filmeket, amelyek megosztóak voltak a klubban (1.7+ szórás)!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "Dark Water",
          "Under the Shadow",
          "Megan is missing",
          "A Girl Walks Home Alone at Night",
          "Sauna",
          "The ABCs of Death",
        ],
      },
      {
        question_en:
          "Name horror films where children or babies are main elements!",
        question_hu:
          "Nevezz meg horror filmeket, amelyekben gyerekek vagy babák a főbb elemek!",
        category: "entertainment",
        difficulty: "medium",
        answers: [
          "Insidious",
          "A tale of two sisters",
          "Babycall",
          "Mama",
          "Awakening",
          "Sinister",
          "The Conjuring",
          "The Others",
          "Insidious 2",
          "Babadook",
          "Case 39",
          "The Orphanage",
          "Hereditary",
          "Brightburn",
          "Gretel and Hansel",
        ],
      },
      {
        question_en: "Name films with Oscar-winning actors/actresses!",
        question_hu:
          "Sorolj fel filmeket a listából, amelyekben Oscar-díjas színész/színésznő szerepel!",
        category: "entertainment",
        difficulty: "hard",
        answers: [
          "The Others",
          "Us",
          "mother!",
          "Nope",
          "The Shining",
          "Alien",
          "Cabin in the woods",
        ],
      },
    ];

    let totalAnswers = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const orderIndex = i + 1;

      console.log(
        `📝 Adding Q${orderIndex}: ${q.question_hu.substring(0, 50)}...`
      );

      // Insert question
      const result = await sql`
        INSERT INTO questions (
          set_id,
          question_en,
          question_hu,
          category,
          difficulty,
          order_index,
          is_active
        ) VALUES (
          ${setId},
          ${q.question_en},
          ${q.question_hu},
          ${q.category},
          ${q.difficulty},
          ${orderIndex},
          true
        )
        RETURNING id
      `;

      const questionId = result[0].id;

      // Insert answers
      for (let j = 0; j < q.answers.length; j++) {
        await sql`
          INSERT INTO answers (
            question_id,
            answer_en,
            answer_hu,
            order_index,
            is_alternative
          ) VALUES (
            ${questionId},
            ${q.answers[j]},
            ${q.answers[j]},
            ${j + 1},
            false
          )
        `;
      }

      console.log(`   ✅ Added ${q.answers.length} answers`);
      totalAnswers += q.answers.length;
    }

    // Update question count
    await sql`
      UPDATE question_sets
      SET question_count = (
        SELECT COUNT(*) FROM questions WHERE set_id = ${setId}
      )
      WHERE id = ${setId}
    `;

    console.log(`\n🎃 Horror Film Klub Kvíz complete!`);
    console.log(`   Questions: ${questions.length}`);
    console.log(`   Total answers: ${totalAnswers}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addHorrorQuestions();
