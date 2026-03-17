export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How SolaceHub Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed to be intuitive and supportive at every
            step of your journey.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-teal-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
            <p className="text-muted-foreground">
              Sign up and complete a brief assessment to help us understand your
              needs.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-teal-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Connect With AI Therapist
            </h3>
            <p className="text-muted-foreground">
              Start conversations with our AI therapist through text or voice
              interactions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-teal-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
            <p className="text-muted-foreground">
              Monitor your mood, journal your thoughts, and see your improvement
              over time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
