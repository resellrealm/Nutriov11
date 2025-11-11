export const DAILY_MEALS = [
  {
    name: "Grilled Salmon with Quinoa",
    description: "Omega-3 rich salmon with protein-packed quinoa",
    calories: 450,
    protein: 35,
    carbs: 40,
    fat: 15,
    image: "🐟",
    tags: ["High Protein", "Heart Healthy"]
  },
  {
    name: "Mediterranean Chicken Bowl",
    description: "Herb-marinated chicken with fresh vegetables",
    calories: 420,
    protein: 38,
    carbs: 35,
    fat: 12,
    image: "🍗",
    tags: ["Balanced", "Low Fat"]
  },
  {
    name: "Veggie Buddha Bowl",
    description: "Colorful mix of roasted vegetables and chickpeas",
    calories: 380,
    protein: 18,
    carbs: 55,
    fat: 10,
    image: "🥗",
    tags: ["Vegetarian", "High Fiber"]
  },
  {
    name: "Lean Beef Stir-Fry",
    description: "Tender beef strips with crisp vegetables",
    calories: 410,
    protein: 32,
    carbs: 38,
    fat: 14,
    image: "🥩",
    tags: ["High Protein", "Iron Rich"]
  },
  {
    name: "Tofu & Vegetable Curry",
    description: "Spiced tofu in coconut curry sauce",
    calories: 360,
    protein: 22,
    carbs: 42,
    fat: 11,
    image: "🍛",
    tags: ["Vegan", "Flavorful"]
  },
  {
    name: "Turkey Avocado Wrap",
    description: "Whole grain wrap with lean turkey",
    calories: 390,
    protein: 28,
    carbs: 45,
    fat: 13,
    image: "🌯",
    tags: ["Quick", "Balanced"]
  },
  {
    name: "Shrimp & Zucchini Noodles",
    description: "Low-carb zoodles with garlic shrimp",
    calories: 320,
    protein: 30,
    carbs: 18,
    fat: 12,
    image: "🍤",
    tags: ["Low Carb", "Light"]
  }
];

export const getMealOfTheDay = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const mealIndex = daysSinceEpoch % DAILY_MEALS.length;
  return DAILY_MEALS[mealIndex];
};

export const getMealForDate = (date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const daysSinceEpoch = Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24));
  const mealIndex = daysSinceEpoch % DAILY_MEALS.length;
  return DAILY_MEALS[mealIndex];
};
