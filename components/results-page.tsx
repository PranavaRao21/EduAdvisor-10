"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CollegeSearch } from "@/components/college-search"

const ArrowLeftIcon = () => <div className="w-4 h-4 flex items-center justify-center text-gray-600">←</div>

const BookOpenIcon = () => <div className="w-8 h-8 flex items-center justify-center">📚</div>

const BriefcaseIcon = () => <div className="w-6 h-6 flex items-center justify-center text-gray-700">💼</div>

const GraduationCapIcon = () => <div className="w-6 h-6 flex items-center justify-center text-gray-700">🎓</div>

const LightbulbIcon = () => <div className="w-7 h-7 flex items-center justify-center text-gray-700">💡</div>

const StarIcon = () => <div className="w-5 h-5 flex items-center justify-center">⭐</div>

const TrendingUpIcon = () => <div className="w-8 h-8 flex items-center justify-center">📈</div>

const UsersIcon = () => <div className="w-8 h-8 flex items-center justify-center">👥</div>

const ZapIcon = () => <div className="w-8 h-8 flex items-center justify-center">⚡</div>

interface ResultsPageProps {
  stream: string
  onBack: () => void
  onRestart: () => void
}

const streamData = {
  Science: {
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
    icon: <ZapIcon />,
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    careers: ["Engineer", "Doctor", "Researcher", "Data Scientist", "Biotechnologist"],
    tips: [
      "Strong foundation in critical thinking and problem-solving",
      "Opens doors to prestigious and high-paying professions",
      "Flexibility to switch to Commerce or Arts later",
      "Prepares for competitive exams like NEET and JEE",
      "Global opportunities in research and development",
    ],
    description:
      "Science stream offers diverse career opportunities in engineering, medicine, research, and emerging fields like AI and biotechnology.",
  },
  Commerce: {
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
    icon: <TrendingUpIcon />,
    subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics"],
    careers: ["Chartered Accountant", "Financial Analyst", "Entrepreneur", "Investment Banker", "Marketing Manager"],
    tips: [
      "Strong foundation for entrepreneurship and business",
      "Industry-wide relevance and global career potential",
      "Diverse opportunities in finance, banking, and management",
      "Ideal for analytical minds with business acumen",
      "Growing demand in digital marketing and fintech",
    ],
    description:
      "Commerce stream provides excellent opportunities in business, finance, and entrepreneurship with strong industry connections.",
  },
  "Arts/Humanities": {
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    icon: <BookOpenIcon />,
    subjects: ["History", "Political Science", "Psychology", "Literature", "Sociology"],
    careers: ["Journalist", "Lawyer", "Psychologist", "Civil Servant", "Content Creator"],
    tips: [
      "Nurtures creativity and critical thinking skills",
      "Strong communication and analytical abilities",
      "Understanding of human society and culture",
      "Diverse career paths in media, law, and social work",
      "Growing opportunities in digital content and UX design",
    ],
    description:
      "Arts/Humanities stream develops creative thinking, communication skills, and deep understanding of society and human behavior.",
  },
  Vocational: {
    color: "from-orange-500 to-red-500",
    bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
    icon: <UsersIcon />,
    subjects: ["Technical Skills", "Practical Training", "Industry-Specific Knowledge"],
    careers: ["Technician", "Designer", "Chef", "Animator", "Skilled Tradesperson"],
    tips: [
      "Hands-on practical experience and skill development",
      "Early employment opportunities after training",
      "Industry-relevant skills with immediate application",
      "Growing demand in technical and creative fields",
      "Pathway to entrepreneurship in specialized domains",
    ],
    description:
      "Vocational training provides practical skills and hands-on experience for immediate employment in specialized fields.",
  },
}

export function ResultsPage({ stream, onBack, onRestart }: ResultsPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showColleges, setShowColleges] = useState(false)
  const data = streamData[stream as keyof typeof streamData] || streamData.Science

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleViewColleges = () => {
    setShowColleges(true)
  }

  const handleBackFromColleges = () => {
    setShowColleges(false)
  }

  if (showColleges) {
    return <CollegeSearch stream={stream} onBack={handleBackFromColleges} />
  }

  return (
    <div className={`min-h-screen ${data.bgColor} transition-all duration-1000`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={onBack} className="hover:bg-white/50">
              <ArrowLeftIcon />
              <span className="ml-2">Back</span>
            </Button>
            <Button onClick={onRestart} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
              Take Quiz Again
            </Button>
          </div>

          {/* Main Result Card */}
          <div
            className={`transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <Card className="mb-8 overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <div className={`h-2 bg-gradient-to-r ${data.color}`}></div>
              <CardHeader className="text-center pb-4">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${data.color} mb-4 mx-auto animate-pulse`}
                >
                  {data.icon}
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  🎉 Congratulations!
                </CardTitle>
                <div className="text-xl text-gray-800 mt-2">Your recommended stream is</div>
                <div className={`text-4xl font-bold bg-gradient-to-r ${data.color} bg-clip-text text-transparent mt-2`}>
                  {stream}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 text-center leading-relaxed mb-6">{data.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Subjects & Careers Grid */}
          <div
            className={`grid md:grid-cols-2 gap-6 mb-8 transform transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            {/* Core Subjects */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <GraduationCapIcon />
                  Core Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.subjects.map((subject, index) => (
                    <Badge
                      key={subject}
                      variant="secondary"
                      className={`bg-gradient-to-r ${data.color} text-white hover:scale-110 transition-transform duration-200 animate-fade-in`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Career Options */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BriefcaseIcon />
                  Career Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.careers.map((career, index) => (
                    <Badge
                      key={career}
                      variant="outline"
                      className={`border-2 hover:bg-gradient-to-r hover:${data.color} hover:text-white hover:border-transparent hover:scale-110 transition-all duration-200 animate-fade-in`}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {career}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips & Benefits */}
          <div
            className={`transform transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <LightbulbIcon />
                  Key Benefits & Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {data.tips.map((tip, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-white/50 to-transparent border-l-4 border-gradient-to-b ${data.color} hover:shadow-lg transition-all duration-300 animate-slide-in`}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <StarIcon />
                      <p className="text-gray-700 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <div
            className={`mt-8 text-center transform transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Ready to Start Your Journey?</h3>
                <p className="text-gray-800 mb-6 leading-relaxed">
                  Consult with your teachers, parents, and career counselors to make the final decision. Remember, this
                  is just a recommendation based on your interests!
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button
                    size="lg"
                    className={`bg-gradient-to-r ${data.color} hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                    onClick={onRestart}
                  >
                    Retake Assessment
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="hover:shadow-lg transform hover:scale-105 transition-all duration-200 bg-transparent border-2"
                    onClick={handleViewColleges}
                  >
                    🏫 Find Nearby Colleges
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="hover:shadow-lg transform hover:scale-105 transition-all duration-200 bg-transparent"
                  >
                    Get Career Guidance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
