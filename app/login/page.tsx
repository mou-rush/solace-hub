"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppStore, useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      addNotification({
        title: "Welcome back!",
        description: "You've successfully logged in.",
        variant: "success",
      });
      router.push("/dashboard");
    } catch (errorMessage: any) {
      console.error("Login error:", errorMessage);
      if (errorMessage.code === "auth/invalid-credential") {
        errorMessage.message =
          "Invalid credentials. Please check your email and password.";
      } else if (errorMessage.code === "auth/wrong-password") {
        errorMessage.message = "Incorrect password. Please try again.";
      } else if (errorMessage.code === "auth/invalid-email") {
        errorMessage.message = "Invalid email format.";
      } else if (errorMessage.code === "auth/too-many-requests") {
        errorMessage.message =
          "Too many login attempts. Please try again later.";
      } else if (errorMessage.code === "auth/network-request-failed") {
        errorMessage.message = "Network error. Please check your connection.";
      } else {
        errorMessage.message =
          "An unexpected error occurred. Please try again.";
      }
      addNotification({
        title: "Login failed",
        description: errorMessage.message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-muted-foreground">
            Sign in to your SolaceHub account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
