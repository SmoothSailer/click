"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/(admin)/admin/actions";
import { LogoMark } from "@/components/logo";
import { buttonPrimaryClass, inputClass, labelClass } from "@/lib/styles";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <LogoMark className="size-10" />
        <div>
          <h1 className="text-lg font-bold text-ink-950">Admin sign in</h1>
          <p className="text-xs text-ink-500">Manage the truck listings</p>
        </div>
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className={labelClass}>
            Admin password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className={inputClass}
          />
        </div>

        {state.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className={`${buttonPrimaryClass} w-full`}
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
