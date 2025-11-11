import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  level: 1,
  currentXP: 0,
  totalPoints: 0,
  achievements: [],
  unlockedBadges: [],
  recentUnlocks: [],
};

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    addPoints: (state, action) => {
      state.currentXP += action.payload;
      state.totalPoints += action.payload;
      
      const xpForNextLevel = state.level * 100;
      if (state.currentXP >= xpForNextLevel) {
        state.level += 1;
        state.currentXP = state.currentXP - xpForNextLevel;
      }
    },
    unlockAchievement: (state, action) => {
      const achievement = action.payload;
      state.unlockedBadges.push(achievement.id);
      state.recentUnlocks.push({
        ...achievement,
        unlockedAt: new Date().toISOString(),
      });
      state.totalPoints += achievement.points || 0;
    },
    updateAchievementProgress: (state, action) => {
      const { id, progress } = action.payload;
      const achievement = state.achievements.find(a => a.id === id);
      if (achievement) {
        achievement.progress = progress;
      }
    },
  },
});

export const { 
  addPoints, 
  unlockAchievement, 
  updateAchievementProgress 
} = achievementsSlice.actions;

export default achievementsSlice.reducer;
