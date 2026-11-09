/**
 * Symbolic concepts (Block 10). Concepts with a written description are
 * published; the rest are stubs kept in draft until researched.
 */
export const symbols: {
  slug: string;
  concept: string;
  description?: string;
  historicalContexts?: string;
  published: boolean;
}[] = [
  {
    slug: "christ",
    concept: "Christ",
    description:
      "The most frequent reading in the Physiologus. Many different animals stand for Christ (the lion, the panther, the unicorn, the pelican among them), each for a different aspect: concealment of divinity, resurrection, incarnation, sacrifice.",
    historicalContexts: "Physiologus and Latin bestiaries; biblical titles such as the Lion of Judah and the Lamb of God.",
    published: true,
  },
  {
    slug: "devil",
    concept: "Devil",
    description:
      "Animals that trick, ambush or steal (the fox, the hedgehog, the wolf) commonly stand for the devil. The same animal can be Christ in one passage and the devil in another, as the lion shows.",
    published: true,
  },
  {
    slug: "resurrection",
    concept: "Resurrection",
    description: "Stories of a third-day awakening (the lion's cubs, the panther) or of rebirth were read as figures of Christ's resurrection.",
    published: true,
  },
  {
    slug: "chastity",
    concept: "Chastity",
    description:
      "Elephants without desire, the unicorn tamed only by a virgin, the beaver casting off what the hunter seeks: chastity is praised through very different stories.",
    published: true,
  },
  {
    slug: "deception",
    concept: "Deception",
    description: "Feigned death, disguise and luring: the fox is the model, but wolves in sheep's clothing and voice-imitating hyenas belong here too.",
    published: true,
  },
  {
    slug: "kingship",
    concept: "Kingship",
    description: "The lion as king of beasts, already in Isidore's etymology; a reading with political as well as religious uses in heraldry and royal imagery.",
    published: true,
  },
  {
    slug: "humility",
    concept: "Humility",
    description: "The small elephant that raises the fallen giant is Christ who humbled himself.",
    published: true,
  },
  {
    slug: "hypocrisy",
    concept: "Hypocrisy and double-mindedness",
    description:
      "The changing hyena and the starving ant-lion are both used against the 'double-minded'. In the hyena's case the allegory is directed against Jews, and is recorded here as historical polemic.",
    published: true,
  },
  {
    slug: "spiritual-struggle",
    concept: "Spiritual struggle",
    description: "Combat between animals, above all the stag against the serpent, stands for the soul's fight against sin and the devil.",
    published: true,
  },
  {
    slug: "loyalty",
    concept: "Loyalty",
    description: "The faithful dog dominates this theme in the bestiaries, through stories drawn mostly from Pliny and Ambrose.",
    published: true,
  },
  { slug: "redemption", concept: "Redemption", published: false },
  { slug: "sacrifice", concept: "Sacrifice", published: false },
  { slug: "purity", concept: "Purity", published: false },
  { slug: "lust", concept: "Lust", published: false },
  { slug: "spiritual-blindness", concept: "Spiritual blindness", published: false },
  { slug: "wisdom", concept: "Wisdom", published: false },
  { slug: "pride", concept: "Pride", published: false },
  { slug: "authority", concept: "Authority", published: false },
  { slug: "death", concept: "Death", published: false },
  { slug: "rebirth", concept: "Rebirth", published: false },
  { slug: "community", concept: "Community", published: false },
  { slug: "transformation", concept: "Transformation", published: false },
];

export const glossary = [
  { slug: "bestiary", term: "Bestiary", definition: "A medieval book of beasts, usually in Latin or a vernacular, describing animals and drawing moral or religious lessons from them." },
  { slug: "physiologus", term: "Physiologus", definition: "A Greek text of late antiquity (Greek: 'the naturalist') that pairs animal natures with Christian readings; the ancestor of the bestiaries." },
  { slug: "allegory", term: "Allegory", definition: "Reading a thing as standing for something else, here usually a spiritual or moral truth." },
  { slug: "moralisatio", term: "Moralisation", definition: "The part of an entry that applies the animal's nature to human conduct or Christian doctrine." },
  { slug: "auctoritas", term: "Auctoritas", definition: "The authority of an earlier writer. Medieval authors valued agreement with authorities more than fresh observation." },
  { slug: "etymology", term: "Etymology (medieval)", definition: "Explaining a thing through the supposed origin of its name, as Isidore of Seville does. Many are false by modern standards but were meant to reveal a nature." },
  { slug: "manuscript-family", term: "Manuscript family", definition: "A group of manuscripts sharing a version of the text, conventionally numbered (first family, second family …) after M. R. James and Florence McCulloch." },
  { slug: "shelfmark", term: "Shelfmark", definition: "The reference a library uses to identify a manuscript, e.g. 'MS Ashmole 1511'." },
  { slug: "folio", term: "Folio, recto, verso", definition: "A leaf of a manuscript. Each folio has a front (recto, 'r') and back (verso, 'v'), so '7r' is the front of the seventh leaf." },
  { slug: "witness", term: "Witness", definition: "A surviving manuscript that preserves a text. A text may survive in many witnesses that differ from one another." },
  { slug: "iiif", term: "IIIF", definition: "International Image Interoperability Framework: an open standard many libraries use to publish high-resolution images that can be zoomed and compared." },
  { slug: "tympanum", term: "Tympanum", definition: "The semicircular field above a church doorway, often carved." },
  { slug: "trumeau", term: "Trumeau", definition: "The central pillar dividing a large doorway, often carved." },
  { slug: "corbel", term: "Corbel", definition: "A projecting block supporting a roof or cornice, frequently carved with heads and beasts in Romanesque churches." },
  { slug: "vernacular", term: "Vernacular", definition: "A spoken language as opposed to Latin: Anglo-Norman, Old French, Middle English and so on." },
];
