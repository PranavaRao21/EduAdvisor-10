"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const ArrowLeftIcon = () => <div className="w-4 h-4 flex items-center justify-center text-current">←</div>

interface BranchQuizProps {
  stream: string
  onComplete: (branch: string) => void
  onBack: () => void
}

export function BranchQuiz({ stream, onComplete, onBack }: BranchQuizProps) {
  const [currentBranch, setCurrentBranch] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [noCount, setNoCount] = useState(0)

  const branchQuestions = {
    Science: {
      PCMB: [
        "Do you enjoy both Mathematics and Biology subjects?",
        "Would you like flexibility to choose between Medical and Engineering later?",
        "Are you interested in fields like Biotechnology, Bioinformatics, or Life Sciences?",
      ],
      PCMC: [
        "Do you enjoy Mathematics and Computer Science?",
        "Would you like to pursue a career in IT, Software, or Data Science?",
        "Are you interested in coding, programming, or technology-driven fields?",
      ],
    },
    Commerce: {
      "With Math": [
        "Do you enjoy working with numbers and statistics?",
        "Would you like to study Economics, CA, or CFA?",
        "Do you prefer solving logical and analytical problems?",
      ],
      "Without Math": [
        "Do you prefer Business/Management studies?",
        "Are you interested in Marketing, HR, or Law?",
        "Do you like practical commerce applications without too much calculation?",
      ],
    },
    "Arts/Humanities": {
      "Social Sciences": [
        "Are you interested in History and Political Science?",
        "Do you like understanding society and human behavior?",
        "Would you like a career in Civil Services or Social Work?",
      ],
      "Literature & Media": [
        "Do you enjoy reading, writing, or storytelling?",
        "Are you interested in Journalism or Mass Communication?",
        "Would you like to pursue English Literature or Psychology?",
      ],
      "Fine Arts": [
        "Do you love painting, music, or performing arts?",
        "Would you enjoy a career in creative design or theatre?",
        "Do you have a passion for artistic expression?",
      ],
    },
    Vocational: {
      "IT & Computers": [
        "Do you enjoy working on computers and software?",
        "Would you like a career in IT or coding?",
        "Are you interested in new technologies and digital tools?",
      ],
      "Hospitality & Tourism": [
        "Do you like interacting with people and helping them?",
        "Would you enjoy working in hotels or tourism?",
        "Are you interested in travel, events, or hospitality?",
      ],
      "Design & Fashion": [
        "Do you enjoy creative designing?",
        "Would you like a career in fashion, interior, or product design?",
        "Are you passionate about creativity and aesthetics?",
      ],
    },
  }

  const streamBranches = branchQuestions[stream as keyof typeof branchQuestions]

  if (!streamBranches) {
    onComplete("No branches available")
    return null
  }

  const branches = Object.keys(streamBranches)

  // Initialize scores if not done
  if (Object.keys(scores).length === 0) {
    const initialScores: Record<string, number> = {}
    branches.forEach((branch) => {
      initialScores[branch] = 0
    })
    setScores(initialScores)
    setCurrentBranch(branches[0])
  }

  const handleAnswer = (answer: "yes" | "no") => {
    if (!currentBranch) return

    // Special handling for Science stream (PCMB with jump rule)
    if (stream === "Science" && currentBranch === "PCMB") {
      if (answer === "no") {
        const newNoCount = noCount + 1
        setNoCount(newNoCount)

        if (newNoCount >= 2) {
          // Switch to PCMC
          setCurrentBranch("PCMC")
          setCurrentQuestionIndex(0)
          setNoCount(0)
          return
        }
      }

      if (answer === "yes") {
        setScores((prev) => ({ ...prev, [currentBranch]: prev[currentBranch] + 1 }))
      }

      const nextIndex = currentQuestionIndex + 1
      const questions = streamBranches[currentBranch as keyof typeof streamBranches]

      if (nextIndex >= questions.length) {
        onComplete(`${currentBranch} under ${stream}`)
        return
      }

      setCurrentQuestionIndex(nextIndex)
      return
    }

    // Default handling for other streams
    if (answer === "yes") {
      setScores((prev) => ({ ...prev, [currentBranch]: prev[currentBranch] + 1 }))
    }

    const nextIndex = currentQuestionIndex + 1
    const questions = streamBranches[currentBranch as keyof typeof streamBranches]

    if (nextIndex >= questions.length) {
      // Move to next branch or complete
      const currentBranchIndex = branches.indexOf(currentBranch)
      if (currentBranchIndex < branches.length - 1) {
        setCurrentBranch(branches[currentBranchIndex + 1])
        setCurrentQuestionIndex(0)
      } else {
        // All branches completed, find best score
        const bestBranch = Object.entries(scores).reduce((a, b) => (scores[a[0]] > scores[b[0]] ? a : b))[0]

        if (scores[bestBranch] === 0) {
          onComplete(`No clear branch preference in ${stream}`)
        } else {
          onComplete(`${bestBranch} under ${stream}`)
        }
      }
    } else {
      setCurrentQuestionIndex(nextIndex)
    }
  }

  if (!currentBranch) return null

  const questions = streamBranches[currentBranch as keyof typeof streamBranches]
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = Object.values(streamBranches).reduce((sum, qs) => sum + qs.length, 0)
  const completedQuestions =
    branches
      .slice(0, branches.indexOf(currentBranch))
      .reduce((sum, branch) => sum + streamBranches[branch as keyof typeof streamBranches].length, 0) +
    currentQuestionIndex
  const progress = (completedQuestions / totalQuestions) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeftIcon />
                <span className="ml-2">Back</span>
              </Button>
              <div className="text-sm text-muted-foreground">Finding your {stream} branch</div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Branch Indicator */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-medium text-primary">Evaluating: {currentBranch}</span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed text-balance">{currentQuestion}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => handleAnswer("yes")} className="flex-1 max-w-xs">
                  Yes
                </Button>
                <Button size="lg" variant="outline" onClick={() => handleAnswer("no")} className="flex-1 max-w-xs">
                  No
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Branch Scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            {Object.entries(scores).map(([branch, score]) => (
              <div
                key={branch}
                className={`bg-card p-3 rounded-lg border ${branch === currentBranch ? "ring-2 ring-primary" : ""}`}
              >
                <div className="text-sm font-medium">{branch}</div>
                <div className="text-2xl font-bold text-primary">{score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
