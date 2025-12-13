// scripts/marks/marks-of-power.mjs
// Marks of Power – gained at Garnet Rank
// Tangible, externalized expressions of power.

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

export const MarksOfPower = {
  categories: {
    weapons: [
      "Axe",
      "Bow",
      "Claw",
      "Fork",
      "Gun",
      "Hammer",
      "Hook",
      "Knife",
      "Net",
      "Rake",
      "Sceptre",
      "Shield",
      "Shovel",
      "Sickle",
      "Spear",
      "Spike",
      "Staff",
      "Sword",
      "Thread",
      "Trap",
      "Trowel",
      "Whip"
    ],

    armor_materials_objects: [
      "Armour",
      "Cage",
      "Chain",
      "Iron",
      "Technology",
      "Wall"
    ],

    elements: [
      "Cold",
      "Arcane",
      "Earth",
      "Fire",
      "Ice",
      "Light",
      "Shadow",
      "Lightning",
      "Water",
      "Wind",
      "Nature"
    ],

    animals_creatures: [
      "Ape",
      "Bat",
      "Bear",
      "Bee",
      "Bird",
      "Cat",
      "Crocodile",
      "Deer",
      "Dog",
      "Duck",
      "Fish",
      "Flea",
      "Fox",
      "Frog",
      "Goat",
      "Horse",
      "Lizard",
      "Locust",
      "Manatee",
      "Monkey",
      "Mouse",
      "Octopus",
      "Rabbit",
      "Rat",
      "Shark",
      "Skunk",
      "Sloth",
      "Snake",
      "Spider",
      "Turtle",
      "Wasp",
      "Wolf"
    ],

    plants_terrain: [
      "Coral",
      "Deep",
      "Fungus",
      "Growth",
      "Plant",
      "Renewal",
      "Tree"
    ],

    body_physicality: [
      "Foot",
      "Hand",
      "Life",
      "Might"
    ],

    magic_metaphysics: [
      "Magic",
      "Pure"
    ]
  }
};

// Flatten for dropdowns (key -> label)
const built = buildLabelsAndOrder(MarksOfPower.categories);
MarksOfPower.labels = built.labels;
MarksOfPower.order  = built.order;
