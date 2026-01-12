// ========================= src/main.tsx =========================
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import "./styles/index.css";

// ✅ Active la logique PWA (install + updates)
import "./pwa/pwa";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-3">
              Une erreur a cassé l’interface
            </h1>
            <p className="text-gray-700 mb-4">
              Cause probable : un <b>SVG</b> avec un <code>path d</code> invalide
              (ex: caractères “étranges”, path tronqué).
            </p>

            <div className="bg-gray-900 text-gray-100 text-xs rounded-lg p-3 overflow-auto max-h-56">
              <pre className="whitespace-pre-wrap">
                {String(this.state.error?.message || this.state.error || "Erreur inconnue")}
              </pre>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Recharger
              </button>
              <button
                onClick={() => {
                  // tente de revenir à l'accueil
                  window.location.href = "/";
                }}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition"
              >
                Aller à /
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
