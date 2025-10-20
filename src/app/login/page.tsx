
import { AuthForm } from "@/components/shared/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EthiopianPattern } from "@/components/icons/ethiopian-pattern";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 z-0">
        <EthiopianPattern className="opacity-20" />
      </div>
      <div className="relative z-10 w-full max-w-md p-4">
        <Card className="border-primary shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Member Login</CardTitle>
            <CardDescription>
              Access your member profile and community resources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm mode="login" />
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline text-accent hover:text-accent/80">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
