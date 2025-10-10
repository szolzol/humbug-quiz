import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Users,
  Target,
  Crown,
  Play,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import gameRulesAudio from "@/assets/audio/humbug-rules.mp3";
import humbugMoodImage from "@/assets/images/humbug-mood.png";

const sampleQuestions = [
  {
    id: "1",
    category: "Turizmus",
    question:
      "Melyek a legkedveltebb hazai turisztikai úticélok a magyarok körében, a belföldi vendégéjszakák száma alapján?",
    answers: [
      "Budapest",
      "Siófok",
      "Balatonfüred",
      "Hajdúszoboszló",
      "Zalakaros",
      "Hévíz",
      "Gyula",
      "Eger",
      "Miskolc",
      "Bük",
      "Szeged",
      "Nyíregyháza",
      "Sárvár",
      "Debrecen",
      "Győr",
    ],
  },
  {
    id: "2",
    category: "Közösségi média",
    question:
      "Mely hírességek oldalai találhatóak meg az Instagram 15 legtöbb követővel rendelkező oldala között?",
    answers: [
      "Cristiano Ronaldo",
      "Lionel Messi",
      "Selena Gomez",
      "Kylie Jenner",
      "Dwayne Johnson",
      "Ariana Grande",
      "Kim Kardashian",
      "Beyoncé",
      "Khloé Kardashian",
      "Kendall Jenner",
      "Justin Bieber",
      "Taylor Swift",
    ],
  },
  {
    id: "3",
    category: "Irodalom",
    question:
      "Nevezzetek meg olyan szerzőket, akiknek legalább egy művük szerepel a jelenleg érvényes Nemzeti Alaptantervben felsorolt kötelező olvasmányok közt!",
    answers: [
      "Petőfi Sándor",
      "Molnár Ferenc",
      "Arany János",
      "Gárdonyi Géza",
      "Jókai Mór",
      "Mikszáth Kálmán",
      "Móricz Zsigmond",
      "William Shakespeare",
      "Molière",
      "Szabó Magda",
      "Homérosz",
      "Szophoklész",
      "Dante Alighieri",
      "François Villon",
      "Boccaccio",
      "Zrínyi Miklós",
      "Mikes Kelemen",
      "Katona József",
      "Vörösmarty Mihály",
      "Honoré de Balzac",
      "Stendhal",
      "Henrik Ibsen",
      "Anton Pavlovics Csehov",
      "Lev Nyikolajevics Tolsztoj",
      "Samuel B. Beckett",
      "Friedrich Dürrenmatt",
      "Madách Imre",
      "Herczeg Ferenc",
      "Babits Mihály",
      "Wass Albert",
      "Örkény István",
    ],
  },
  {
    id: "4",
    category: "Videójátékok",
    question:
      "Nevezzetek meg olyan videójáték-franchiseokat, amelyekből legalább 100 millió példányt adtak el a világon!",
    answers: [
      "Mario",
      "Tetris",
      "Pokémon",
      "Call of Duty",
      "Grand Theft Auto",
      "FIFA",
      "Minecraft",
      "Wii",
      "Lego",
      "The Sims",
      "Assassin's Creed",
      "Final Fantasy",
      "Sonic the Hedgehog",
      "The Legend of Zelda",
      "Need for Speed",
      "Resident Evil",
      "Madden NFL",
      "NBA 2K",
      "Star Wars",
      "Pro Evolution Soccer",
    ],
  },
  {
    id: "5",
    category: "Autómárkák",
    question: "Melyik a 10 leggyakoribb autómárka Magyarországon útjain?",
    answers: [
      "Opel",
      "Suzuki",
      "Volkswagen",
      "Ford",
      "Toyota",
      "Skoda",
      "Renault",
      "Peugeot",
      "BMW",
      "Mercedes",
      "Audi",
      "Fiat",
      "Citroen",
      "Honda",
      "KIA",
    ],
  },
  {
    id: "6",
    category: "Repülőterek",
    question:
      "Melyek azok a városok, amelyeknek legalább 1 reptere szerepel Európa 15 legforgalmasabb repülőtere között?",
    answers: [
      "London",
      "Isztanbul",
      "Párizs",
      "Amszterdam",
      "Madrid",
      "Frankfurt",
      "Barcelona",
      "Róma",
      "München",
      "Moszkva",
      "Lisszabon",
      "Palma de Mallorca",
      "Dublin",
    ],
  },
  {
    id: "7",
    category: "Filmek",
    question:
      "Nevezzetek meg filmeket, amelyeknek legalább 8,7-es értékelésük van IMDb-n!",
    answers: [
      "A remény rabjai",
      "A keresztapa",
      "A sötét lovag",
      "A keresztapa II",
      "Tizenkét dühös ember",
      "Schindler listája",
      "A Gyűrűk Ura: A király visszatér",
      "Ponyvaregény",
      "A Gyűrűk Ura: A gyűrű szövetsége",
      "A Jó, a Rossz és a Csúf",
      "Forrest Gump",
      "Harcosok klubja",
      "A Gyűrűk Ura: A két torony",
      "Eredet",
      "A Birodalom visszavág",
      "Mátrix",
      "Nagymenők",
      "Száll a kakukk fészkére",
      "Csillagok között",
      "Hetedik",
    ],
  },
  {
    id: "8",
    category: "Futball",
    question:
      "A Bajnokok Ligája indulása óta (1992) melyik 10 klubcsapat szerzett a legtöbb pontot a sorozatban?",
    answers: [
      "Real Madrid",
      "Bayern München",
      "Barcelona",
      "Manchester United",
      "Juventus",
      "Milan",
      "Liverpool",
      "Porto",
      "Benfica",
      "Chelsea",
      "Ajax",
      "Inter",
      "Arsenal",
      "Atletico Madrid",
      "Dortmund",
    ],
  },
  {
    id: "9",
    category: "Zene",
    question:
      "Soroljatok fel zenei előadókat, akik karrierjük során legalább 200 millió lemezt adtak el!",
    answers: [
      "The Beatles",
      "Elvis Presley",
      "Michael Jackson",
      "Elton John",
      "Queen",
      "Madonna",
      "Led Zeppelin",
      "Rihanna",
      "Pink Floyd",
      "Eminem",
      "Mariah Carey",
      "Taylor Swift",
      "Beyoncé",
      "Whitney Houston",
      "Eagles",
      "Céline Dion",
      "AC/DC",
      "The Rolling Stones",
    ],
  },
  {
    id: "10",
    category: "Keresztnevek",
    question:
      "Melyik a 15 leggyakoribb női keresztnév Magyarországon a teljes népesség körében?",
    answers: [
      "Mária",
      "Erzsébet",
      "Katalin",
      "Éva",
      "Ilona",
      "Anna",
      "Zsuzsanna",
      "Margit",
      "Andrea",
      "Judit",
      "Ágnes",
      "Ildikó",
      "Erika",
      "Julianna",
      "Krisztina",
    ],
  },
  {
    id: "11",
    category: "Gasztronómia",
    question:
      "Milyen hozzávalókat tartalmazott Dalnoki Bence nyertes Bocuse d'Or halászlé receptje?",
    answers: [
      "ponty",
      "víz",
      "vöröshagyma",
      "fokhagyma",
      "paradicsom",
      "hegyes erős paprika",
      "fehérbor",
      "édes fűszerpaprika",
      "csípős fűszerpaprika",
      "tésztaliszt",
      "durumliszt",
      "tojássárgája",
      "tojásfehérje",
      "olívaolaj",
      "só",
      "ecet",
      "tej",
      "ikra",
      "tejföl",
      "bors",
      "salotta hagyma",
      "savanyított almapaprika",
      "capri gyümölcs",
      "snidling",
      "marokkói citrom",
    ],
  },
  {
    id: "12",
    category: "Technológia",
    question:
      "Melyik volt az okostelefonokra legtöbbször letöltött 10 alkalmazás 2023-ban, globálisan?",
    answers: [
      "TikTok",
      "Instagram",
      "Facebook",
      "WhatsApp",
      "CapCut",
      "Snapchat",
      "Telegram",
      "Facebook Messenger",
      "WhatsApp Business",
      "Spotify",
    ],
  },
  {
    id: "13",
    category: "Marvel",
    question:
      "Melyek azok a Marvel-karakterek, amelyek legalább 7 Marvel Cinematic Universe-filmben feltűntek?",
    answers: [
      "Winter Soldier",
      "Bucky Barnes",
      "Black Widow",
      "Pepper Potts",
      "J.A.R.V.I.S.",
      "Vision",
      "James Rhodes",
      "War Machine",
      "Thor",
      "Steve Rogers",
      "Captain America",
      "Nick Fury",
      "Tony Stark",
      "Iron Man",
    ],
  },
  {
    id: "14",
    category: "Televízió",
    question:
      "Soroljatok fel tévésorozatokat vagy talk show-kat, amelyek történetük során több mint 20 Emmy-díjat kaptak!",
    answers: [
      "Gengszterkorzó",
      "A káprázatos Mrs. Maisel",
      "24",
      "New York rendőrei",
      "A korona",
      "Maffiózók",
      "All in the Family",
      "Modern család",
      "Vészhelyzet",
      "The Carol Burnett Show",
      "The Daily Show",
      "RuPaul",
      "John Oliver-show",
      "Az elnök emberei",
      "Külvárosi Körzet",
      "American Masters",
      "Cheers",
      "Mary Tyler Moore",
      "A Simpson család",
      "Frasier",
      "Trónok harca",
      "Saturday Night Live",
    ],
  },
  {
    id: "15",
    category: "Történelem",
    question:
      "Soroljatok fel keresztneveket, amelyeket a történelem során legalább 1 magyar kormányfő viselt!",
    answers: [
      "István",
      "Gyula",
      "Sándor",
      "Dénes",
      "Pál",
      "Károly",
      "Miklós",
      "László",
      "Imre",
      "András",
      "Ferenc",
      "József",
      "János",
      "Kálmán",
      "Béla",
      "Frigyes",
      "Géza",
      "Lajos",
      "Viktor",
      "Tibor",
      "Jenő",
      "Péter",
      "Mihály",
      "Gyula",
    ],
  },
];

function App() {
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Studio Light Animations */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 60%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 80%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 30%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed inset-0 pointer-events-none z-0"
      />
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 70%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Combined Hero + Game Rules Section with Shared Background */}
      <div className="relative overflow-hidden">
        {/* Shared Background Image - covers both hero and game rules */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat opacity-70 hero-background"
          style={{
            backgroundImage: `url(${humbugMoodImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/90" />

        {/* Hero Section */}
        <motion.section
          className="relative min-h-[35vh] flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}>
          <div className="container mx-auto px-6 py-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1.2,
                  delay: 0.3,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                className="mb-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-2xl">
                    HUMBUG!
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1.0,
                  delay: 0.6,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                className="text-xl md:text-3xl font-bold text-foreground/90 mb-6 tracking-wide">
                FAKE IT TILL YOU WIN IT!
              </motion.p>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.9,
                  delay: 0.9,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                Egy új, kvízes partyjáték, ahol a tudás, a bátorság és a
                megtévesztés találkozik!
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 1.2,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    document
                      .getElementById("questions-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}>
                  <CaretDown className="mr-2" size={24} weight="fill" />
                  Kezdjük a játékot!
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-16 h-16 bg-primary/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-20 right-10 w-24 h-24 bg-accent/20 rounded-full blur-xl"
          />
        </motion.section>

        {/* Game Rules */}
        <section className="relative py-14">
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16">
              {/* <h2 className="text-4xl font-bold mb-6">Játékszabályok</h2> */}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto">
              <AudioPlayer src={gameRulesAudio} title="Hogyan játsszuk?" />

              <Button
                onClick={() => setIsRulesOpen(!isRulesOpen)}
                className="w-full flex items-center justify-between text-sm font-medium py-2 h-auto mt-0 rounded-t-none border-t-0 bg-yellow-500/20 hover:bg-muted/50 text-foreground"
                variant="ghost">
                <span>Részletes szabályok</span>
                <motion.div
                  animate={{ rotate: isRulesOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}>
                  {isRulesOpen ? (
                    <CaretUp size={20} />
                  ) : (
                    <CaretDown size={20} />
                  )}
                </motion.div>
              </Button>

              <AnimatePresence>
                {isRulesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden">
                    <Card className="bg-card/30 border-border/30 rounded-t-none border-t-0 mt-0">
                      <CardContent className="p-8 pt-4">
                        <div className="space-y-6 text-card-foreground">
                          <div>
                            <h3 className="text-xl font-semibold mb-3 text-primary">
                              1. Előkészületek
                            </h3>
                            <p className="leading-relaxed">
                              A játék semmilyen kiegészítőt, előkészületet nem
                              igényel, egyedül a játékmesternek van szüksége a
                              telefonjára, hogy felolvassa a kérdéseket és
                              ellenőrizze a válaszokat. A játékosok száma 3 és 8
                              fő között lehet, de akár többen is játszhatják, ha
                              van elég hely és idő.
                            </p>
                          </div>

                          <Separator className="bg-border/50" />

                          <div>
                            <h3 className="text-xl font-semibold mb-3 text-primary">
                              2. A játék menete
                            </h3>
                            <p className="leading-relaxed">
                              A játék menete körökre oszlik, minden kör egy
                              kérdésből áll. A játékmester feltesz egy
                              kvízkérdést a teljes csapatnak, melynek általában
                              legalább egy tucat helyes megoldása van. Például:
                              "Soroljatok fel olyan keresztneveket, amelyeket a
                              történelem során magyar kormányfő viselt! <br />{" "}
                              <br /> A játékosoknak sorban haladva mondaniuk
                              kell egy-egy lehetséges választ, amelyik szerintük
                              helyes válasz lehet az adott kérdésre (például:
                              "Ferenc"). A játékmester nem kommentálja az
                              elhangzott válaszokat, mert nem az a lényeg, hogy
                              a válasz jó-e vagy sem, hanem, hogy lesz-e aki
                              lefüleli a blöfföt!
                            </p>
                          </div>

                          <Separator className="bg-border/50" />

                          <div>
                            <h3 className="text-xl font-semibold mb-3 text-primary">
                              3. A "Humbug!" és a pontozás
                            </h3>
                            <p className="leading-relaxed">
                              Egy fordulónak akkor van vége, ha egy játékos
                              megkérdőjelezi egy előtte megszólaló válaszát
                              azzal, hogy hangosan „Humbug!” szót mond rá. A
                              játékmester ekkor ellenőrzi, hogy a kérdéses
                              válasz jó-e vagy sem. <br /> <br />
                              Ha jó volt, a blöfföt hívó játékos veszít egy
                              életet, ha viszont rossz, akkor értelemszerűen az
                              veszít, aki a hibás választ mondta. Ha helyes volt
                              a blöff bemondása, akkor az azt bemondó játékos
                              egy passzolási lehetőséggel is gazdagodik, amit
                              később bármikor felhasználhat. Vagyis amikor
                              rákerül a sor, mondhat passzt is, és átugorjuk a
                              körét. A játékosok előzetes megegyezés alapján 1,
                              2 vagy 3 élettel indulnak. <br />
                              <br />
                              Az nyer, aki utoljára „életben marad”.
                            </p>
                          </div>

                          <Separator className="bg-border/50" />

                          <div>
                            <h3 className="text-xl font-semibold mb-3 text-primary">
                              4. Alternatív játékmód
                            </h3>
                            <p className="leading-relaxed">
                              Játszható a játék úgy is, hogy egy adott forduló
                              nem ér véget az első blöff bemondásánál. Ekkor a
                              még aktív játékosok - azaz a megkérdőjelezett
                              választ adó és a blöfföt behívó játékos
                              kivételével mindenki - mennek tovább a második
                              blöff bemondásáig. Ebben az esetben 2 különböző
                              játékos is életet veszít az adott körben.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Game Features */}
        <section className="relative py-24">
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Mi teszi különlegessé?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A HUMBUG ötvözi a klasszikus kvízjátékok izgalmát a
                pszichológiai megtévesztés művészetével. Játszhatod kicsi vagy
                nagy társaságban, bárhol és bármikor!
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Brain size={48} weight="fill" />,
                  title: "Tudás vs. Blöff",
                  description:
                    "Nem csak a tudásod számít, hanem az is, hogy képes vagy-e leleplezni mások blöffjét és tartod-e a pókerarcod",
                },
                {
                  icon: <Users size={48} weight="fill" />,
                  title: "Bárhányan és bárhol",
                  description:
                    "3-8 játékos számára tervezve, akár utazás közben is, mivel nincs szükség semmilyen kiegészítőre",
                },
                {
                  icon: <Crown size={48} weight="fill" />,
                  title: "Taktikázz és nyerj",
                  description:
                    "Döntsd el mikor blöffolsz, mikor hívod le a másikat, és mikor passzolsz; minden pont számít",
                },
                {
                  icon: <Target size={48} weight="fill" />,
                  title: "Könnyed és tartalmas",
                  description:
                    "5 perc alatt megtanulható, de mégis elég mély ahhoz, hogy órákig játszd",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}>
                  <Card className="h-full bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <div className="text-primary mb-4 flex justify-center">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {/* End of Combined Hero + Game Rules + Features Section */}

      {/* Sample Questions */}
      <section
        id="questions-section"
        className="py-24 bg-gradient-to-b from-background to-muted/50 relative overflow-hidden">
        {/* Studio Light Effects */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 10% 20%, rgba(234, 179, 8, 0.25) 0%, transparent 40%)",
              "radial-gradient(circle at 90% 30%, rgba(234, 179, 8, 0.25) 0%, transparent 40%)",
              "radial-gradient(circle at 50% 70%, rgba(234, 179, 8, 0.25) 0%, transparent 40%)",
              "radial-gradient(circle at 10% 20%, rgba(234, 179, 8, 0.25) 0%, transparent 40%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 pointer-events-none"
        />
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 85% 15%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)",
              "radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)",
              "radial-gradient(circle at 70% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)",
              "radial-gradient(circle at 85% 15%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute inset-0 pointer-events-none"
        />
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 50% 10%, rgba(234, 179, 8, 0.15) 0%, transparent 35%)",
              "radial-gradient(circle at 50% 90%, rgba(234, 179, 8, 0.15) 0%, transparent 35%)",
              "radial-gradient(circle at 50% 10%, rgba(234, 179, 8, 0.15) 0%, transparent 35%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute inset-0 pointer-events-none"
        />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Feladványok</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Böngéssz a kérdések között! Ha játékmester vagy, kattints a
              kártyákra a helyes válaszok megtekintéséhez és jelöld be az
              elhangzott helyes válaszokat.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {sampleQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-card/20 border-t border-border/30">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}>
            <h3 className="text-2xl font-bold mb-4 text-primary">HUMBUG!</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Készítette:{" "}
              <span className="font-semibold">Szoleczki Zoltán</span> és{" "}
              <span className="font-semibold">Beró Zsolt</span>
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 HUMBUG! Minden jog fenntartva.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

export default App;
