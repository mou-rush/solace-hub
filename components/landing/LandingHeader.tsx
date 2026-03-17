import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function LandingHeader() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-teal-600" />
          <span className="text-xl font-bold">SolaceHub</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-teal-600 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium hover:text-teal-600 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium hover:text-teal-600 transition-colors"
          >
            Testimonials
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
