
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { SecurityUtils } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long.")
    .refine((name) => {
      const validation = SecurityUtils.validateEmail(name + "@test.com"); // Just to use the sanitization logic
      return !name.includes('<') && !name.includes('>') && !name.includes('"');
    }, "Name contains invalid characters"),
  phone: z.string()
    .min(5, "Please enter a valid phone number.")
    .max(20, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  address: z.string()
    .min(5, "Please enter a valid address.")
    .max(200, "Address is too long.")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .email("Please enter a valid email address.")
    .max(254, "Email address is too long.")
    .refine((email) => {
      const validation = SecurityUtils.validateEmail(email);
      return validation.isValid;
    }, "Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long.")
    .refine((password) => {
      const validation = SecurityUtils.validatePassword(password);
      return validation.isValid;
    }, "Password must contain at least 3 of: uppercase, lowercase, number, special character")
    .refine((password) => {
      return !SecurityUtils.isCommonPassword(password);
    }, "Please choose a less common password"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const schema = isLogin ? loginSchema : registerSchema;
  type FormValues = z.infer<typeof schema>;

  const { toast } = useToast();
  const router = useRouter();
  
  // Safely get auth context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // Auth context not available
    authContext = null;
  }
  
  const { login, register } = authContext || { login: null, register: null };
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining?: number;
    resetTime?: number;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  
  const getDefaultValues = () => {
    if (isLogin) {
      return {
        email: "",
        password: "",
      };
    }
    return {
      name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues() as FormValues,
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    
    try {
      // Simplified rate limiting check - fail open if there are issues
      let rateLimitOk = true;
      try {
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const identifier = data.email;
        
        const rateLimitCheck = await SecurityUtils.checkRateLimit(endpoint, identifier);
        if (!rateLimitCheck.allowed) {
          toast({
            title: "Too Many Attempts",
            description: "Please wait a few minutes before trying again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        setRateLimitInfo({
          remaining: rateLimitCheck.remaining,
          resetTime: rateLimitCheck.resetTime,
        });
      } catch (rateLimitError) {
        console.warn('Rate limit check failed, proceeding anyway:', rateLimitError);
        // Continue with login/registration even if rate limit check fails
      }

      if (isLogin) {
        if (!login) {
          throw new Error("Please wait a moment for the system to initialize, then try again.");
        }
        
        await login(data.email, data.password);
        
        toast({
          title: "Welcome back!",
          description: "Taking you to your dashboard...",
        });
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
        
      } else {
        if (!register) {
          throw new Error("Please wait a moment for the system to initialize, then try again.");
        }
        
        // Remove confirmPassword before sending to backend
        const { confirmPassword, ...registerData } = data as any;
        await register(registerData);
        
        toast({
          title: "Account Created!",
          description: "Please log in with your new account.",
        });
        
        setTimeout(() => {
          router.push("/auth/login");
        }, 500);
      }
      
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      
      console.error('Auth error:', error);
      
      // Simplified error handling
      if (errorMessage.includes('initializ') || errorMessage.includes('not available')) {
        toast({
          title: "System Starting Up",
          description: "Please wait a few seconds and try again.",
          variant: "default",
        });
      } else if (errorMessage.includes('credentials') || errorMessage.includes('Invalid')) {
        toast({
          title: "Login Failed",
          description: "Please check your email and password and try again.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('exists')) {
        toast({
          title: "Account Already Exists",
          description: "An account with this email already exists. Please try logging in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again. If the problem continues, please contact support.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const handlePasswordChange = (password: string) => {
    if (!isLogin && password) {
      const validation = SecurityUtils.validatePassword(password);
      setPasswordStrength(validation.strength || '');
    }
  };

  // Show loading state if auth service isn't ready
  if (!authContext) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-pulse">
            <p className="text-muted-foreground">Initializing authentication...</p>
            <p className="text-xs text-muted-foreground mt-2">This should only take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isLogin && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
         {!isLogin && (
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Phone Number" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {!isLogin && (
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Street, City, Postal Code" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} value={field.value || ""} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="********" 
                  {...field} 
                  value={field.value || ""} 
                  onChange={(e) => {
                    field.onChange(e);
                    handlePasswordChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
              {!isLogin && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Must contain at least 3 of: uppercase, lowercase, number, special character
                  </p>
                  {passwordStrength && (
                    <p className={`text-xs font-medium ${
                      passwordStrength === 'Very Strong' ? 'text-green-600' :
                      passwordStrength === 'Strong' ? 'text-blue-600' :
                      passwordStrength === 'Medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      Strength: {passwordStrength}
                    </p>
                  )}
                </div>
              )}
            </FormItem>
          )}
        />
        {!isLogin && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button 
          type="submit" 
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          disabled={isLoading}
        >
          {isLoading ? "Please wait..." : (isLogin ? "Log In" : "Register")}
        </Button>
        
        {/* Rate limit info */}
        {rateLimitInfo.remaining !== undefined && (
          <p className="text-xs text-muted-foreground text-center">
            {rateLimitInfo.remaining} attempts remaining
          </p>
        )}
        {isLogin && (
            <div className="text-center text-sm">
                <Link href="#" className="underline text-accent hover:text-accent/80">Forgot Password?</Link>
            </div>
        )}
      </form>
    </Form>
  );
}
