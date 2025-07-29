"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, ExternalLink, FileText, Heart, Phone } from "lucide-react";
import Link from "next/link";

const emergencyResources = [
  {
    name: "National Suicide Prevention Lifeline",
    description:
      "Free and confidential support for individuals experiencing distress, including suicide prevention and mental health counseling",
    contact: "+264 61 232 221",
    website: "https://lifelinechildline.org.na",
  },
  {
    name: "Mental Health Helpline",
    description:
      "Provides psychological support, including crisis intervention for individuals with severe mental health issues.",
    contact: "+264 61 203 9111",
    website: "https://www.crisistextline.org/",
  },
  {
    name: "LGBTQIA+ Mental Health Support",
    description:
      "Provides psychological counseling and mental health support for LGBTQIA+ individuals",
    contact: "+264 81 406 7132 ",
    website:
      "https://www.civic264.org.na/human-rights-and-democracy/out-right-namibia-orn",
  },
];

const articles = [
  {
    title: "Understanding Anxiety: Causes, Symptoms, and Coping Strategies",
    description:
      "Learn about the different types of anxiety disorders and effective ways to manage symptoms.",
    category: "Anxiety",
  },
  {
    title: "The Science of Depression: What We Know and How to Treat It",
    description:
      "Explore the latest research on depression, its biological basis, and evidence-based treatments.",
    category: "Depression",
  },
  {
    title: "Mindfulness Meditation: A Beginner's Guide",
    description:
      "Discover how mindfulness practices can help reduce stress and improve mental wellbeing.",
    category: "Stress Management",
  },
  {
    title: "Building Resilience: How to Bounce Back from Life's Challenges",
    description:
      "Learn practical strategies to develop emotional resilience and cope with adversity.",
    category: "Resilience",
  },
  {
    title: "The Connection Between Physical and Mental Health",
    description:
      "Understand how exercise, nutrition, and sleep impact your mental wellbeing.",
    category: "Wellness",
  },
];

const exercises = [
  {
    title: "5-4-3-2-1 Grounding Technique",
    description:
      "A simple exercise to help manage anxiety by engaging your five senses.",
    category: "Anxiety",
  },
  {
    title: "Progressive Muscle Relaxation",
    description:
      "Learn to release tension in your body by systematically tensing and relaxing muscle groups.",
    category: "Stress",
  },
  {
    title: "Thought Record Journal",
    description:
      "Identify and challenge negative thought patterns to improve your mood.",
    category: "Depression",
  },
  {
    title: "Gratitude Practice",
    description:
      "Cultivate a positive mindset by regularly acknowledging things you're grateful for.",
    category: "Positivity",
  },
  {
    title: "Box Breathing Exercise",
    description:
      "A breathing technique to reduce stress and improve concentration.",
    category: "Stress",
  },
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-muted-foreground mt-1">
          Helpful information and tools for your mental health journey
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-red-50 border-b">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Emergency Resources</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            If you're experiencing a mental health crisis, please reach out for
            immediate help
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            {emergencyResources.map((resource, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-1">{resource.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {resource.description}
                </p>
                <p className="text-sm font-medium mb-2">{resource.contact}</p>
                <Link
                  href={resource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="link"
                    className="p-0 h-auto flex items-center gap-1"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <Input
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="articles">
        <TabsList className="mb-4">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Exercises
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </div>
                    <CardDescription>{article.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                    <Button variant="link" className="p-0 h-auto">
                      Read article
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>No articles found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="exercises">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="text-lg">
                        {exercise.title}
                      </CardTitle>
                    </div>
                    <CardDescription>{exercise.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {exercise.category}
                    </span>
                    <Button variant="link" className="p-0 h-auto">
                      Try exercise
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>No exercises found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Resource Library</CardTitle>
              <CardDescription>
                A curated collection of books, videos, and podcasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Library content is coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
