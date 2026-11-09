/**
 * Curriculum seed. All thirteen blocks are published as an overview; only
 * lessons with written content are published. Planned lessons are stored as
 * drafts so editors can see them in the CMS, but they are never shown publicly.
 *
 * Markdown supports internal reference tokens:
 *   [[animal:lion|the lion]]  [[source:pliny-natural-history|Pliny]]
 *   [[bib:clark-2006|Clark 2006]]  [[manuscript:aberdeen-bestiary|Aberdeen]]
 */

type Block = {
  number: number;
  slug: string;
  title: string;
  kind: "foundations" | "zoological" | "thematic" | "practice";
  summary: string;
  scope: string;
  modules?: { slug: string; title: string; kind: "core" | "mythology_iconography"; summary: string }[];
  plannedLessons?: string[];
};

const myth = (slug: string, title: string, summary: string) => ({
  slug,
  title,
  kind: "mythology_iconography" as const,
  summary: `${summary} Planned module: scope and sources to be researched before drafting.`,
});

export const blocks: Block[] = [
  {
    number: 1,
    slug: "foundations",
    title: "Foundations of Medieval Bestiaries",
    kind: "foundations",
    summary: "What a bestiary was, who made and read it, and why animals were a way of thinking about God and conduct.",
    scope: "Definition and purpose · Medieval attitudes to nature · Animals as moral and theological instruction · Observation and inherited authority · Audiences and manuscript production · The role of illustration",
    plannedLessons: ["Nature as a book", "Observation and authority", "Makers and readers", "Why the pictures matter"],
  },
  {
    number: 2,
    slug: "origins-and-transmission",
    title: "Origins and Transmission",
    kind: "foundations",
    summary: "From the Greek Physiologus and Roman natural history to Isidore, the Latin families and the vernacular bestiaries.",
    scope: "Greek Physiologus · Pliny, Aristotle, Aelian, Solinus · Biblical animals · Early Christian interpretation · Isidore of Seville · Latin bestiary families · Vernacular bestiaries · Encyclopaedias · Translation",
    plannedLessons: ["The Greek Physiologus", "Roman natural history", "Isidore and the encyclopaedists", "The Latin families", "Bestiaries in French and Anglo-Norman"],
  },
  {
    number: 3,
    slug: "how-to-read-a-bestiary",
    title: "How to Read a Bestiary",
    kind: "foundations",
    summary: "The layers of an entry (description, legend, allegory, etymology, authority) and how to keep them apart.",
    scope: "Literal description · Allegory · Moral interpretation · Etymology · Auctoritas · Textual variants · Manuscript families · Visual narrative · Iconographic convention · Interpretation and uncertainty",
    plannedLessons: ["Etymology as argument", "Variants and families", "Pictures that tell stories"],
  },
  {
    number: 4,
    slug: "mammals-and-land-creatures",
    title: "Mammals and Land Creatures",
    kind: "zoological",
    summary: "Predators, herd animals, beasts of burden and small animals. An editorial inventory still being checked against the sources.",
    scope:
      "Lesson 1 Predators, power and deception · Lesson 2 Horns, sacrifice and the herd · Lesson 3 Elephants and beasts of burden · Lesson 4 Small animals and moral lessons · Lesson 5 Loyalty, imitation and instinct · Lesson 6 Hybrids, serpent-killers and dangerous bodies · Lesson 7 Remaining beasts and unusual creatures",
    modules: [
      { slug: "land-creatures", title: "The land creatures", kind: "core", summary: "Seven lessons on the beasts." },
      myth("lions-kings-and-gods", "Lions of kings and gods", "Royal and divine lions before Christianity and their afterlife in Romanesque sculpture."),
    ],
    plannedLessons: [
      "Horns, sacrifice and the herd",
      "Elephants and beasts of burden",
      "Small animals and moral lessons",
      "Loyalty, imitation and instinct",
      "Hybrids, serpent-killers and dangerous bodies",
      "Remaining beasts and unusual creatures",
    ],
  },
  {
    number: 5,
    slug: "birds",
    title: "Birds",
    kind: "zoological",
    summary: "Eagle, pelican, phoenix, dove, owl, crane and the other birds of the bestiaries and of Hugh of Fouilloy's Aviarium.",
    scope: "Eagle · Pelican · Phoenix · Dove and turtle dove · Raven and crow · Owl · Vulture · Crane and stork · Swan · Peacock · Ostrich · Partridge · Cock and hen · Sparrow and swallow · Hoopoe · Kingfisher · Heron · Falcon, hawk, kite · Ibis",
    modules: [myth("birds-of-omen", "Birds of omen and augury", "Classical augury, the phoenix in Egypt and Rome, and Christian reinterpretation.")],
  },
  {
    number: 6,
    slug: "serpents-reptiles-dragons",
    title: "Serpents, Reptiles and Dragons",
    kind: "zoological",
    summary: "Serpents, dragons, basilisks, asps, salamanders and crocodiles.",
    scope: "Serpents and vipers · Dragon · Basilisk · Asp · Amphisbaena · Crocodile · Salamander · Lizards · Tortoise",
    modules: [myth("dragon-slayers", "Dragon-slayers", "From Near Eastern combat myths to saints' lives and church portals.")],
  },
  {
    number: 7,
    slug: "fish-and-marine",
    title: "Fish and Marine Creatures",
    kind: "zoological",
    summary: "Whales, dolphins, eels, shellfish and the island-whale aspidochelone.",
    scope: "Whale and aspidochelone · Dolphin · Eel · Fish · Shellfish and oysters · Sea monsters",
    modules: [myth("sea-monsters", "Sea monsters and sailors' tales", "Jonah, Brendan and the island that was a whale.")],
  },
  {
    number: 8,
    slug: "insects-and-small-creatures",
    title: "Insects and Small Creatures",
    kind: "zoological",
    summary: "Bees, ants, spiders, scorpions, locusts, worms and other small animals.",
    scope: "Bees · Ants · Spiders · Scorpions · Flies · Locusts and grasshoppers · Worms · Snails · Leeches",
    modules: [myth("bees-and-community", "Bees, ants and the ordered community", "Virgil's bees, monastic communities and the political insect.")],
  },
  {
    number: 9,
    slug: "fantastic-creatures",
    title: "Fantastic Creatures and Hybrids",
    kind: "zoological",
    summary: "Unicorns, griffins, manticores, sirens and other creatures; linked to existing records rather than repeated.",
    scope: "Unicorn and monoceros · Griffin · Manticore · Centaur and onocentaur · Siren · Bonnacon · Ant-lion · Aspidochelone",
    modules: [myth("hybrids-and-boundaries", "Hybrids and the edges of the world", "Monstrous races, maps and the margins of creation.")],
  },
  {
    number: 10,
    slug: "comparative-symbolism",
    title: "Comparative Symbolism",
    kind: "thematic",
    summary: "One concept across many animals, and many concepts in one animal: Christ, the devil, resurrection, chastity, deception and more.",
    scope: "Christ · Devil · Resurrection · Redemption · Sacrifice · Purity · Chastity · Lust · Deception · Hypocrisy · Spiritual blindness · Wisdom · Pride · Humility · Kingship · Authority · Death · Rebirth · Community · Spiritual struggle · Transformation",
  },
  {
    number: 11,
    slug: "visual-identification",
    title: "Visual Identification and Iconography",
    kind: "thematic",
    summary: "Recognising bestiary animals in manuscripts, capitals, portals, glass, metalwork and textiles.",
    scope: "Manuscript illustration · Romanesque capitals · Gothic portals · Façades · Tympana · Mosaics · Stained glass · Funerary sculpture · Metalwork · Textiles · Attributes and gestures · Architectural context",
  },
  {
    number: 12,
    slug: "manuscripts-and-regions",
    title: "Manuscripts and Regional Traditions",
    kind: "thematic",
    summary: "English families, continental traditions, workshops, patrons and the relation between bestiaries and encyclopaedias.",
    scope: "English bestiary families · Continental traditions · Early illustrated Physiologus manuscripts · Vernacular adaptations · Scribal variation · Workshops · Patronage · Regional iconography · Romanesque and Gothic · Bestiaries and encyclopaedias",
  },
  {
    number: 13,
    slug: "independent-interpretation",
    title: "Independent Interpretation",
    kind: "practice",
    summary: "Putting it together: reading unfamiliar entries, identifying animals in images and telling evidence from speculation.",
    scope: "Reading unfamiliar entries · Identifying manuscript animals · Comparing variants · Interpreting architectural imagery · Evaluating symbolism · Identifying sources · Evidence versus speculation",
  },
];

export interface SeedLesson {
  block: string;
  module?: string;
  slug: string;
  number: number;
  title: string;
  summary: string;
  durationMinutes: number;
  featured?: boolean;
  objectives: string[];
  animals: string[];
  symbols?: string[];
  references: ({ source: string; locator?: string } | { bib: string; locator?: string })[];
  sections: { heading?: string; kind?: "text" | "quote" | "comparison" | "note"; body: string }[];
}

export const lessons: SeedLesson[] = [
  {
    block: "foundations",
    slug: "what-is-a-bestiary",
    number: 1,
    title: "What is a bestiary?",
    summary: "A first look at the book of beasts: what went into it, what it was for, and what it was not.",
    durationMinutes: 10,
    objectives: [
      "Describe what a medieval bestiary contains.",
      "Explain why medieval readers looked for meaning in animals.",
      "Distinguish a bestiary from a modern field guide.",
    ],
    animals: ["lion", "fox", "beaver"],
    references: [{ bib: "mcculloch-1960" }, { bib: "baxter-1998" }, { bib: "hassig-1995" }, { source: "physiologus-greek" }],
    sections: [
      {
        heading: "A book of beasts",
        body: `A bestiary is a medieval book about animals. Most surviving Latin bestiaries were made in England and France in the twelfth and thirteenth centuries, and many are illustrated. Each entry names an animal, describes its nature, often tells a story about it, and then explains what that nature teaches.

Take the [[animal:fox|fox]]. The bestiary says it plays dead to catch birds. It then tells the reader that the fox is the devil, who pretends to be harmless to those who live by the flesh.`,
      },
      {
        heading: "Not a field guide",
        body: `It is tempting to read a bestiary as bad zoology. That misses the point. The compilers were not trying to describe animals for their own sake; they believed that the created world, like scripture, carried meaning placed in it by God. An animal's habits were signs to be read.

That is why a bestiary can describe creatures nobody had seen, and why it can repeat a story it knows to be strange. What matters is the lesson and the authority behind the report.`,
      },
      {
        heading: "Where the entries came from",
        body: `The core of the bestiary is the [[source:physiologus-greek|Physiologus]], a Greek text of late antiquity that paired animal natures with Christian readings. Latin translations of it were expanded over centuries with material from [[source:isidore-etymologiae|Isidore of Seville]], Ambrose, Solinus and others. The result was not one book but a family of related books that differ in which animals they include and how they tell the stories.`,
      },
      {
        kind: "note",
        heading: "Keep in mind",
        body: "Throughout this course we separate what medieval books *said* from what is zoologically true, and both from what modern scholars think it meant. Each claim on an animal page carries a label telling you which of these it is.",
      },
    ],
  },
  {
    block: "how-to-read-a-bestiary",
    slug: "how-to-read-a-beast",
    number: 1,
    title: "How to read a beast",
    summary: "One entry, several layers: description, legend, allegory, etymology and authority, using the lion.",
    durationMinutes: 12,
    featured: true,
    objectives: [
      "Identify the layers of a typical bestiary entry.",
      "Tell a medieval description from a legend and from an allegory.",
      "Recognise when a statement is a modern interpretation rather than a medieval one.",
    ],
    animals: ["lion"],
    symbols: ["christ", "devil", "resurrection"],
    references: [
      { source: "physiologus-greek", locator: "Lion chapter" },
      { source: "isidore-etymologiae", locator: "XII.2" },
      { bib: "clark-2006", locator: "Lion" },
      { bib: "curley-physiologus", locator: "Lion" },
    ],
    sections: [
      {
        heading: "Start with the name",
        body: `Many bestiary entries open with the animal's name and an explanation of it. For the [[animal:lion|lion]], the Latin bestiaries borrow from [[source:isidore-etymologiae|Isidore]]: the Greek word for lion, he says, means 'king' in Latin, because the lion is chief of the beasts.

This is an **etymology** in the medieval sense. It is wrong by modern philology, but it was not meant as philology. It was a way of showing that the name already contained the creature's nature.`,
      },
      {
        heading: "Then the natures",
        body: `Next come the lion's three *natures*, inherited from the Physiologus:

1. Hunted, it erases its tracks with its tail.
2. It sleeps with its eyes open.
3. Its cubs are born dead and brought to life on the third day.

These are **legends**: stories presented as facts about the animal. They are not observations, and the bestiary does not pretend to have checked them.`,
      },
      {
        heading: "Then the meaning",
        body: `After each nature comes its **allegory**. The erased tracks are Christ hiding his divinity when he became man; the open eyes are his divinity awake while his body lay dead; the revived cubs are the Resurrection.

Notice that the allegory is written into the text itself. When a bestiary says the lion signifies Christ, that is a medieval reading we can cite. When a modern writer says the lion on a church doorway signifies Christ, that is an **interpretation** that needs its own evidence.`,
      },
      {
        heading: "Meanings compete",
        kind: "comparison",
        body: `| Reading | Where it comes from | Layer |
| --- | --- | --- |
| The lion is Christ | Physiologus; Revelation 5:5 | Bestiary allegory |
| The lion is the devil | 1 Peter 5:8 | Wider religious symbolism |
| The lion is a king | Isidore's etymology | Medieval description |

Medieval readers held all of these at once. Context, not the animal, decides the meaning.`,
      },
      {
        heading: "Authority",
        body: `Behind every layer stands *auctoritas*, the authority of earlier writers. A bestiary entry is credible to its readers because Isidore, or Ambrose, or "Physiologus" said so. The questions to ask of any statement are therefore: who says this, in which text, and at what layer?`,
      },
    ],
  },
  {
    block: "how-to-read-a-bestiary",
    slug: "two-texts-one-lion",
    number: 2,
    title: "Two texts, one lion",
    summary: "Put the Physiologus lion beside the encyclopaedic lion and see how a bestiary is stitched together.",
    durationMinutes: 18,
    featured: true,
    objectives: [
      "Compare two source traditions behind a single bestiary entry.",
      "Explain why the same entry can be both allegorical and descriptive.",
      "Use a manuscript comparison to see how images vary within one textual family.",
    ],
    animals: ["lion", "panther"],
    references: [
      { source: "physiologus-greek", locator: "Lion chapter" },
      { source: "isidore-etymologiae", locator: "XII.2" },
      { source: "pliny-natural-history", locator: "Book 8" },
      { bib: "mcculloch-1960" },
      { bib: "clark-2006" },
    ],
    sections: [
      {
        heading: "Text one: the Physiologus",
        body: `The Physiologus lion is short and theological. It gives three natures and, after each, a scriptural reading. There is nothing about the lion's appearance, diet or habitat. The animal exists to carry a meaning.`,
      },
      {
        heading: "Text two: the encyclopaedia",
        body: `Isidore's lion, and behind it the lions of [[source:pliny-natural-history|Pliny]] and [[source:solinus-collectanea|Solinus]], is a different creature. It is described by its kinds, its temper, what it fears and how it fights. Pliny's interest is natural history and wonder, not salvation.`,
      },
      {
        heading: "The bestiary joins them",
        body: `The Latin bestiaries of the [[manuscript:aberdeen-bestiary|Aberdeen]] and [[manuscript:ashmole-bestiary|Ashmole]] type place the two side by side. You will find the Physiologus natures and their allegories, and then the encyclopaedic remarks: the lion's fear of the white cockerel, its mercy to the prostrate, its anger shown in the tail.

The result is uneven, and that unevenness is evidence. It shows a compiler working from several books at once.`,
      },
      {
        heading: "Now compare the pictures",
        kind: "comparison",
        body: `Open the [[comparison:the-lion-four-ways|lion comparison]]. The four manuscripts share a textual family, yet the lions differ in mane, tail and posture. Most of these artists were probably working from earlier pictures rather than from life. One exception proves the point: [[manuscript:villard-portfolio|Villard de Honnecourt]] felt it worth noting that one of his lions was drawn from a living animal.`,
      },
    ],
  },
  {
    block: "mammals-and-land-creatures",
    module: "land-creatures",
    slug: "predators-power-and-deception",
    number: 1,
    title: "Predators, power and deception",
    summary: "Lion, panther, wolf, fox and bear: power, cunning and the uses of the predator in moral teaching.",
    durationMinutes: 20,
    objectives: [
      "Summarise the main legends of the lion, panther, wolf, fox and bear.",
      "Explain why predators could signify both Christ and the devil.",
      "Separate bestiary material from classical and folkloric traditions about the same animals.",
    ],
    animals: ["lion", "panther", "wolf", "fox", "bear"],
    symbols: ["christ", "devil", "deception", "kingship"],
    references: [{ source: "physiologus-greek" }, { source: "pliny-natural-history", locator: "Book 8" }, { source: "isidore-etymologiae", locator: "XII.2" }, { bib: "clark-2006" }],
    sections: [
      {
        heading: "The noble predators",
        body: `The [[animal:lion|lion]] and the [[animal:panther|panther]] are predators, yet in the Physiologus both are figures of Christ. Their power is turned to the service of salvation: the lion revives, the panther draws all creatures to itself. (The brief's catalogue also lists the leopard and tiger; their entries are still being researched.)`,
      },
      {
        heading: "The deceivers",
        body: `The [[animal:fox|fox]] and the [[animal:wolf|wolf]] are the opposite case. The fox feigns death to catch birds; the wolf circles the fold. Both stand for the devil. Scripture reinforced this: Herod is "that fox", and false prophets are wolves in sheep's clothing.`,
      },
      {
        heading: "The bear",
        body: `The [[animal:bear|bear]] does not fit either pattern. Its best-known story, the cubs licked into shape, comes from classical natural history and carries no fixed allegory in the core texts. Not every animal was made to preach.`,
      },
      {
        kind: "note",
        heading: "Outside the bestiary",
        body: "The wolf of Rome's founding legend and the fox of the Renart stories belong to other traditions. They are recorded on the animal pages under their own labels.",
      },
    ],
  },
];

export const exercises = [
  {
    lesson: "how-to-read-a-beast",
    slug: "which-layer",
    title: "Which layer is this?",
    instructions: "For each statement, choose the layer of knowledge it belongs to. Optional; your answers are saved only if you are signed in.",
    questions: [
      {
        prompt: "“The lion's cubs are born dead and brought to life on the third day.”",
        explanation: "A story presented as a fact about the animal: a legend from the Physiologus.",
        answers: [
          { text: "Legend", correct: true },
          { text: "Modern zoology", correct: false },
          { text: "Modern scholarly interpretation", correct: false },
        ],
      },
      {
        prompt: "“The revived cubs signify Christ raised on the third day.”",
        explanation: "The meaning is stated in the text itself, so this is a bestiary allegory.",
        answers: [
          { text: "Bestiary allegory", correct: true },
          { text: "Legend", correct: false },
          { text: "Uncertain connection", correct: false },
        ],
      },
      {
        prompt: "“Lions were extinct in Europe long before the Middle Ages.”",
        explanation: "A statement about real animals in the world: modern zoology (and history).",
        answers: [
          { text: "Modern zoology", correct: true },
          { text: "Medieval description", correct: false },
          { text: "Bestiary allegory", correct: false },
        ],
      },
      {
        prompt: "“Isidore says the Greek word for lion means 'king'.”",
        explanation: "A medieval author's account of the animal: medieval description (an etymology).",
        answers: [
          { text: "Medieval description", correct: true },
          { text: "Classical mythology", correct: false },
          { text: "Legend", correct: false },
        ],
      },
    ],
  },
];
