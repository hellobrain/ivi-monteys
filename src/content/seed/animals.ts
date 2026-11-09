import type { SeedAnimal } from "./types";

/**
 * Representative creatures for the first milestone. Every entry is
 * "provisional": drafted from standard sources and scholarship, pending
 * specialist review against the primary texts. Locators are book-level
 * unless a precise reference is well established. Claims with no `cites`
 * are shown publicly as "citation needed".
 */
export const animals: SeedAnimal[] = [
  {
    slug: "lion",
    canonicalName: "Lion",
    latinName: "leo",
    greekName: "λέων (leōn)",
    group: "mammals",
    modernIdentification: "Lion",
    scientificName: "Panthera leo",
    identificationUncertainty: "attested",
    medievalClassification: "Bestia; 'king of the beasts' in the bestiaries",
    summary:
      "The first beast in most Latin bestiaries, read through three 'natures' inherited from the Physiologus, and a symbol that could stand for Christ or for the devil.",
    description: `Latin bestiaries of the twelfth and thirteenth centuries usually open their account of the beasts with the lion. The entry joins two kinds of material. The first is a set of three *natures* taken from the [[legend:lion-erases-tracks|Physiologus]], each followed by a Christian reading. The second is a looser gathering of remarks from Isidore of Seville and, through him and others, from Pliny and Solinus: the lion's fear of the white cockerel, its mercy towards those who lie down before it, its anger shown in the tail.

The lion is a good place to see that a medieval animal does not have one meaning. The same books that make the lion a figure of Christ also know the verse in which the devil goes about "as a roaring lion" (1 Peter 5:8).

Few English illuminators can have seen a living lion. The pictures repeat earlier pictures as much as they record report, which is why the [[comparison:the-lion-four-ways|lion comparison]] is so instructive.`,
    iconographicAttributes: ["Mane, often stylised into curls or flames", "Tail raised or curled over the back", "Erasing tracks with the tail", "Breathing on lifeless cubs", "Sleeping with open eyes"],
    traditions: ["physiologus", "latin-bestiary", "vernacular-bestiary", "encyclopaedic", "classical", "biblical"],
    names: [
      { name: "leo", kind: "latin", language: "Latin" },
      { name: "λέων", kind: "greek", language: "Greek" },
      { name: "lion", kind: "vernacular", language: "Old French" },
    ],
    symbols: [
      { slug: "christ", evidence: "attested", note: "Through the three natures in the Physiologus." },
      { slug: "resurrection", evidence: "attested", note: "The cubs revived on the third day." },
      { slug: "kingship", evidence: "attested", note: "Isidore's etymology and the bestiary title 'king of beasts'." },
      { slug: "devil", evidence: "attested", note: "1 Peter 5:8; a competing scriptural reading." },
    ],
    related: ["panther", "ant-lion", "manticore"],
    claims: [
      {
        key: "lion.isidore.king",
        text: "Isidore glosses the Greek word for lion as meaning 'king' in Latin, because the lion is chief of all beasts.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [
          { source: "isidore-etymologiae", locator: "XII.2" },
          { bib: "barney-isidore-2006", locator: "Book XII" },
        ],
      },
      {
        key: "lion.physiologus.three-natures",
        text: "The Physiologus gives the lion three natures: it erases its tracks with its tail, it sleeps with its eyes open, and its cubs are born dead and brought to life on the third day.",
        layer: "legend",
        evidence: "attested",
        cites: [
          { source: "physiologus-greek", locator: "Lion chapter" },
          { bib: "curley-physiologus", locator: "Lion" },
        ],
      },
      {
        key: "lion.bestiary.white-cock",
        text: "Latin bestiaries add that the lion fears the white cockerel and spares those who lie prostrate before it.",
        layer: "medieval_description",
        evidence: "supported",
        cites: [{ bib: "clark-2006", locator: "Lion" }, { bib: "barber-1992", locator: "Lion" }],
      },
      {
        key: "lion.villard.from-life",
        text: "Villard de Honnecourt annotated one of his lion drawings to say it was drawn from life.",
        layer: "modern_scholarship",
        evidence: "supported",
        cites: [{ manuscript: "villard-portfolio", note: "Folio to be confirmed." }],
      },
      {
        key: "lion.zoology.range",
        text: "Lions were extinct in Europe long before the Middle Ages; medieval Europeans knew them from texts, earlier images and the occasional menagerie animal.",
        layer: "modern_zoology",
        evidence: "supported",
      },
    ],
    interpretations: [
      {
        layer: "bestiary_allegory",
        tradition: "physiologus",
        symbol: "christ",
        interpretation:
          "The lion erasing its tracks is Christ concealing his divinity when he took human form, so that the devil would not recognise him.",
        evidence: "attested",
      },
      {
        layer: "bestiary_allegory",
        tradition: "physiologus",
        symbol: "christ",
        interpretation:
          "Sleeping with open eyes is Christ's body sleeping in death on the cross while his divinity kept watch; the Physiologus applies Song of Songs 5:2, 'I sleep, but my heart waketh'.",
        evidence: "attested",
      },
      {
        layer: "bestiary_allegory",
        tradition: "physiologus",
        symbol: "resurrection",
        interpretation: "The father reviving the dead cubs on the third day is God the Father raising Christ on the third day.",
        evidence: "attested",
      },
      {
        layer: "religious_symbolism",
        tradition: "biblical",
        symbol: "devil",
        interpretation:
          "In 1 Peter 5:8 the adversary 'as a roaring lion, walketh about, seeking whom he may devour'. Medieval readers held both readings at once; context decides which is meant.",
        evidence: "attested",
        claims: [
          {
            key: "lion.1peter.devil",
            text: "1 Peter 5:8 compares the devil to a roaring lion seeking whom he may devour.",
            layer: "religious_symbolism",
            evidence: "attested",
            cites: [{ source: "vulgate", locator: "1 Peter 5:8" }],
          },
        ],
      },
      {
        layer: "religious_symbolism",
        tradition: "biblical",
        symbol: "christ",
        interpretation: "The 'Lion of the tribe of Judah' (Revelation 5:5; compare Genesis 49:9) supplied the scriptural basis for reading the lion as Christ.",
        evidence: "attested",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "panther",
    canonicalName: "Panther",
    latinName: "panthera",
    greekName: "πάνθηρ (panthēr)",
    group: "mammals",
    modernIdentification: "Uncertain; not simply the modern leopard",
    identificationUncertainty: "disputed",
    identificationNote:
      "The bestiary panther is many-coloured and gentle. Ancient and medieval names for spotted cats overlap (pardus, leopardus, panthera), and the bestiary creature is better treated as its own literary animal.",
    summary: "A gentle, many-coloured beast whose sweet breath draws every animal except the dragon: one of the clearest figures of Christ in the Physiologus.",
    description: `The panther of the bestiaries is a friend to every animal except the dragon. After eating it sleeps in its den for three days, then wakes with a great roar, and from its mouth comes a scent so sweet that all the beasts follow it. Only the dragon, afraid, hides under the earth.

The Christian reading is direct: Christ rose on the third day, and the sweetness of his teaching drew all people, while the devil fled. The panther's many colours were compared to the many qualities of Christ.

The name causes trouble. The bestiary panther does not map neatly onto a modern species, and pictures show it with circles or spots of several colours rather than the coat of any real cat.`,
    iconographicAttributes: ["Multicoloured spots or roundels", "Animals following its breath", "Dragon hiding or fleeing"],
    traditions: ["physiologus", "latin-bestiary", "vernacular-bestiary"],
    names: [{ name: "panthera", kind: "latin", language: "Latin" }],
    symbols: [
      { slug: "christ", evidence: "attested" },
      { slug: "resurrection", evidence: "attested", note: "Waking after three days." },
    ],
    related: ["lion"],
    claims: [
      {
        key: "panther.physiologus.breath",
        text: "The Physiologus says the panther sleeps three days after eating, then wakes and roars, and its sweet breath draws all animals except the dragon.",
        layer: "legend",
        evidence: "attested",
        cites: [{ source: "physiologus-greek", locator: "Panther chapter" }, { bib: "curley-physiologus", locator: "Panther" }],
      },
      {
        key: "panther.identification",
        text: "The bestiary panther does not correspond straightforwardly to any one modern species.",
        layer: "modern_scholarship",
        evidence: "supported",
        cites: [{ bib: "george-yapp-1991" }],
      },
    ],
    interpretations: [
      {
        layer: "bestiary_allegory",
        tradition: "physiologus",
        symbol: "christ",
        interpretation: "Waking after three days and drawing all creatures with its breath, the panther is the risen Christ drawing humanity; the dragon that hides is the devil.",
        evidence: "attested",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "elephant",
    canonicalName: "Elephant",
    latinName: "elephas, elephantus",
    greekName: "ἐλέφας (elephas)",
    group: "mammals",
    modernIdentification: "Elephant (African or Asian)",
    scientificName: "Loxodonta / Elephas",
    identificationUncertainty: "attested",
    summary: "A chaste giant that cannot rise once fallen: the bestiaries turn it into a story of the Fall and of Christ's humility.",
    description: `Bestiary elephants have no desire to mate. When they wish for young, the male and female go east towards Paradise, where the female eats the mandrake and gives some to the male, and so she conceives. The pair are read as Adam and Eve, and the mandrake as the fruit of the Fall.

The elephant was also believed to have no joints in its legs. It sleeps leaning against a tree; a hunter saws the tree almost through, the elephant leans, falls and cannot get up. Twelve elephants fail to lift it, and finally a small elephant raises it with its trunk. The fallen elephant is humanity, the large elephants the Law and the prophets, and the small one Christ, who made himself low to lift us.

Pliny, writing earlier and with no allegory in mind, praises the elephant as the animal nearest to humans in understanding. Bestiary pictures often show elephants carrying towers full of soldiers, a detail that ultimately goes back to the war elephants of 1 Maccabees.`,
    iconographicAttributes: ["Castle or tower on its back", "Trunk drawn as a trumpet", "Leaning against a sawn tree", "Small elephant lifting a fallen one"],
    traditions: ["physiologus", "latin-bestiary", "classical", "biblical"],
    names: [{ name: "elephas", kind: "latin", language: "Latin" }, { name: "elephantus", kind: "latin", language: "Latin" }],
    symbols: [
      { slug: "chastity", evidence: "attested" },
      { slug: "humility", evidence: "attested", note: "The small elephant who lifts the fallen one." },
    ],
    related: [],
    claims: [
      {
        key: "elephant.physiologus.mandrake",
        text: "The Physiologus says elephants conceive only after the female eats the mandrake near Paradise and gives it to the male.",
        layer: "legend",
        evidence: "attested",
        cites: [{ source: "physiologus-greek", locator: "Elephant chapter" }, { bib: "curley-physiologus", locator: "Elephant" }],
      },
      {
        key: "elephant.pliny.intelligence",
        text: "Pliny opens his book on land animals with the elephant, which he calls the animal nearest to humans in understanding.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "pliny-natural-history", locator: "8.1" }],
      },
      {
        key: "elephant.towers.maccabees",
        text: "The image of elephants carrying fortified towers has a scriptural precedent in the war elephants of 1 Maccabees 6.",
        layer: "religious_symbolism",
        evidence: "supported",
        cites: [{ source: "vulgate", locator: "1 Maccabees 6:37" }],
      },
      {
        key: "elephant.joints.caesar",
        text: "Caesar tells a similar story of animals without leg joints that sleep leaning on trees, but of the alces (elk) of the Hercynian forest, not the elephant. Whether the two stories are connected is uncertain.",
        layer: "uncertain_connection",
        evidence: "plausible",
        cites: [{ source: "caesar-gallic-war", locator: "6.27" }],
      },
      {
        key: "elephant.zoology.knees",
        text: "Elephants have knee joints and can kneel and lie down.",
        layer: "modern_zoology",
        evidence: "supported",
      },
    ],
    interpretations: [
      {
        layer: "bestiary_allegory",
        tradition: "physiologus",
        symbol: "humility",
        interpretation: "The small elephant that lifts the fallen one is Christ, who humbled himself to raise fallen humanity where the Law could not.",
        evidence: "attested",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "beaver",
    canonicalName: "Beaver",
    latinName: "castor, fiber",
    group: "mammals",
    modernIdentification: "Eurasian beaver",
    scientificName: "Castor fiber",
    identificationUncertainty: "attested",
    summary: "Hunted for a medicine, the beaver bites off its own testicles and throws them to the hunter: a lesson in giving up what the devil wants.",
    description: `Beavers were hunted for a substance used in medicine, which the ancient sources took to come from the animal's testicles. The story says that a beaver, when chased, bites them off and throws them to the hunter, who then lets it go. A beaver that has already done this shows the hunter it has nothing left to take.

The bestiaries read the hunter as the devil and the testicles as vices: a person who casts off sin escapes. Isidore supplies a false etymology to match, deriving *castor* from *castrare*.

The modern zoology is a useful corrective. The medicinal substance, castoreum, comes from scent glands (castor sacs), and the beaver's testes are internal and could not be bitten off.`,
    iconographicAttributes: ["Hunter with spear and horn", "Beaver biting at its groin", "Hunting dog"],
    traditions: ["physiologus", "latin-bestiary", "encyclopaedic", "classical"],
    names: [{ name: "castor", kind: "latin", language: "Latin" }, { name: "fiber", kind: "latin", language: "Latin" }],
    symbols: [{ slug: "chastity", evidence: "attested", note: "Casting off the vices of the flesh." }],
    claims: [
      {
        key: "beaver.physiologus.selfcastration",
        text: "The Physiologus tells that the hunted beaver bites off its testicles and throws them to the hunter.",
        layer: "legend",
        evidence: "attested",
        cites: [{ source: "physiologus-greek", locator: "Beaver chapter" }, { bib: "curley-physiologus", locator: "Beaver" }],
      },
      {
        key: "beaver.isidore.etymology",
        text: "Isidore derives castor from castrando, 'castrating'.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "isidore-etymologiae", locator: "XII.2" }],
      },
      {
        key: "beaver.pliny.castoreum",
        text: "Pliny records the belief and the medicinal use of the beaver's 'testicles'.",
        layer: "medieval_description",
        evidence: "supported",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }],
      },
      {
        key: "beaver.zoology.castor-sacs",
        text: "Castoreum is produced in the beaver's castor sacs, not its testes, which are internal.",
        layer: "modern_zoology",
        evidence: "supported",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "hedgehog",
    canonicalName: "Hedgehog",
    latinName: "ericius, erinaceus",
    group: "mammals",
    modernIdentification: "European hedgehog",
    scientificName: "Erinaceus europaeus",
    identificationUncertainty: "attested",
    summary: "It shakes grapes from the vine and rolls on them to carry them home on its spines: the devil stealing the fruit of the soul.",
    description: `The hedgehog climbs a vine, shakes the grapes to the ground, then rolls on them so that the fruit sticks to its spines, and carries it back to its young. The bestiary turns the vineyard into the soul and the hedgehog into the devil, who strips it of its spiritual fruit if it is not guarded.

Pliny tells a related story of hedgehogs gathering fallen apples on their spines as a winter store. The picture of a hedgehog bristling with fruit became one of the most recognisable images in bestiary manuscripts.

Hedgehogs eat mainly insects and other invertebrates; there is no good evidence that they carry fruit on their spines.`,
    iconographicAttributes: ["Body covered with red grapes or fruit", "Vine or fruit tree", "Young waiting in a burrow"],
    traditions: ["physiologus", "latin-bestiary", "classical"],
    names: [{ name: "ericius", kind: "latin", language: "Latin" }, { name: "erinaceus", kind: "latin", language: "Latin" }],
    symbols: [{ slug: "devil", evidence: "attested" }],
    claims: [
      {
        key: "hedgehog.physiologus.grapes",
        text: "In the Physiologus the hedgehog shakes down grapes and rolls on them to carry them to its young.",
        layer: "legend",
        evidence: "attested",
        cites: [{ source: "physiologus-greek", locator: "Hedgehog chapter" }, { bib: "curley-physiologus", locator: "Hedgehog" }],
      },
      {
        key: "hedgehog.pliny.apples",
        text: "Pliny describes hedgehogs storing food for winter by rolling on fallen apples.",
        layer: "medieval_description",
        evidence: "supported",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }],
      },
      {
        key: "hedgehog.zoology.diet",
        text: "Hedgehogs feed mainly on invertebrates and do not carry fruit on their spines.",
        layer: "modern_zoology",
        evidence: "supported",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "fox",
    canonicalName: "Fox",
    latinName: "vulpes",
    greekName: "ἀλώπηξ (alōpēx)",
    group: "mammals",
    modernIdentification: "Red fox",
    scientificName: "Vulpes vulpes",
    identificationUncertainty: "attested",
    summary: "It plays dead to catch the birds that come to peck it, and in the bestiary it stands for the devil and for deceit.",
    description: `When hungry, the fox rolls in red earth so that it looks bloodied, lies on its back, holds its breath and plays dead. Birds land on it to feed, and it seizes them. The bestiary reads the fox as the devil, who pretends to be dead to those who live by the flesh, and the birds as souls caught by his tricks.

Scripture gave the fox a bad name too. Christ calls Herod "that fox" (Luke 13:32), and the Song of Songs speaks of "the little foxes, that spoil the vines" (2:15).

The fox had a separate and much larger life in vernacular beast epic: the stories of Renart, whose cunning is admired as much as condemned. That literary tradition should be kept apart from the bestiary entry.`,
    iconographicAttributes: ["Lying on its back with tongue out", "Birds perched on its body", "Red-stained fur"],
    traditions: ["physiologus", "latin-bestiary", "vernacular-bestiary", "biblical", "folklore"],
    names: [{ name: "vulpes", kind: "latin", language: "Latin" }, { name: "goupil", kind: "vernacular", language: "Old French" }],
    symbols: [
      { slug: "devil", evidence: "attested" },
      { slug: "deception", evidence: "attested" },
    ],
    related: ["wolf"],
    claims: [
      {
        key: "fox.physiologus.feigns-death",
        text: "The Physiologus says the fox feigns death to catch birds.",
        layer: "legend",
        evidence: "attested",
        cites: [{ source: "physiologus-greek", locator: "Fox chapter" }, { bib: "curley-physiologus", locator: "Fox" }],
      },
      {
        key: "fox.luke.herod",
        text: "In Luke 13:32 Christ calls Herod a fox.",
        layer: "religious_symbolism",
        evidence: "attested",
        cites: [{ source: "vulgate", locator: "Luke 13:32" }],
      },
      {
        key: "fox.zoology.thanatosis",
        text: "Some animals do feign death (thanatosis); there is no good evidence that foxes use it as a hunting technique.",
        layer: "modern_zoology",
        evidence: "plausible",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "wolf",
    canonicalName: "Wolf",
    latinName: "lupus",
    greekName: "λύκος (lykos)",
    group: "mammals",
    modernIdentification: "Grey wolf",
    scientificName: "Canis lupus",
    identificationUncertainty: "attested",
    summary: "A predator of the flock whose gaze could strike a man dumb; in scripture and bestiary alike, the enemy of the sheep.",
    description: `The bestiary wolf comes less from the Physiologus than from Pliny, Solinus and Isidore. Pliny reports the Italian belief that if a wolf sees a man first, the man loses his voice. Bestiaries add that the wolf cannot turn its neck and that it approaches a sheepfold against the wind, licking its paw if it treads on a twig.

Scripture supplied the moral frame: false prophets come "in sheep's clothing, but inwardly they are ravening wolves" (Matthew 7:15). The wolf therefore stands for the devil circling the flock of the faithful.

For Roman readers the wolf was also the foster-mother of Romulus and Remus. That foundation story belongs to classical mythology and should not be confused with the bestiary's moral reading.`,
    iconographicAttributes: ["Approaching a sheepfold", "Biting its own paw", "Stiff neck"],
    traditions: ["latin-bestiary", "encyclopaedic", "classical", "biblical"],
    names: [{ name: "lupus", kind: "latin", language: "Latin" }],
    symbols: [{ slug: "devil", evidence: "attested" }, { slug: "deception", evidence: "attested", note: "Wolves in sheep's clothing." }],
    related: ["fox", "dog"],
    claims: [
      {
        key: "wolf.pliny.voice",
        text: "Pliny reports a belief in Italy that a man seen by a wolf before he sees it loses his voice.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }],
      },
      {
        key: "wolf.matthew.sheep",
        text: "Matthew 7:15 warns of false prophets in sheep's clothing who are inwardly ravening wolves.",
        layer: "religious_symbolism",
        evidence: "attested",
        cites: [{ source: "vulgate", locator: "Matthew 7:15" }],
      },
      {
        key: "wolf.isidore.etymology",
        text: "Isidore gives etymologies for lupus from the Greek lykos.",
        layer: "medieval_description",
        evidence: "supported",
        cites: [{ source: "isidore-etymologiae", locator: "XII.2" }],
      },
    ],
    interpretations: [
      {
        layer: "classical_mythology",
        tradition: "classical",
        interpretation:
          "In Roman tradition a she-wolf suckled Romulus and Remus, making the wolf an emblem of Rome. This positive civic image coexists with, and is unrelated to, the bestiary's hostile reading.",
        evidence: "attested",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "stag",
    canonicalName: "Stag",
    latinName: "cervus",
    greekName: "ἔλαφος (elaphos)",
    group: "mammals",
    modernIdentification: "Red deer",
    scientificName: "Cervus elaphus",
    identificationUncertainty: "supported",
    summary: "The enemy of serpents, drawing them from their holes with its breath; and the deer of the psalm that longs for running water.",
    description: `The stag is the enemy of the serpent. It draws snakes out of their holes with the breath of its nostrils and tramples them. Bestiaries add that after eating a serpent it runs to water to drink and so renews itself, and that stags crossing a river swim in line, each resting its head on the back of the one in front.

Two strands meet here. Pliny already describes stags drawing out snakes with their breath. Scripture gave the image a devotional meaning: "As the hart panteth after the water brooks, so panteth my soul after thee, O God" (Psalm 42:1; Psalm 41 in the Vulgate). In Christian art the deer drinking at streams appears in baptismal settings.`,
    iconographicAttributes: ["Antlers", "Serpent drawn from a hole", "Drinking at a spring", "Swimming in a line"],
    traditions: ["physiologus", "latin-bestiary", "classical", "biblical"],
    names: [{ name: "cervus", kind: "latin", language: "Latin" }, { name: "hart", kind: "vernacular", language: "English" }],
    symbols: [{ slug: "spiritual-struggle", evidence: "attested" }, { slug: "christ", evidence: "supported" }],
    claims: [
      {
        key: "stag.pliny.serpents",
        text: "Pliny says that stags draw serpents from their holes with their breath.",
        layer: "medieval_description",
        evidence: "supported",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }],
      },
      {
        key: "stag.psalm42",
        text: "Psalm 42:1 (Vulgate 41:2) compares the soul longing for God to a hart longing for water.",
        layer: "religious_symbolism",
        evidence: "attested",
        cites: [{ source: "vulgate", locator: "Psalm 42:1 (Vulgate 41:2)" }],
      },
      {
        key: "stag.bestiary.swimming",
        text: "Bestiaries describe stags swimming in a line, each resting its head on the one in front.",
        layer: "medieval_description",
        evidence: "supported",
        cites: [{ bib: "clark-2006", locator: "Stag" }],
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "hyena",
    canonicalName: "Hyena",
    latinName: "hyaena, yena",
    greekName: "ὕαινα (hyaina)",
    group: "mammals",
    modernIdentification: "Hyena (probably striped hyena in ancient sources)",
    scientificName: "Hyaena hyaena / Crocuta crocuta",
    identificationUncertainty: "plausible",
    summary: "A grave-robber believed to change its sex, used in the Physiologus and bestiaries for an anti-Jewish allegory that has to be read critically.",
    description: `The hyena was said to be now male and now female, which made it unclean. It lives among tombs and feeds on corpses, and it imitates human voices at night to lure people out. A stone found in its eye, placed under the tongue, was said to give the power of prophecy.

The allegory needs to be read with care. The Physiologus and the bestiaries that follow it compare the hyena's changing sex to the Jews, whom they accuse of first serving God and then idols, and to double-minded Christians. This is anti-Jewish polemic, and the project records it as a historical attestation, not as a reading to adopt.

Aristotle had already rejected the sex-change story. A likely source of the belief is the anatomy of the female spotted hyena, whose external genitals closely resemble a male's.`,
    iconographicAttributes: ["Digging at a tomb or eating a corpse", "Striped or spotted coat", "Long mane on the back"],
    traditions: ["physiologus", "latin-bestiary", "classical"],
    names: [{ name: "hyaena", kind: "latin", language: "Latin" }, { name: "yena", kind: "latin", language: "Medieval Latin" }],
    symbols: [{ slug: "hypocrisy", evidence: "attested", note: "The 'double-minded'." }],
    claims: [
      {
        key: "hyena.physiologus.sex",
        text: "The Physiologus says the hyena alternates between male and female.",
        layer: "legend",
        evidence: "attested",
        cites: [{ source: "physiologus-greek", locator: "Hyena chapter" }, { bib: "curley-physiologus", locator: "Hyena" }],
      },
      {
        key: "hyena.aristotle.rejects",
        text: "Aristotle rejects the belief that the hyena has both sexes.",
        layer: "medieval_description",
        evidence: "supported",
        cites: [{ source: "aristotle-historia-animalium", note: "Also discussed in Generation of Animals." }],
      },
      {
        key: "hyena.zoology.genitalia",
        text: "Female spotted hyenas have masculinised external genitalia, a plausible origin for the belief.",
        layer: "modern_scholarship",
        evidence: "plausible",
      },
    ],
    interpretations: [
      {
        layer: "bestiary_allegory",
        tradition: "physiologus",
        symbol: "hypocrisy",
        interpretation:
          "The hyena's changing sex is compared to people who are 'double-minded'; the text names the Jews explicitly. Recorded as anti-Jewish polemic in the source, not endorsed.",
        context: "See Hassig (1995) on bestiary ideology.",
        evidence: "attested",
        claims: [
          {
            key: "hyena.ideology.hassig",
            text: "Modern scholarship treats the hyena's allegory as part of the anti-Jewish ideology of the bestiaries.",
            layer: "modern_scholarship",
            evidence: "supported",
            cites: [{ bib: "hassig-1995" }],
          },
        ],
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "bear",
    canonicalName: "Bear",
    latinName: "ursus",
    greekName: "ἄρκτος (arktos)",
    group: "mammals",
    modernIdentification: "Brown bear",
    scientificName: "Ursus arctos",
    identificationUncertainty: "attested",
    summary: "Its cubs were believed to be born as shapeless lumps that the mother licks into form.",
    description: `The bear gives birth to cubs that are formless pieces of flesh, and the mother shapes them by licking. Isidore builds an etymology on it, deriving *ursus* from *orsus*, 'begun', because the mother forms the young with her mouth (*ore*).

The story is classical before it is Christian; Pliny and Aristotle both discuss the small and undeveloped state of newborn bears. In later centuries 'to lick into shape' became an English idiom.

Newborn bear cubs are indeed very small relative to the mother and are born blind and nearly hairless, which may explain the belief.`,
    iconographicAttributes: ["Mother licking a shapeless cub", "Bear hunted with dogs", "Muzzled and led on a chain"],
    traditions: ["latin-bestiary", "encyclopaedic", "classical"],
    names: [{ name: "ursus", kind: "latin", language: "Latin" }],
    symbols: [{ slug: "transformation", evidence: "plausible", note: "Some modern writers read the licking as a figure of formation or conversion; treat as an interpretation." }],
    claims: [
      {
        key: "bear.isidore.etymology",
        text: "Isidore derives ursus from the idea that the mother shapes (orsus) her cubs with her mouth (ore).",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "isidore-etymologiae", locator: "XII.2" }],
      },
      {
        key: "bear.pliny.formless",
        text: "Pliny describes newborn bears as shapeless lumps of flesh licked into shape by the mother.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }],
      },
      {
        key: "bear.zoology.altricial",
        text: "Bear cubs are born very small, blind and nearly hairless.",
        layer: "modern_zoology",
        evidence: "supported",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "weasel",
    canonicalName: "Weasel",
    latinName: "mustela",
    greekName: "γαλῆ (galē)",
    group: "mammals",
    modernIdentification: "Weasel; ancient usage may include other small mustelids",
    scientificName: "Mustela nivalis (in part)",
    identificationUncertainty: "plausible",
    summary: "Said to conceive through the ear and give birth through the mouth (or the reverse), and to be the one creature the basilisk fears.",
    description: `The Physiologus reports that the weasel conceives through its mouth and gives birth through its ear; other versions reverse the order. The text applies it to people who hear the word of God gladly and then let it go out of their ears without keeping it.

From Pliny comes a quite different weasel: the only animal that can kill the basilisk, whose glance and breath kill everything else. Bestiaries also claim that weasels can revive their dead young with a herb.

Isidore's etymology, *mustela* as *mus longus* ('long mouse'), shows how the encyclopaedists sorted small animals by name.`,
    iconographicAttributes: ["Long low body", "Carrying young in its mouth", "Facing a basilisk"],
    traditions: ["physiologus", "latin-bestiary", "encyclopaedic", "classical"],
    names: [{ name: "mustela", kind: "latin", language: "Latin" }],
    symbols: [{ slug: "spiritual-blindness", evidence: "plausible", note: "Hearing without retaining the word." }],
    claims: [
      {
        key: "weasel.physiologus.ear",
        text: "The Physiologus says the weasel conceives through the mouth and gives birth through the ear; versions differ on the order.",
        layer: "legend",
        evidence: "attested",
        cites: [{ source: "physiologus-greek", locator: "Weasel chapter" }, { bib: "curley-physiologus", locator: "Weasel" }],
      },
      {
        key: "weasel.pliny.basilisk",
        text: "Pliny reports that the weasel's smell kills the basilisk.",
        layer: "medieval_description",
        evidence: "supported",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }],
      },
      {
        key: "weasel.isidore.etymology",
        text: "Isidore explains mustela as mus longus, 'long mouse'.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "isidore-etymologiae", locator: "XII.3" }],
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "dog",
    canonicalName: "Dog",
    latinName: "canis",
    greekName: "κύων (kyōn)",
    group: "mammals",
    modernIdentification: "Domestic dog",
    scientificName: "Canis familiaris",
    identificationUncertainty: "attested",
    summary: "The most loyal of animals in the bestiaries, full of stories of dogs who defended or avenged their masters; also the dog that returns to its vomit.",
    description: `The bestiary dog is above all faithful. Pliny's story of the king of the Garamantes, brought back from exile by two hundred dogs who fought his enemies, is repeated, along with tales of dogs that refused to leave a dead master or identified his murderer.

The moral readings are mixed. Dogs that heal wounds by licking them are compared to priests who heal sin through confession. But Proverbs 26:11 also supplies the dog that "returneth to his vomit", the sinner who goes back to sin after confessing it.`,
    iconographicAttributes: ["Collar", "Guarding a body", "Licking a wound", "Hunting with men"],
    traditions: ["latin-bestiary", "classical", "biblical"],
    names: [{ name: "canis", kind: "latin", language: "Latin" }],
    symbols: [{ slug: "loyalty", evidence: "attested" }],
    related: ["wolf"],
    claims: [
      {
        key: "dog.pliny.garamantes",
        text: "Pliny tells of a king of the Garamantes brought back from exile by two hundred dogs.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }],
      },
      {
        key: "dog.proverbs.vomit",
        text: "Proverbs 26:11 compares a fool returning to his folly to a dog returning to its vomit.",
        layer: "religious_symbolism",
        evidence: "attested",
        cites: [{ source: "vulgate", locator: "Proverbs 26:11" }],
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "bonnacon",
    canonicalName: "Bonnacon",
    latinName: "bonnacon, bonasus",
    group: "fantastic",
    modernIdentification: "Possibly an exaggerated account of a wild bovid, such as the European bison",
    identificationUncertainty: "disputed",
    identificationNote: "The scientific name of the European bison, Bison bonasus, borrows the ancient name; that is a modern naming choice, not proof of identity.",
    summary: "A bull-like beast whose horns curl back uselessly, so it defends itself by spraying burning dung over a great distance.",
    description: `Pliny places the *bonasus* in Paeonia: it has a mane like a horse and horns that curl back so far they are useless for fighting. Instead it escapes by voiding dung over a great distance, and the dung burns whatever it touches.

The bestiaries kept the story with evident relish. Pictures show hunters with shields recoiling from a stream of dung, one of the comic set-pieces of the manuscripts. There is no Christian allegory attached in the core texts, which is itself instructive: not every bestiary entry is a sermon.`,
    iconographicAttributes: ["Horns curled backwards", "Stream of dung aimed at hunters", "Hunters with shields"],
    traditions: ["latin-bestiary", "classical"],
    names: [{ name: "bonasus", kind: "latin", language: "Latin (Pliny)" }, { name: "bonnacon", kind: "latin", language: "Medieval Latin" }],
    related: [],
    claims: [
      {
        key: "bonnacon.pliny",
        text: "Pliny describes the bonasus of Paeonia, with useless backward horns, defending itself with burning dung.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }],
      },
      {
        key: "bonnacon.no-allegory",
        text: "The bonnacon entry in Latin bestiaries carries no developed Christian allegory.",
        layer: "modern_scholarship",
        evidence: "supported",
        cites: [{ bib: "badke-bestiary-ca" }],
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "manticore",
    canonicalName: "Manticore",
    latinName: "manticora, mantichora",
    group: "fantastic",
    modernIdentification: "None; possibly a garbled report of a tiger",
    identificationUncertainty: "disputed",
    summary: "A man-eater with a human face, three rows of teeth and a stinging tail, passed from a Greek writer on India into Pliny and the bestiaries.",
    description: `The manticore has a lion's body, a man's face and ears, three rows of teeth that interlock like a comb, a red body and a tail that stings like a scorpion's. Its voice is like a pipe and trumpet together, and it eats human flesh.

It entered Western tradition through Ctesias, a Greek physician at the Persian court who wrote about India, and was repeated by Pliny and Solinus. Its name is often explained as a Persian word meaning 'man-eater'; some scholars think a tiger lies behind the reports.

The bestiaries describe the manticore but attach no allegory to it in the core text. It belongs with the fantastic creatures, though the curriculum's mammals block refers to it as part of the land-beast catalogue.`,
    iconographicAttributes: ["Human face with a crown or cap", "Lion's body", "Scorpion tail", "Eating a human limb"],
    traditions: ["latin-bestiary", "classical"],
    names: [{ name: "mantichora", kind: "latin", language: "Latin (Pliny)" }],
    related: ["lion"],
    claims: [
      {
        key: "manticore.pliny.ctesias",
        text: "Pliny describes the mantichora on the authority of Ctesias.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }, { source: "ctesias-indica" }],
      },
      {
        key: "manticore.etymology.persian",
        text: "The name is commonly derived from an Old Persian compound meaning 'man-eater'.",
        layer: "modern_scholarship",
        evidence: "supported",
      },
      {
        key: "manticore.tiger",
        text: "Some modern writers suggest that reports of tigers lie behind the manticore.",
        layer: "uncertain_connection",
        evidence: "plausible",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "unicorn",
    canonicalName: "Unicorn",
    latinName: "unicornis, monoceros, rhinoceros",
    greekName: "μονόκερως (monokerōs)",
    group: "fantastic",
    modernIdentification: "None; descriptions borrow from rhinoceros, oryx and other horned animals",
    identificationUncertainty: "disputed",
    summary: "A fierce one-horned beast that no hunter can take, except by leaving a virgin alone in the woods for it to come to.",
    description: `In the Physiologus the unicorn is small, like a kid, but so fierce that no hunter can approach it. It is caught by sending a virgin into the forest: the unicorn runs to her, lies in her lap, and is taken. The reading is the Incarnation: Christ, whom no power could capture, came to rest in the Virgin.

The Latin bestiaries use the names *unicornis*, *monoceros* and even *rhinoceros*, sometimes as separate beasts. Pliny's *monoceros* is a different creature again, a large and violent animal of India. Scripture added weight through Latin and Greek translations of the Psalms that speak of the horn of the unicorn.

By the late Middle Ages narwhal tusks circulated as unicorn horns and were prized as antidotes, a commercial afterlife quite separate from the allegory.`,
    iconographicAttributes: ["Single horn", "Head in a maiden's lap", "Hunters with spears", "Goat-like or horse-like body"],
    traditions: ["physiologus", "latin-bestiary", "classical", "biblical"],
    names: [{ name: "unicornis", kind: "latin", language: "Latin" }, { name: "monoceros", kind: "latin", language: "Latin" }],
    symbols: [{ slug: "christ", evidence: "attested" }, { slug: "chastity", evidence: "attested" }, { slug: "purity", evidence: "supported" }],
    claims: [
      {
        key: "unicorn.physiologus.virgin",
        text: "The Physiologus says the unicorn can be caught only by a virgin, in whose lap it lies down.",
        layer: "legend",
        evidence: "attested",
        cites: [{ source: "physiologus-greek", locator: "Unicorn (monoceros) chapter" }, { bib: "curley-physiologus", locator: "Unicorn" }],
      },
      {
        key: "unicorn.pliny.monoceros",
        text: "Pliny describes a fierce Indian monoceros with a single black horn.",
        layer: "medieval_description",
        evidence: "attested",
        cites: [{ source: "pliny-natural-history", locator: "Book 8" }],
      },
      {
        key: "unicorn.narwhal",
        text: "Narwhal tusks were traded in medieval and early modern Europe as unicorn horns.",
        layer: "modern_scholarship",
        evidence: "supported",
      },
    ],
    interpretations: [
      {
        layer: "bestiary_allegory",
        tradition: "physiologus",
        symbol: "christ",
        interpretation: "The unicorn resting in the virgin's lap is Christ incarnate in the Virgin Mary.",
        evidence: "attested",
      },
      {
        layer: "modern_scholarship",
        tradition: "other",
        interpretation:
          "In late medieval courtly art, such as the Unicorn Tapestries, the captured unicorn can also be read as the lover or bridegroom; scholars disagree about how far religious and nuptial readings overlap in particular works.",
        evidence: "disputed",
      },
    ],
    publication: "published",
    research: "provisional",
  },
  {
    slug: "ant-lion",
    canonicalName: "Ant-lion",
    latinName: "formicoleon, myrmecoleon",
    greekName: "μυρμηκολέων (myrmēkoleōn)",
    group: "fantastic",
    modernIdentification: "None. The modern name 'antlion' for insect larvae (Myrmeleontidae) is a later borrowing.",
    identificationUncertainty: "attested",
    identificationNote: "A creature produced by a translation: see the claim on Job 4:11.",
    summary: "Born of a lion and an ant, it can eat neither meat nor grain and so dies: an image of the 'double-minded' man.",
    description: `The ant-lion's father has the face of a lion and its mother is an ant. The offspring has the lion's front and the ant's back; its father's nature will not let it eat grain and its mother's will not let it eat meat, so it starves. The Physiologus applies James 1:8, "a double minded man is unstable in all his ways".

The creature exists because of a word. Where the Hebrew of Job 4:11 has a kind of lion, the Septuagint translators wrote *myrmēkoleōn*, 'ant-lion', and the Physiologus built a beast to fit.

The brief for this project lists the ant-lion among the mammals; it is filed here under fantastic creatures because it has no zoological counterpart.`,
    iconographicAttributes: ["Lion's forequarters with ant's body", "Standing between grain and meat"],
    traditions: ["physiologus", "latin-bestiary", "biblical"],
    names: [{ name: "formicoleon", kind: "latin", language: "Latin" }, { name: "myrmecoleon", kind: "latin", language: "Latin" }],
    symbols: [{ slug: "hypocrisy", evidence: "plausible", note: "Strictly, double-mindedness rather than hypocrisy." }],
    related: ["lion"],
    claims: [
      {
        key: "antlion.septuagint.job",
        text: "The Septuagint text of Job 4:11 has myrmēkoleōn, 'ant-lion', where the Hebrew names a lion.",
        layer: "modern_scholarship",
        evidence: "supported",
        cites: [{ source: "septuagint", locator: "Job 4:11" }],
      },
      {
        key: "antlion.physiologus.starves",
        text: "The Physiologus says the ant-lion cannot eat meat or grain and dies, and compares it to the double-minded man of James 1:8.",
        layer: "legend",
        evidence: "attested",
        cites: [{ source: "physiologus-greek", locator: "Ant-lion chapter" }, { bib: "curley-physiologus", locator: "Ant-lion" }],
      },
    ],
    publication: "published",
    research: "provisional",
  },
];
