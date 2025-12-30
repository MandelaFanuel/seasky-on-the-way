// ========================= src/store/slices/authSlice.ts =========================
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ========================= TYPES =========================
export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;

  /**
   * ✅ Auth fiable:
   * - true uniquement après validation (setUser, loginSuccess, registerSuccess)
   * - pas juste parce qu’un token existe en localStorage
   */
  isAuthenticated: boolean;

  isLoading: boolean;
  error: string | null;

  /**
   * ✅ Pour éviter les redirects bizarres:
   * - on sait si l’app a déjà "vérifié" au moins une fois
   */
  hasHydrated: boolean;
};

// ========================= HELPERS =========================
const loadTokens = () => {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
  };
};

const { accessToken, refreshToken } = loadTokens();

// ========================= INITIAL STATE =========================
const initialState: AuthState = {
  accessToken,
  refreshToken,
  user: null,

  // ✅ IMPORTANT: ne pas mettre true uniquement car token existe
  isAuthenticated: false,

  isLoading: false,
  error: null,

  hasHydrated: false,
};

// ========================= SLICE =========================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ appelé après login
    loginSuccess: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;

      state.isAuthenticated = true;
      state.error = null;
      state.hasHydrated = true;

      localStorage.setItem("access_token", action.payload.accessToken);
      localStorage.setItem("refresh_token", action.payload.refreshToken);
    },

    // ✅ appelé après register
    registerSuccess: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;

      state.isAuthenticated = true;
      state.error = null;
      state.hasHydrated = true;

      localStorage.setItem("access_token", action.payload.accessToken);
      localStorage.setItem("refresh_token", action.payload.refreshToken);
    },

    // ✅ logout propre
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;

      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.hasHydrated = true;

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },

    // ✅ update user profile local
    updateProfile: (state, action: PayloadAction<any>) => {
      state.user = { ...(state.user || {}), ...action.payload };
    },

    /**
     * ✅ setUser = preuve que le token est valide (car on a récupéré /me)
     * donc isAuthenticated devient true ici
     */
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.hasHydrated = true;
    },

    /**
     * ✅ quand on a fini un check (même si pas connecté)
     */
    markHydrated: (state) => {
      state.hasHydrated = true;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export default authSlice.reducer;

// ========================= EXPORT ACTIONS =========================
export const {
  loginSuccess,
  registerSuccess,
  logout,
  updateProfile,
  setUser,
  markHydrated,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;
