import { Checkbox } from "../../../components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import logo from "../../../assets/img/SVG (3).png"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { useAuth } from "../../../store/Auth/Auth"

type LoginForm = {
    email: string
    password: string
}

export default function Login() {
    const { LoginZustand } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm<LoginForm>({
        mode: "onChange",
    })

    const onSubmit = async (values: LoginForm) => {
        console.log("SUBMIT FIRED", values)
        try {
            await LoginZustand(values)
            navigate("/dashboard")
        } catch (error) {
            console.error("Login failed:", error)
        }
    }

    console.log(watch())

    const errorInput =
        "border-red-500 focus:border-red-500 focus:ring-red-500"

    const normalInput =
        "border-gray-300 focus:border-[#0f172a] focus:ring-[#0f172a]"

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4">
            <div className="w-full max-w-[360px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="h-[3px] bg-[#0f172a]" />

                <div className="p-8">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <img className="w-6" src={logo} alt="Logo" />
                            <strong className="text-[23px]">
                                DebtBook
                            </strong>
                        </div>

                        <h1 className="mt-3 text-xl font-semibold text-[#0f172a]">
                            Welcome back
                        </h1>

                        <p className="mt-1.5 text-sm text-gray-500">
                            Enter your details to access your dashboard.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-7 space-y-5"
                    >
                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <Input
                                type="email"
                                placeholder="you@company.com"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value:
                                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message:
                                            "Please enter a valid email address",
                                    },
                                })}
                                className={`h-10 w-full rounded-lg text-sm placeholder:text-gray-400 ${
                                    errors.email
                                        ? errorInput
                                        : normalInput
                                }`}
                            />

                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <div className="relative">
                                <Input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="••••••••"
                                    {...register("password", {
                                        required:
                                            "Password is required",
                                        minLength: {
                                            value: 8,
                                            message:
                                                "Password must be at least 8 characters",
                                        },
                                    })}
                                    className={`h-10 w-full rounded-lg pr-10 text-sm placeholder:text-gray-400 ${
                                        errors.password
                                            ? errorInput
                                            : normalInput
                                    }`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (prev) => !prev
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    className="h-4 w-4 border-gray-300 text-[#0f172a] data-[state=checked]:border-[#0f172a] data-[state=checked]:bg-[#0f172a]"
                                />

                                <label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm text-gray-600"
                                >
                                    Remember me
                                </label>
                            </div>

                            <Link
                                to="/forgot-password"
                                className="text-sm text-gray-600 transition-colors hover:text-[#0f172a]"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={!isValid}
                            className="h-10 w-full cursor-pointer rounded-lg bg-[#0f172a] text-sm font-medium text-white transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Log In
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-[#0f172a] transition-colors hover:underline"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}