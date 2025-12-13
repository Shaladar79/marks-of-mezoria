// scripts/marks/marks-of-concept.mjs
// Mark of Concept
// Abstract, internal, cosmic, and metaphysical expressions of power

function slugKey(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildLabelsAndOrder(categories) {
  const labels = {};
  const order = [];

  for (const list of Object.values(categories)) {
    if (!Array.isArray(list)) continue;
    for (const label of list) {
      const key = slugKey(label);
      if (!key) continue;
      if (!(key in labels)) {
        labels[key] = label;
        order.push(key);
      }
    }
  }

  return { labels, order };
}

export const MarksOfConcept = {
  categories: {
    materials_forms: [
      "Bone",
      "Crystal",
      "Glass",
      "Hair",
      "Mirror",
      "Rune",
      "Visage"
    ],

    cosmic_forces: [
      "Cloud",
      "Moon",
      "Sand",
      "Smoke",
      "Star",
      "Sun",
      "Void"
    ],

    anatomy_internal: [
      "Blood",
      "Flesh",
      "Venom"
    ],

    instincts_drives: [
      "Blight",
      "Gathering",
      "Hunger",
      "Hunt"
    ],

    virtues_concepts: [
      "Adept",
      "Balance",
      "Echo",
      "Eye",
      "Omen",
      "Resolute",
      "Serene",
      "Vast",
      "Zeal"
    ],

    abstract_magic: [
      "Dimension",
      "Discord",
      "Myriad",
      "Shimmer"
    ],

    corruption_decay: [
      "Corrupt",
      "Death",
      "Feeble",
      "Harm",
      "Malign",
      "Sin",
      "Potent"
    ]
  }
};

// Flatten for dropdowns (key -> label)
const built = buildLabelsAndOrder(MarksOfConcept.categories);
MarksOfConcept.labels = built.labels;
MarksOfConcept.order  = built.order;

