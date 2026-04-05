"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-soft p-8 text-center">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-xl font-bold text-textDark mb-2">
              Quelque chose s&apos;est mal passé
            </h1>
            <p className="text-sm text-textLight mb-6">
              Une erreur inattendue s&apos;est produite. Recharge la page pour continuer.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
