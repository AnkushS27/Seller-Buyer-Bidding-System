"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Briefcase, Star, ArrowRight, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ProjectBid</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Connect Buyers with Talented Sellers</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate platform for project bidding and management. Post your projects, receive competitive bids, and
            manage everything from start to completion.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Start as Buyer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="px-8">
                Join as Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Manage Projects</h2>
            <p className="text-lg text-gray-600">From project posting to completion, we've got you covered</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Post Projects</CardTitle>
                <CardDescription>Create detailed project listings with budget ranges and deadlines</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Receive Bids</CardTitle>
                <CardDescription>
                  Get competitive proposals from qualified sellers with detailed estimates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>Monitor project status, receive deliverables, and manage completion</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>Rate & Review</CardTitle>
                <CardDescription>Build trust with our rating and review system for quality assurance</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Stay updated with automatic email notifications for all project activities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>
                  Built with security in mind using modern authentication and data protection
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to get your project completed</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* For Buyers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">For Buyers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Badge className="mr-3 mt-1">1</Badge>
                    <div>
                      <h4 className="font-semibold">Post Your Project</h4>
                      <p className="text-sm text-gray-600">
                        Create a detailed project description with budget and timeline
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Badge className="mr-3 mt-1">2</Badge>
                    <div>
                      <h4 className="font-semibold">Review Bids</h4>
                      <p className="text-sm text-gray-600">Receive and evaluate proposals from qualified sellers</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Badge className="mr-3 mt-1">3</Badge>
                    <div>
                      <h4 className="font-semibold">Select & Manage</h4>
                      <p className="text-sm text-gray-600">
                        Choose your seller and track project progress to completion
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Sellers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">For Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Badge className="mr-3 mt-1">1</Badge>
                    <div>
                      <h4 className="font-semibold">Browse Projects</h4>
                      <p className="text-sm text-gray-600">Find projects that match your skills and expertise</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Badge className="mr-3 mt-1">2</Badge>
                    <div>
                      <h4 className="font-semibold">Submit Proposals</h4>
                      <p className="text-sm text-gray-600">Create compelling bids with your pricing and timeline</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Badge className="mr-3 mt-1">3</Badge>
                    <div>
                      <h4 className="font-semibold">Deliver Results</h4>
                      <p className="text-sm text-gray-600">
                        Complete the work and upload deliverables for client review
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of buyers and sellers already using our platform</p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="px-8">
              Create Your Account Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 ProjectBid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
