export const traditions = [
  {
    slug: "physiologus",
    name: "Core Physiologus tradition",
    description:
      "Material descending from the Greek Physiologus and its Latin translations: an animal's 'nature' followed by a Christian reading.",
  },
  {
    slug: "latin-bestiary",
    name: "Latin bestiary tradition",
    description:
      "Expanded Latin compilations of the twelfth and thirteenth centuries that combine the Physiologus with Isidore, Ambrose, Solinus and others.",
  },
  {
    slug: "vernacular-bestiary",
    name: "Vernacular bestiary tradition",
    description: "Bestiaries in Anglo-Norman, Old French and other vernaculars, often in verse.",
  },
  {
    slug: "encyclopaedic",
    name: "Medieval encyclopaedic natural history",
    description:
      "Encyclopaedias such as Isidore's Etymologiae, Hrabanus Maurus, Bartholomaeus Anglicus, Thomas of Cantimpré and Vincent of Beauvais.",
  },
  {
    slug: "classical",
    name: "Classical natural history",
    description: "Greek and Roman writers on animals: Aristotle, Pliny the Elder, Aelian, Solinus.",
  },
  {
    slug: "biblical",
    name: "Biblical commentary",
    description: "Scripture and its patristic and medieval commentators.",
  },
  {
    slug: "folklore",
    name: "Folklore",
    description: "Popular beliefs and stories recorded outside the learned textual traditions.",
  },
  {
    slug: "other",
    name: "Other historical traditions",
    description: "Traditions that do not fit the categories above; each record explains the context.",
  },
];

export const animalGroups = [
  { slug: "mammals", name: "Mammals and land creatures", description: "Beasts (bestiae) and herd animals." },
  { slug: "birds", name: "Birds", description: "Birds, including those treated in the Aviarium of Hugh of Fouilloy." },
  { slug: "serpents", name: "Serpents, reptiles and dragons", description: "Serpents, dragons, lizards and their kin." },
  { slug: "marine", name: "Fish and marine creatures", description: "Fish, whales and sea monsters." },
  { slug: "small-creatures", name: "Insects and small creatures", description: "Bees, ants, worms and other small animals." },
  {
    slug: "fantastic",
    name: "Fantastic creatures and hybrids",
    description:
      "Creatures that medieval authors treated as real but which have no modern zoological counterpart, or only a contested one.",
  },
];

/**
 * Coordinates are city- or site-level approximations entered without a
 * gazetteer check, so all are marked unverified.
 */
export const locations = [
  { slug: "aberdeen", name: "Aberdeen", modernPlace: "Aberdeen, Scotland", country: "United Kingdom", latitude: 57.15, longitude: -2.1 },
  { slug: "oxford", name: "Oxford", modernPlace: "Oxford, England", country: "United Kingdom", latitude: 51.75, longitude: -1.26 },
  { slug: "london", name: "London", modernPlace: "London, England", country: "United Kingdom", latitude: 51.51, longitude: -0.13 },
  { slug: "cambridge", name: "Cambridge", modernPlace: "Cambridge, England", country: "United Kingdom", latitude: 52.2, longitude: 0.12 },
  { slug: "new-york", name: "New York", modernPlace: "New York, USA", country: "United States", latitude: 40.75, longitude: -73.98 },
  { slug: "los-angeles", name: "Los Angeles", modernPlace: "Los Angeles, USA", country: "United States", latitude: 34.08, longitude: -118.47 },
  { slug: "bern", name: "Bern", modernPlace: "Bern, Switzerland", country: "Switzerland", latitude: 46.95, longitude: 7.45 },
  { slug: "paris", name: "Paris", modernPlace: "Paris, France", country: "France", latitude: 48.86, longitude: 2.35 },
  { slug: "kilpeck", name: "Kilpeck", modernPlace: "Kilpeck, Herefordshire, England", country: "United Kingdom", latitude: 51.97, longitude: -2.81 },
  { slug: "hereford", name: "Hereford", modernPlace: "Hereford, England", country: "United Kingdom", latitude: 52.05, longitude: -2.72 },
  { slug: "souillac", name: "Souillac", modernPlace: "Souillac, Lot, France", country: "France", latitude: 44.9, longitude: 1.48 },
];
