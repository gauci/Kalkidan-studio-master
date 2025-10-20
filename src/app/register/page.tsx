
import { AuthForm } from "@/components/shared/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EthiopianPattern } from "@/components/icons/ethiopian-pattern";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background py-12">
      <div className="absolute inset-0 z-0">
        <EthiopianPattern className="opacity-20" />
      </div>
      <div className="relative z-10 w-full max-w-md p-4">
        <Card className="border-primary shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Register for Membership</CardTitle>
            <CardDescription>
              Submit your application to join Kalkidan e.V.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm mode="register" />
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline text-accent hover:text-accent/80">
                Log in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
