"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

const unsplashUrl =
  "https://scontent.facc7-1.fna.fbcdn.net/v/t39.30808-6/480782457_1132763061972858_5591730858718956336_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFc59sk6Z5O_MPqd5J6uvsFZGQ9aqygCl5kZD1qrKAKXhIHeBlJhy2fSaKoWG8yBc3Np06rGBniDT9BMraj8VwT&_nc_ohc=lQHzw_7JJpkQ7kNvwFef22j&_nc_oc=AdlS2E2h8X-AMyRwfLVxII2FxE5otKNEXtg2sYDoqXWQ_F99maVIKacwBpoJPFWC4Bo&_nc_zt=23&_nc_ht=scontent.facc7-1.fna&_nc_gid=zWyIPde42V2fnqxd4SsyVQ&oh=00_AfUt1STzzIdqkfmxo3DtHV7YGhScjWVPeWXnBdwYhlwBvw&oe=68B4ACB6";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  };

  async function getUser(access_token: string | undefined = undefined) {
    if (!access_token) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser(access_token);
    return user;
  }

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get("access_token");

    if (accessToken) {
      getUser(accessToken).then((user) => {
        if (!user) return;
        supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: user.user_metadata.name,
            student_id: user.user_metadata.studentId,
          })
          .then(() => {
            localStorage.setItem("user", JSON.stringify(user));
          });

        router.push("/dashboard");
      });
    } else {
      getUser().then((user) => {
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          router.push("/dashboard");
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex w-full max-w-4xl min-h-[80vh] shadow-xl rounded-2xl overflow-hidden bg-white">
        {/* Left side: Image with overlay */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-[#2B7A78] to-[#3AAFA9] items-center justify-center">
          <img
            src={unsplashUrl}
            alt="Students"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
          />
          <div className="relative z-10 p-10 text-white text-left">
            <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">Welcome Back</h2>
            <p className="text-lg font-medium drop-shadow-sm">
              Login to access your campus services!
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        </div>
        {/* Right side: Form card */}
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-full max-w-md p-8 rounded-2xl shadow-none">
            <h1 className="text-2xl font-bold mb-1 text-gray-900">Log In</h1>
            <p className="mb-6 text-gray-500">Sign in to access your campus services</p>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email" className="block mb-1 font-medium text-gray-700">
                  Student Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button
                type="submit"
                className="w-full rounded-lg bg-black hover:bg-gray-900 text-white font-semibold py-2 text-base shadow-md transition"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Log In"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-[#2B7A78] hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Responsive BG image for mobile */}
      <div className="md:hidden fixed inset-0 -z-10">
        <img
          src={unsplashUrl}
          alt="Students"
          className="w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      </div>
    </div>
  );
}
