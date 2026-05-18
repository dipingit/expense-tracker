import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            toast.success("Login successful!");
            navigate("/");
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error instanceof Error ? error.message : "Login failed";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
            <div className="card w-full max-w-md bg-base-200 shadow-xl">
                <div className="card-body">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-14 h-14 rounded-2xl stat-card-blue flex items-center justify-center mb-4">
                            <LogIn size={24} className="text-white"/>
                        </div>
                        <h1 className="text-2xl font-bold text-base-content">Welcome Back</h1>
                        <p className="text-base-content/50 text-sm">Sign in to Spendly</p>
                    </div>
                    <div className="text-center">
                        <p>email: demo@gmail.com</p> 
                        <p>password: demo123</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="input input-bordered flex items-center gap-3 bg-base-100 w-full">
                            <Mail size={16} className="text-base-content/40" />
                            <input
                                type="email"
                                className="grow"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </label>

                        <label className="input input-bordered flex items-center gap-3 bg-base-100 w-full">
                            <Lock size={16} className="text-base-content/40" />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="grow"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="text-base-content/40 hover:text-base-content cursor-pointer"
                                disabled={isLoading}
                            >
                               { showPassword ? <EyeOff size={16} /> : <Eye size={16} /> }
                            </button>
                        </label>

                        <button 
                            type="submit" 
                            className="btn bg-base-100 text-black/60 hover:bg-base-200 w-full rounded-xl border-none shadow-md hover:shadow-lg transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-base-content/50 mt-4">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary font-medium hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;