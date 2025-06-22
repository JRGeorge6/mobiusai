import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BookOpen, Zap, Target, Users, TrendingUp, RotateCcw } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glassmorphic shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800">MobiusAI</h1>
            </div>
            <Button onClick={handleGetStarted} className="btn-coral">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-neutral-800 mb-6">
            Unlock Your Learning Potential
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Active Recall, Feynman Mode, Spaced Repetition, and Interleaved Studying—all in one place.
            Connect with Canvas and let AI transform your study experience.
          </p>
          <Button
            size="lg"
            className="btn-coral text-lg px-8 py-4 rounded-xl"
            onClick={handleGetStarted}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-800 mb-12">
            Powerful Learning Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glassmorphic hover-lift border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-coral/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-coral" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Active Recall</h3>
                <p className="text-sm text-neutral-600">
                  Test your knowledge with AI-generated questions based on your course materials.
                </p>
              </CardContent>
            </Card>

            <Card className="glassmorphic hover-lift border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Feynman Mode</h3>
                <p className="text-sm text-neutral-600">
                  Teach concepts back to the AI and receive probing questions to deepen understanding.
                </p>
              </CardContent>
            </Card>

            <Card className="glassmorphic hover-lift border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-lime/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-lime" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Spaced Repetition</h3>
                <p className="text-sm text-neutral-600">
                  Optimize your review schedule with scientifically-proven spaced repetition algorithms.
                </p>
              </CardContent>
            </Card>

            <Card className="glassmorphic hover-lift border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Interleaved Studying</h3>
                <p className="text-sm text-neutral-600">
                  Mix different topics within a single session to improve long-term retention and knowledge transfer.
                </p>
              </CardContent>
            </Card>

            <Card className="glassmorphic hover-lift border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Adaptive Learning</h3>
                <p className="text-sm text-neutral-600">
                  Personalized study recommendations based on your learning style assessment.
                </p>
              </CardContent>
            </Card>

            <Card className="glassmorphic hover-lift border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">AI-Powered</h3>
                <p className="text-sm text-neutral-600">
                  Advanced AI analyzes your materials and creates personalized learning experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Canvas Integration Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glassmorphic rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">
              Seamless Canvas Integration
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
              Connect your Canvas LMS account to automatically sync courses, assignments, and due dates. 
              Your course materials are organized and ready for AI-powered study sessions.
            </p>
            <Button
              size="lg"
              className="btn-lime text-lg px-8 py-4 rounded-xl"
              onClick={handleGetStarted}
            >
              Connect Canvas Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 glassmorphic mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-coral rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-neutral-800">MobiusAI</span>
            </div>
            <div className="flex space-x-6 text-sm text-neutral-600">
              <a href="#" className="hover:text-neutral-800 transition-colors">About</a>
              <a href="#" className="hover:text-neutral-800 transition-colors">Privacy</a>
              <a href="#" className="hover:text-neutral-800 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
