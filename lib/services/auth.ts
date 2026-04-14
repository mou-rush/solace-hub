import { cache } from "react";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export interface VerifiedUser {
  uid: string;
  userName: string | null;
  email: string | null;
}

/**
 * Verifies a Firebase ID token via the Identity Toolkit REST API.
 * Wrapped in React `cache()` so multiple server components that call this
 * within the same render pass share one network request.
 */
export const verifySession = cache(
  async (idToken: string): Promise<VerifiedUser | null> => {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          cache: "no-store",
        },
      );

      if (!res.ok) return null;

      const { users } = await res.json();
      const user = users?.[0];
      if (!user?.localId) return null;

      return {
        uid: user.localId,
        userName: user.displayName ?? null,
        email: user.email ?? null,
      };
    } catch {
      return null;
    }
  },
);
