"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Plus, LogOut, Calendar, DollarSign, User, Clock } from "lucide-react"

interface DashboardUser {
  id: string
  name: string
  email: string
  userType: "BUYER" | "SELLER"
}

interface Project {
  id: string
  title: string
  description: string
  budgetMin: number
  budgetMax: number
  deadline: string
  status: string
  selectedSeller?: { name: string; email: string }
  _count?: { bids: number }
}

interface Bid {
  id: string
  amount: number
  estimatedDays: number
  message: string
  project: {
    id: string
    title: string
    status: string
    buyer: { name: string; email: string }
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (response.ok) {
        const data = await response.json()
        if (data.projects) {
          setProjects(data.projects)
          setUser({ userType: "BUYER" } as DashboardUser)
        } else {
          setBids(data.bids || [])
          setSelectedProjects(data.selectedProjects || [])
          setUser({ userType: "SELLER" } as DashboardUser)
        }
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              {user?.userType === "BUYER" ? "Buyer Dashboard" : "Seller Dashboard"}
            </h1>
            <div className="flex items-center space-x-4">
              {user?.userType === "BUYER" && (
                <Link href="/projects/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Project
                  </Button>
                </Link>
              )}
              <Link href="/projects">
                <Button variant="outline">Browse Projects</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.userType === "BUYER" ? (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Projects</h2>
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't posted any projects yet.</p>
                    <Link href="/projects/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Post Your First Project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />${project.budgetMin.toLocaleString()} - $
                            {project.budgetMax.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(project.deadline).toLocaleDateString()}
                          </div>
                          {project._count && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              {project._count.bids} bid(s)
                            </div>
                          )}
                          {project.selectedSeller && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Selected: {project.selectedSeller.name}
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* My Bids */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Bids</h2>
              {bids.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't placed any bids yet.</p>
                    <Link href="/projects">
                      <Button>Browse Projects</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bids.map((bid) => (
                    <Card key={bid.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{bid.project.title}</CardTitle>
                          <Badge className={getStatusColor(bid.project.status)}>
                            {bid.project.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <CardDescription>Buyer: {bid.project.buyer.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Your bid: ${bid.amount.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {bid.estimatedDays} days
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link href={`/projects/${bid.project.id}`}>
                            <Button variant="outline" className="w-full">
                              View Project
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Projects */}
            {selectedProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Projects</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {selectedProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Buyer: {project.buyer?.name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" className="w-full">
                              Manage Project
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
