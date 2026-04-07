// app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const businessTypes = [
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "RETAIL", label: "Retail Shop" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "SERVICE", label: "Service Business" },
  { value: "OTHER", label: "Other" },
];

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Account
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2: Business
    businessName: "",
    businessType: "",
    ownerName: "",
  });

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.businessName || !formData.businessType || !formData.ownerName) {
      setError("Please fill in all business details");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessType: formData.businessType,
          ownerName: formData.ownerName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Redirect to login with success message
      router.push("/auth/login?registered=true");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Step {step} of 2
        </p>
      </div>

      <div className="mt-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className={step >= 1 ? "text-indigo-600 dark:text-indigo-400 font-medium" : ""}>
              Account
            </span>
            <span className={step >= 2 ? "text-indigo-600 dark:text-indigo-400 font-medium" : ""}>
              Business
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
          {step === 1 ? (
            <>
              <Input
                label="Full Name"
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                leftIcon={<User className="h-5 w-5 text-gray-400" />}
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                placeholder="••••••••"
                hint="Must be at least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <Input
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Input
                label="Business Name"
                id="businessName"
                name="businessName"
                type="text"
                required
                leftIcon={<Building2 className="h-5 w-5 text-gray-400" />}
                placeholder="Acme Inc."
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />

              <Input
                label="Owner Name"
                id="ownerName"
                name="ownerName"
                type="text"
                required
                leftIcon={<User className="h-5 w-5 text-gray-400" />}
                placeholder="John Doe"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  required
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm px-3 py-2 border"
                >
                  <option value="">Select a type</option>
                  {businessTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={isLoading}
                  rightIcon={<Check className="h-4 w-4" />}
                >
                  Create Account
                </Button>
              </div>
            </>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}