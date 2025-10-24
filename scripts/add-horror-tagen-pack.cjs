require("dotenv/config");/**

const { neon } = require("@neondatabase/serverless"); * Add Horror Tagen Special Set - Premium Question Pack

 * 

if (!process.env.POSTGRES_POSTGRES_URL) { * This script creates a new PREMIUM question pack with a horror theme

  console.error("❌ Missing POSTGRES_POSTGRES_URL environment variable"); * and adds a sample question.

  process.exit(1); */

}

require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.POSTGRES_POSTGRES_URL);const { neon } = require("@neondatabase/serverless");



async function addHorrorTagenPack() {const sql = neon(process.env.POSTGRES_POSTGRES_URL);

  try {

    console.log("🎃 Creating Horror Tagen Special Set...\n");async function addHorrorTagenPack() {

  try {

    // Check if the set already exists (ID 4 was created in previous run)    console.log("🎃 Creating Horror Tagen Special Set...\n");

    const existing = await sql`

      SELECT id, slug, name_en, question_count     // 1. Create the question set

      FROM question_sets     const questionSet = await sql`

      WHERE slug = 'horror-tagen-special'      INSERT INTO question_sets (

    `;        slug,

        name_en,

    if (existing.length > 0) {        name_hu,

      console.log("⚠️  Horror Tagen Special Set already exists:");        description_en,

      console.log(JSON.stringify(existing[0], null, 2));        description_hu,

              is_active,

      const setId = existing[0].id;        access_level,

              pack_type,

      // Check if sample question exists        is_published,

      const questions = await sql`        display_order

        SELECT COUNT(*) as count FROM questions WHERE set_id = ${setId}      ) VALUES (

      `;        'horror-tagen-special',

              '👻 Horror Tagen Special Set',

      if (questions[0].count > 0) {        '👻 Horror Tagen Special Set',

        console.log("\n✅ Pack already has questions. Nothing to do.");        'Premium horror-themed questions for the brave ones',

        process.exit(0);        'Prémium horror témájú kérdések a bátraknak',

      }        true,

              'premium',

      console.log("\n📝 Adding sample question to existing set...");        'quiz',

              true,

      // Add sample question        3

      const sampleQuestion = await sql`      )

        INSERT INTO questions (      RETURNING id, slug, name_en, name_hu, access_level

          set_id,    `;

          question_en,

          question_hu,    console.log("✅ Question set created:");

          category,    console.log(JSON.stringify(questionSet[0], null, 2));

          difficulty,

          is_active    const setId = questionSet[0].id;

        ) VALUES (

          ${setId},    // 2. Add sample question

          'Name a famous horror movie franchise',    const sampleQuestion = await sql`

          'Mondj egy híres horror filmsorozatot',      INSERT INTO questions (

          'Horror Movies',        set_id,

          'medium',        question_en,

          true        question_hu,

        )        category,

        RETURNING id, question_en, question_hu, category        difficulty,

      `;        is_active

      ) VALUES (

      console.log("\n✅ Sample question added:");        ${setId},

      console.log(JSON.stringify(sampleQuestion[0], null, 2));        'Name a famous horror movie franchise',

        'Mondj egy híres horror filmsorozatot',

      // Add sample answers        'Horror Movies',

      const questionId = sampleQuestion[0].id;        'medium',

      const answers = [        true

        'Friday the 13th',      )

        'A Nightmare on Elm Street',      RETURNING id

        'Halloween',    `;

        'Saw',          'The Texas Chain Saw Massacre',

        'The Conjuring',          'Hellraiser'

        'Paranormal Activity',        ],

        'Scream',        'https://en.wikipedia.org/wiki/List_of_horror_film_franchises',

        'Child\'s Play',        true

        'The Purge',      )

        'Insidious',      RETURNING id, question_text_en, question_text_hu, category

        'The Ring',    `;

        'Final Destination',

        'Resident Evil',    console.log("\n✅ Sample question added:");

        'The Texas Chain Saw Massacre',    console.log(JSON.stringify(sampleQuestion[0], null, 2));

        'Hellraiser'

      ];    // 3. Update question count in question_sets

    await sql`

      console.log("\n✅ Adding answers...");      UPDATE question_sets

      for (const answer of answers) {      SET question_count = (

        await sql`        SELECT COUNT(*) FROM questions WHERE question_set_id = ${setId} AND is_active = true

          INSERT INTO answers (question_id, answer_en, answer_hu, is_primary)      )

          VALUES (${questionId}, ${answer}, ${answer}, true)      WHERE id = ${setId}

        `;    `;

      }

      console.log(`   Added ${answers.length} answers`);    console.log("\n✅ Question count updated");



      // Update question count    // 4. Verify the result

      await sql`    const verification = await sql`

        UPDATE question_sets      SELECT 

        SET question_count = (        qs.id,

          SELECT COUNT(*) FROM questions WHERE set_id = ${setId} AND is_active = true        qs.slug,

        )        qs.name_en,

        WHERE id = ${setId}        qs.name_hu,

      `;        qs.access_level,

        qs.question_count,

      console.log("\n✅ Question count updated");        qs.icon

      FROM question_sets qs

      // Verify      WHERE qs.id = ${setId}

      const verification = await sql`    `;

        SELECT 

          qs.id,    console.log("\n🎃 Horror Tagen Special Set created successfully!");

          qs.slug,    console.log(JSON.stringify(verification[0], null, 2));

          qs.name_en,

          qs.name_hu,    console.log("\n📊 Summary:");

          qs.access_level,    console.log(`   ID: ${setId}`);

          qs.question_count    console.log(`   Slug: horror-tagen-special`);

        FROM question_sets qs    console.log(`   Access Level: premium`);

        WHERE qs.id = ${setId}    console.log(`   Questions: ${verification[0].question_count}`);

      `;    console.log(`   Icon: ${verification[0].icon}`);



      console.log("\n🎃 Horror Tagen Special Set updated successfully!");  } catch (error) {

      console.log(JSON.stringify(verification[0], null, 2));    console.error("❌ Error creating Horror Tagen pack:", error);

          throw error;

      process.exit(0);  }

    }}



    // If doesn't exist, create new set// Run the script

    const questionSet = await sql`addHorrorTagenPack()

      INSERT INTO question_sets (  .then(() => {

        slug,    console.log("\n✅ Script completed successfully!");

        name_en,    process.exit(0);

        name_hu,  })

        description_en,  .catch((error) => {

        description_hu,    console.error("\n❌ Script failed:", error);

        is_active,    process.exit(1);

        access_level,  });

        pack_type,
        is_published,
        display_order
      ) VALUES (
        'horror-tagen-special',
        '👻 Horror Tagen Special Set',
        '👻 Horror Tagen Special Set',
        'Premium horror-themed questions for the brave ones',
        'Prémium horror témájú kérdések a bátraknak',
        true,
        'premium',
        'quiz',
        true,
        3
      )
      RETURNING id, slug, name_en, name_hu, access_level
    `;

    console.log("✅ Question set created:");
    console.log(JSON.stringify(questionSet[0], null, 2));

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

addHorrorTagenPack().catch((err) => {
  console.error("\n❌ Script failed:", err);
  process.exit(1);
});
