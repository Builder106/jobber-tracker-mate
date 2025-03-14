
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { BsMicrosoft } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/layout/AuthLayout";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const navigate = useNavigate();
  const { login, signInWithMicrosoft, signInWithGoogle } = useAuth();
  
  // If a plan is specified in the URL, default to signup mode
  const [isLogin, setIsLogin] = useState(!plan);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const authSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    ...((!isLogin) && {
      confirmPassword: z.string()
    })
  }).refine(data => {
    if (!isLogin) {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

  const form = useForm<z.infer<typeof authSchema> & { confirmPassword?: string }>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof authSchema>) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(values.email, values.password);
      } else {
        // Here you would implement signup functionality
        // For now, we'll simulate it with login
        await login(values.email, values.password);
        
        // If there's a plan parameter, you might want to store that information
        if (plan) {
          console.log(`User signed up with ${plan} plan`);
          // Here you would typically store the plan selection in your database
        }
      }
      navigate("/applications");
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout className="flex justify-center items-center">
      <div className="w-full max-w-md p-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isLogin ? "Welcome back" : plan ? `Sign up for ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan` : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin 
              ? "Enter your credentials to sign in to your account" 
              : plan ? "Start your 14-day free trial today" : "Enter your information to create your account"}
          </p>
        </div>

        <Card className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            type="email" 
                            placeholder="name@example.com"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel htmlFor="password">Password</FormLabel>
                          {isLogin && (
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-xs"
                              type="button"
                            >
                              Forgot password?
                            </Button>
                          )}
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              autoComplete={isLogin ? "current-password" : "new-password"}
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading 
                      ? "Loading..." 
                      : isLogin ? "Sign In" : "Create Account"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      type="button" 
                      disabled={isLoading}
                      onClick={signInWithMicrosoft}
                    >
                      <BsMicrosoft className="mr-2 h-4 w-4" />
                      Microsoft
                    </Button>
                    <Button 
                      variant="outline" 
                      type="button" 
                      disabled={isLoading}
                      onClick={signInWithGoogle}
                    >
                      <FcGoogle className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-muted-foreground">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      form.reset();
                    }}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </Button>
                </div>
                {plan && (
                  <div className="text-sm text-center p-3 bg-primary/10 rounded-md border border-primary/20">
                    <div className="font-medium text-primary mb-1">
                      {plan === 'pro' ? 'Pro Plan Selected' : plan === 'premium' ? 'Premium Plan Selected' : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Selected`}
                    </div>
                    <div className="text-muted-foreground">
                      {plan === 'pro' ? 
                        'Includes unlimited applications, advanced tracking, and interview prep tools.' : 
                        plan === 'premium' ? 
                        'Includes all Pro features plus resume analysis and priority support.' : 
                        'You can change your plan anytime after signup.'}
                    </div>
                    <div className="mt-2 text-xs">
                      Your 14-day free trial starts today. No credit card required.
                    </div>
                  </div>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default Auth;
