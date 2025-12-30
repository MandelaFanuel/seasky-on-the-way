// ========================= src/pages/auth/Login.tsx =========================
import { useMemo, useState, useEffect, useRef, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import type { AppDispatch, RootState } from "../../store/store";
import { loginSuccess, setError, setLoading } from "../../store/slices/authSlice";

import { SeaSkyApiError, getCurrentUser, loginUser } from "../../api/client";

import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Phone,
  Lock,
  AlertCircle,
  Check,
  Shield,
} from "lucide-react";
import Footer from "../../components/sections/Footer";

type LocationState = {
  from?: { pathname?: string };
};

/** ✅ Icône Google (logo complet, bien centré) */
function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={`${className} shrink-0`} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.733 32.657 29.201 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.1 0 9.797-1.958 13.338-5.148l-6.173-5.225C29.175 35.091 26.718 36 24 36c-5.179 0-9.697-3.319-11.274-7.946l-6.52 5.02C9.518 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.751 2.173-2.311 4.012-4.338 5.245l.003-.002 6.173 5.225C36.704 38.867 44 33.5 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/** ✅ Icône Facebook (bien alignée) */
function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={`${className} shrink-0`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24h11.495v-9.294H9.691V11.01h3.13V8.309c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"
      />
    </svg>
  );
}

/** ✅ Affichage d'erreur sous champ (propre & uniforme) */
function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="mt-2 flex items-start gap-1.5 text-red-600 text-xs animate-fadeIn">
      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span className="leading-snug">{message}</span>
    </div>
  );
}

function extractTokens(res: any): { access: string | null; refresh: string | null } {
  const access = res?.access ?? res?.tokens?.access ?? null;
  const refresh = res?.refresh ?? res?.tokens?.refresh ?? null;
  return { access, refresh };
}

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const auth = useSelector((s: RootState) => s.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => localStorage.getItem("rememberMe") === "true");
  const [success, setSuccess] = useState<string | null>(null);
  const [loginType, setLoginType] = useState<"username" | "phone">("username");
  const [inputType, setInputType] = useState<"username" | "phone">("username");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.trim().length > 0 && !auth.isLoading;
  }, [username, password, auth.isLoading]);

  // Auto-hide erreurs
  useEffect(() => {
    let timer: any;
    if (usernameError) timer = setTimeout(() => setUsernameError(null), 5000);
    return () => timer && clearTimeout(timer);
  }, [usernameError]);

  useEffect(() => {
    let timer: any;
    if (passwordError) timer = setTimeout(() => setPasswordError(null), 5000);
    return () => timer && clearTimeout(timer);
  }, [passwordError]);

  useEffect(() => {
    let timer: any;
    if (formError) timer = setTimeout(() => setFormError(null), 6500);
    return () => timer && clearTimeout(timer);
  }, [formError]);

  // restore username
  useEffect(() => {
    if (!rememberMe) return;
    const saved = localStorage.getItem("savedUsername");
    if (saved && usernameInputRef.current) {
      setUsername(saved);
      setInputType(detectInputType(saved));
    }
  }, [rememberMe]);

  // save rememberMe
  useEffect(() => {
    if (rememberMe) localStorage.setItem("rememberMe", "true");
    else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("savedUsername");
    }
  }, [rememberMe]);

  // detect type on tab change
  useEffect(() => {
    if (!usernameInputRef.current) return;
    const value = username;
    if (value) setInputType(detectInputType(value));
  }, [loginType]);

  const detectInputType = (value: string): "username" | "phone" => {
    const cleanValue = value.replace(/[\s\-+()]/g, "");
    return /^\d+$/.test(cleanValue) && cleanValue.length >= 8 ? "phone" : "username";
  };

  const validateUsername = (identifier: string): string | null => {
    if (!identifier.trim()) return "Le nom d'utilisateur ou numéro de téléphone est requis.";

    if (detectInputType(identifier) === "phone") {
      const phoneDigits = identifier.replace(/\D/g, "");
      if (phoneDigits.length < 8) return "Le numéro de téléphone doit contenir au moins 8 chiffres.";
      if (phoneDigits.length > 15) return "Le numéro de téléphone est trop long.";
    } else {
      if (identifier.length < 3) return "Le nom d'utilisateur doit contenir au moins 3 caractères.";
      if (identifier.length > 50) return "Le nom d'utilisateur est trop long.";
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return "Le mot de passe est requis.";
    if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
    return null;
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (value) setInputType(detectInputType(value));
    setUsernameError(validateUsername(value));
    setFormError(null);
    dispatch(setError(null)); // Clear Redux error
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
    setFormError(null);
    dispatch(setError(null)); // Clear Redux error
  };

  const handleBlur = (field: "username" | "password") => {
    if (field === "username") {
      setUsernameError(validateUsername(username));
    } else {
      setPasswordError(validatePassword(password));
    }
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const idErr = validateUsername(username);
    const pwErr = validatePassword(password);

    setUsernameError(idErr);
    setPasswordError(pwErr);
    setFormError(null);
    setSuccess(null);
    dispatch(setError(null)); // Clear Redux error

    if (idErr || pwErr) {
      if (idErr && usernameInputRef.current) usernameInputRef.current.focus();
      else if (pwErr && passwordInputRef.current) passwordInputRef.current.focus();
      return;
    }

    if (!canSubmit) return;

    dispatch(setError(null));
    dispatch(setLoading(true));

    try {
      // 1) login
      const res = await loginUser(username.trim(), password);

      // 2) tokens (supporte {access,refresh} ou {tokens:{access,refresh}})
      const { access, refresh } = extractTokens(res);

      if (!access || !refresh) {
        throw new SeaSkyApiError(
          "Login OK mais tokens manquants dans la réponse. Vérifie la réponse backend (access/refresh)."
        );
      }

      // 3) user : si backend ne renvoie pas user, on le charge via /me/profile
      let user = res?.user ?? null;
      if (!user) {
        user = await getCurrentUser();
      }

      if (rememberMe) localStorage.setItem("savedUsername", username.trim());

      // 4) redux
      dispatch(
        loginSuccess({
          accessToken: access,
          refreshToken: refresh,
          user,
        })
      );

      setSuccess("Authentification réussie ! Redirection en cours...");
      
      // 5) redirect (revient à la page demandée sinon dashboard)
      const redirectTo = state?.from?.pathname || "/dashboard";
      setTimeout(() => navigate(redirectTo, { replace: true }), 1200);
    } catch (err: any) {
      // SeaSkyApiError donne status + message
      let msg = "Erreur de connexion.";
      
      if (err instanceof SeaSkyApiError) {
        msg = err.message;

        // message plus clair si 403
        if (err.status === 403) {
          msg = "403 (Forbidden) : le backend refuse la requête. Causes fréquentes : CSRF/SessionAuthentication activée, permissions DRF, ou endpoint login pas configuré correctement.";
        }

        // Handle specific error cases
        if (err.status === 401) {
          setPasswordError("Identifiants incorrects. Vérifiez vos informations.");
          setUsernameError(null);
          setFormError(null);
          setPassword("");
          passwordInputRef.current?.focus();
          dispatch(setError(null));
          dispatch(setLoading(false));
          return;
        }

        if (err.status === 403 && err.payload) {
          const detail = (err.payload.detail || err.payload.message || err.payload.error) as string | undefined;
          setUsernameError(detail || "Compte désactivé. Contactez l'administrateur.");
          setPasswordError(null);
          setFormError(null);
          usernameInputRef.current?.focus();
          dispatch(setError(null));
          dispatch(setLoading(false));
          return;
        }
      } else if (err?.message) {
        msg = err.message;
      }

      // Also set in Redux for compatibility
      dispatch(setError(msg));
      setFormError(msg);
    } finally {
      dispatch(setLoading(false));
    }
  }

  const handleForgotPassword = () => {
    const identifier = username.trim();

    if (!identifier) {
      setUsernameError("Veuillez d'abord saisir votre identifiant pour réinitialiser le mot de passe.");
      usernameInputRef.current?.focus();
      return;
    }

    const idErr = validateUsername(identifier);
    if (idErr) {
      setUsernameError(idErr);
      return;
    }

    const type = detectInputType(identifier);
    const label = type === "phone" ? "téléphone" : "nom d'utilisateur";

    setSuccess(`Instructions de réinitialisation envoyées à votre ${label}.`);
    setUsernameError(null);
    setPasswordError(null);
    setFormError(null);

    setTimeout(() => setSuccess(null), 5000);
  };

  const handleSocialLogin = (provider: string) => console.log(`Connexion via ${provider}`);
  const togglePasswordVisibility = () => setShowPassword((v) => !v);
  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked);

  const handleLoginTypeChange = (type: "username" | "phone") => {
    setLoginType(type);
    setInputType(type);
    setUsername("");
    setUsernameError(null);
    setPasswordError(null);
    setFormError(null);
    dispatch(setError(null));

    if (usernameInputRef.current) {
      usernameInputRef.current.value = "";
      usernameInputRef.current.placeholder = type === "phone" ? "Ex: 06 12 34 56 78" : "Votre nom d'utilisateur";
      usernameInputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 to-blue-50/30 mt-20">
      <div className="grow flex items-center justify-center p-4 md:p-6 lg:p-8 py-8 md:py-12 mb-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Connectez-vous
            </h1>
            {/* <p className="text-gray-600 text-sm md:text-base max-w-sm mx-auto">
              Connectez-vous avec vos identifiants ou votre numéro de téléphone
            </p> */}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8">
              {/* Onglets pour choisir le type de connexion */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleLoginTypeChange("username")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                      loginType === "username"
                        ? "text-[#0077B5] border-b-2 border-[#0077B5]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Nom d'utilisateur</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoginTypeChange("phone")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                      loginType === "phone"
                        ? "text-[#0077B5] border-b-2 border-[#0077B5]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>Téléphone</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Affichage des erreurs Redux et locales */}
              {auth.error && (
                <div className="mb-6 animate-fadeIn">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-800 font-medium text-sm mb-1">Problème de connexion</p>
                        <p className="text-red-600 text-sm">{auth.error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formError && !auth.error && (
                <div className="mb-6 animate-fadeIn">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-800 font-medium text-sm mb-1">Problème de connexion</p>
                        <p className="text-red-600 text-sm">{formError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 animate-fadeIn">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 shrink-0" />
                      <div>
                        <p className="text-emerald-800 font-medium text-sm mb-1">Succès</p>
                        <p className="text-emerald-600 text-sm">{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons de connexion sociale */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm active:scale-[0.98]"
                  >
                    <GoogleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium leading-none">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center gap-2 bg-[#1877F2] text-white font-medium py-3 px-4 rounded-xl transition-all hover:bg-[#166FE5] hover:shadow-sm active:scale-[0.98]"
                  >
                    <FacebookIcon className="w-5 h-5" />
                    <span className="text-sm font-medium leading-none">Facebook</span>
                  </button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-gray-500 text-sm font-medium">Ou utilisez vos identifiants</span>
                  </div>
                </div>
              </div>

              {/* Formulaire principal */}
              <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {loginType === "phone" ? "Numéro de téléphone" : "Nom d'utilisateur"}
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {loginType === "phone" ? (
                        <Phone className="w-5 h-5 text-gray-400" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    <input
                      ref={usernameInputRef}
                      value={username}
                      type="text"
                      placeholder={loginType === "phone" ? "Ex: 06 12 34 56 78" : "Votre nom d'utilisateur"}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                        usernameError ? "border-red-300" : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-[#0077B5]/30 focus:border-[#0077B5] transition-all text-sm md:text-base placeholder-gray-500 hover:bg-white`}
                      autoComplete={loginType === "phone" ? "tel" : "username"}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      onBlur={() => handleBlur("username")}
                    />
                  </div>

                  <FieldError message={usernameError} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Mot de passe</label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>

                    <input
                      ref={passwordInputRef}
                      value={password}
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe confidentiel"
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
                        passwordError ? "border-red-300" : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-[#0077B5]/30 focus:border-[#0077B5] transition-all text-sm md:text-base placeholder-gray-500 hover:bg-white`}
                      autoComplete="current-password"
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={() => handleBlur("password")}
                    />

                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <FieldError message={passwordError} />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-2">
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          checked={rememberMe}
                          onChange={handleRememberMeChange}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                            rememberMe ? "bg-[#0077B5] border-[#0077B5]" : "bg-white border-gray-300"
                          }`}
                        >
                          {rememberMe && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-700 select-none">Se souvenir de moi</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#0077B5] font-medium hover:text-[#005A8C] hover:underline transition-colors text-right sm:text-left"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!canSubmit || auth.isLoading}
                    className="w-full bg-linear-to-r from-[#0077B5] to-[#005A8C] hover:from-[#00669C] hover:to-[#004A75] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#0077B5]/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-3"
                  >
                    {auth.isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connexion en cours...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Se connecter</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Section d'inscription */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-4">Vous n'avez pas encore de compte ?</p>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border-2 border-[#0077B5] text-[#0077B5] font-semibold rounded-xl hover:bg-[#0077B5] hover:text-white transition-all duration-200 active:scale-[0.98]"
                  >
                    Créer un nouveau compte
                  </Link>
                </div>

                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    En vous connectant, vous acceptez nos{" "}
                    <Link to="/terms" className="text-[#0077B5] hover:underline font-medium">
                      Conditions
                    </Link>{" "}
                    et notre{" "}
                    <Link to="/privacy" className="text-[#0077B5] hover:underline font-medium">
                      Confidentialité
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de sécurité */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/50 px-4 py-2 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              <span>Connexion sécurisée par chiffrement SSL</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}