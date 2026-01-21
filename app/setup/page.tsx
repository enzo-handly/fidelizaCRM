"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const setupAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.error || "Failed to create admin user" })
      }
    } catch (error) {
      setResult({ success: false, message: "Network error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Initial Setup</CardTitle>
          <CardDescription>Create the default admin user for your CRM system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">enzo.galeano@handly.io</span>
            </div>
          </div>

          <Button onClick={setupAdmin} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating Admin..." : "Create Admin User"}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {result.success ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <XCircle className="h-4 w-4 mt-0.5" />}
                <AlertDescription>{result.message}</AlertDescription>
              </div>
            </Alert>
          )}

          {result?.success && (
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
