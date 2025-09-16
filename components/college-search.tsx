"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, Phone, Globe, Star, Navigation, Search } from "lucide-react"

const MapIcon = () => <div className="w-5 h-5 flex items-center justify-center">🗺️</div>
const SchoolIcon = () => <div className="w-6 h-6 flex items-center justify-center">🏫</div>
const LocationIcon = () => <div className="w-4 h-4 flex items-center justify-center">📍</div>

interface College {
  name: string
  address: string
  courses: string[]
  type: string
  rating?: number
  phone?: string
  website?: string
  distance?: number
  lat?: number
  lng?: number
  placeId?: string
}

interface CollegeSearchProps {
  stream: string
  onBack: () => void
}

export function CollegeSearch({ stream, onBack }: CollegeSearchProps) {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchRadius, setSearchRadius] = useState(70)
  const [locationError, setLocationError] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          searchNearbyColleges(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          setLocationError("Unable to get your location. Please enable location services.")
          setLoading(false)
        },
      )
    } else {
      setLocationError("Geolocation is not supported by this browser.")
      setLoading(false)
    }
  }, [stream])

  const searchNearbyColleges = async (lat: number, lng: number) => {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/colleges?lat=${lat}&lng=${lng}&stream=${encodeURIComponent(stream)}&radius=${searchRadius}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch colleges")
      }

      const data = await response.json()
      setColleges(data.colleges || [])
    } catch (error) {
      console.error("Error searching colleges:", error)
      setLocationError("Failed to search for colleges. Please try again.")
      setColleges([])
    } finally {
      setLoading(false)
    }
  }

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius)
    if (userLocation) {
      searchNearbyColleges(userLocation.lat, userLocation.lng)
    }
  }

  const openInMaps = (college: College) => {
    if (college.placeId) {
      window.open(`https://www.google.com/maps/place/?q=place_id:${college.placeId}`, "_blank")
    } else {
      const query = encodeURIComponent(`${college.name} ${college.address}`)
      window.open(`https://www.google.com/maps/search/${query}`, "_blank")
    }
  }

  const getDirections = (college: College) => {
    if (userLocation && college.lat && college.lng) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${college.lat},${college.lng}`
      window.open(url, "_blank")
    } else {
      openInMaps(college)
    }
  }

  const filteredColleges = colleges.filter(
    (college) =>
      college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.courses.some((course) => course.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const streamColors = {
    Science: "from-blue-500 to-cyan-500",
    Commerce: "from-green-500 to-emerald-500",
    "Arts/Humanities": "from-purple-500 to-pink-500",
    Vocational: "from-orange-500 to-red-500",
  }

  const streamColor = streamColors[stream as keyof typeof streamColors] || streamColors.Science

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={onBack} className="hover:bg-white/50">
              <div className="w-4 h-4 mr-2">←</div>
              Back to Results
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Search Radius</div>
                <select
                  value={searchRadius}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="text-lg font-semibold bg-transparent border-none outline-none"
                >
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={70}>70 km</option>
                  <option value={100}>100 km</option>
                </select>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${streamColor} mb-4 animate-pulse`}
            >
              <SchoolIcon />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Government Colleges for {stream}</h1>
            <p className="text-gray-600 text-lg">
              Find the best government colleges near you offering {stream} courses
            </p>
            {locationError && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
                {locationError}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search colleges, courses, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">Searching for colleges near you...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {!loading && filteredColleges.length > 0 && (
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Found <span className="font-semibold text-gray-800">{filteredColleges.length}</span> government colleges
                within <span className="font-semibold text-gray-800">{searchRadius}km</span> offering {stream} courses
              </p>
            </div>
          )}

          {/* Colleges Grid */}
          {!loading && filteredColleges.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredColleges.map((college, index) => (
                <Card
                  key={college.placeId || index}
                  className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-800 leading-tight mb-2">
                          {college.name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <LocationIcon />
                          <span className="ml-1 line-clamp-2">{college.address}</span>
                        </div>
                        {college.distance && (
                          <div className="flex items-center text-sm text-blue-600 font-medium">
                            <Navigation className="w-3 h-3 mr-1" />
                            {college.distance} km away
                          </div>
                        )}
                      </div>
                      {college.rating && (
                        <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-green-800">{college.rating}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Courses */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Available Courses</h4>
                      <div className="flex flex-wrap gap-1">
                        {college.courses.slice(0, 3).map((course, courseIndex) => (
                          <Badge
                            key={courseIndex}
                            variant="secondary"
                            className={`text-xs bg-gradient-to-r ${streamColor} text-white`}
                          >
                            {course}
                          </Badge>
                        ))}
                        {college.courses.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{college.courses.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    {(college.phone || college.website) && (
                      <div className="space-y-1">
                        {college.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-2" />
                            <span>{college.phone}</span>
                          </div>
                        )}
                        {college.website && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Globe className="w-3 h-3 mr-2" />
                            <span className="truncate">{college.website}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => openInMaps(college)}
                        className={`flex-1 bg-gradient-to-r ${streamColor} hover:shadow-lg`}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        View on Map
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => getDirections(college)}
                        className="flex-1 hover:bg-gray-50"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredColleges.length === 0 && !locationError && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏫</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No colleges found</h3>
              <p className="text-gray-600 mb-4">
                No government colleges found within {searchRadius}km radius for {stream} stream.
              </p>
              <Button onClick={() => handleRadiusChange(100)} className={`bg-gradient-to-r ${streamColor}`}>
                Try searching within 100km
              </Button>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Contact the colleges directly for admission requirements, fees, and application procedures.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button variant="outline" className="hover:bg-gray-50 bg-transparent">
                    Admission Guidelines
                  </Button>
                  <Button variant="outline" className="hover:bg-gray-50 bg-transparent">
                    Fee Structure
                  </Button>
                  <Button variant="outline" className="hover:bg-gray-50 bg-transparent">
                    Scholarship Info
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
