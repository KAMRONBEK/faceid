import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  //check if userifo present in local storage use it else null
  userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // set  userinfo in local storage
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      console.log("Setting credentials with payload:", action.payload);
      // Ensure localStorage is updated synchronously
      try {
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Error setting userInfo in localStorage:', error);
      }
    },
    // clear local storage it different from actual logout which send to backend
    // it just clear credential form local storage it like frontend logout
    logout: (state, action) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
  },
});

// export actions
export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
