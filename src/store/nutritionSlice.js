import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  todayMeals: [],
  goals: {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fats: 70,
    fiber: 30,
    water: 8,
  },
  currentIntake: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    water: 0,
  },
  streak: 0,
  favourites: [],
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    addMeal: (state, action) => {
      state.todayMeals.push(action.payload);
      const meal = action.payload;
      state.currentIntake.calories += meal.calories || 0;
      state.currentIntake.protein += meal.protein || 0;
      state.currentIntake.carbs += meal.carbs || 0;
      state.currentIntake.fats += meal.fats || 0;
    },
    updateGoals: (state, action) => {
      state.goals = { ...state.goals, ...action.payload };
    },
    resetDaily: (state) => {
      state.todayMeals = [];
      state.currentIntake = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        water: 0,
      };
    },
    addFavourite: (state, action) => {
      state.favourites.push(action.payload);
    },
    removeFavourite: (state, action) => {
      state.favourites = state.favourites.filter(fav => fav.id !== action.payload);
    },
    updateStreak: (state, action) => {
      state.streak = action.payload;
    },
  },
});

export const { 
  addMeal, 
  updateGoals, 
  resetDaily, 
  addFavourite, 
  removeFavourite,
  updateStreak 
} = nutritionSlice.actions;

export default nutritionSlice.reducer;
