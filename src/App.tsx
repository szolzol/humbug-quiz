import { motion } from "framer-motion"
import { QuestionCard } from "@/components/QuestionCard"
import { AudioPlayer } from "@/components/AudioPlayer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Brain, Users, Target, Crown, Play } from "@phosphor-icons/react"
import gameRulesAudio from "@/assets/audio/game-rules.mp3"

const sampleQuestions = [
  {
    id: "1",
    category: "Autómárkák",
    question: "Melyik a 10 leggyakoribb autómárka Magyarországon?",
    answers: ["Opel", "Suzuki", "Volkswagen", "Ford", "Toyota", "Skoda", "Renault", "Peugeot", "BMW", "Mercedes"]
  },
  {
    id: "2", 
    category: "Repülőterek",
    question: "Melyek azok a városok, amelyeknek legalább 1 reptere szerepel Európa 15 legforgalmasabb repülőtere között?",
    answers: ["London", "Isztanbul", "Párizs", "Amszterdam", "Madrid", "Frankfurt", "Barcelona", "Róma", "München", "Moszkva", "Lisszabon", "Palma de Mallorca", "Dublin"]
  },
  {
    id: "3",
    category: "Filmek",
    question: "Nevezzetek meg filmeket, amelyeknek legalább 8,7-es értékelésük van IMDb-n!",
    answers: ["A remény rabjai", "A keresztapa", "A sötét lovag", "Tizenkét dühös ember", "Schindler listája", "A Gyűrűk Ura: A király visszatér", "Ponyvaregény", "Forrest Gump", "Harcosok klubja"]
  },
  {
    id: "4",
    category: "Futball",
    question: "Melyik 10 klubcsapat szerzett a legtöbb pontot a Bajnokok Ligájában 1992 óta?",
    answers: ["Real Madrid", "Bayern München", "Barcelona", "Manchester United", "Juventus", "Milan", "Liverpool", "Porto", "Benfica", "Chelsea"]
  },
  {
    id: "5",
    category: "Zene",
    question: "Soroljatok fel előadókat, akik legalább 200 millió lemezt adtak el!",
    answers: ["The Beatles", "Elvis Presley", "Michael Jackson", "Elton John", "Queen", "Madonna", "Led Zeppelin", "Rihanna", "Pink Floyd", "Eminem", "Mariah Carey", "Taylor Swift"]
  },
  {
    id: "6",
    category: "Keresztnevek",
    question: "Melyik a 15 leggyakoribb női keresztnév Magyarországon?",
    answers: ["Mária", "Erzsébet", "Katalin", "Éva", "Ilona", "Anna", "Zsuzsanna", "Margit", "Andrea", "Judit", "Ágnes", "Ildikó", "Erika", "Julianna", "Krisztina"]
  }
]

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent)_0%,_transparent_50%)] opacity-20" />
        
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  HUMBUG!
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-foreground/90 mb-8 tracking-wide"
            >
              FAKE IT TIL YOU WIN IT
            </motion.p>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Egy kísérleti kvízes partyjáték, ahol a tudás és a blöff találkozik. 
              Legyél okos, légy bátor, és fogd le a hazugot!
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Play className="mr-2" size={24} weight="fill" />
                Kezdjük a játékot!
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-16 h-16 bg-primary/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 right-10 w-24 h-24 bg-accent/20 rounded-full blur-xl"
        />
      </motion.section>

      {/* Game Features */}
      <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Mi teszi különlegessé?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A HUMBUG ötvözi a klasszikus kvízjátékok izgalmát a pszichológiai taktikázással
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Brain size={48} weight="fill" />,
                title: "Tudás vs. Blöff",
                description: "Nem csak a tudásod számít, hanem az is, hogy képes vagy-e leleplezni mások blöffjét"
              },
              {
                icon: <Users size={48} weight="fill" />,
                title: "Társas Élmény",
                description: "3-8 játékos számára tervezve, tökéletes baráti összejövetelekre"
              },
              {
                icon: <Target size={48} weight="fill" />,
                title: "Stratégiai Mélység",
                description: "Döntsd el mikor blöffolsz, mikor hívod le a másikat, és mikor passzolsz"
              },
              {
                icon: <Crown size={48} weight="fill" />,
                title: "Egyszerű Szabályok",
                description: "5 perc alatt megtanulható, de mégis végtelen élményt nyújt"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="text-primary mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Rules */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Játékszabályok</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hallgasd meg a részletes szabályokat, vagy olvasd el lentebb
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto mb-12">
            <AudioPlayer 
              src={gameRulesAudio}
              title="HUMBUG! Játékszabályok"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-card/30 border-border/30">
              <CardContent className="p-8">
                <div className="space-y-6 text-card-foreground">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">1. A játék menete</h3>
                    <p className="leading-relaxed">
                      A játékmester feltesz egy kvízkérdést a teljes csapatnak, melynek általában legalább egy tucat helyes megoldása van. 
                      Például: "Soroljatok fel olyan keresztneveket, amelyeket a történelem során magyar kormányfő viselt!"
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">2. Válaszadás</h3>
                    <p className="leading-relaxed">
                      A játékosoknak sorban haladva mondaniuk kell egy-egy lehetséges választ, amelyik szerintük helyes válasz lehet 
                      az adott kérdésre. A játékmester nem kommentálja az elhangzott válaszokat!
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">3. A "Humbug!" hívás</h3>
                    <p className="leading-relaxed">
                      Egy fordulónak akkor van vége, ha egy játékos megkérdőjelezi egy előtte megszólaló válaszát azzal, 
                      hogy hangosan "Humbug!!" szót mond rá. A játékmester ekkor ellenőrzi a válasz helyességét.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">4. Győzelem és vereség</h3>
                    <p className="leading-relaxed">
                      Ha a válasz helyes volt, a blöfföt hívó játékos veszít egy életet. Ha rossz volt, akkor az veszít, 
                      aki a hibás választ mondta. Helyes blöff esetén a hívó egy passzolási lehetőséget kap.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">5. Győztes</h3>
                    <p className="leading-relaxed">
                      A játékosok 1-3 élettel indulnak. Az nyer, aki utoljára "életben marad". 
                      A játék játszható úgy is, hogy több blöff is történhet egy fordulóban.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Sample Questions */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Példa Kérdések</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nézz meg néhány példát a játékban szereplő kérdésekre. Kattints a kártyákra a válaszok megtekintéséhez!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4 text-primary">HUMBUG!</h3>
            <p className="text-muted-foreground mb-6">
              Kísérleti kvízes partyjáték - Fake it til you win it
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 HUMBUG! Minden jog fenntartva.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

export default App