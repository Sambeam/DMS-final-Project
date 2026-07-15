import { Sparkles, Clock, FileText } from "lucide-react";
import React from "react";

export default function AuthPage({
    authScreen,
    setAuthScreen,
    authForm,
    handleAuthInput,
    authLoading,
    handleManualAuth,
    googleReady,
    isGoogleLoading,
    googleButtonRef
}) {
    const isSignup = authScreen === "signup";


    return (
    <div className="min-h-screen w-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-slate-900/80 border border-white/10 rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT SIDE */}
        <div className="flex-1 p-8 bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-600">
          <h2 className="text-3xl font-bold mb-4">
            {isSignup ? "Create an account" : "Welcome back"}
          </h2>

          <p className="text-blue-50 mb-8">
            {isSignup
              ? "Get personalized schedules, reminders, and study tools tailored just for you."
              : "Sign in to pick up where you left off across your courses and notes."}
          </p>

          <div className="space-y-4 text-blue-50">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span>Plan your week with intelligent schedule blocks.</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <span>Track study time and stay accountable.</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <span>Sync notes, assignments, and deadlines.</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 p-8 bg-slate-900">

          {/* back button */}
          <div className="mb-6">
            <button
              onClick={() => setAuthScreen("landing")}
              className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
            >
              ← Back to landing
            </button>
          </div>

          {/* form */}
          <form className="space-y-4" onSubmit={handleManualAuth}>
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  value={authForm.name}
                  onChange={handleAuthInput}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={handleAuthInput}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={handleAuthInput}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-70 text-white font-semibold py-2.5 rounded-lg"
            >
              {authLoading
                ? "Please wait..."
                : isSignup
                ? "Create account"
                : "Log in"}
            </button>
          </form>

          {/* google login */}
          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
            <span className="flex-1 h-px bg-slate-700" />
            or continue with
            <span className="flex-1 h-px bg-slate-700" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <div ref={googleButtonRef} />
            {(!googleReady || isGoogleLoading) && (
              <span className="text-sm text-slate-400">
                Loading Google sign-in...
              </span>
            )}
          </div>

          {/* switch-login-signup */}
          {isSignup ? (
            <p className="text-sm text-slate-400 mt-6">
              Already have an account?{" "}
              <button
                onClick={() => setAuthScreen("login")}
                className="text-blue-400 hover:underline"
              >
                Log in
              </button>
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-6">
              Need an account?{" "}
              <button
                onClick={() => setAuthScreen("signup")}
                className="text-blue-400 hover:underline"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
