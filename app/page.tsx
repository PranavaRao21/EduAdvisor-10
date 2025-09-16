"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuestionnaireEngine } from "@/components/questionnaire-engine"
import { BranchQuiz } from "@/components/branch-quiz"
import { ResultsPage } from "@/components/results-page"

const GraduationCapIcon = () => <div className="w-6 h-6 flex items-center justify-center">🎓</div>

const BookOpenIcon = () => <div className="w-6 h-6 flex items-center justify-center">📚</div>

const CalculatorIcon = () => <div className="w-6 h-6 flex items-center justify-center">🧮</div>

const PaletteIcon = () => <div className="w-6 h-6 flex items-center justify-center">🎨</div>

const WrenchIcon = () => <div className="w-6 h-6 flex items-center justify-center">🔧</div>

const ArrowRightIcon = () => <div className="w-5 h-5 flex items-center justify-center text-purple-600">→</div>

export default function HomePage() {
  const [currentView, setCurrentView] = useState<"welcome" | "quiz" | "branch" | "result">("welcome")
  const [selectedStream, setSelectedStream] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)

  const handleQuizComplete = (stream: string) => {
    setSelectedStream(stream)
    setCurrentView("branch")
  }

  const handleBranchComplete = (branch: string) => {
    setSelectedBranch(branch)
    setCurrentView("result")
  }

  const resetQuiz = () => {
    setCurrentView("welcome")
    setSelectedStream(null)
    setSelectedBranch(null)
  }

  if (currentView === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full animate-pulse-glow">
                  <div className="text-3xl">🎓</div>
                </div>
              </div>
              <h1
                className="text-4xl md:text-6xl font-bold text-balance mb-4 bg-gradient-to-r from-gray-800 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient"
                style={{ fontFamily: "Space Grotesk" }}
              >
                Find Your Perfect Academic Stream
              </h1>
              <p className="text-xl text-gray-800 text-balance max-w-2xl mx-auto leading-relaxed">
                Discover your ideal educational path through our intelligent questionnaire. Get personalized
                recommendations based on your interests and strengths.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  name: "Science",
                  icon: BookOpenIcon,
                  desc: "STEM fields, research, and innovation",
                  gradient: "from-blue-500 to-indigo-600",
                  bgGradient: "from-blue-50 to-indigo-100",
                },
                {
                  name: "Commerce",
                  icon: CalculatorIcon,
                  desc: "Business, finance, and economics",
                  gradient: "from-green-500 to-emerald-600",
                  bgGradient: "from-green-50 to-emerald-100",
                },
                {
                  name: "Arts/Humanities",
                  icon: PaletteIcon,
                  desc: "Literature, social sciences, and creativity",
                  gradient: "from-purple-500 to-pink-600",
                  bgGradient: "from-purple-50 to-pink-100",
                },
                {
                  name: "Vocational",
                  icon: WrenchIcon,
                  desc: "Practical skills and hands-on careers",
                  gradient: "from-orange-500 to-red-600",
                  bgGradient: "from-orange-50 to-red-100",
                },
              ].map((stream, index) => {
                const Icon = stream.icon
                return (
                  <Card
                    key={stream.name}
                    className={`text-center hover-lift glass border-0 shadow-xl bg-gradient-to-br ${stream.bgGradient} animate-fade-in`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${stream.gradient} flex items-center justify-center mx-auto mb-3 animate-bounce-in shadow-lg`}
                        style={{ animationDelay: `${index * 300}ms` }}
                      >
                        <Icon />
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-800">{stream.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{stream.desc}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card
              className="text-center border-0 shadow-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient animate-fade-in"
              style={{ animationDelay: "800ms" }}
            >
              <CardHeader className="bg-black/20 backdrop-blur-sm">
                <CardTitle className="text-2xl mb-2 text-white font-bold" style={{ fontFamily: "Space Grotesk" }}>
                  Ready to Discover Your Path?
                </CardTitle>
                <CardDescription className="text-lg text-white font-medium">
                  Our questionnaire takes about 5-10 minutes and provides personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-black/20 backdrop-blur-sm">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-white text-purple-600 hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg font-semibold"
                  onClick={() => setCurrentView("quiz")}
                >
                  Start Questionnaire
                  <ArrowRightIcon />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "quiz") {
    return <QuestionnaireEngine onComplete={handleQuizComplete} onBack={() => setCurrentView("welcome")} />
  }

  if (currentView === "branch" && selectedStream) {
    return (
      <BranchQuiz stream={selectedStream} onComplete={handleBranchComplete} onBack={() => setCurrentView("quiz")} />
    )
  }

  if (currentView === "result" && selectedStream) {
    return <ResultsPage stream={selectedStream} onBack={() => setCurrentView("branch")} onRestart={resetQuiz} />
  }

  return null
}
