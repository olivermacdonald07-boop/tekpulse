"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }
    if (!formData.agreeTerms) {
      setError("You must agree to the Terms & Conditions.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          studentId: formData.studentId,
        },
        emailRedirectTo: `${location.origin}/auth/login`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setShowCheckEmail(true);
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex w-full max-w-4xl min-h-[80vh] shadow-xl rounded-2xl overflow-hidden bg-white">
        {/* Left side: Image with overlay */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-[#2B7A78] to-[#3AAFA9] items-center justify-center">
          <img
            src="/campus-students.jpg"
            alt="Students"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
          />
          <div className="relative z-10 p-10 text-white text-left">
            <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">Create your Account</h2>
            <p className="text-lg font-medium drop-shadow-sm">
              Connect with other students and share experiences!
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        </div>
        {/* Right side: Form card */}
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-full max-w-md p-8 rounded-2xl shadow-none">
            {showCheckEmail ? (
              <div className="text-center mb-20">
                <p className="text-xl font-semibold mb-2 text-[#2B7A78]">Check your email</p>
                <p className="text-sm text-gray-500">
                  Please check your email for a verification link.
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-1 text-gray-900">Sign Up</h1>
                <p className="mb-6 text-gray-500">
                  Create your account to get started
                </p>
                <form onSubmit={handleSignup} className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="block mb-1 font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      required
                      className="rounded-lg border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#3AAFA9] focus:border-[#2B7A78] transition"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="block mb-1 font-medium text-gray-700">
                      Student Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@st.knust.edu.gh"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      required
                      className="rounded-lg border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#3AAFA9] focus:border-[#2B7A78] transition"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentId" className="block mb-1 font-medium text-gray-700">
                      Student ID
                    </Label>
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="ST001"
                      value={formData.studentId}
                      onChange={(e) => updateFormData("studentId", e.target.value)}
                      required
                      className="rounded-lg border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#3AAFA9] focus:border-[#2B7A78] transition"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="block mb-1 font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        required
                        className="rounded-lg border-gray-300 px-4 py-2 pr-12 focus:ring-2 focus:ring-[#3AAFA9] focus:border-[#2B7A78] transition"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateFormData("confirmPassword", e.target.value)
                      }
                      required
                      className="rounded-lg border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#3AAFA9] focus:border-[#2B7A78] transition"
                    />
                  </div>
                  <div className="flex items-center mb-1">
                    <input
                      id="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => updateFormData("agreeTerms", e.target.checked)}
                      required
                      className="rounded border-gray-300 focus:ring-2 focus:ring-[#2B7A78] mr-2"
                    />
                    <Label htmlFor="agreeTerms" className="text-sm text-gray-700 cursor-pointer">
                      I agree to the&nbsp;
                      <a
                        href="/terms"
                        className="text-[#2B7A78] underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms &amp; Conditions
                      </a>
                    </Label>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full rounded-lg bg-black hover:bg-gray-900 text-white font-semibold py-2 text-base shadow-md transition"
                    disabled={loading}
                  >
                    {loading ? "Signing up..." : "Sign Up"}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-[#2B7A78] hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Responsive BG image for mobile */}
      <div className="md:hidden fixed inset-0 -z-10">
        <img
          src="/campus-students.jpg"
          alt="Students"
          className="w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      </div>
    </div>
  );
}