"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (username.trim() === "admin" && password === "1234") {
      localStorage.setItem("loggedIn", "true");
      document.cookie = "loggedIn=true; path=/";
      window.location.assign("/");
      return;
    }

    setError("Λάθος username ή κωδικός.");
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            ΚΑΛΟΜΕΛΕΤΑ
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            ΚΕΝΤΡΟ ΣΧΟΛΙΚΗΣ ΜΕΛΕΤΗΣ
          </p>

          <p className="mt-5 text-sm text-slate-500">
            Σύστημα διαχείρισης
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

          <form onSubmit={handleLogin}>

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Κωδικός
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="1234"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-950 py-4 font-bold text-white hover:bg-slate-800"
              >
                ΕΙΣΟΔΟΣ
              </button>

            </div>

          </form>

        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          ΚΑΛΟΜΕΛΕΤΑ • Study Center Manager
        </p>

      </div>
    </main>
  );
}