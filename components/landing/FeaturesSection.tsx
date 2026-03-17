import { MessageSquare, Brain, Shield } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Features Designed For Your Wellbeing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with evidence-based
            therapeutic approaches to support your mental health journey.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Therapy Sessions</h3>
            <p className="text-muted-foreground">
              Chat with our AI therapist powered by Google's Generative AI for
              supportive conversations anytime.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mood Tracking</h3>
            <p className="text-muted-foreground">
              Track your emotional patterns over time to gain insights into your
              mental wellbeing.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Crisis Resources</h3>
            <p className="text-muted-foreground">
              Immediate access to emergency contacts and crisis resources when
              you need them most.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
