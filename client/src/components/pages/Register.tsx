import { Eye, EyeOff, Mail, Lock, UserPlus, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (!confirmPassword.trim()) {
            toast.error("Please confirm your password");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            // AuthContext expects: email, password, confirmPassword, name?
            await register(
                email,
                password,
                confirmPassword,
                name.trim()
            );
            toast.success("Registration successful!");
            navigate("/");
        } catch (error) {
            console.error("Registration error:", error);
            const errorMessage = error instanceof Error ? error.message : "Registration failed";
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
                        <div className="w-14 h-14 rounded-2xl stat-card-purple flex items-center justify-center mb-4">
                            <UserPlus size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-base-content">Create Account</h1>
                        <p className="text-base-content/50 text-sm">Start tracking your expenses</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="input input-bordered flex items-center gap-3 bg-base-100 w-full">
                            <User size={16} className="text-base-content/40" />
                            <input
                                type="text"
                                className="grow"
                                placeholder="Display Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </label>

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
                                placeholder="Password (minimum 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                minLength={6}
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-base-content/40 hover:text-base-content cursor-pointer"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </label>

                        <label className="input input-bordered flex items-center gap-3 bg-base-100 w-full">
                            <Lock size={16} className="text-base-content/40" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="grow"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-base-content/40 hover:text-base-content cursor-pointer"
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </label>

                        <button 
                            type="submit" 
                            className="btn bg-base-100 hover:bg-base-200 text-black/60 w-full rounded-xl border-none shadow-md hover:shadow-lg transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-base-content/50 mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        
    );
};

export default Register;