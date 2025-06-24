import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LoginBackGround from "../../asset/LoginBackGround.jpg";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, user, isEmailConfirmed } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [apiError, setApiError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("[Register Page] MOUNTED.");
    if (user) {
      console.log("[Register Page] User exists. Checking email confirmation...");
      if (isEmailConfirmed) {
        navigate("/dashboard/investment-agent-lab");
      } else {
        navigate("/confirm");
      }
    }
  }, [user, isEmailConfirmed, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (apiError) setApiError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("-> Step 1: `handleRegister` triggered.");

    if (!form.username || !form.email || !form.password) {
      console.log("-> Step 2: Validation FAILED (fields empty).");
      setApiError("All fields are required.");
      return;
    }

    if (form.username.length < 3) {
      console.log("-> Step 2: Validation FAILED (username too short).");
      setApiError("Username must be at least 3 characters.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      console.log("-> Step 2: Validation FAILED (invalid email).");
      setApiError("Invalid email format.");
      return;
    }

    if (form.password.length < 4) {
      console.log("-> Step 2: Validation FAILED (password too short).");
      setApiError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    setApiError("");
    console.log("-> Step 2: Validation PASSED. Calling register.");

    try {
      console.log("-> Step 3: Calling `await register(...)`...");
      await register(form.username, form.email, form.password);

      console.log("-> Step 4: `register` successful.");
      toast({ title: "Registration Successful", description: isEmailConfirmed ? "Redirecting..." : "Please check your email to confirm." });
      if (isEmailConfirmed) {
        navigate("/dashboard/investment-agent-lab");
      } else {
        navigate("/confirm");
      }
    } catch (error: any) {
      console.log("-> Step 4: `register` FAILED.");
      setApiError(error.message || "Failed to create account.");
    } finally {
      console.log("-> Step 5: `finally` block. Setting loading to false.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast({ title: "Google Sign-Up", description: "Not implemented yet.", variant: "default" });
  };

  if (user) return null;

  return (
    <div
      className="register-container min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${LoginBackGround})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-finance-blue">
            Advanced Financial Research platform
          </h1>

        </div>
        <Card className="w-full shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              Create an account to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} noValidate>
              {apiError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="pl-10"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    className="pl-10"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="pl-10"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign up"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                >
                  Sign up with Google
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;