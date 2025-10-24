require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.POSTGRES_POSTGRES_URL);

async function updateAnswersWithDetails() {
  try {
    const setId = 4;

    console.log("🔄 Updating answers with detailed information...\n");

    // Define updated answers with full details for each question
    const updatedQuestions = [
      {
        order_index: 1,
        answers: [
          "Paranormal Activity I (8.7 - IMDb: 6.3)",
          "Midsommar (8.6 - IMDb: 7.1)",
          "Cloverfield Lane 10 (8.3 - IMDb: 7.2)",
          "The Others (8.2 - IMDb: 7.6)",
          "Talk to Me (8.13 - IMDb: 7.1)",
          "Menu (8.08 - IMDb: 7.2)",
          "The Shining (8.0 - IMDb: 8.4)",
          "It Follows (8.0 - IMDb: 6.8)",
          "Doctor Sleep (8.0 - IMDb: 7.3)",
        ],
      },
      {
        order_index: 2,
        answers: [
          "Doctor Sleep (9.0)",
          "Marrowbone (8.5)",
          "Don't Breathe (8.0)",
          "Beneath (8.0)",
          "A Quiet Place II (8.0)",
          "Smile (8.0)",
          "Knock at the Cabin (8.0)",
          "Paranormal Activity: Next of Kin (8.0)",
        ],
      },
      {
        order_index: 3,
        answers: [
          "Book of Shadows: Blair Witch 2 (2.38 - IMDb: 4.1)",
          "Altered (2.4 - IMDb: 5.6)",
          "Lemon Tree Passage (2.5 - IMDb: 5.0)",
          "The Innkeepers (2.63 - IMDb: 5.5)",
          "Fagyott Május (2.67 - IMDb: 4.8)",
          "Mártírok (2.8 - IMDb: 7.0)",
          "Frontière(s) (3.2 - IMDb: 6.2)",
          "Body (3.3 - IMDb: 5.8)",
          "Empty Rooms (3.33 - IMDb: 5.1)",
          "Gallows Hill (3.5 - IMDb: 4.8)",
          "The Void (3.5 - IMDb: 5.8)",
          "Sauna (3.83 - IMDb: 6.2)",
          "Ringu 2 (3.88 - IMDb: 5.9)",
          "The Pyramid (3.88 - IMDb: 4.6)",
          "Malignant (3.88 - IMDb: 6.2)",
        ],
      },
      {
        order_index: 4,
        answers: [
          "Shutter (9.0)",
          "Awakening (9.0)",
          "Midsommar (9.0)",
          "Late Night with the Devil (9.0)",
          "Paranormal Activity I (8.5)",
          "Let the right one in (8.5)",
          "Menu (8.5)",
          "The Shining (8.0)",
        ],
      },
      {
        order_index: 5,
        answers: [
          "Paranormal Activity I (10.0)",
          "Rec (9.5)",
          "The Shining (9.0)",
          "The Tunnel (9.0)",
          "The Descent (8.5)",
          "Cloverfield Lane 10 (8.5)",
          "Midsommar (8.5)",
          "Substance (8.5)",
        ],
      },
      {
        order_index: 6,
        answers: [
          "Grave Encounters (9.0)",
          "A night in the woods (9.0)",
          "Lost Highway (9.0)",
          "Cloverfield Lane 10 (9.0)",
          "Smile (9.0)",
          "Frozen (8.5)",
          "The Others (8.5)",
          "mother! (8.5)",
        ],
      },
      {
        order_index: 7,
        answers: [
          "The Others (9.0)",
          "Midsommar (9.0)",
          "Paranormal Activity I (8.5)",
          "The Shining (8.5)",
          "Grave Encounters (8.5)",
          "It Follows (8.5)",
          "Cloverfield Lane 10 (8.5)",
          "Menu (8.5)",
        ],
      },
      {
        order_index: 8,
        answers: [
          "Paranormal Activity I (9.0)",
          "The VVitch (8.5)",
          "The Shining (8.0)",
          "Eden Lake (8.0)",
          "The Descent (8.0)",
          "The Others (8.0)",
          "Alien (8.0)",
          "It Follows (8.0)",
        ],
      },
      {
        order_index: 9,
        answers: [
          "Eden Lake (kutya)",
          "Hereditary (madár, kutya)",
          "Midsommar (medve)",
          "The VVitch (kecske)",
          "Don't Breathe (kutya)",
          "The Shining (flashback - ló)",
          "Frozen (farkasok)",
          "The Descent (tetemek)",
          "The Lighthouse (madár)",
          "The Ritual (szarvas)",
          "Bone Tomahawk (lovak)",
          "mother! (madár)",
          "It Follows (állatok)",
          "A Quiet Place (háziállatok)",
          "His House (kutya)",
        ],
      },
      {
        order_index: 10,
        answers: [
          "The Shining (1980)",
          "Alien (1979)",
          "Ringu (1998)",
          "The Blair Witch Project (1999)",
          "Stir of Echoes (1999)",
          "House on Haunted Hill (1999)",
          "The Cure (1997)",
          "Lost Highway (1997)",
        ],
      },
      {
        order_index: 11,
        answers: [
          "Dark Water (2.61 szórás)",
          "Under the Shadow (1.89 szórás)",
          "Megan is missing (1.85 szórás)",
          "A Girl Walks Home Alone at Night (1.89 szórás)",
          "Sauna (1.74 szórás)",
          "The ABCs of Death (1.70 szórás)",
        ],
      },
      {
        order_index: 12,
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
        order_index: 13,
        answers: [
          "The Others (Nicole Kidman - Oscar: The Hours 2003)",
          "Us (Lupita Nyong'o - Oscar: 12 Years a Slave 2014)",
          "mother! (Jennifer Lawrence - Oscar: Silver Linings Playbook 2013)",
          "Nope (Lupita Nyong'o - Oscar: 12 Years a Slave 2014)",
          "The Shining (Jack Nicholson - 3x Oscar)",
          "Alien (Sigourney Weaver - 2x jelölt)",
          "Cabin in the woods (Richard Jenkins - jelölt)",
        ],
      },
    ];

    let totalUpdated = 0;

    for (const q of updatedQuestions) {
      // Get question ID
      const question = await sql`
        SELECT id FROM questions 
        WHERE set_id = ${setId} AND order_index = ${q.order_index}
      `;

      if (question.length === 0) {
        console.log(`❌ Question ${q.order_index} not found`);
        continue;
      }

      const questionId = question[0].id;

      // Delete old answers
      await sql`DELETE FROM answers WHERE question_id = ${questionId}`;

      // Insert new detailed answers
      for (let i = 0; i < q.answers.length; i++) {
        await sql`
          INSERT INTO answers (
            question_id,
            answer_en,
            answer_hu,
            order_index,
            is_alternative
          ) VALUES (
            ${questionId},
            ${q.answers[i]},
            ${q.answers[i]},
            ${i + 1},
            false
          )
        `;
      }

      console.log(`✅ Q${q.order_index}: Updated ${q.answers.length} answers`);
      totalUpdated += q.answers.length;
    }

    console.log(
      `\n🎃 Updated ${totalUpdated} answers with detailed information!`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateAnswersWithDetails();
