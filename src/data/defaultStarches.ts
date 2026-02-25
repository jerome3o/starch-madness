import type { Starch } from "../types";

let nextId = 1;
function s(name: string, emoji: string): Starch {
  return { id: String(nextId++), name, emoji };
}

export const DEFAULT_STARCHES: Starch[] = [
  // Breads & Baked
  s("Bagel", "🥯"),
  s("Sourdough", "🍞"),
  s("Baguette", "🥖"),
  s("Croissant", "🥐"),
  s("Pretzel", "🥨"),
  s("Naan", "🫓"),
  s("Pita", "🫓"),
  s("Focaccia", "🍞"),
  s("Cornbread", "🌽"),
  s("Biscuit", "🧈"),
  s("Dinner Roll", "🍞"),
  s("English Muffin", "🫓"),

  // Pasta & Noodles
  s("Spaghetti", "🍝"),
  s("Ramen", "🍜"),
  s("Mac & Cheese", "🧀"),
  s("Lasagna", "🍝"),
  s("Ravioli", "🥟"),
  s("Gnocchi", "🥔"),
  s("Udon", "🍜"),
  s("Pho", "🍜"),
  s("Pad Thai", "🍜"),
  s("Lo Mein", "🍜"),

  // Potatoes
  s("French Fries", "🍟"),
  s("Mashed Potatoes", "🥔"),
  s("Baked Potato", "🥔"),
  s("Tater Tots", "🥔"),
  s("Hash Browns", "🥔"),
  s("Potato Chips", "🥔"),
  s("Loaded Fries", "🍟"),
  s("Potato Wedges", "🥔"),

  // Rice & Grains
  s("Fried Rice", "🍚"),
  s("Sushi Rice", "🍣"),
  s("Risotto", "🍚"),
  s("Paella", "🥘"),
  s("Congee", "🍚"),
  s("Bibimbap", "🍚"),
  s("Oatmeal", "🥣"),
  s("Polenta", "🌽"),

  // Dumplings & Wrapped
  s("Dumplings", "🥟"),
  s("Pierogi", "🥟"),
  s("Empanada", "🥟"),
  s("Samosa", "🥟"),
  s("Spring Roll", "🥟"),
  s("Tamale", "🫔"),
  s("Arepa", "🫓"),
  s("Pupusa", "🫓"),

  // Flatbreads & Tortillas
  s("Pizza", "🍕"),
  s("Taco", "🌮"),
  s("Burrito", "🌯"),
  s("Quesadilla", "🧀"),
  s("Crepe", "🥞"),
  s("Injera", "🫓"),

  // Breakfast & Sweet
  s("Pancakes", "🥞"),
  s("Waffles", "🧇"),
  s("Donut", "🍩"),
  s("Churro", "🍩"),
  s("Funnel Cake", "🍰"),
  s("Scone", "🧁"),
  s("Crumpet", "🧇"),
  s("Cinnamon Roll", "🍥"),

  // Snacks & Other
  s("Popcorn", "🍿"),
  s("Crackers", "🍘"),
  s("Breadsticks", "🥖"),
  s("Mantou", "🫓"),
  s("Couscous", "🥘"),
  s("Grits", "🌽"),
];
