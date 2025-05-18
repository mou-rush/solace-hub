"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          lastLogin: new Date().toISOString(),
        });
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      }

      success({
        title: "Welcome back!",
        description: "You've successfully logged in.",
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

      error({
        title: "Login failed",
        description: errorMessage.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <Heart className="h-10 w-10 text-teal-600" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-teal-600 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
