"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Loader2, Database, Users, Zap } from "lucide-react"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupData, setSetupData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSetup = async (method: "prisma" | "serverless" | "data-only") => {
    setIsLoading(true)
    setError(null)

    try {
      let endpoint = "/api/prisma-setup"
      if (method === "serverless") endpoint = "/api/serverless-setup"
      if (method === "data-only") endpoint = "/api/data-only-setup"

      const response = await fetch(endpoint, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setSetupComplete(true)
        setSetupData(data.data)
        toast({
          title: "Success!",
          description: `Database setup completed using ${data.data?.method || method} method`,
        })
      } else {
        setError(data.error || data.message)
        toast({
          title: "Setup Failed",
          description: data.message || "Failed to set up database",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "Something went wrong during setup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/db-status")
      const data = await response.json()

      if (data.success) {
        setSetupComplete(true)
        setSetupData(data.data)
        toast({
          title: "Database Ready",
          description: "Database is already set up and ready to use",
        })
      } else {
        toast({
          title: "Database Not Ready",
          description: "Database needs to be set up",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Check Failed",
        description: "Could not check database status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {setupComplete ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600" />
            )}
            Database Setup
          </CardTitle>
          <CardDescription>
            {setupComplete
              ? "Your database is ready to use!"
              : "Initialize your database to start using the application"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!setupComplete ? (
            <>
              <div className="text-sm text-gray-600 space-y-2">
                <p>This will create:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>PostgreSQL enums (UserType, ProjectStatus)</li>
                  <li>All necessary database tables</li>
                  <li>Sample buyer and seller accounts</li>
                  <li>Sample project with bid</li>
                </ul>
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                  <p className="font-semibold">Setup Error:</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Button onClick={() => handleSetup("prisma")} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Prisma Setup (Recommended)
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleSetup("serverless")}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Serverless Setup
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleSetup("data-only")}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Data Only Setup
                    </>
                  )}
                </Button>

                <Button onClick={checkStatus} variant="ghost" className="w-full">
                  Check Database Status
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <strong>Prisma Setup:</strong> Complete schema and data creation using Prisma only
                </p>
                <p>
                  <strong>Serverless:</strong> Alternative approach with different error handling
                </p>
                <p>
                  <strong>Data Only:</strong> Creates sample data only (requires existing schema)
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                <p className="font-semibold">Setup Complete!</p>
                <p>Database is ready. You can now use the application.</p>
                {setupData?.method && <p className="text-xs mt-1">Method: {setupData.method}</p>}
              </div>

              {setupData && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-semibold">Test Accounts:</p>
                  <ul className="space-y-1">
                    <li>• Buyer: buyer@example.com</li>
                    <li>• Seller: seller@example.com</li>
                  </ul>
                  {setupData.userCount !== undefined && (
                    <p className="text-xs text-gray-500">
                      Users: {setupData.userCount} | Projects: {setupData.projectCount}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a href="/auth/login">Go to Login</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/">Home</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
