import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import logo from "../../../assets/img/Margin.png"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { useAuth } from "../../../store/Auth/Auth"

type RegisterForm = {
    name: string
    email: string
    password: string
}

const Registration = () => {
    const { RegisterZustand } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterForm>()

    const onSubmit = async (values: RegisterForm) => {
        try {
            await RegisterZustand(values)
            navigate("/dashboard")
        } catch (error) {
            console.error("Registration failed:", error)
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
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Name
                            </label>

                            <Input
                                type="text"
                                placeholder="John Doe"
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: {
                                        value: 3,
                                        message:
                                            "Name must be at least 3 characters",
                                    },
                                })}
                                className={`h-10 w-full rounded-lg text-sm placeholder:text-gray-400 ${
                                    errors.name
                                        ? errorInput
                                        : normalInput
                                }`}
                            />

                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                        required: "Password is required",
                                        minLength: {
                                            value: 8,
                                            message:
                                                "Password must be at least 8 characters",
                                        },
                                        pattern: {
                                            value:
                                                /^(?=.*[A-Za-z])(?=.*\d).+$/,
                                            message:
                                                "Password must contain at least one letter and one number",
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

                        <Button
                            type="submit"
                            className="h-10 w-full cursor-pointer rounded-lg bg-[#0f172a] text-sm font-medium text-white transition-colors hover:bg-[#1e293b]"
                        >
                            Register
                            <ArrowRight />
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            to="/"
                            className="font-semibold text-[#0f172a] transition-colors hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Registration