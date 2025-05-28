"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, DollarSign, User, Clock, Upload, Download } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  budgetMin: number
  budgetMax: number
  deadline: string
  status: string
  buyer: { name: string; email: string }
  selectedSeller?: { name: string; email: string }
}

interface Bid {
  id: string
  amount: number
  estimatedDays: number
  message: string
  seller: { name: string; email: string }
}

interface Deliverable {
  id: string
  fileName: string
  fileUrl: string
  description?: string
  createdAt: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [userType, setUserType] = useState<"BUYER" | "SELLER" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showBidForm, setShowBidForm] = useState(false)
  const [showDeliverableForm, setShowDeliverableForm] = useState(false)

  const [bidForm, setBidForm] = useState({
    amount: "",
    estimatedDays: "",
    message: "",
  })

  const [deliverableForm, setDeliverableForm] = useState({
    fileName: "",
    fileUrl: "",
    description: "",
  })

  useEffect(() => {
    if (params.id) {
      fetchProjectData()
    }
  }, [params.id])

  const fetchProjectData = async () => {
    try {
      // Fetch project details
      const projectResponse = await fetch(`/api/projects/${params.id}`)
      if (!projectResponse.ok) {
        throw new Error("Project not found")
      }
      const projectData = await projectResponse.json()
      setProject(projectData)

      // Fetch bids
      const bidsResponse = await fetch(`/api/projects/${params.id}/bids`)
      if (bidsResponse.ok) {
        const bidsData = await bidsResponse.json()
        setBids(bidsData)
      }

      // Fetch deliverables
      const deliverablesResponse = await fetch(`/api/projects/${params.id}/deliverables`)
      if (deliverablesResponse.ok) {
        const deliverablesData = await deliverablesResponse.json()
        setDeliverables(deliverablesData)
      }

      // Determine user type from dashboard
      const dashboardResponse = await fetch("/api/dashboard")
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        setUserType(dashboardData.projects ? "BUYER" : "SELLER")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      })
      router.push("/projects")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form data
      if (!bidForm.amount || !bidForm.estimatedDays || !bidForm.message) {
        throw new Error("Please fill in all fields")
      }

      if (Number(bidForm.amount) <= 0) {
        throw new Error("Bid amount must be greater than 0")
      }

      if (Number(bidForm.estimatedDays) <= 0) {
        throw new Error("Estimated days must be greater than 0")
      }

      const response = await fetch(`/api/projects/${params.id}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bidForm),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bid submitted successfully",
        })
        setBidForm({ amount: "", estimatedDays: "", message: "" })
        setShowBidForm(false)
        fetchProjectData() // Refresh data
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to submit bid",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSeller = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/projects/${params.id}/select-seller`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sellerId }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Seller selected successfully",
        })
        fetchProjectData() // Refresh data
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to select seller",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleCompleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/complete`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project marked as completed",
        })
        fetchProjectData() // Refresh data
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to complete project",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/projects/${params.id}/deliverables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deliverableForm),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Deliverable uploaded successfully",
        })
        setDeliverableForm({ fileName: "", fileUrl: "", description: "" })
        setShowDeliverableForm(false)
        fetchProjectData() // Refresh data
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to upload deliverable",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
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
        <div className="text-lg">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Project not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Project Details</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                    <CardDescription className="mt-2">Posted by {project.buyer.name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Budget: ${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Deadline: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  {project.selectedSeller && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center text-sm text-blue-800">
                        <User className="w-4 h-4 mr-2" />
                        Selected Seller: {project.selectedSeller.name}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deliverables Section */}
            {project.status === "IN_PROGRESS" || project.status === "COMPLETED" ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Deliverables</CardTitle>
                    {userType === "SELLER" && project.status === "IN_PROGRESS" && (
                      <Button onClick={() => setShowDeliverableForm(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Deliverable
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {deliverables.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No deliverables uploaded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {deliverables.map((deliverable) => (
                        <div key={deliverable.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{deliverable.fileName}</h4>
                              {deliverable.description && (
                                <p className="text-gray-600 text-sm mt-1">{deliverable.description}</p>
                              )}
                              <p className="text-gray-400 text-xs mt-2">
                                Uploaded on {new Date(deliverable.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={deliverable.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Deliverable Upload Form */}
                  {showDeliverableForm && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-semibold mb-4">Upload New Deliverable</h4>
                      <form onSubmit={handleDeliverableSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="fileName">File Name</Label>
                          <Input
                            id="fileName"
                            value={deliverableForm.fileName}
                            onChange={(e) => setDeliverableForm({ ...deliverableForm, fileName: e.target.value })}
                            placeholder="e.g., final_design.zip"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="fileUrl">File URL</Label>
                          <Input
                            id="fileUrl"
                            value={deliverableForm.fileUrl}
                            onChange={(e) => setDeliverableForm({ ...deliverableForm, fileUrl: e.target.value })}
                            placeholder="https://example.com/file.zip"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            value={deliverableForm.description}
                            onChange={(e) => setDeliverableForm({ ...deliverableForm, description: e.target.value })}
                            placeholder="Brief description of the deliverable..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">Upload Deliverable</Button>
                          <Button type="button" variant="outline" onClick={() => setShowDeliverableForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Complete Project Button */}
                  {userType === "BUYER" && project.status === "IN_PROGRESS" && deliverables.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <Button onClick={handleCompleteProject} className="w-full">
                        Mark Project as Completed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bidding Section */}
            {project.status === "PENDING" && (
              <Card>
                <CardHeader>
                  <CardTitle>Place Your Bid</CardTitle>
                  <CardDescription>Submit your proposal for this project</CardDescription>
                </CardHeader>
                <CardContent>
                  {userType === "SELLER" ? (
                    <>
                      {!showBidForm ? (
                        <Button onClick={() => setShowBidForm(true)} className="w-full">
                          Place Bid
                        </Button>
                      ) : (
                        <form onSubmit={handleBidSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="amount">Bid Amount ($)</Label>
                            <Input
                              id="amount"
                              type="number"
                              value={bidForm.amount}
                              onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                              placeholder="5000"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="estimatedDays">Estimated Days</Label>
                            <Input
                              id="estimatedDays"
                              type="number"
                              value={bidForm.estimatedDays}
                              onChange={(e) => setBidForm({ ...bidForm, estimatedDays: e.target.value })}
                              placeholder="30"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="message">Proposal Message</Label>
                            <Textarea
                              id="message"
                              value={bidForm.message}
                              onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                              placeholder="Explain why you're the right fit for this project..."
                              rows={4}
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                              {isLoading ? "Submitting..." : "Submit Bid"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowBidForm(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">Only sellers can place bids on projects.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bids List */}
            <Card>
              <CardHeader>
                <CardTitle>Bids ({bids.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {bids.length === 0 ? (
                  <p className="text-gray-500 text-sm">No bids yet.</p>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div key={bid.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{bid.seller.name}</h4>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <DollarSign className="w-3 h-3 mr-1" />${bid.amount.toLocaleString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-3 h-3 mr-1" />
                              {bid.estimatedDays} days
                            </div>
                          </div>
                          {userType === "BUYER" && project.status === "PENDING" && (
                            <Button size="sm" onClick={() => handleSelectSeller(bid.seller.email)}>
                              Select
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{bid.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
