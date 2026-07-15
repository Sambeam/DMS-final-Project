export default function UserBanner({ authError, isGoogleConfigured, user, googleReady, isGoogleLoading, googleButtonRef, handleSignOut }) {
  return (
    <div className="mb-6 space-y-3">
      {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{authError}</div>}
      {isGoogleConfigured ? (
        user ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg">
                  {(user.name?.[0] ?? "S").toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="self-start sm:self-auto border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-dashed border-gray-300 rounded-xl p-4">
            <div>
              <p className="font-semibold text-gray-900">Sign in with Google</p>
              <p className="text-sm text-gray-600">Connect your Google account to sync schedules and personalize StudyHub.</p>
            </div>
            <div className="flex items-center gap-3">
              <div ref={googleButtonRef} />
              {(!googleReady || isGoogleLoading) && <span className="text-sm text-gray-500">Loading…</span>}
            </div>
          </div>
        )
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl p-4">
          <p className="font-semibold mb-1">Google OAuth is not configured</p>
          <p>
            Add <code className="bg-white px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> to your environment (see README) to enable Google
            sign-in.
          </p>
        </div>
      )}
    </div>
  );
}
