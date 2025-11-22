import { db, isFirebaseFullyInitialized } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  ERROR_CODES,
  createErrorResponse
} from '../utils/errorCodes';

// Helper to check if Firestore is available
const checkFirestoreConfig = () => {
  if (!isFirebaseFullyInitialized || !db) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Database is not configured. Please check your Firebase setup.');
  }
  return null;
};

// 60+ built-in recipes for 2 months of daily recommendations
export const BUILT_IN_RECIPES = [
  // Week 1
  {
    id: 'recipe_001',
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
    ingredients: ['Salmon fillet', 'Quinoa', 'Broccoli', 'Lemon', 'Olive oil', 'Garlic'],
    instructions: ['Season salmon with lemon and herbs', 'Cook quinoa according to package', 'Grill salmon for 4-5 min per side', 'Steam broccoli', 'Serve together']
  },
  {
    id: 'recipe_002',
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
    ingredients: ['Chicken breast', 'Cucumber', 'Tomatoes', 'Red onion', 'Hummus', 'Feta cheese', 'Olive oil'],
    instructions: ['Marinate chicken with herbs', 'Grill chicken until cooked', 'Dice vegetables', 'Assemble bowl with hummus', 'Top with feta']
  },
  {
    id: 'recipe_003',
    name: 'Veggie Buddha Bowl',
    description: 'Colorful mix of roasted vegetables and chickpeas with tahini dressing',
    calories: 380,
    protein: 18,
    carbs: 55,
    fat: 10,
    fiber: 12,
    cookTime: '35 min',
    difficulty: 'Easy',
    image: '🥗',
    mealType: 'lunch',
    tags: ['Vegetarian', 'High Fiber', 'Vegan'],
    ingredients: ['Chickpeas', 'Sweet potato', 'Kale', 'Quinoa', 'Tahini', 'Lemon'],
    instructions: ['Roast chickpeas and sweet potato', 'Cook quinoa', 'Massage kale', 'Make tahini dressing', 'Assemble bowl']
  },
  {
    id: 'recipe_004',
    name: 'Lean Beef Stir-Fry',
    description: 'Tender beef strips with crisp vegetables in ginger sauce',
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
    ingredients: ['Beef sirloin', 'Bell peppers', 'Broccoli', 'Snap peas', 'Ginger', 'Soy sauce', 'Brown rice'],
    instructions: ['Slice beef thinly', 'Stir-fry beef until browned', 'Add vegetables', 'Add sauce', 'Serve over rice']
  },
  {
    id: 'recipe_005',
    name: 'Tofu & Vegetable Curry',
    description: 'Spiced tofu in coconut curry sauce with brown rice',
    calories: 360,
    protein: 22,
    carbs: 42,
    fat: 11,
    fiber: 7,
    cookTime: '30 min',
    difficulty: 'Medium',
    image: '🍛',
    mealType: 'dinner',
    tags: ['Vegan', 'Flavorful', 'High Fiber'],
    ingredients: ['Firm tofu', 'Coconut milk', 'Curry paste', 'Bell peppers', 'Spinach', 'Brown rice'],
    instructions: ['Press and cube tofu', 'Sauté vegetables', 'Add curry paste and coconut milk', 'Simmer with tofu', 'Serve over rice']
  },
  {
    id: 'recipe_006',
    name: 'Turkey Avocado Wrap',
    description: 'Whole grain wrap with lean turkey, avocado, and fresh veggies',
    calories: 390,
    protein: 28,
    carbs: 45,
    fat: 13,
    fiber: 8,
    cookTime: '10 min',
    difficulty: 'Easy',
    image: '🌯',
    mealType: 'lunch',
    tags: ['Quick', 'Balanced', 'High Fiber'],
    ingredients: ['Whole wheat tortilla', 'Turkey breast', 'Avocado', 'Lettuce', 'Tomato', 'Mustard'],
    instructions: ['Spread mustard on tortilla', 'Layer turkey slices', 'Add avocado and veggies', 'Roll tightly', 'Cut in half']
  },
  {
    id: 'recipe_007',
    name: 'Shrimp & Zucchini Noodles',
    description: 'Low-carb zoodles with garlic shrimp and cherry tomatoes',
    calories: 320,
    protein: 30,
    carbs: 18,
    fat: 12,
    fiber: 4,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🍤',
    mealType: 'dinner',
    tags: ['Low Carb', 'Light', 'Quick'],
    ingredients: ['Shrimp', 'Zucchini', 'Cherry tomatoes', 'Garlic', 'Olive oil', 'Basil'],
    instructions: ['Spiralize zucchini', 'Sauté garlic in olive oil', 'Cook shrimp', 'Add zoodles and tomatoes', 'Top with basil']
  },
  // Week 2
  {
    id: 'recipe_008',
    name: 'Overnight Oats with Berries',
    description: 'Creamy overnight oats with mixed berries and honey',
    calories: 350,
    protein: 12,
    carbs: 58,
    fat: 8,
    fiber: 7,
    cookTime: '5 min prep',
    difficulty: 'Easy',
    image: '🫐',
    mealType: 'breakfast',
    tags: ['Meal Prep', 'High Fiber', 'Vegetarian'],
    ingredients: ['Rolled oats', 'Almond milk', 'Greek yogurt', 'Mixed berries', 'Honey', 'Chia seeds'],
    instructions: ['Mix oats with milk and yogurt', 'Add chia seeds', 'Refrigerate overnight', 'Top with berries and honey']
  },
  {
    id: 'recipe_009',
    name: 'Egg White Veggie Omelet',
    description: 'Fluffy egg white omelet loaded with vegetables',
    calories: 220,
    protein: 24,
    carbs: 8,
    fat: 9,
    fiber: 3,
    cookTime: '12 min',
    difficulty: 'Easy',
    image: '🥚',
    mealType: 'breakfast',
    tags: ['High Protein', 'Low Carb', 'Low Calorie'],
    ingredients: ['Egg whites', 'Spinach', 'Mushrooms', 'Bell peppers', 'Feta cheese', 'Herbs'],
    instructions: ['Whisk egg whites', 'Sauté vegetables', 'Pour eggs over veggies', 'Cook until set', 'Fold and serve']
  },
  {
    id: 'recipe_010',
    name: 'Tuna Salad Lettuce Wraps',
    description: 'Light tuna salad served in crisp lettuce cups',
    calories: 280,
    protein: 32,
    carbs: 12,
    fat: 11,
    fiber: 4,
    cookTime: '10 min',
    difficulty: 'Easy',
    image: '🥬',
    mealType: 'lunch',
    tags: ['Low Carb', 'High Protein', 'Quick'],
    ingredients: ['Canned tuna', 'Greek yogurt', 'Celery', 'Red onion', 'Lettuce leaves', 'Dill'],
    instructions: ['Drain tuna', 'Mix with yogurt and veggies', 'Season with dill', 'Spoon into lettuce cups']
  },
  {
    id: 'recipe_011',
    name: 'Grilled Chicken Salad',
    description: 'Mixed greens with grilled chicken and balsamic vinaigrette',
    calories: 340,
    protein: 35,
    carbs: 18,
    fat: 14,
    fiber: 5,
    cookTime: '20 min',
    difficulty: 'Easy',
    image: '🥗',
    mealType: 'lunch',
    tags: ['High Protein', 'Low Carb', 'Fresh'],
    ingredients: ['Chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Balsamic vinegar', 'Olive oil'],
    instructions: ['Grill chicken', 'Prepare salad base', 'Slice chicken', 'Make vinaigrette', 'Assemble and dress']
  },
  {
    id: 'recipe_012',
    name: 'Baked Cod with Asparagus',
    description: 'Lemon herb baked cod with roasted asparagus',
    calories: 310,
    protein: 38,
    carbs: 12,
    fat: 10,
    fiber: 4,
    cookTime: '25 min',
    difficulty: 'Easy',
    image: '🐟',
    mealType: 'dinner',
    tags: ['Low Carb', 'High Protein', 'Heart Healthy'],
    ingredients: ['Cod fillet', 'Asparagus', 'Lemon', 'Garlic', 'Olive oil', 'Fresh herbs'],
    instructions: ['Preheat oven to 400°F', 'Season cod with lemon and herbs', 'Arrange asparagus around fish', 'Bake for 15-18 minutes']
  },
  {
    id: 'recipe_013',
    name: 'Black Bean Tacos',
    description: 'Spiced black bean tacos with fresh salsa and avocado',
    calories: 380,
    protein: 16,
    carbs: 52,
    fat: 12,
    fiber: 14,
    cookTime: '20 min',
    difficulty: 'Easy',
    image: '🌮',
    mealType: 'dinner',
    tags: ['Vegetarian', 'High Fiber', 'Flavorful'],
    ingredients: ['Black beans', 'Corn tortillas', 'Avocado', 'Tomatoes', 'Onion', 'Cilantro', 'Lime'],
    instructions: ['Season and heat black beans', 'Warm tortillas', 'Make fresh salsa', 'Assemble tacos', 'Top with avocado']
  },
  {
    id: 'recipe_014',
    name: 'Greek Yogurt Parfait',
    description: 'Layered Greek yogurt with granola and fresh fruit',
    calories: 320,
    protein: 18,
    carbs: 45,
    fat: 8,
    fiber: 4,
    cookTime: '5 min',
    difficulty: 'Easy',
    image: '🍓',
    mealType: 'breakfast',
    tags: ['Quick', 'High Protein', 'Vegetarian'],
    ingredients: ['Greek yogurt', 'Granola', 'Strawberries', 'Blueberries', 'Honey'],
    instructions: ['Layer yogurt in glass', 'Add granola', 'Add berries', 'Drizzle honey', 'Repeat layers']
  },
  // Week 3
  {
    id: 'recipe_015',
    name: 'Pesto Pasta with Chicken',
    description: 'Whole wheat pasta with basil pesto and grilled chicken',
    calories: 480,
    protein: 35,
    carbs: 52,
    fat: 16,
    fiber: 6,
    cookTime: '25 min',
    difficulty: 'Medium',
    image: '🍝',
    mealType: 'dinner',
    tags: ['Balanced', 'Flavorful', 'High Protein'],
    ingredients: ['Whole wheat pasta', 'Chicken breast', 'Basil pesto', 'Cherry tomatoes', 'Parmesan'],
    instructions: ['Cook pasta', 'Grill chicken', 'Toss pasta with pesto', 'Add sliced chicken', 'Top with parmesan']
  },
  {
    id: 'recipe_016',
    name: 'Banana Protein Pancakes',
    description: 'Fluffy pancakes made with banana and protein powder',
    calories: 380,
    protein: 28,
    carbs: 48,
    fat: 8,
    fiber: 4,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🥞',
    mealType: 'breakfast',
    tags: ['High Protein', 'Post-Workout', 'Vegetarian'],
    ingredients: ['Banana', 'Oats', 'Protein powder', 'Egg whites', 'Cinnamon', 'Maple syrup'],
    instructions: ['Blend banana, oats, protein powder', 'Add egg whites', 'Cook pancakes', 'Top with maple syrup']
  },
  {
    id: 'recipe_017',
    name: 'Asian Chicken Lettuce Cups',
    description: 'Savory ground chicken in crispy lettuce cups',
    calories: 290,
    protein: 28,
    carbs: 16,
    fat: 12,
    fiber: 3,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🥬',
    mealType: 'dinner',
    tags: ['Low Carb', 'High Protein', 'Quick'],
    ingredients: ['Ground chicken', 'Water chestnuts', 'Soy sauce', 'Ginger', 'Garlic', 'Butter lettuce'],
    instructions: ['Brown ground chicken', 'Add water chestnuts and seasonings', 'Cook until glazed', 'Serve in lettuce cups']
  },
  {
    id: 'recipe_018',
    name: 'Lentil Soup',
    description: 'Hearty lentil soup with vegetables and herbs',
    calories: 340,
    protein: 20,
    carbs: 52,
    fat: 6,
    fiber: 16,
    cookTime: '40 min',
    difficulty: 'Easy',
    image: '🥣',
    mealType: 'lunch',
    tags: ['Vegan', 'High Fiber', 'Budget Friendly'],
    ingredients: ['Green lentils', 'Carrots', 'Celery', 'Onion', 'Tomatoes', 'Vegetable broth', 'Cumin'],
    instructions: ['Sauté vegetables', 'Add lentils and broth', 'Simmer until lentils tender', 'Season with cumin', 'Serve hot']
  },
  {
    id: 'recipe_019',
    name: 'Turkey Burger with Sweet Potato',
    description: 'Lean turkey burger with baked sweet potato fries',
    calories: 440,
    protein: 34,
    carbs: 48,
    fat: 12,
    fiber: 7,
    cookTime: '35 min',
    difficulty: 'Medium',
    image: '🍔',
    mealType: 'dinner',
    tags: ['High Protein', 'Balanced', 'Family Friendly'],
    ingredients: ['Ground turkey', 'Whole wheat bun', 'Sweet potato', 'Lettuce', 'Tomato', 'Onion'],
    instructions: ['Form turkey patties', 'Cut and bake sweet potato fries', 'Grill burgers', 'Assemble with toppings']
  },
  {
    id: 'recipe_020',
    name: 'Caprese Salad with Burrata',
    description: 'Fresh tomatoes with creamy burrata and basil',
    calories: 280,
    protein: 14,
    carbs: 12,
    fat: 20,
    fiber: 2,
    cookTime: '10 min',
    difficulty: 'Easy',
    image: '🍅',
    mealType: 'lunch',
    tags: ['Vegetarian', 'Fresh', 'Quick'],
    ingredients: ['Burrata cheese', 'Heirloom tomatoes', 'Fresh basil', 'Balsamic glaze', 'Olive oil', 'Salt'],
    instructions: ['Slice tomatoes', 'Arrange with burrata', 'Add fresh basil', 'Drizzle with oil and balsamic']
  },
  {
    id: 'recipe_021',
    name: 'Spinach Mushroom Frittata',
    description: 'Baked egg frittata with spinach and mushrooms',
    calories: 260,
    protein: 22,
    carbs: 8,
    fat: 16,
    fiber: 2,
    cookTime: '25 min',
    difficulty: 'Easy',
    image: '🍳',
    mealType: 'breakfast',
    tags: ['High Protein', 'Low Carb', 'Vegetarian'],
    ingredients: ['Eggs', 'Spinach', 'Mushrooms', 'Goat cheese', 'Onion', 'Herbs'],
    instructions: ['Sauté mushrooms and spinach', 'Pour whisked eggs over', 'Add cheese', 'Bake until set', 'Slice and serve']
  },
  // Week 4
  {
    id: 'recipe_022',
    name: 'Teriyaki Salmon Bowl',
    description: 'Glazed teriyaki salmon over brown rice with edamame',
    calories: 480,
    protein: 38,
    carbs: 48,
    fat: 14,
    fiber: 6,
    cookTime: '30 min',
    difficulty: 'Medium',
    image: '🍱',
    mealType: 'dinner',
    tags: ['High Protein', 'Asian Inspired', 'Balanced'],
    ingredients: ['Salmon fillet', 'Brown rice', 'Edamame', 'Teriyaki sauce', 'Sesame seeds', 'Green onions'],
    instructions: ['Cook brown rice', 'Glaze salmon with teriyaki', 'Bake or pan-sear salmon', 'Arrange bowl', 'Garnish with sesame and onions']
  },
  {
    id: 'recipe_023',
    name: 'Avocado Toast with Eggs',
    description: 'Whole grain toast with smashed avocado and poached eggs',
    calories: 380,
    protein: 18,
    carbs: 32,
    fat: 22,
    fiber: 8,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🥑',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Quick', 'High Fiber'],
    ingredients: ['Whole grain bread', 'Avocado', 'Eggs', 'Cherry tomatoes', 'Red pepper flakes', 'Lemon'],
    instructions: ['Toast bread', 'Mash avocado with lemon', 'Poach eggs', 'Spread avocado on toast', 'Top with egg and tomatoes']
  },
  {
    id: 'recipe_024',
    name: 'Quinoa Stuffed Peppers',
    description: 'Bell peppers stuffed with quinoa, beans, and cheese',
    calories: 360,
    protein: 16,
    carbs: 48,
    fat: 12,
    fiber: 10,
    cookTime: '45 min',
    difficulty: 'Medium',
    image: '🫑',
    mealType: 'dinner',
    tags: ['Vegetarian', 'High Fiber', 'Meal Prep'],
    ingredients: ['Bell peppers', 'Quinoa', 'Black beans', 'Corn', 'Tomato sauce', 'Cheese', 'Cumin'],
    instructions: ['Cook quinoa', 'Mix with beans, corn, spices', 'Hollow peppers', 'Fill with mixture', 'Bake with cheese on top']
  },
  {
    id: 'recipe_025',
    name: 'Chicken Caesar Wrap',
    description: 'Grilled chicken Caesar salad in a whole wheat wrap',
    calories: 410,
    protein: 32,
    carbs: 38,
    fat: 16,
    fiber: 4,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🌯',
    mealType: 'lunch',
    tags: ['High Protein', 'Quick', 'Balanced'],
    ingredients: ['Chicken breast', 'Romaine lettuce', 'Parmesan', 'Caesar dressing', 'Whole wheat wrap'],
    instructions: ['Grill and slice chicken', 'Chop romaine', 'Toss with dressing', 'Add to wrap with parmesan', 'Roll and serve']
  },
  {
    id: 'recipe_026',
    name: 'Thai Peanut Noodles',
    description: 'Rice noodles with vegetables in creamy peanut sauce',
    calories: 420,
    protein: 16,
    carbs: 54,
    fat: 18,
    fiber: 4,
    cookTime: '20 min',
    difficulty: 'Easy',
    image: '🍜',
    mealType: 'dinner',
    tags: ['Vegan', 'Asian Inspired', 'Flavorful'],
    ingredients: ['Rice noodles', 'Peanut butter', 'Soy sauce', 'Carrots', 'Cabbage', 'Green onions', 'Lime'],
    instructions: ['Cook noodles', 'Make peanut sauce', 'Julienne vegetables', 'Toss noodles with sauce and veggies', 'Garnish with lime']
  },
  {
    id: 'recipe_027',
    name: 'Cottage Cheese Bowl',
    description: 'High-protein cottage cheese with pineapple and almonds',
    calories: 280,
    protein: 24,
    carbs: 28,
    fat: 8,
    fiber: 3,
    cookTime: '5 min',
    difficulty: 'Easy',
    image: '🍍',
    mealType: 'breakfast',
    tags: ['High Protein', 'Quick', 'Low Fat'],
    ingredients: ['Cottage cheese', 'Pineapple chunks', 'Sliced almonds', 'Honey', 'Cinnamon'],
    instructions: ['Place cottage cheese in bowl', 'Top with pineapple', 'Add almonds', 'Drizzle honey', 'Sprinkle cinnamon']
  },
  {
    id: 'recipe_028',
    name: 'Moroccan Chickpea Stew',
    description: 'Spiced chickpea stew with sweet potato and spinach',
    calories: 380,
    protein: 14,
    carbs: 58,
    fat: 10,
    fiber: 14,
    cookTime: '35 min',
    difficulty: 'Medium',
    image: '🥘',
    mealType: 'dinner',
    tags: ['Vegan', 'High Fiber', 'Flavorful'],
    ingredients: ['Chickpeas', 'Sweet potato', 'Spinach', 'Tomatoes', 'Cumin', 'Cinnamon', 'Ginger'],
    instructions: ['Sauté onions with spices', 'Add diced sweet potato', 'Add chickpeas and tomatoes', 'Simmer until tender', 'Stir in spinach']
  },
  // Week 5
  {
    id: 'recipe_029',
    name: 'Smoked Salmon Bagel',
    description: 'Whole grain bagel with cream cheese and smoked salmon',
    calories: 420,
    protein: 26,
    carbs: 42,
    fat: 16,
    fiber: 4,
    cookTime: '10 min',
    difficulty: 'Easy',
    image: '🥯',
    mealType: 'breakfast',
    tags: ['High Protein', 'Omega-3', 'Quick'],
    ingredients: ['Whole grain bagel', 'Cream cheese', 'Smoked salmon', 'Capers', 'Red onion', 'Dill'],
    instructions: ['Toast bagel', 'Spread cream cheese', 'Layer smoked salmon', 'Top with capers, onion, dill']
  },
  {
    id: 'recipe_030',
    name: 'Miso Soup with Tofu',
    description: 'Traditional miso soup with tofu, wakame, and green onions',
    calories: 120,
    protein: 10,
    carbs: 8,
    fat: 5,
    fiber: 2,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🥣',
    mealType: 'lunch',
    tags: ['Vegan', 'Low Calorie', 'Light'],
    ingredients: ['Miso paste', 'Silken tofu', 'Wakame seaweed', 'Green onions', 'Dashi stock'],
    instructions: ['Heat dashi stock', 'Add wakame to rehydrate', 'Cube tofu and add', 'Dissolve miso paste', 'Garnish with green onions']
  },
  {
    id: 'recipe_031',
    name: 'BBQ Chicken Pizza',
    description: 'Whole wheat pizza with BBQ chicken and red onion',
    calories: 380,
    protein: 28,
    carbs: 42,
    fat: 12,
    fiber: 4,
    cookTime: '25 min',
    difficulty: 'Medium',
    image: '🍕',
    mealType: 'dinner',
    tags: ['High Protein', 'Family Friendly', 'Balanced'],
    ingredients: ['Whole wheat pizza dough', 'BBQ sauce', 'Chicken breast', 'Red onion', 'Mozzarella', 'Cilantro'],
    instructions: ['Roll out dough', 'Spread BBQ sauce', 'Add cooked chicken and onion', 'Top with cheese', 'Bake and add cilantro']
  },
  {
    id: 'recipe_032',
    name: 'Kale and White Bean Soup',
    description: 'Hearty Italian-style soup with kale and cannellini beans',
    calories: 320,
    protein: 16,
    carbs: 48,
    fat: 8,
    fiber: 12,
    cookTime: '30 min',
    difficulty: 'Easy',
    image: '🥬',
    mealType: 'lunch',
    tags: ['Vegan', 'High Fiber', 'Comfort Food'],
    ingredients: ['Kale', 'Cannellini beans', 'Carrots', 'Celery', 'Onion', 'Garlic', 'Vegetable broth'],
    instructions: ['Sauté aromatics', 'Add broth and beans', 'Simmer 15 minutes', 'Add chopped kale', 'Cook until wilted']
  },
  {
    id: 'recipe_033',
    name: 'Shrimp Fried Rice',
    description: 'Healthy shrimp fried rice with vegetables and egg',
    calories: 410,
    protein: 28,
    carbs: 48,
    fat: 12,
    fiber: 4,
    cookTime: '20 min',
    difficulty: 'Medium',
    image: '🍚',
    mealType: 'dinner',
    tags: ['High Protein', 'Asian Inspired', 'Quick'],
    ingredients: ['Brown rice', 'Shrimp', 'Eggs', 'Peas', 'Carrots', 'Soy sauce', 'Sesame oil'],
    instructions: ['Cook and cool rice', 'Scramble eggs', 'Stir-fry shrimp and veggies', 'Add rice and sauce', 'Mix in eggs']
  },
  {
    id: 'recipe_034',
    name: 'Greek Salad with Grilled Halloumi',
    description: 'Classic Greek salad topped with grilled halloumi cheese',
    calories: 360,
    protein: 18,
    carbs: 16,
    fat: 26,
    fiber: 4,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🥗',
    mealType: 'lunch',
    tags: ['Vegetarian', 'Mediterranean', 'Fresh'],
    ingredients: ['Halloumi cheese', 'Cucumber', 'Tomatoes', 'Olives', 'Red onion', 'Oregano', 'Olive oil'],
    instructions: ['Grill halloumi slices', 'Chop vegetables', 'Combine in bowl', 'Top with halloumi', 'Dress with oil and oregano']
  },
  {
    id: 'recipe_035',
    name: 'Apple Cinnamon Oatmeal',
    description: 'Warm oatmeal with fresh apples, walnuts, and cinnamon',
    calories: 340,
    protein: 10,
    carbs: 56,
    fat: 10,
    fiber: 8,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🍎',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'High Fiber', 'Comfort Food'],
    ingredients: ['Rolled oats', 'Apple', 'Walnuts', 'Cinnamon', 'Maple syrup', 'Almond milk'],
    instructions: ['Cook oats in almond milk', 'Dice apple', 'Stir in apple and cinnamon', 'Top with walnuts', 'Drizzle maple syrup']
  },
  // Week 6
  {
    id: 'recipe_036',
    name: 'Chicken Tikka Masala',
    description: 'Tender chicken in creamy tomato curry sauce with rice',
    calories: 460,
    protein: 36,
    carbs: 42,
    fat: 16,
    fiber: 4,
    cookTime: '40 min',
    difficulty: 'Medium',
    image: '🍛',
    mealType: 'dinner',
    tags: ['High Protein', 'Indian Inspired', 'Flavorful'],
    ingredients: ['Chicken thighs', 'Yogurt', 'Tomato sauce', 'Garam masala', 'Cream', 'Basmati rice', 'Ginger'],
    instructions: ['Marinate chicken in yogurt and spices', 'Grill or bake chicken', 'Make sauce with tomatoes and cream', 'Add chicken to sauce', 'Serve over rice']
  },
  {
    id: 'recipe_037',
    name: 'Berry Smoothie Bowl',
    description: 'Thick berry smoothie bowl with granola and seeds',
    calories: 380,
    protein: 16,
    carbs: 58,
    fat: 10,
    fiber: 8,
    cookTime: '10 min',
    difficulty: 'Easy',
    image: '🫐',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'High Fiber', 'Fresh'],
    ingredients: ['Mixed berries', 'Banana', 'Greek yogurt', 'Granola', 'Chia seeds', 'Honey'],
    instructions: ['Blend berries, banana, yogurt', 'Pour into bowl', 'Top with granola', 'Add chia seeds', 'Drizzle honey']
  },
  {
    id: 'recipe_038',
    name: 'Fish Tacos',
    description: 'Grilled fish tacos with cabbage slaw and lime crema',
    calories: 380,
    protein: 28,
    carbs: 38,
    fat: 14,
    fiber: 4,
    cookTime: '25 min',
    difficulty: 'Medium',
    image: '🌮',
    mealType: 'dinner',
    tags: ['High Protein', 'Fresh', 'Flavorful'],
    ingredients: ['White fish', 'Corn tortillas', 'Cabbage', 'Greek yogurt', 'Lime', 'Cilantro', 'Chipotle'],
    instructions: ['Season and grill fish', 'Make cabbage slaw', 'Make lime crema', 'Warm tortillas', 'Assemble tacos']
  },
  {
    id: 'recipe_039',
    name: 'Vegetable Minestrone',
    description: 'Classic Italian vegetable soup with pasta and beans',
    calories: 320,
    protein: 14,
    carbs: 52,
    fat: 6,
    fiber: 10,
    cookTime: '35 min',
    difficulty: 'Easy',
    image: '🥣',
    mealType: 'lunch',
    tags: ['Vegetarian', 'High Fiber', 'Comfort Food'],
    ingredients: ['Zucchini', 'Carrots', 'Celery', 'Kidney beans', 'Small pasta', 'Tomatoes', 'Basil'],
    instructions: ['Sauté vegetables', 'Add broth and tomatoes', 'Add beans and pasta', 'Simmer until pasta cooked', 'Top with fresh basil']
  },
  {
    id: 'recipe_040',
    name: 'Steak with Roasted Vegetables',
    description: 'Lean sirloin steak with colorful roasted vegetables',
    calories: 440,
    protein: 38,
    carbs: 24,
    fat: 20,
    fiber: 6,
    cookTime: '35 min',
    difficulty: 'Medium',
    image: '🥩',
    mealType: 'dinner',
    tags: ['High Protein', 'Iron Rich', 'Paleo'],
    ingredients: ['Sirloin steak', 'Brussels sprouts', 'Carrots', 'Red onion', 'Rosemary', 'Olive oil'],
    instructions: ['Roast vegetables at 425°F', 'Season steak', 'Pan-sear to desired doneness', 'Rest before slicing', 'Serve with vegetables']
  },
  {
    id: 'recipe_041',
    name: 'Breakfast Burrito',
    description: 'Scrambled eggs with black beans, salsa, and cheese',
    calories: 420,
    protein: 24,
    carbs: 42,
    fat: 18,
    fiber: 8,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🌯',
    mealType: 'breakfast',
    tags: ['High Protein', 'High Fiber', 'Flavorful'],
    ingredients: ['Eggs', 'Black beans', 'Whole wheat tortilla', 'Salsa', 'Cheese', 'Avocado'],
    instructions: ['Scramble eggs', 'Warm beans', 'Warm tortilla', 'Layer ingredients', 'Roll and enjoy']
  },
  {
    id: 'recipe_042',
    name: 'Cauliflower Fried Rice',
    description: 'Low-carb fried rice using cauliflower rice',
    calories: 280,
    protein: 18,
    carbs: 18,
    fat: 14,
    fiber: 6,
    cookTime: '20 min',
    difficulty: 'Easy',
    image: '🥦',
    mealType: 'dinner',
    tags: ['Low Carb', 'Keto', 'High Fiber'],
    ingredients: ['Cauliflower rice', 'Eggs', 'Peas', 'Carrots', 'Soy sauce', 'Sesame oil', 'Green onions'],
    instructions: ['Scramble eggs', 'Stir-fry vegetables', 'Add cauliflower rice', 'Season with soy sauce', 'Mix in eggs']
  },
  // Week 7
  {
    id: 'recipe_043',
    name: 'Honey Garlic Chicken',
    description: 'Sweet and savory honey garlic chicken thighs with broccoli',
    calories: 420,
    protein: 35,
    carbs: 32,
    fat: 16,
    fiber: 4,
    cookTime: '30 min',
    difficulty: 'Easy',
    image: '🍯',
    mealType: 'dinner',
    tags: ['High Protein', 'Sweet', 'Family Friendly'],
    ingredients: ['Chicken thighs', 'Honey', 'Garlic', 'Soy sauce', 'Broccoli', 'Brown rice'],
    instructions: ['Make honey garlic sauce', 'Brown chicken', 'Simmer in sauce', 'Steam broccoli', 'Serve over rice']
  },
  {
    id: 'recipe_044',
    name: 'Shakshuka',
    description: 'Eggs poached in spiced tomato sauce with feta',
    calories: 320,
    protein: 18,
    carbs: 24,
    fat: 18,
    fiber: 4,
    cookTime: '25 min',
    difficulty: 'Medium',
    image: '🍳',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Middle Eastern', 'Flavorful'],
    ingredients: ['Eggs', 'Tomatoes', 'Bell peppers', 'Onion', 'Cumin', 'Feta cheese', 'Bread'],
    instructions: ['Sauté peppers and onions', 'Add tomatoes and spices', 'Create wells and add eggs', 'Cover and cook', 'Top with feta']
  },
  {
    id: 'recipe_045',
    name: 'Poke Bowl',
    description: 'Hawaiian-style bowl with raw tuna, rice, and vegetables',
    calories: 460,
    protein: 32,
    carbs: 52,
    fat: 14,
    fiber: 4,
    cookTime: '20 min',
    difficulty: 'Medium',
    image: '🍱',
    mealType: 'lunch',
    tags: ['High Protein', 'Fresh', 'Asian Inspired'],
    ingredients: ['Sushi-grade tuna', 'Sushi rice', 'Cucumber', 'Edamame', 'Avocado', 'Soy sauce', 'Sesame'],
    instructions: ['Cook sushi rice', 'Cube tuna', 'Marinate tuna in soy sauce', 'Arrange bowl', 'Top with vegetables and sesame']
  },
  {
    id: 'recipe_046',
    name: 'Chicken and Vegetable Stir-Fry',
    description: 'Quick chicken stir-fry with colorful vegetables',
    calories: 380,
    protein: 34,
    carbs: 28,
    fat: 14,
    fiber: 5,
    cookTime: '20 min',
    difficulty: 'Easy',
    image: '🥡',
    mealType: 'dinner',
    tags: ['High Protein', 'Quick', 'Balanced'],
    ingredients: ['Chicken breast', 'Bell peppers', 'Snow peas', 'Carrots', 'Garlic', 'Ginger', 'Oyster sauce'],
    instructions: ['Slice chicken and vegetables', 'Stir-fry chicken', 'Add vegetables', 'Add sauce', 'Serve hot']
  },
  {
    id: 'recipe_047',
    name: 'Chia Pudding',
    description: 'Creamy chia pudding with mango and coconut',
    calories: 320,
    protein: 10,
    carbs: 38,
    fat: 14,
    fiber: 10,
    cookTime: '5 min + overnight',
    difficulty: 'Easy',
    image: '🥭',
    mealType: 'breakfast',
    tags: ['Vegan', 'High Fiber', 'Meal Prep'],
    ingredients: ['Chia seeds', 'Coconut milk', 'Mango', 'Shredded coconut', 'Maple syrup'],
    instructions: ['Mix chia seeds with coconut milk', 'Add maple syrup', 'Refrigerate overnight', 'Top with mango and coconut']
  },
  {
    id: 'recipe_048',
    name: 'Eggplant Parmesan',
    description: 'Baked eggplant with marinara and melted mozzarella',
    calories: 380,
    protein: 18,
    carbs: 32,
    fat: 20,
    fiber: 8,
    cookTime: '45 min',
    difficulty: 'Medium',
    image: '🍆',
    mealType: 'dinner',
    tags: ['Vegetarian', 'Italian', 'Comfort Food'],
    ingredients: ['Eggplant', 'Marinara sauce', 'Mozzarella', 'Parmesan', 'Breadcrumbs', 'Basil'],
    instructions: ['Slice and salt eggplant', 'Bread and bake slices', 'Layer with sauce and cheese', 'Bake until bubbly', 'Top with basil']
  },
  {
    id: 'recipe_049',
    name: 'Chicken Noodle Soup',
    description: 'Classic homemade chicken noodle soup',
    calories: 320,
    protein: 28,
    carbs: 36,
    fat: 8,
    fiber: 3,
    cookTime: '40 min',
    difficulty: 'Easy',
    image: '🍜',
    mealType: 'lunch',
    tags: ['High Protein', 'Comfort Food', 'Healing'],
    ingredients: ['Chicken breast', 'Egg noodles', 'Carrots', 'Celery', 'Onion', 'Chicken broth', 'Thyme'],
    instructions: ['Simmer chicken in broth', 'Add vegetables', 'Shred chicken', 'Add noodles', 'Season and serve']
  },
  // Week 8
  {
    id: 'recipe_050',
    name: 'Veggie Quesadillas',
    description: 'Cheesy quesadillas filled with peppers and onions',
    calories: 380,
    protein: 16,
    carbs: 42,
    fat: 16,
    fiber: 6,
    cookTime: '15 min',
    difficulty: 'Easy',
    image: '🧀',
    mealType: 'lunch',
    tags: ['Vegetarian', 'Quick', 'Family Friendly'],
    ingredients: ['Whole wheat tortillas', 'Cheddar cheese', 'Bell peppers', 'Onion', 'Black beans', 'Salsa'],
    instructions: ['Sauté peppers and onions', 'Add beans', 'Fill tortilla with veggies and cheese', 'Cook until crispy', 'Serve with salsa']
  },
  {
    id: 'recipe_051',
    name: 'Salmon Cakes',
    description: 'Crispy salmon cakes with lemon dill sauce',
    calories: 340,
    protein: 28,
    carbs: 18,
    fat: 18,
    fiber: 2,
    cookTime: '25 min',
    difficulty: 'Medium',
    image: '🐟',
    mealType: 'dinner',
    tags: ['High Protein', 'Omega-3', 'Elegant'],
    ingredients: ['Canned salmon', 'Breadcrumbs', 'Egg', 'Green onions', 'Greek yogurt', 'Dill', 'Lemon'],
    instructions: ['Mix salmon with breadcrumbs and egg', 'Form into patties', 'Pan-fry until golden', 'Make lemon dill sauce', 'Serve together']
  },
  {
    id: 'recipe_052',
    name: 'Acai Bowl',
    description: 'Thick acai smoothie bowl with tropical toppings',
    calories: 380,
    protein: 8,
    carbs: 68,
    fat: 10,
    fiber: 8,
    cookTime: '10 min',
    difficulty: 'Easy',
    image: '🍇',
    mealType: 'breakfast',
    tags: ['Vegan', 'Antioxidants', 'Fresh'],
    ingredients: ['Acai puree', 'Banana', 'Berries', 'Granola', 'Coconut flakes', 'Honey'],
    instructions: ['Blend acai with banana', 'Pour into bowl', 'Top with berries and granola', 'Add coconut', 'Drizzle honey']
  },
  {
    id: 'recipe_053',
    name: 'Beef and Broccoli',
    description: 'Classic Chinese beef and broccoli over rice',
    calories: 420,
    protein: 32,
    carbs: 40,
    fat: 14,
    fiber: 4,
    cookTime: '25 min',
    difficulty: 'Medium',
    image: '🥦',
    mealType: 'dinner',
    tags: ['High Protein', 'Asian Inspired', 'Family Friendly'],
    ingredients: ['Flank steak', 'Broccoli', 'Soy sauce', 'Oyster sauce', 'Garlic', 'Ginger', 'Brown rice'],
    instructions: ['Slice beef thinly', 'Make sauce', 'Stir-fry beef', 'Add broccoli and sauce', 'Serve over rice']
  },
  {
    id: 'recipe_054',
    name: 'Spinach Artichoke Stuffed Chicken',
    description: 'Chicken breast stuffed with creamy spinach artichoke filling',
    calories: 380,
    protein: 42,
    carbs: 8,
    fat: 18,
    fiber: 2,
    cookTime: '35 min',
    difficulty: 'Medium',
    image: '🍗',
    mealType: 'dinner',
    tags: ['High Protein', 'Low Carb', 'Elegant'],
    ingredients: ['Chicken breast', 'Spinach', 'Artichoke hearts', 'Cream cheese', 'Parmesan', 'Garlic'],
    instructions: ['Make spinach artichoke filling', 'Cut pocket in chicken', 'Stuff chicken', 'Bake until cooked through', 'Rest and serve']
  },
  {
    id: 'recipe_055',
    name: 'Hummus Veggie Wrap',
    description: 'Whole wheat wrap with hummus and crunchy vegetables',
    calories: 340,
    protein: 12,
    carbs: 48,
    fat: 12,
    fiber: 10,
    cookTime: '10 min',
    difficulty: 'Easy',
    image: '🥙',
    mealType: 'lunch',
    tags: ['Vegan', 'High Fiber', 'Quick'],
    ingredients: ['Whole wheat wrap', 'Hummus', 'Cucumber', 'Carrots', 'Bell peppers', 'Spinach', 'Sprouts'],
    instructions: ['Spread hummus on wrap', 'Layer vegetables', 'Add sprouts', 'Roll tightly', 'Cut in half']
  },
  {
    id: 'recipe_056',
    name: 'Protein Waffles',
    description: 'High-protein waffles with Greek yogurt and berries',
    calories: 380,
    protein: 26,
    carbs: 42,
    fat: 12,
    fiber: 4,
    cookTime: '20 min',
    difficulty: 'Easy',
    image: '🧇',
    mealType: 'breakfast',
    tags: ['High Protein', 'Post-Workout', 'Vegetarian'],
    ingredients: ['Protein powder', 'Oats', 'Egg whites', 'Greek yogurt', 'Baking powder', 'Berries'],
    instructions: ['Blend oats into flour', 'Mix with protein powder and egg whites', 'Cook in waffle iron', 'Top with yogurt and berries']
  },
  {
    id: 'recipe_057',
    name: 'Stuffed Sweet Potato',
    description: 'Baked sweet potato with black beans and toppings',
    calories: 380,
    protein: 14,
    carbs: 62,
    fat: 8,
    fiber: 12,
    cookTime: '50 min',
    difficulty: 'Easy',
    image: '🍠',
    mealType: 'dinner',
    tags: ['Vegan', 'High Fiber', 'Budget Friendly'],
    ingredients: ['Sweet potato', 'Black beans', 'Corn', 'Greek yogurt', 'Cilantro', 'Lime', 'Cumin'],
    instructions: ['Bake sweet potato', 'Season black beans with cumin', 'Split potato', 'Fill with beans and corn', 'Top with yogurt and cilantro']
  },
  {
    id: 'recipe_058',
    name: 'Chicken Fajitas',
    description: 'Sizzling chicken fajitas with peppers and onions',
    calories: 420,
    protein: 36,
    carbs: 32,
    fat: 16,
    fiber: 4,
    cookTime: '25 min',
    difficulty: 'Easy',
    image: '🫑',
    mealType: 'dinner',
    tags: ['High Protein', 'Flavorful', 'Family Friendly'],
    ingredients: ['Chicken breast', 'Bell peppers', 'Onion', 'Fajita seasoning', 'Whole wheat tortillas', 'Salsa', 'Guacamole'],
    instructions: ['Slice chicken and vegetables', 'Season with fajita spices', 'Cook in hot skillet', 'Warm tortillas', 'Serve with toppings']
  },
  {
    id: 'recipe_059',
    name: 'Peanut Butter Banana Smoothie',
    description: 'Creamy smoothie with peanut butter, banana, and oats',
    calories: 380,
    protein: 18,
    carbs: 48,
    fat: 14,
    fiber: 6,
    cookTime: '5 min',
    difficulty: 'Easy',
    image: '🍌',
    mealType: 'breakfast',
    tags: ['High Protein', 'Quick', 'Post-Workout'],
    ingredients: ['Banana', 'Peanut butter', 'Oats', 'Milk', 'Honey', 'Cinnamon'],
    instructions: ['Add all ingredients to blender', 'Blend until smooth', 'Pour and enjoy']
  },
  {
    id: 'recipe_060',
    name: 'Lamb Kofta with Tzatziki',
    description: 'Spiced lamb kofta with cool cucumber tzatziki',
    calories: 440,
    protein: 32,
    carbs: 28,
    fat: 22,
    fiber: 3,
    cookTime: '30 min',
    difficulty: 'Medium',
    image: '🥙',
    mealType: 'dinner',
    tags: ['High Protein', 'Middle Eastern', 'Flavorful'],
    ingredients: ['Ground lamb', 'Cumin', 'Coriander', 'Greek yogurt', 'Cucumber', 'Dill', 'Pita bread'],
    instructions: ['Mix lamb with spices', 'Form into kofta', 'Grill kofta', 'Make tzatziki sauce', 'Serve with pita']
  },
  // Extra recipes for variety
  {
    id: 'recipe_061',
    name: 'Cobb Salad',
    description: 'Classic Cobb salad with chicken, bacon, and blue cheese',
    calories: 420,
    protein: 36,
    carbs: 12,
    fat: 26,
    fiber: 4,
    cookTime: '20 min',
    difficulty: 'Easy',
    image: '🥗',
    mealType: 'lunch',
    tags: ['High Protein', 'Low Carb', 'Classic'],
    ingredients: ['Chicken breast', 'Bacon', 'Eggs', 'Avocado', 'Blue cheese', 'Tomatoes', 'Romaine'],
    instructions: ['Grill chicken', 'Cook bacon and eggs', 'Chop all ingredients', 'Arrange in rows on greens', 'Drizzle dressing']
  },
  {
    id: 'recipe_062',
    name: 'Ratatouille',
    description: 'French vegetable stew with herbs de Provence',
    calories: 280,
    protein: 6,
    carbs: 32,
    fat: 14,
    fiber: 8,
    cookTime: '45 min',
    difficulty: 'Medium',
    image: '🍆',
    mealType: 'dinner',
    tags: ['Vegan', 'High Fiber', 'French'],
    ingredients: ['Eggplant', 'Zucchini', 'Bell peppers', 'Tomatoes', 'Onion', 'Herbs de Provence', 'Olive oil'],
    instructions: ['Slice all vegetables', 'Layer in baking dish', 'Drizzle with oil and herbs', 'Bake until tender', 'Serve warm']
  }
];

// Recipe service functions

/**
 * Get all built-in recipes
 */
export const getAllRecipes = () => {
  return BUILT_IN_RECIPES;
};

/**
 * Get recipe by ID
 */
export const getRecipeById = (recipeId) => {
  return BUILT_IN_RECIPES.find(recipe => recipe.id === recipeId) || null;
};

/**
 * Get recipes by meal type
 */
export const getRecipesByMealType = (mealType) => {
  return BUILT_IN_RECIPES.filter(recipe => recipe.mealType === mealType);
};

/**
 * Get recipes by tag
 */
export const getRecipesByTag = (tag) => {
  return BUILT_IN_RECIPES.filter(recipe =>
    recipe.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
};

/**
 * Get meal of the day - rotates through all recipes
 */
export const getMealOfTheDay = () => {
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
 * Search recipes by name or description
 */
export const searchRecipes = (query) => {
  const lowerQuery = query.toLowerCase();
  return BUILT_IN_RECIPES.filter(recipe =>
    recipe.name.toLowerCase().includes(lowerQuery) ||
    recipe.description.toLowerCase().includes(lowerQuery) ||
    recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery))
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
    console.error('Error saving user recipe:', error);
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
    console.error('Error fetching user recipes:', error);
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
    console.error('Error updating user recipe:', error);
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
    console.error('Error deleting user recipe:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get combined recipes (built-in + user's custom)
 */
export const getAllUserAndBuiltInRecipes = async (userId) => {
  try {
    const userRecipesResult = await getUserRecipes(userId);
    const userRecipes = userRecipesResult.success ? userRecipesResult.data : [];

    return {
      success: true,
      data: {
        builtIn: BUILT_IN_RECIPES,
        custom: userRecipes,
        all: [...BUILT_IN_RECIPES, ...userRecipes]
      }
    };
  } catch (error) {
    console.error('Error fetching all recipes:', error);
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
  searchRecipes,
  saveUserRecipe,
  getUserRecipes,
  updateUserRecipe,
  deleteUserRecipe,
  getAllUserAndBuiltInRecipes,
  BUILT_IN_RECIPES
};
