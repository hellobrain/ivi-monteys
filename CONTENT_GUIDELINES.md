# Content guidelines

Historical accuracy is a product requirement. These rules apply to seed data, the CMS and any AI-assisted drafting.

## Never invent

Sources, editions, shelfmarks, folio numbers, quotations, artwork titles, accession numbers, dates, allegorical readings, scholarly references, lines of transmission, image URLs or attributions. If you do not know, leave the field empty and mark the record `unverified`. An empty locator is better than a guessed one.

## Keep the layers apart

Every claim carries a knowledge layer. Do not let one pass for another:

| Layer | Example |
| --- | --- |
| Modern zoology | Castoreum comes from scent glands; beaver testes are internal. |
| Medieval description | Isidore derives *castor* from *castrare*. |
| Legend | The beaver bites off its testicles and throws them to the hunter. |
| Bestiary allegory | The hunter is the devil; the beaver is the man who casts off vice. |
| Wider religious symbolism | 1 Peter 5:8: the devil as a roaring lion. |
| Classical mythology | The she-wolf of Romulus and Remus. |
| Modern scholarship | Hassig reads the hyena allegory as anti-Jewish ideology. |
| Uncertain connection | Caesar's jointless elk and the jointless elephant. |

## Evidence labels

- **Attested**: stated in a named primary source or object you can point to.
- **Supported by scholarship**: established in modern scholarship; primary text not yet checked by us.
- **Plausible**: reasonable inference, not documented.
- **Disputed**: scholars disagree; record each side as its own interpretation.
- **Unverified**: recorded for research only.

## No single meaning

An animal can be Christ and the devil. Record each reading as its own interpretation with its tradition and evidence. The UI presents them side by side.

## Difficult material

Some bestiary allegories are anti-Jewish (e.g. the hyena) or otherwise hostile. Record them accurately as historical attestations, say plainly what they are, and cite scholarship. Do not soften the source and do not adopt its view.

## Textual traditions versus manuscripts

A text (Physiologus, Isidore) is a `primary_source`. A surviving book is a `manuscript`. What a specific book contains, and where, is a `manuscript_witness`. Only set `folio_verified` after checking the folio in the manuscript or its facsimile.

## Provisional content

Seeded and AI-assisted entries are `research_status = provisional` and display a notice. A specialist must check them against the primary sources before they are marked `verified`. Claims without citations are shown as "Citation needed" rather than hidden.

## Classification notes on the brief's catalogue

The Block 4 list is an editorial inventory, not a verified catalogue. In the seed: the manticore, bonnacon and ant-lion are filed under *Fantastic creatures* (no zoological counterpart) and cross-referenced from Block 4; panther/leopard and other overlapping names need a decision on whether to merge or keep separate entries, recorded via `animal_names` and `animal_relations`.

## Writing style

Plain, precise English. Short sentences. Name the source in the sentence when it matters ("Pliny reports…"). Avoid hype, filler and fantasy register. Prefer "the bestiaries say" to "legend has it".
