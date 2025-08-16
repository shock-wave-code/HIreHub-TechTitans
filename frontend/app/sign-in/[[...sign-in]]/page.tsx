import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your internship portal account</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-sm normal-case",
              card: "shadow-xl border-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50",
              formFieldInput: "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500",
              footerActionLink: "text-emerald-600 hover:text-emerald-700",
            },
          }}
          redirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
