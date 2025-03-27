import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserInfo } from '../types/models';

interface AuthState {
  userInfo: UserInfo | null;
}

// Parse userInfo from localStorage
const getUserInfoFromStorage = (): UserInfo | null => {
  try {
    const userInfoString = localStorage.getItem('userInfo');
    return userInfoString ? JSON.parse(userInfoString) : null;
  } catch (error) {
    console.error('Error parsing userInfo from localStorage:', error);
    return null;
  }
};

const initialState: AuthState = {
  userInfo: getUserInfoFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set userinfo in local storage
    setCredentials: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      console.log("Setting credentials with payload:", action.payload);
      // Ensure localStorage is updated synchronously
      try {
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Error setting userInfo in localStorage:', error);
      }
    },
    // Clear local storage (frontend logout)
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
  },
});

// Export actions
export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer; 