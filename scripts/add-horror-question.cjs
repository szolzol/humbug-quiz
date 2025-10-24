require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

if (!process.env.POSTGRES_POSTGRES_URL) {
  console.error("❌ Missing POSTGRES_POSTGRES_URL");
  process.exit(1);
}

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function addSampleQuestion() {
  try {
    const setId = 4; // Horror Tagen Special Set ID

    console.log("📝 Adding sample question to Horror Tagen pack (ID: 4)...\n");

    // Check if questions already exist
    const existing = await sql`
      SELECT COUNT(*) as count FROM questions WHERE set_id = ${setId}
    `;

    if (existing[0].count > 0) {
      console.log(
        `✅ Pack already has ${existing[0].count} question(s). Skipping.`
      );
      process.exit(0);
    }

    // Add sample question
    const question = await sql`
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
        'Name a famous horror movie franchise',
        'Mondj egy híres horror filmsorozatot',
        'entertainment',
        'medium',
        1,
        true
      )
      RETURNING id, question_en
    `;

    console.log("✅ Question added:", question[0].question_en);

    const questionId = question[0].id;

    // Add answers
    const answers = [
      "Friday the 13th",
      "A Nightmare on Elm Street",
      "Halloween",
      "Saw",
      "The Conjuring",
      "Paranormal Activity",
      "Scream",
      "Child's Play",
      "The Purge",
      "Insidious",
      "The Ring",
      "Final Destination",
      "Resident Evil",
      "The Texas Chain Saw Massacre",
      "Hellraiser",
    ];

    let orderIndex = 1;
    for (const answer of answers) {
      await sql`
        INSERT INTO answers (
          question_id,
          answer_en,
          answer_hu,
          order_index,
          is_alternative
        ) VALUES (
          ${questionId},
          ${answer},
          ${answer},
          ${orderIndex},
          false
        )
      `;
      orderIndex++;
    }

    console.log(`✅ Added ${answers.length} answers\n`);

    // Update question count
    await sql`
      UPDATE question_sets
      SET question_count = (
        SELECT COUNT(*) FROM questions WHERE set_id = ${setId}
      )
      WHERE id = ${setId}
    `;

    console.log("🎃 Horror Tagen pack ready!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addSampleQuestion();
