"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const ArrowLeftIcon = () => <div className="w-4 h-4 flex items-center justify-center text-current">←</div>

interface Question {
  QuestionID: string
  Question: string
  AnswerType: string
  NextIfYes: string
  NextIfNo: string
  StreamSuggestion: string
}

interface QuestionnaireEngineProps {
  onComplete: (stream: string) => void
  onBack: () => void
}

export function QuestionnaireEngine({ onComplete, onBack }: QuestionnaireEngineProps) {
  const [questions, setQuestions] = useState<Record<string, Question>>({})
  const [currentQuestionId, setCurrentQuestionId] = useState("Q1")
  const [scores, setScores] = useState({
    Science: 0,
    Commerce: 0,
    "Arts/Humanities": 0,
    Vocational: 0,
  })
  const [noCounts, setNoCounts] = useState({
    Science: 0,
    Commerce: 0,
    "Arts/Humanities": 0,
    Vocational: 0,
  })
  const [questionCount, setQuestionCount] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const loadQuestionsOptimized = async () => {
      try {
        setLoadingProgress(20)
        console.log("[v0] Starting CSV fetch...")

        const response = await fetch("/stream_decision_tree_ordered_no_early_jump.csv")
        if (!response.ok) throw new Error("Failed to fetch CSV")

        setLoadingProgress(40)
        const csvData = await response.text()
        console.log("[v0] CSV data loaded successfully")

        setLoadingProgress(60)

        const parseCSVLine = (line: string): string[] => {
          const result: string[] = []
          let current = ""
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]

            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                // Handle escaped quotes
                current += '"'
                i++ // Skip next quote
              } else {
                // Toggle quote state
                inQuotes = !inQuotes
              }
            } else if (char === "," && !inQuotes) {
              // End of field
              result.push(current.trim())
              current = ""
            } else {
              current += char
            }
          }

          // Add the last field
          result.push(current.trim())
          return result
        }

        const lines = csvData.trim().split("\n")
        const questionsData: Record<string, Question> = {}

        // Skip header and process each line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue // Skip empty lines

          const values = parseCSVLine(line)

          if (values.length >= 6) {
            const questionId = values[0]
            if (questionId && questionId.match(/^Q\d+$/)) {
              questionsData[questionId] = {
                QuestionID: questionId,
                Question: values[1],
                AnswerType: values[2],
                NextIfYes: values[3],
                NextIfNo: values[4],
                StreamSuggestion: values[5],
              }
            }
          }
        }

        setLoadingProgress(100)
        console.log("[v0] Parsed questions:", Object.keys(questionsData).length)
        console.log("[v0] Available question IDs:", Object.keys(questionsData))
        console.log("[v0] Looking for question ID:", "Q1")
        console.log("[v0] Q1 exists:", !!questionsData["Q1"])

        const firstQuestionId = Object.keys(questionsData).sort()[0] || "Q1"
        if (!questionsData["Q1"] && firstQuestionId) {
          console.log("[v0] Q1 not found, using first available question:", firstQuestionId)
          setCurrentQuestionId(firstQuestionId)
        }

        setQuestions(questionsData)
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Error loading CSV:", error)
        setLoadingProgress(100)

        const fallbackQuestions: Record<string, Question> = {
          Q1: {
            QuestionID: "Q1",
            Question: "Do you enjoy solving math problems or puzzles that require logical thinking?",
            AnswerType: "yesno",
            NextIfYes: "Q2",
            NextIfNo: "Q2",
            StreamSuggestion: "",
          },
          Q2: {
            QuestionID: "Q2",
            Question: "Are you curious about how the world works, like physics laws or chemical reactions?",
            AnswerType: "yesno",
            NextIfYes: "Q3",
            NextIfNo: "Q3",
            StreamSuggestion: "",
          },
          Q3: {
            QuestionID: "Q3",
            Question: "Do you like conducting experiments or building simple models?",
            AnswerType: "yesno",
            NextIfYes: "END",
            NextIfNo: "END",
            StreamSuggestion: "Science",
          },
        }
        console.log("[v0] Using fallback questions")
        setQuestions(fallbackQuestions)
        setIsLoading(false)
      }
    }

    loadQuestionsOptimized()
  }, [])

  const getStream = (questionId: string): keyof typeof scores | null => {
    const qNum = Number.parseInt(questionId.substring(1))
    if (qNum >= 1 && qNum <= 10) return "Science"
    if (qNum >= 11 && qNum <= 20) return "Commerce"
    if (qNum >= 21 && qNum <= 30) return "Arts/Humanities"
    if (qNum >= 31 && qNum <= 40) return "Vocational"
    return null
  }

  const handleAnswer = (answer: "yes" | "no") => {
    const currentQuestion = questions[currentQuestionId]
    if (!currentQuestion) {
      console.log("[v0] No current question found for ID:", currentQuestionId)
      return
    }

    console.log("[v0] Handling answer:", answer, "for question:", currentQuestionId)

    const stream = getStream(currentQuestionId)

    // Update scores and history
    setHistory((prev) => [...prev, currentQuestionId])
    setQuestionCount((prev) => prev + 1)

    if (stream) {
      if (answer === "yes") {
        setScores((prev) => ({ ...prev, [stream]: prev[stream] + 1 }))
      } else {
        setNoCounts((prev) => {
          const newNoCounts = { ...prev, [stream]: prev[stream] + 1 }

          const currentStreamQuestionNumber = Number.parseInt(currentQuestionId.substring(1))
          const streamStartQuestion = getStreamStartQuestion(stream)
          const questionsAnsweredInStream = currentStreamQuestionNumber - streamStartQuestion + 1

          console.log(
            "[v0] Stream:",
            stream,
            "No count:",
            newNoCounts[stream],
            "Questions in stream:",
            questionsAnsweredInStream,
          )

          if (newNoCounts[stream] >= 2 && questionsAnsweredInStream >= 5) {
            console.log("[v0] Switching streams due to 2/5 no answers in", stream)
            const nextStreamStartId = getNextStreamStartId(stream)
            if (nextStreamStartId) {
              setCurrentQuestionId(nextStreamStartId)
              return newNoCounts
            }
          }

          return newNoCounts
        })
      }
    }

    const nextId = answer === "yes" ? currentQuestion.NextIfYes : currentQuestion.NextIfNo
    console.log("[v0] Next question ID:", nextId)

    if (!nextId || nextId === "") {
      console.log("[v0] No next question, completing questionnaire")
      const maxScore = Math.max(...Object.values(scores))
      const recommendedStream = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0]

      if (recommendedStream && maxScore > 0) {
        onComplete(recommendedStream)
      } else {
        onComplete("No clear match")
      }
      return
    }

    if (["Q10", "Q20", "Q30", "Q40"].includes(currentQuestionId)) {
      if (stream && scores[stream] >= 8) {
        onComplete(currentQuestion.StreamSuggestion || stream)
        return
      }
    }

    if (currentQuestionId === "Q41" || questionCount >= 40) {
      const maxScore = Math.max(...Object.values(scores))
      const recommendedStream = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0]

      if (recommendedStream && maxScore > 0) {
        onComplete(recommendedStream)
      } else {
        onComplete("No clear match")
      }
      return
    }

    setCurrentQuestionId(nextId)
  }

  const getStreamStartQuestion = (stream: keyof typeof scores): number => {
    switch (stream) {
      case "Science":
        return 1
      case "Commerce":
        return 11
      case "Arts/Humanities":
        return 21
      case "Vocational":
        return 31
      default:
        return 1
    }
  }

  const getNextStreamStartId = (currentStream: keyof typeof scores): string | null => {
    switch (currentStream) {
      case "Science":
        return "Q11" // Commerce
      case "Commerce":
        return "Q21" // Arts/Humanities
      case "Arts/Humanities":
        return "Q31" // Vocational
      case "Vocational":
        return "Q41" // Final question
      default:
        return null
    }
  }

  const goBack = () => {
    if (history.length > 0) {
      const previousId = history[history.length - 1]
      setHistory((prev) => prev.slice(0, -1))
      setQuestionCount((prev) => prev - 1)
      setCurrentQuestionId(previousId)
    } else {
      onBack()
    }
  }

  const currentQuestion = questions[currentQuestionId]
  const progress = Math.min((questionCount / 40) * 100, 100)

  console.log("[v0] Current question ID:", currentQuestionId)
  console.log("[v0] Current question exists:", !!currentQuestion)
  console.log("[v0] Is loading:", isLoading)
  console.log("[v0] Total questions loaded:", Object.keys(questions).length)

  const loadingMessage = isLoading
    ? "Loading your personalized questionnaire..."
    : !currentQuestion
      ? "Preparing your first question..."
      : "Loading your personalized questionnaire..."

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
        <div className="text-center relative z-10 max-w-md mx-auto px-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <div className="text-xl font-semibold text-gray-800 mb-4">{loadingMessage}</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            {isLoading
              ? loadingProgress < 40
                ? "Fetching questions..."
                : loadingProgress < 60
                  ? "Processing data..."
                  : loadingProgress < 90
                    ? "Preparing questionnaire..."
                    : "Almost ready!"
              : "Setting up your questionnaire..."}
          </div>
        </div>
      </div>
    )
  }

  const currentStream = getStream(currentQuestionId)
  const streamColors = {
    Science: { bg: "from-blue-500 to-indigo-600", light: "from-blue-50 to-indigo-100" },
    Commerce: { bg: "from-green-500 to-emerald-600", light: "from-green-50 to-emerald-100" },
    "Arts/Humanities": { bg: "from-purple-500 to-pink-600", light: "from-purple-50 to-pink-100" },
    Vocational: { bg: "from-orange-500 to-red-600", light: "from-orange-50 to-red-100" },
  }

  const currentStreamColor = currentStream
    ? streamColors[currentStream]
    : { bg: "from-gray-500 to-gray-600", light: "from-gray-50 to-gray-100" }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentStreamColor.light} relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={goBack}
                className="hover:bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg hover:scale-105 transition-all duration-300"
              >
                <ArrowLeftIcon />
                <span className="ml-2">Back</span>
              </Button>
              <div className="text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                Question {questionCount + 1} of ~40
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-800">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3 bg-white/50 backdrop-blur-sm" />
                <div
                  className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${currentStreamColor.bg} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {currentStream && (
            <div className="text-center mb-6 animate-slide-in">
              <div
                className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${currentStreamColor.bg} text-white rounded-full shadow-lg animate-pulse-glow`}
              >
                <span className="text-sm font-semibold">Exploring: {currentStream}</span>
              </div>
            </div>
          )}

          <Card className="mb-8 glass border-0 shadow-2xl hover-lift animate-bounce-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl md:text-2xl leading-relaxed text-balance text-gray-800 font-semibold">
                {currentQuestion.Question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 justify-center">
                <Button
                  size="lg"
                  onClick={() => handleAnswer("yes")}
                  className={`flex-1 max-w-xs bg-gradient-to-r ${currentStreamColor.bg} hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold py-4 text-lg`}
                >
                  Yes
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleAnswer("no")}
                  className="flex-1 max-w-xs hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 font-semibold py-4 text-lg"
                >
                  No
                </Button>
              </div>
            </CardContent>
          </Card>

          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            {Object.entries(scores).map(([stream, score], index) => {
              const streamColor = streamColors[stream as keyof typeof streamColors]
              const isCurrentStream = stream === currentStream

              return (
                <div
                  key={stream}
                  className={`glass p-4 rounded-xl border-0 shadow-lg hover-lift transition-all duration-300 ${
                    isCurrentStream ? "ring-2 ring-purple-400 animate-pulse-glow" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-xs font-medium text-gray-800 mb-2">{stream}</div>
                  <div
                    className={`text-3xl font-bold bg-gradient-to-r ${streamColor.bg} bg-clip-text text-transparent`}
                  >
                    {score}
                  </div>
                  <div className="text-xs text-gray-700 mt-1">
                    {noCounts[stream as keyof typeof noCounts]} no answers
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: "600ms" }}>
            <p className="text-sm text-gray-800 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-white/20">
              Every answer brings you closer to your perfect path!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
