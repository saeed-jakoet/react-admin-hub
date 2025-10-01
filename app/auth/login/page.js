"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Eye, EyeOff, AlertCircle, Shield, Network } from "lucide-react";
import Link from "next/link";

// Hardcoded credentials
const ADMIN_CREDENTIALS = {
  email: "admin@fibre.africa",
  password: "FibreAdmin2024!"
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate loading delay for professional feel
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Simulate API response
      const apiResponse = {
        status: "success",
        message: "Success",
        data: {
          user: {
            user_metadata: {
              firstName: "saeed",
              role: "super_admin",
              email: "jakoetsaeed@gmail.com"
            }
          },
          session: {
            access_token: "eyJhbGciOiJIUzI1NiIsImtpZCI6Ii9HTDRaNFhjS2x6UXJOYWUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21uc3dvZHlhcGxncWFoYW1wbHlmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1NWZhMDNiMC1jYWU2LTQyOGYtOTg2Ny00MTEzNDJkNDhjMmIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU5MzQ1ODIyLCJpYXQiOjE3NTkzNDIyMjIsImVtYWlsIjoiamFrb2V0c2FlZWRAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6Impha29ldHNhZWVkQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJzdE5hbWUiOiJzYWVlZCIsInBob25lTnVtYmVyIjoiKzI3Nzk2OTU3OTMiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInJvbGUiOiJzdXBlcl9hZG1pbiIsInN1YiI6IjU1ZmEwM2IwLWNhZTYtNDI4Zi05ODY3LTQxMTM0MmQ0OGMyYiIsInN1cm5hbWUiOiJqYWtvZXQifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc1OTM0MjIyMn1dLCJzZXNzaW9uX2lkIjoiZjM1YWY1ZTctNDgzZS00ZmRkLWJiZTEtNzBjYzRjM2Q2OWI0IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.Qf3QEbUKReyIQEfkU4EcsyfTwkzkYhQSZtFFQJRg5Do"
          }
        }
      };
      const { firstName, email: userEmail, role } = apiResponse.data.user.user_metadata;
      const accessToken = apiResponse.data.session.access_token;
      console.log("First Name:", firstName);
      console.log("Email:", userEmail);
      console.log("Role:", role);
      console.log("Access Token:", accessToken);
      // Use auth context to login
      login(userEmail);
    } else {
      setError("Invalid email or password. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>
      
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <CardHeader className="space-y-6 text-center pb-8">
          {/* Logo */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
            <Zap className="h-8 w-8 text-white" />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Fiber Africa
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Business Command Center
            </CardDescription>
          </div>
          
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Secure Access Portal
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@fibre.africa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-muted/50 border-border/50 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required 
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-muted/50 border-border/50 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                  required 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Access Command Center
                </div>
              )}
            </Button>
          </form>
          
          {/* Forgot Password Link */}
          <div className="flex flex-col gap-4 mt-2">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:underline text-center font-medium transition-colors"
            >
              Forgot password?
            </Link>
            {/* Demo Credentials */}
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-muted-foreground text-center mb-2 font-medium">Demo Credentials:</p>
              <div className="text-xs text-center space-y-1">
                <p className="font-mono text-blue-600">admin@fibre.africa</p>
                <p className="font-mono text-blue-600">FibreAdmin2024!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}