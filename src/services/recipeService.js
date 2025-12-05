import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ERROR_CODES } from '../utils/errorCodes';
import { logError, logWarning } from '../utils/errorLogger';
import { checkFirestoreConfig } from '../utils/firebaseHelpers';
import {
  getMealsForUser,
  getMealOfTheDay as getAIMealOfTheDay
} from './aiMealGenerationService';

// ==================== BACKUP RECIPES (28 total: 7 per meal type) ====================
// These serve as fallback when AI-generated meals are unavailable

export const BUILT_IN_RECIPES = [
  // ========== BREAKFAST (7 recipes) ==========
  {
    id: 'recipe_b001',
    name: 'Greek Yogurt Parfait',
    description: 'Protein-rich yogurt layered with fresh berries and granola',
    calories: 320,
    protein: 20,
    carbs: 42,
    fat: 8,
    fiber: 6,
    cookTime: '5 min',
    difficulty: 'Easy',
    image: '🥣',
    mealType: 'breakfast',
    tags: ['High Protein', 'Quick', 'Vegetarian'],
    ingredients: ['Greek yogurt (1 cup)', 'Mixed berries (1/2 cup)', 'Granola (1/4 cup)', 'Honey (1 tbsp)', 'Chia seeds (1 tsp)'],
    instructions: ['Layer yogurt in bowl', 'Add berries', 'Top with granola and chia seeds', 'Drizzle with honey', 'Serve immediately'],
    prepTime: '5 min',
    servings: 1
  },
  {
    id: 'recipe_b002',
    name: 'Avocado Toast with Poached Egg',
    description: 'Whole grain toast topped with creamy avocado and protein-rich egg',
    calories: 380,
    protein: 18,
    carbs: 32,
    fat: 20,
    fiber: 9,
    cookTime: '10 min',
    difficulty: 'Easy',
    image: '🥑',
    mealType: 'breakfast',
    tags: ['Balanced', 'Healthy Fats', 'Vegetarian'],
    ingredients: ['Whole grain bread (2 slices)', 'Avocado (1/2)', 'Eggs (2)', 'Cherry tomatoes (1/4 cup)', 'Red pepper flakes', 'Lemon juice', 'Salt & pepper'],
    instructions: ['Toast bread', 'Mash avocado with lemon juice', 'Poach eggs in simmering water (3-4 min)', 'Spread avocado on toast', 'Top with poached eggs and tomatoes', 'Season with red pepper flakes'],
    prepTime: '5 min',
    servings: 1
  },
  {
    id: 'recipe_b003',
    name: 'Protein Banana Pancakes',
    description: 'Fluffy pancakes made with banana and protein powder',
    calories: 420,
    protein: 32,
    carbs: 48,
    fat: 10,
    fiber: 5,
    cookTime: '15 min',
    difficulty: 'Medium',
    image: '🥞',
    mealType: 'breakfast',
    tags: ['High Protein', 'Post-Workout', 'Sweet'],
    ingredients: ['Banana (1 large, mashed)', 'Eggs (2)', 'Protein powder (1 scoop)', 'Oats (1/4 cup)', 'Baking powder (1/2 tsp)', 'Cinnamon', 'Vanilla extract', 'Blueberries (1/4 cup)'],
    instructions: ['Blend banana, eggs, protein powder, oats', 'Add baking powder, cinnamon, vanilla', 'Heat non-stick pan', 'Pour batter to make pancakes', 'Cook 2-3 min per side', 'Top with fresh blueberries'],
    prepTime: '5 min',
    servings: 1
  },
  {
    id: 'recipe_b004',
    name: 'Veggie Scramble Bowl',
    description: 'Colorful scrambled eggs loaded with vegetables',
    calories: 340,
    protein: 24,
    carbs: 18,
    fat: 18,
    fiber: 6,
    cookTime: '12 min',
    difficulty: 'Easy',
    image: '🍳',
    mealType: 'breakfast',
    tags: ['High Protein', 'Low Carb', 'Gluten-Free'],
    ingredients: ['Eggs (3)', 'Spinach (1 cup)', 'Bell peppers (1/2 cup)', 'Onion (1/4 cup)', 'Mushrooms (1/4 cup)', 'Cherry tomatoes (1/4 cup)', 'Feta cheese (2 tbsp)', 'Olive oil', 'Herbs'],
    instructions: ['Dice all vegetables', 'Heat olive oil in pan', 'Sauté onions and peppers (3 min)', 'Add mushrooms and spinach', 'Beat eggs and pour over veggies', 'Scramble until cooked', 'Top with feta and tomatoes'],
    prepTime: '8 min',
    servings: 1
  },
  {
    id: 'recipe_b005',
    name: 'Overnight Oats with Berries',
    description: 'No-cook oats soaked overnight with fresh berries and nuts',
    calories: 380,
    protein: 15,
    carbs: 56,
    fat: 12,
    fiber: 10,
    cookTime: '0 min (overnight)',
    difficulty: 'Easy',
    image: '🥣',
    mealType: 'breakfast',
    tags: ['High Fiber', 'Meal Prep', 'Vegan'],
    ingredients: ['Rolled oats (1/2 cup)', 'Almond milk (3/4 cup)', 'Chia seeds (1 tbsp)', 'Mixed berries (1/2 cup)', 'Almonds (2 tbsp, chopped)', 'Maple syrup (1 tbsp)', 'Cinnamon'],
    instructions: ['Mix oats, milk, chia seeds in jar', 'Stir in cinnamon and maple syrup', 'Refrigerate overnight (8 hours)', 'In morning, top with berries and almonds', 'Ready to eat!'],
    prepTime: '5 min',
    servings: 1
  },
  {
    id: 'recipe_b006',
    name: 'Spinach & Feta Omelet',
    description: 'Fluffy omelet filled with spinach, feta, and herbs',
    calories: 320,
    protein: 26,
    carbs: 8,
    fat: 20,
    fiber: 3,
    cookTime: '10 min',
    difficulty: 'Medium',
    image: '🍳',
    mealType: 'breakfast',
    tags: ['High Protein', 'Low Carb', 'Keto-Friendly'],
    ingredients: ['Eggs (3)', 'Fresh spinach (1 cup)', 'Feta cheese (1/4 cup)', 'Red onion (2 tbsp)', 'Cherry tomatoes (1/4 cup)', 'Olive oil', 'Fresh dill', 'Salt & pepper'],
    instructions: ['Beat eggs with salt and pepper', 'Sauté spinach and onion until wilted', 'Pour eggs into pan', 'When edges set, add spinach, feta, tomatoes', 'Fold omelet in half', 'Cook 1 more minute', 'Garnish with dill'],
    prepTime: '5 min',
    servings: 1
  },
  {
    id: 'recipe_b007',
    name: 'Berry Smoothie Bowl',
    description: 'Thick and creamy smoothie bowl topped with fresh fruit and granola',
    calories: 390,
    protein: 18,
    carbs: 58,
    fat: 10,
    fiber: 12,
    cookTime: '5 min',
    difficulty: 'Easy',
    image: '🍓',
    mealType: 'breakfast',
    tags: ['High Fiber', 'Antioxidant Rich', 'Refreshing'],
    ingredients: ['Frozen mixed berries (1 cup)', 'Banana (1)', 'Greek yogurt (1/2 cup)', 'Almond milk (1/4 cup)', 'Protein powder (1 scoop)', 'Granola (2 tbsp)', 'Fresh berries (1/4 cup)', 'Coconut flakes'],
    instructions: ['Blend frozen berries, banana, yogurt, milk, protein powder until thick', 'Pour into bowl', 'Top with fresh berries, granola, coconut flakes', 'Add chia seeds if desired', 'Eat with spoon'],
    prepTime: '5 min',
    servings: 1
  },

  // ========== LUNCH (7 recipes) ==========
  {
    id: 'recipe_l001',
    name: 'Mediterranean Chicken Bowl',
    description: 'Herb-marinated chicken with fresh vegetables and hummus',
    calories: 420,
    protein: 38,
    carbs: 35,
    fat: 12,
    fiber: 8,
    cookTime: '30 min',
    difficulty: 'Medium',
    image: '🍗',
    mealType: 'lunch',
    tags: ['Balanced', 'Low Fat', 'High Fiber'],
    ingredients: ['Chicken breast (6 oz)', 'Cucumber (1/2 cup)', 'Tomatoes (1/2 cup)', 'Red onion (1/4 cup)', 'Hummus (3 tbsp)', 'Feta cheese (2 tbsp)', 'Olive oil', 'Lemon', 'Herbs', 'Mixed greens'],
    instructions: ['Marinate chicken with herbs, lemon, olive oil (15 min)', 'Grill chicken until cooked through (6-7 min per side)', 'Dice vegetables', 'Assemble bowl with greens as base', 'Add sliced chicken, vegetables, hummus', 'Top with feta and drizzle lemon juice'],
    prepTime: '15 min',
    servings: 1
  },
  {
    id: 'recipe_l002',
    name: 'Quinoa Buddha Bowl',
    description: 'Colorful mix of quinoa, roasted vegetables, and tahini dressing',
    calories: 420,
    protein: 16,
    carbs: 62,
    fat: 14,
    fiber: 12,
    cookTime: '35 min',
    difficulty: 'Easy',
    image: '🥗',
    mealType: 'lunch',
    tags: ['Vegetarian', 'High Fiber', 'Vegan'],
    ingredients: ['Quinoa (1/2 cup dry)', 'Chickpeas (1/2 cup)', 'Sweet potato (1 cup)', 'Kale (1 cup)', 'Avocado (1/4)', 'Tahini (2 tbsp)', 'Lemon juice', 'Garlic', 'Olive oil'],
    instructions: ['Cook quinoa according to package', 'Roast sweet potato and chickpeas with olive oil (25 min at 400°F)', 'Massage kale with lemon juice', 'Make tahini dressing (tahini, lemon, garlic, water)', 'Assemble bowl with quinoa base', 'Add roasted veggies, kale, avocado', 'Drizzle tahini dressing'],
    prepTime: '10 min',
    servings: 1
  },
  {
    id: 'recipe_l003',
    name: 'Turkey & Avocado Wrap',
    description: 'Whole wheat wrap filled with lean turkey, avocado, and crisp veggies',
    calories: 390,
    protein: 32,
    carbs: 36,
    fat: 14,
    fiber: 8,
    cookTime: '10 min',
    difficulty: 'Easy',
    image: '🌯',
    mealType: 'lunch',
    tags: ['High Protein', 'Quick', 'Portable'],
    ingredients: ['Whole wheat tortilla (large)', 'Turkey breast (4 oz, sliced)', 'Avocado (1/2)', 'Romaine lettuce', 'Tomato (1/2)', 'Red onion', 'Swiss cheese (1 slice)', 'Mustard', 'Sprouts'],
    instructions: ['Lay tortilla flat', 'Spread mashed avocado', 'Add mustard', 'Layer turkey, cheese, lettuce, tomato, onion, sprouts', 'Fold sides in, roll tightly', 'Cut in half diagonally', 'Serve with fruit or veggie sticks'],
    prepTime: '10 min',
    servings: 1
  },
  {
    id: 'recipe_l004',
    name: 'Spicy Shrimp Stir-Fry',
    description: 'Succulent shrimp with colorful vegetables in ginger-garlic sauce',
    calories: 380,
    protein: 36,
    carbs: 42,
    fat: 8,
    fiber: 6,
    cookTime: '20 min',
    difficulty: 'Medium',
    image: '🍤',
    mealType: 'lunch',
    tags: ['High Protein', 'Low Fat', 'Pescatarian'],
    ingredients: ['Shrimp (6 oz, peeled)', 'Brown rice (1/2 cup dry)', 'Bell peppers (1 cup)', 'Broccoli (1 cup)', 'Snap peas (1/2 cup)', 'Ginger (1 tbsp)', 'Garlic (2 cloves)', 'Soy sauce', 'Sesame oil', 'Red pepper flakes'],
    instructions: ['Cook brown rice', 'Heat sesame oil in wok', 'Stir-fry shrimp until pink (3-4 min), remove', 'Add vegetables, ginger, garlic, stir-fry (5 min)', 'Return shrimp to wok', 'Add soy sauce and red pepper flakes', 'Serve over brown rice'],
    prepTime: '10 min',
    servings: 1
  },
  {
    id: 'recipe_l005',
    name: 'Lentil & Sweet Potato Curry',
    description: 'Hearty plant-based curry with aromatic spices',
    calories: 410,
    protein: 18,
    carbs: 68,
    fat: 8,
    fiber: 16,
    cookTime: '35 min',
    difficulty: 'Medium',
    image: '🍛',
    mealType: 'lunch',
    tags: ['Vegan', 'High Fiber', 'Comfort Food'],
    ingredients: ['Red lentils (3/4 cup)', 'Sweet potato (1 large)', 'Coconut milk (1/2 cup)', 'Diced tomatoes (1/2 cup)', 'Onion (1)', 'Garlic (3 cloves)', 'Ginger (1 tbsp)', 'Curry powder (2 tsp)', 'Cumin', 'Turmeric', 'Spinach (1 cup)'],
    instructions: ['Sauté onion, garlic, ginger', 'Add curry powder, cumin, turmeric', 'Add sweet potato, lentils, tomatoes', 'Pour in coconut milk and 2 cups water', 'Simmer 25 min until lentils tender', 'Stir in spinach until wilted', 'Serve with brown rice or naan'],
    prepTime: '10 min',
    servings: 2
  },
  {
    id: 'recipe_l006',
    name: 'Grilled Salmon Salad',
    description: 'Omega-3 rich salmon over mixed greens with citrus vinaigrette',
    calories: 420,
    protein: 38,
    carbs: 22,
    fat: 22,
    fiber: 6,
    cookTime: '20 min',
    difficulty: 'Medium',
    image: '🐟',
    mealType: 'lunch',
    tags: ['High Protein', 'Heart Healthy', 'Gluten-Free'],
    ingredients: ['Salmon fillet (6 oz)', 'Mixed greens (3 cups)', 'Cherry tomatoes (1 cup)', 'Cucumber (1/2 cup)', 'Avocado (1/4)', 'Walnuts (2 tbsp)', 'Orange juice (2 tbsp)', 'Olive oil (1 tbsp)', 'Dijon mustard', 'Honey', 'Lemon'],
    instructions: ['Season salmon with lemon, salt, pepper', 'Grill salmon 4-5 min per side', 'Make vinaigrette: whisk orange juice, olive oil, mustard, honey', 'Toss greens, tomatoes, cucumber with vinaigrette', 'Top with salmon, avocado, walnuts', 'Serve immediately'],
    prepTime: '10 min',
    servings: 1
  },
  {
    id: 'recipe_l007',
    name: 'Chicken Caesar Salad',
    description: 'Classic Caesar with grilled chicken and homemade dressing',
    calories: 450,
    protein: 42,
    carbs: 18,
    fat: 24,
    fiber: 4,
    cookTime: '25 min',
    difficulty: 'Medium',
    image: '🥗',
    mealType: 'lunch',
    tags: ['High Protein', 'Classic', 'Low Carb'],
    ingredients: ['Chicken breast (6 oz)', 'Romaine lettuce (3 cups)', 'Parmesan cheese (1/4 cup)', 'Whole grain croutons (1/4 cup)', 'Greek yogurt (3 tbsp)', 'Lemon juice (1 tbsp)', 'Garlic (1 clove)', 'Dijon mustard', 'Worcestershire sauce', 'Anchovies (optional)'],
    instructions: ['Grill chicken breast until cooked through', 'Make dressing: blend yogurt, lemon, garlic, mustard, Worcestershire', 'Chop romaine lettuce', 'Slice grilled chicken', 'Toss lettuce with dressing', 'Top with chicken, Parmesan, croutons', 'Add black pepper to taste'],
    prepTime: '10 min',
    servings: 1
  },

  // ========== DINNER (7 recipes) ==========
  {
    id: 'recipe_d001',
    name: 'Grilled Salmon with Quinoa',
    description: 'Omega-3 rich salmon with protein-packed quinoa and steamed vegetables',
    calories: 450,
    protein: 35,
    carbs: 40,
    fat: 15,
    fiber: 6,
    cookTime: '25 min',
    difficulty: 'Medium',
    image: '🐟',
    mealType: 'dinner',
    tags: ['High Protein', 'Heart Healthy', 'Gluten-Free'],
    ingredients: ['Salmon fillet (6 oz)', 'Quinoa (1/2 cup dry)', 'Broccoli (1.5 cups)', 'Lemon (1)', 'Olive oil (1 tbsp)', 'Garlic (2 cloves)', 'Fresh dill', 'Salt & pepper'],
    instructions: ['Cook quinoa according to package directions', 'Season salmon with lemon juice, dill, salt, pepper', 'Grill salmon 4-5 min per side until flaky', 'Steam broccoli until tender-crisp (5 min)', 'Sauté garlic in olive oil, toss with quinoa', 'Plate quinoa, top with salmon and broccoli', 'Garnish with lemon wedge and fresh dill'],
    prepTime: '10 min',
    servings: 1
  },
  {
    id: 'recipe_d002',
    name: 'Lean Beef Stir-Fry',
    description: 'Tender beef strips with crisp vegetables in savory ginger sauce',
    calories: 410,
    protein: 32,
    carbs: 38,
    fat: 14,
    fiber: 5,
    cookTime: '20 min',
    difficulty: 'Easy',
    image: '🥩',
    mealType: 'dinner',
    tags: ['High Protein', 'Iron Rich', 'Quick'],
    ingredients: ['Lean beef sirloin (5 oz)', 'Brown rice (1/2 cup dry)', 'Bell peppers (1 cup)', 'Broccoli (1 cup)', 'Snap peas (1/2 cup)', 'Ginger (1 tbsp)', 'Garlic (2 cloves)', 'Low-sodium soy sauce', 'Sesame oil', 'Cornstarch'],
    instructions: ['Cook brown rice', 'Slice beef thinly, toss with cornstarch', 'Heat sesame oil in wok on high heat', 'Stir-fry beef until browned (3 min), remove', 'Add vegetables, ginger, garlic, stir-fry (5 min)', 'Return beef to wok with soy sauce', 'Serve over brown rice'],
    prepTime: '15 min',
    servings: 1
  },
  {
    id: 'recipe_d003',
    name: 'Baked Chicken & Roasted Vegetables',
    description: 'Herb-crusted chicken breast with colorful roasted vegetables',
    calories: 420,
    protein: 42,
    carbs: 32,
    fat: 12,
    fiber: 8,
    cookTime: '40 min',
    difficulty: 'Easy',
    image: '🍗',
    mealType: 'dinner',
    tags: ['High Protein', 'Meal Prep', 'Gluten-Free'],
    ingredients: ['Chicken breast (7 oz)', 'Sweet potato (1 medium)', 'Brussels sprouts (1 cup)', 'Carrots (1 cup)', 'Red onion (1/2)', 'Olive oil (2 tbsp)', 'Rosemary', 'Thyme', 'Garlic powder', 'Paprika'],
    instructions: ['Preheat oven to 425°F', 'Season chicken with herbs, garlic powder, paprika', 'Chop vegetables into bite-sized pieces', 'Toss vegetables with olive oil, salt, pepper', 'Place chicken and vegetables on baking sheet', 'Roast 35-40 min until chicken reaches 165°F', 'Let chicken rest 5 min before slicing'],
    prepTime: '15 min',
    servings: 1
  },
  {
    id: 'recipe_d004',
    name: 'Vegetarian Stuffed Bell Peppers',
    description: 'Bell peppers filled with quinoa, black beans, and vegetables',
    calories: 390,
    protein: 18,
    carbs: 62,
    fat: 10,
    fiber: 14,
    cookTime: '45 min',
    difficulty: 'Medium',
    image: '🫑',
    mealType: 'dinner',
    tags: ['Vegetarian', 'High Fiber', 'Comfort Food'],
    ingredients: ['Bell peppers (2 large)', 'Quinoa (1/2 cup)', 'Black beans (1/2 cup)', 'Corn (1/4 cup)', 'Diced tomatoes (1/2 cup)', 'Onion (1/4 cup)', 'Cumin (1 tsp)', 'Chili powder', 'Monterey Jack cheese (1/4 cup)', 'Cilantro'],
    instructions: ['Cook quinoa', 'Cut tops off peppers, remove seeds', 'Sauté onion, add cooked quinoa, beans, corn, tomatoes, spices', 'Stuff peppers with mixture', 'Place in baking dish with 1/4 cup water', 'Bake at 375°F for 30 min', 'Top with cheese, bake 5 more min', 'Garnish with cilantro'],
    prepTime: '20 min',
    servings: 2
  },
  {
    id: 'recipe_d005',
    name: 'Shrimp Scampi with Zucchini Noodles',
    description: 'Light and flavorful shrimp in garlic butter sauce over zoodles',
    calories: 340,
    protein: 32,
    carbs: 18,
    fat: 16,
    fiber: 4,
    cookTime: '20 min',
    difficulty: 'Medium',
    image: '🍤',
    mealType: 'dinner',
    tags: ['Low Carb', 'High Protein', 'Pescatarian'],
    ingredients: ['Shrimp (6 oz)', 'Zucchini (2 medium, spiralized)', 'Garlic (4 cloves)', 'White wine (1/4 cup)', 'Butter (1 tbsp)', 'Olive oil (1 tbsp)', 'Lemon juice', 'Red pepper flakes', 'Parsley', 'Parmesan'],
    instructions: ['Spiralize zucchini or use pre-made zoodles', 'Heat olive oil, sauté garlic until fragrant', 'Add shrimp, cook until pink (3 min per side)', 'Add wine, lemon juice, butter, red pepper flakes', 'Simmer 2 min to reduce sauce', 'Toss zoodles in sauce briefly (1 min)', 'Garnish with parsley and Parmesan'],
    prepTime: '15 min',
    servings: 1
  },
  {
    id: 'recipe_d006',
    name: 'Turkey Meatballs with Marinara',
    description: 'Lean turkey meatballs in rich tomato sauce with whole wheat pasta',
    calories: 460,
    protein: 38,
    carbs: 52,
    fat: 10,
    fiber: 8,
    cookTime: '35 min',
    difficulty: 'Medium',
    image: '🍝',
    mealType: 'dinner',
    tags: ['High Protein', 'Comfort Food', 'Meal Prep'],
    ingredients: ['Ground turkey (6 oz)', 'Whole wheat pasta (2 oz dry)', 'Egg (1)', 'Breadcrumbs (2 tbsp)', 'Parmesan (2 tbsp)', 'Marinara sauce (1 cup)', 'Garlic (2 cloves)', 'Italian herbs', 'Onion powder', 'Fresh basil'],
    instructions: ['Mix turkey, egg, breadcrumbs, Parmesan, herbs, onion powder', 'Form into 10-12 meatballs', 'Bake at 400°F for 20 min until cooked through', 'Cook pasta according to package', 'Heat marinara sauce with garlic', 'Add meatballs to sauce', 'Serve meatballs and sauce over pasta', 'Garnish with basil and Parmesan'],
    prepTime: '15 min',
    servings: 1
  },
  {
    id: 'recipe_d007',
    name: 'Tofu & Vegetable Curry',
    description: 'Crispy tofu cubes in creamy coconut curry with vegetables',
    calories: 420,
    protein: 22,
    carbs: 48,
    fat: 18,
    fiber: 10,
    cookTime: '35 min',
    difficulty: 'Medium',
    image: '🍛',
    mealType: 'dinner',
    tags: ['Vegan', 'High Protein', 'Asian Inspired'],
    ingredients: ['Firm tofu (6 oz)', 'Brown rice (1/2 cup dry)', 'Coconut milk (1/2 cup)', 'Bell peppers (1 cup)', 'Broccoli (1 cup)', 'Curry paste (2 tbsp)', 'Ginger (1 tbsp)', 'Garlic (2 cloves)', 'Soy sauce', 'Lime', 'Basil'],
    instructions: ['Press tofu to remove moisture, cube', 'Pan-fry tofu until crispy on all sides', 'Cook brown rice', 'Sauté garlic, ginger, curry paste', 'Add vegetables, cook 5 min', 'Pour in coconut milk, simmer 10 min', 'Add crispy tofu and soy sauce', 'Serve over rice with lime and basil'],
    prepTime: '15 min',
    servings: 1
  },

  // ========== SNACKS (7 recipes) ==========
  {
    id: 'recipe_s001',
    name: 'Apple Slices with Almond Butter',
    description: 'Crisp apple slices paired with creamy almond butter',
    calories: 220,
    protein: 6,
    carbs: 28,
    fat: 10,
    fiber: 6,
    cookTime: '3 min',
    difficulty: 'Easy',
    image: '🍎',
    mealType: 'snack',
    tags: ['Quick', 'Healthy Fats', 'Kid-Friendly'],
    ingredients: ['Apple (1 medium)', 'Almond butter (2 tbsp)', 'Cinnamon (optional)'],
    instructions: ['Slice apple into wedges', 'Arrange on plate', 'Serve with almond butter for dipping', 'Sprinkle cinnamon if desired'],
    prepTime: '3 min',
    servings: 1
  },
  {
    id: 'recipe_s002',
    name: 'Greek Yogurt with Honey & Nuts',
    description: 'Protein-rich Greek yogurt drizzled with honey and crunchy nuts',
    calories: 240,
    protein: 18,
    carbs: 22,
    fat: 10,
    fiber: 2,
    cookTime: '2 min',
    difficulty: 'Easy',
    image: '🥣',
    mealType: 'snack',
    tags: ['High Protein', 'Quick', 'Vegetarian'],
    ingredients: ['Greek yogurt (3/4 cup)', 'Honey (1 tbsp)', 'Mixed nuts (2 tbsp, chopped)', 'Cinnamon'],
    instructions: ['Scoop yogurt into bowl', 'Drizzle with honey', 'Top with chopped nuts', 'Sprinkle cinnamon', 'Enjoy immediately'],
    prepTime: '2 min',
    servings: 1
  },
  {
    id: 'recipe_s003',
    name: 'Hummus & Veggie Sticks',
    description: 'Creamy hummus with colorful vegetable crudités',
    calories: 180,
    protein: 8,
    carbs: 22,
    fat: 8,
    fiber: 8,
    cookTime: '5 min',
    difficulty: 'Easy',
    image: '🥕',
    mealType: 'snack',
    tags: ['Vegan', 'High Fiber', 'Low Calorie'],
    ingredients: ['Hummus (1/4 cup)', 'Carrots (1 cup)', 'Celery (1/2 cup)', 'Bell peppers (1/2 cup)', 'Cherry tomatoes (1/2 cup)'],
    instructions: ['Wash and cut vegetables into sticks', 'Arrange on plate', 'Serve with hummus for dipping', 'Refrigerate leftovers'],
    prepTime: '5 min',
    servings: 1
  },
  {
    id: 'recipe_s004',
    name: 'Protein Energy Balls',
    description: 'No-bake energy balls packed with protein and natural sweetness',
    calories: 200,
    protein: 8,
    carbs: 26,
    fat: 8,
    fiber: 4,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🍪',
    mealType: 'snack',
    tags: ['Meal Prep', 'Post-Workout', 'Vegan'],
    ingredients: ['Dates (1/2 cup)', 'Oats (1/2 cup)', 'Almond butter (2 tbsp)', 'Protein powder (2 tbsp)', 'Chia seeds (1 tbsp)', 'Dark chocolate chips (2 tbsp)', 'Vanilla extract'],
    instructions: ['Pulse dates in food processor until sticky', 'Add oats, almond butter, protein powder, chia seeds, vanilla', 'Blend until combined', 'Fold in chocolate chips', 'Roll into 8-10 balls', 'Refrigerate 1 hour', 'Store in fridge up to 1 week'],
    prepTime: '15 min',
    servings: 4
  },
  {
    id: 'recipe_s005',
    name: 'Cottage Cheese & Berries',
    description: 'Protein-packed cottage cheese with fresh mixed berries',
    calories: 180,
    protein: 20,
    carbs: 18,
    fat: 4,
    fiber: 4,
    cookTime: '2 min',
    difficulty: 'Easy',
    image: '🫐',
    mealType: 'snack',
    tags: ['High Protein', 'Low Fat', 'Quick'],
    ingredients: ['Cottage cheese (3/4 cup)', 'Mixed berries (1/2 cup)', 'Honey (1 tsp, optional)', 'Mint leaves'],
    instructions: ['Scoop cottage cheese into bowl', 'Top with fresh berries', 'Drizzle honey if desired', 'Garnish with mint', 'Serve chilled'],
    prepTime: '2 min',
    servings: 1
  },
  {
    id: 'recipe_s006',
    name: 'Avocado Rice Cakes',
    description: 'Crunchy rice cakes topped with creamy avocado and seasonings',
    calories: 200,
    protein: 4,
    carbs: 22,
    fat: 12,
    fiber: 6,
    cookTime: '5 min',
    difficulty: 'Easy',
    image: '🥑',
    mealType: 'snack',
    tags: ['Healthy Fats', 'Quick', 'Gluten-Free'],
    ingredients: ['Rice cakes (2)', 'Avocado (1/2)', 'Cherry tomatoes (4, halved)', 'Red pepper flakes', 'Lemon juice', 'Sea salt'],
    instructions: ['Mash avocado with lemon juice', 'Spread on rice cakes', 'Top with cherry tomato halves', 'Sprinkle with red pepper flakes and sea salt', 'Eat immediately for best crunch'],
    prepTime: '5 min',
    servings: 1
  },
  {
    id: 'recipe_s007',
    name: 'Trail Mix',
    description: 'Homemade trail mix with nuts, seeds, and dried fruit',
    calories: 220,
    protein: 8,
    carbs: 24,
    fat: 12,
    fiber: 4,
    cookTime: '3 min',
    difficulty: 'Easy',
    image: '🥜',
    mealType: 'snack',
    tags: ['Portable', 'Meal Prep', 'Energy Boost'],
    ingredients: ['Almonds (2 tbsp)', 'Walnuts (1 tbsp)', 'Pumpkin seeds (1 tbsp)', 'Dried cranberries (2 tbsp)', 'Dark chocolate chips (1 tbsp)', 'Coconut flakes (1 tbsp)'],
    instructions: ['Mix all ingredients in bowl or container', 'Portion into small bags for easy grab-and-go', 'Store in airtight container', 'Enjoy as needed'],
    prepTime: '3 min',
    servings: 1
  }
];

// ==================== AI-ENHANCED RECIPE FUNCTIONS ====================

/**
 * Get all recipes (AI-generated + backup static recipes)
 * If user profile provided, returns personalized AI-generated meals
 * Otherwise returns static backup recipes
 */
export const getAllRecipes = async (userProfile = null) => {
  // Try to get AI-generated meals if user profile provided
  if (userProfile) {
    try {
      const aiMeals = await getMealsForUser(userProfile);
      if (aiMeals) {
        // Flatten AI meals structure to match recipe format
        const allAIMeals = [
          ...(aiMeals.breakfast || []),
          ...(aiMeals.lunch || []),
          ...(aiMeals.dinner || []),
          ...(aiMeals.snack || [])
        ];

        if (allAIMeals.length > 0) {
          return allAIMeals;
        }
      }
    } catch (error) {
      logWarning('recipeService.getAllRecipes', 'Failed to fetch AI meals, falling back to static recipes', { error: error.message });
    }
  }

  // Fallback to static recipes
  return BUILT_IN_RECIPES;
};

/**
 * Get recipe by ID (checks both AI and static recipes)
 */
export const getRecipeById = async (recipeId, userProfile = null) => {
  // Check AI recipes first if user profile provided
  if (userProfile) {
    try {
      const aiMeals = await getMealsForUser(userProfile);
      if (aiMeals) {
        const allAIMeals = [
          ...(aiMeals.breakfast || []),
          ...(aiMeals.lunch || []),
          ...(aiMeals.dinner || []),
          ...(aiMeals.snack || [])
        ];

        const aiRecipe = allAIMeals.find(recipe => recipe.id === recipeId);
        if (aiRecipe) return aiRecipe;
      }
    } catch (error) {
      logWarning('recipeService.getRecipeById', 'Error fetching AI recipe', { error: error.message, recipeId });
    }
  }

  // Fallback to static recipes
  return BUILT_IN_RECIPES.find(recipe => recipe.id === recipeId) || null;
};

/**
 * Get recipes by meal type
 */
export const getRecipesByMealType = async (mealType, userProfile = null) => {
  const allRecipes = await getAllRecipes(userProfile);
  return allRecipes.filter(recipe => recipe.mealType === mealType);
};

/**
 * Get recipes by tag
 */
export const getRecipesByTag = async (tag, userProfile = null) => {
  const allRecipes = await getAllRecipes(userProfile);
  return allRecipes.filter(recipe =>
    recipe.tags && recipe.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
};

/**
 * Get meal of the day - uses AI if available, otherwise rotates through static recipes
 */
export const getMealOfTheDay = async (userProfile = null) => {
  // Try AI-generated meal of the day if user profile provided
  if (userProfile) {
    try {
      const aiMeal = await getAIMealOfTheDay(userProfile);
      if (aiMeal) return aiMeal;
    } catch (error) {
      logWarning('recipeService.getMealOfTheDay', 'Failed to fetch AI meal of the day, using static recipe', { error: error.message });
    }
  }

  // Fallback to static recipe rotation
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const recipeIndex = daysSinceEpoch % BUILT_IN_RECIPES.length;
  return BUILT_IN_RECIPES[recipeIndex];
};

/**
 * Get meal for a specific date
 */
export const getMealForDate = (date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const daysSinceEpoch = Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24));
  const recipeIndex = daysSinceEpoch % BUILT_IN_RECIPES.length;
  return BUILT_IN_RECIPES[recipeIndex];
};

/**
 * Filter recipes based on user dietary preferences
 * This creates "categories" of users with similar preferences
 *
 * @param {Object} userProfile - User profile with dietary preferences
 * @returns {Array} Filtered recipes that match user preferences
 */
const filterRecipesByUserPreferences = (userProfile) => {
  if (!userProfile?.dietary) {
    return BUILT_IN_RECIPES; // No preferences, return all recipes
  }

  const { restrictions = [], allergies = [], dislikedFoods = [] } = userProfile.dietary;

  return BUILT_IN_RECIPES.filter(recipe => {
    // 1. Check dietary restrictions (vegetarian, vegan, etc.)
    if (restrictions.length > 0) {
      const hasRequiredTags = restrictions.every(restriction => {
        const restrictionLower = restriction.toLowerCase();

        // Map common restrictions to recipe tags
        if (restrictionLower.includes('vegetarian')) {
          return recipe.tags.some(tag => tag.toLowerCase().includes('vegetarian'));
        }
        if (restrictionLower.includes('vegan')) {
          return recipe.tags.some(tag => tag.toLowerCase().includes('vegan'));
        }
        if (restrictionLower.includes('gluten')) {
          return recipe.tags.some(tag => tag.toLowerCase().includes('gluten-free'));
        }
        if (restrictionLower.includes('dairy')) {
          return recipe.tags.some(tag => tag.toLowerCase().includes('dairy-free'));
        }
        if (restrictionLower.includes('low carb') || restrictionLower.includes('keto')) {
          return recipe.tags.some(tag => tag.toLowerCase().includes('low carb'));
        }

        return true; // Unknown restriction, don't filter out
      });

      if (!hasRequiredTags) return false;
    }

    // 2. Check allergies - exclude recipes with allergens
    if (allergies.length > 0) {
      const hasAllergen = allergies.some(allergen => {
        const allergenLower = allergen.toLowerCase();

        // Check in recipe name, description, and ingredients
        const recipeText = [
          recipe.name,
          recipe.description,
          ...recipe.ingredients,
          ...recipe.tags
        ].join(' ').toLowerCase();

        // Common allergen mappings
        if (allergenLower.includes('nut') || allergenLower.includes('peanut')) {
          return recipeText.includes('nut') ||
                 recipeText.includes('peanut') ||
                 recipeText.includes('almond') ||
                 recipeText.includes('cashew') ||
                 recipeText.includes('walnut');
        }
        if (allergenLower.includes('dairy') || allergenLower.includes('lactose')) {
          return recipeText.includes('cheese') ||
                 recipeText.includes('milk') ||
                 recipeText.includes('cream') ||
                 recipeText.includes('butter') ||
                 recipeText.includes('yogurt');
        }
        if (allergenLower.includes('egg')) {
          return recipeText.includes('egg');
        }
        if (allergenLower.includes('fish') || allergenLower.includes('seafood')) {
          return recipeText.includes('salmon') ||
                 recipeText.includes('tuna') ||
                 recipeText.includes('shrimp') ||
                 recipeText.includes('fish');
        }
        if (allergenLower.includes('shellfish')) {
          return recipeText.includes('shrimp') ||
                 recipeText.includes('crab') ||
                 recipeText.includes('lobster');
        }
        if (allergenLower.includes('soy')) {
          return recipeText.includes('soy') ||
                 recipeText.includes('tofu') ||
                 recipeText.includes('edamame');
        }
        if (allergenLower.includes('wheat') || allergenLower.includes('gluten')) {
          return recipeText.includes('wheat') ||
                 recipeText.includes('bread') ||
                 recipeText.includes('pasta') ||
                 recipeText.includes('flour');
        }

        // Generic allergen check
        return recipeText.includes(allergenLower);
      });

      if (hasAllergen) return false; // Exclude recipes with allergens
    }

    // 3. Check disliked foods
    if (dislikedFoods.length > 0) {
      const hasDislikedFood = dislikedFoods.some(food => {
        const foodLower = food.toLowerCase();
        const recipeText = [
          recipe.name,
          recipe.description,
          ...recipe.ingredients
        ].join(' ').toLowerCase();

        return recipeText.includes(foodLower);
      });

      if (hasDislikedFood) return false;
    }

    return true; // Recipe passes all filters
  });
};

/**
 * Get PERSONALIZED meal of the day based on user preferences
 * Users with the same preferences get the same meal recommendation
 *
 * @param {Object} userProfile - User profile with dietary preferences
 * @returns {Object} Personalized recipe recommendation for today
 *
 * Example:
 * - Vegetarian + No allergies → Category A → Recipe X
 * - Vegetarian + Nut allergy → Category B → Recipe Y
 * - No restrictions → Category C → Recipe Z
 */
export const getPersonalizedMealOfTheDay = (userProfile) => {
  // Filter recipes based on user preferences
  const compatibleRecipes = filterRecipesByUserPreferences(userProfile);

  // If no recipes match preferences, fall back to all recipes
  if (compatibleRecipes.length === 0) {
    logWarning('recipeService.getPersonalizedMealOfTheDay', 'No recipes match user preferences, showing all recipes');
    return getMealOfTheDay();
  }

  // Rotate through compatible recipes based on day
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const recipeIndex = daysSinceEpoch % compatibleRecipes.length;

  return compatibleRecipes[recipeIndex];
};

/**
 * Get personalized meal for a specific date
 *
 * @param {Object} userProfile - User profile with dietary preferences
 * @param {Date} date - Target date
 * @returns {Object} Personalized recipe for the specified date
 */
export const getPersonalizedMealForDate = (userProfile, date) => {
  const compatibleRecipes = filterRecipesByUserPreferences(userProfile);

  if (compatibleRecipes.length === 0) {
    return getMealForDate(date);
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const daysSinceEpoch = Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24));
  const recipeIndex = daysSinceEpoch % compatibleRecipes.length;

  return compatibleRecipes[recipeIndex];
};

/**
 * Get all recipes compatible with user preferences
 *
 * @param {Object} userProfile - User profile with dietary preferences
 * @returns {Array} All recipes that match user's dietary needs
 */
export const getCompatibleRecipes = (userProfile) => {
  return filterRecipesByUserPreferences(userProfile);
};

/**
 * Search recipes by name or description
 */
export const searchRecipes = async (query, userProfile = null) => {
  const allRecipes = await getAllRecipes(userProfile);
  const lowerQuery = query.toLowerCase();
  return allRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(lowerQuery) ||
    recipe.description.toLowerCase().includes(lowerQuery) ||
    (recipe.ingredients && recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery)))
  );
};

// ==================== USER CUSTOM RECIPES (FIRESTORE) ====================

/**
 * Save a user's custom recipe to Firestore
 */
export const saveUserRecipe = async (userId, recipeData) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const userRecipesRef = collection(db, 'users', userId, 'recipes');

    const recipe = {
      ...recipeData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isCustom: true
    };

    const docRef = await addDoc(userRecipesRef, recipe);

    return {
      success: true,
      data: { id: docRef.id, ...recipe }
    };
  } catch (error) {
    logError('recipeService.saveUserRecipe', error, { userId });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all user's custom recipes from Firestore
 */
export const getUserRecipes = async (userId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const userRecipesRef = collection(db, 'users', userId, 'recipes');
    const q = query(userRecipesRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const recipes = [];

    snapshot.forEach(doc => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: recipes
    };
  } catch (error) {
    logError('recipeService.getUserRecipes', error, { userId });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update a user's custom recipe
 */
export const updateUserRecipe = async (userId, recipeId, updates) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);

    await updateDoc(recipeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return {
      success: true
    };
  } catch (error) {
    logError('recipeService.updateUserRecipe', error, { userId, recipeId });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete a user's custom recipe
 */
export const deleteUserRecipe = async (userId, recipeId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
    await deleteDoc(recipeRef);

    return {
      success: true
    };
  } catch (error) {
    logError('recipeService.deleteUserRecipe', error, { userId, recipeId });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get combined recipes (AI-generated OR static built-in + user's custom)
 */
export const getAllUserAndBuiltInRecipes = async (userId, userProfile = null) => {
  try {
    const userRecipesResult = await getUserRecipes(userId);
    const userRecipes = userRecipesResult.success ? userRecipesResult.data : [];

    // Get either AI or static recipes
    const builtInRecipes = await getAllRecipes(userProfile);

    return {
      success: true,
      data: {
        builtIn: builtInRecipes,
        custom: userRecipes,
        all: [...builtInRecipes, ...userRecipes]
      }
    };
  } catch (error) {
    logError('recipeService.getAllUserRecipes', error, { userId });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Save a meal from food log as a recipe
 */
export const saveMealAsRecipe = async (userId, mealData) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const recipeData = {
      name: mealData.name || mealData.food?.name || 'Saved Meal',
      description: mealData.description || `Meal saved from ${mealData.date}`,
      image: mealData.image || null,
      mealType: mealData.mealType || 'lunch',
      source: 'analyzed',

      // Nutrition from meal
      calories: mealData.food?.nutrition?.calories || null,
      protein: mealData.food?.nutrition?.protein || null,
      carbs: mealData.food?.nutrition?.carbs || null,
      fat: mealData.food?.nutrition?.fat || null,
      fiber: mealData.food?.nutrition?.fiber || null,

      // Extract ingredients from analysis if available
      ingredients: mealData.ingredients || [],
      instructions: mealData.preparationMethod || '',
      cookTime: mealData.cookTime || '30 min',
      difficulty: 'Medium',

      tags: ['analyzed', 'favorite'],
      timesCooked: 1,
      lastCooked: mealData.date || new Date().toISOString().split('T')[0],
      rating: 0
    };

    return await saveUserRecipe(userId, recipeData);
  } catch (error) {
    logError('recipeService.saveMealAsRecipe', error, { userId });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mark recipe as cooked (increment counter and update last cooked date)
 */
export const markRecipeCooked = async (userId, recipeId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (!recipeSnap.exists()) {
      return {
        success: false,
        error: 'Recipe not found'
      };
    }

    const currentTimesCooked = recipeSnap.data().timesCooked || 0;

    await updateDoc(recipeRef, {
      timesCooked: currentTimesCooked + 1,
      lastCooked: new Date().toISOString().split('T')[0],
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Recipe marked as cooked'
    };
  } catch (error) {
    logError('recipeService.markRecipeAsCooked', error, { userId, recipeId });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update recipe rating
 */
export const rateRecipe = async (userId, recipeId, rating) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    if (rating < 0 || rating > 5) {
      return {
        success: false,
        error: 'Rating must be between 0 and 5'
      };
    }

    const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);

    await updateDoc(recipeRef, {
      rating,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Recipe rated successfully'
    };
  } catch (error) {
    logError('recipeService.rateRecipe', error, { userId, recipeId, rating });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get recipe stats
 */
export const getRecipeStats = async (userId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const recipesResult = await getUserRecipes(userId);

    if (!recipesResult.success) {
      return recipesResult;
    }

    const recipes = recipesResult.data;

    const stats = {
      totalRecipes: recipes.length,
      byMealType: {
        breakfast: recipes.filter(r => r.mealType === 'breakfast').length,
        lunch: recipes.filter(r => r.mealType === 'lunch').length,
        dinner: recipes.filter(r => r.mealType === 'dinner').length,
        snack: recipes.filter(r => r.mealType === 'snack').length
      },
      bySource: {
        manual: recipes.filter(r => r.source === 'manual').length,
        analyzed: recipes.filter(r => r.source === 'analyzed').length,
        cookbook: recipes.filter(r => r.source === 'cookbook').length,
        online: recipes.filter(r => r.source === 'online').length
      },
      mostCooked: recipes.sort((a, b) => (b.timesCooked || 0) - (a.timesCooked || 0)).slice(0, 5),
      highestRated: recipes.filter(r => r.rating > 0).sort((a, b) => b.rating - a.rating).slice(0, 5)
    };

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    logError('recipeService.getRecipeStats', error, { userId });
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  getAllRecipes,
  getRecipeById,
  getRecipesByMealType,
  getRecipesByTag,
  getMealOfTheDay,
  getMealForDate,
  getPersonalizedMealOfTheDay,
  getPersonalizedMealForDate,
  getCompatibleRecipes,
  searchRecipes,
  saveUserRecipe,
  getUserRecipes,
  updateUserRecipe,
  deleteUserRecipe,
  getAllUserAndBuiltInRecipes,
  saveMealAsRecipe,
  markRecipeCooked,
  rateRecipe,
  getRecipeStats,
  BUILT_IN_RECIPES
};
