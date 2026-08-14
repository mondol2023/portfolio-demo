import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FiLock } from "react-icons/fi";
import { Navigate, useLocation, useNavigate, type Location } from "react-router-dom";
import { loginInputSchema, type LoginInput } from "@portfolio/shared";
import { Input, Button, Card } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ApiError } from "@/lib/api";
import { motionTokens, springs } from "@/lib/animations/tokens";

interface LocationState {
  from?: Location;
}

export function AdminLoginPage() {
  const { status, login } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: "", password: "" },
  });

  // Already signed in (e.g. session restored) — skip the form entirely.
  if (status === "authenticated") {
    const from = (location.state as LocationState | null)?.from;
    return <Navigate to={from ? `${from.pathname}${from.search}` : "/admin"} replace />;
  }

  async function onSubmit(data: LoginInput) {
    try {
      await login(data);
      const from = (location.state as LocationState | null)?.from;
      navigate(from ? `${from.pathname}${from.search}` : "/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        toast({ title: "Sign in failed", description: err.message, tone: "danger" });
        return;
      }
      if (err instanceof ApiError && err.status === 429) {
        toast({ title: "Too many attempts", description: err.message, tone: "warning" });
        return;
      }
      toast({ title: "Sign in failed", description: "Something went wrong. Please try again.", tone: "danger" });
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-base-950 px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: motionTokens.distance.md }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.gentle}
        className="w-full max-w-sm"
      >
        <Card padded={false} className="flex flex-col gap-6 p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-hero/15 text-hero">
              <FiLock aria-hidden="true" />
            </span>
            <h1 className="text-xl font-semibold text-base-50">Admin sign in</h1>
            <p className="text-sm text-base-400">Restricted area — authorized access only.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Sign in
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
