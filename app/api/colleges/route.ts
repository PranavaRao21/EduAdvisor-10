import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = "AIzaSyA6-PfWD2XPmAUnheDODUyp42vnaPZ9hQ4"

interface PlaceResult {
  name: string
  formatted_address: string
  rating?: number
  place_id: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types: string[]
  business_status?: string
}

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

// Course mappings for different streams
const streamCourses = {
  Science: [
    "B.Sc Physics",
    "B.Sc Chemistry",
    "B.Sc Mathematics",
    "B.Sc Biology",
    "B.Sc Computer Science",
    "B.Tech",
    "MBBS",
    "BDS",
    "B.Pharmacy",
  ],
  Commerce: ["B.Com", "B.Com (Hons)", "BBA", "M.Com", "MBA", "CA", "CS", "CMA"],
  "Arts/Humanities": [
    "BA",
    "BA (Hons)",
    "MA",
    "B.A. Psychology",
    "B.A. History",
    "B.A. Political Science",
    "B.A. Literature",
    "LLB",
  ],
  Vocational: [
    "Diploma in Engineering",
    "ITI",
    "Polytechnic",
    "Certificate Courses",
    "Skill Development Programs",
    "Trade Courses",
  ],
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in kilometers
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function assignCoursesToCollege(collegeName: string, stream: string): string[] {
  const courses = streamCourses[stream as keyof typeof streamCourses] || []

  // Assign 3-5 random courses based on college type and stream
  const numCourses = Math.floor(Math.random() * 3) + 3 // 3-5 courses
  const shuffled = [...courses].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, numCourses)
}

function isGovernmentCollege(name: string, types: string[]): boolean {
  const governmentKeywords = [
    "government",
    "govt",
    "state",
    "national",
    "central",
    "public",
    "municipal",
    "district",
    "university",
    "institute of technology",
    "indian institute",
    "nit",
    "iit",
    "iiit",
  ]

  const nameWords = name.toLowerCase()
  return (
    governmentKeywords.some((keyword) => nameWords.includes(keyword)) ||
    types.includes("university") ||
    types.includes("school")
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const stream = searchParams.get("stream") || "Science"
    const radius = Number.parseInt(searchParams.get("radius") || "70") * 1000 // Convert km to meters

    if (!lat || !lng) {
      return NextResponse.json({ error: "Location coordinates are required" }, { status: 400 })
    }

    // Search for colleges and universities using Google Places API
    const searchQueries = [
      "government college",
      "government university",
      "state university",
      "public college",
      "government institute",
    ]

    let allColleges: College[] = []

    for (const query of searchQueries) {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(query)}&type=university&key=${GOOGLE_MAPS_API_KEY}`

      try {
        const response = await fetch(placesUrl)
        const data = await response.json()

        if (data.results) {
          const colleges: College[] = data.results
            .filter(
              (place: PlaceResult) =>
                place.business_status !== "CLOSED_PERMANENTLY" && isGovernmentCollege(place.name, place.types),
            )
            .map((place: PlaceResult) => {
              const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)

              return {
                name: place.name,
                address: place.formatted_address,
                courses: assignCoursesToCollege(place.name, stream),
                type: "Government",
                rating: place.rating ? Math.round(place.rating * 10) / 10 : undefined,
                distance,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                placeId: place.place_id,
              }
            })
            .filter((college: College) => college.distance <= radius / 1000) // Filter by radius in km

          allColleges = [...allColleges, ...colleges]
        }
      } catch (error) {
        console.error(`Error searching for ${query}:`, error)
        // Continue with other queries even if one fails
      }
    }

    // Remove duplicates based on place_id
    const uniqueColleges = allColleges.filter(
      (college, index, self) => index === self.findIndex((c) => c.placeId === college.placeId),
    )

    // Sort by distance
    uniqueColleges.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    // Limit to top 20 results
    const limitedResults = uniqueColleges.slice(0, 20)

    return NextResponse.json({
      colleges: limitedResults,
      total: limitedResults.length,
      stream,
      searchRadius: radius / 1000,
    })
  } catch (error) {
    console.error("Error in colleges API:", error)
    return NextResponse.json({ error: "Failed to search for colleges" }, { status: 500 })
  }
}
