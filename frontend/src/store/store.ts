// ========================= src/store/store.ts =========================
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// ✅ Re-export actions pour pouvoir importer depuis store.ts
export {
  loginSuccess,
  registerSuccess,
  logout,
  updateProfile,
  setUser,
  markHydrated,
  setLoading,
  setError,
  clearError,
} from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/setUser",
          "auth/loginSuccess",
          "auth/registerSuccess",
          "auth/updateProfile",
        ],
        ignoredPaths: ["auth.user"],
      },
    }),
  devTools: import.meta.env.MODE !== "production",
});

// Types Redux standard
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
