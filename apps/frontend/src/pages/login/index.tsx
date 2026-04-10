import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useNavigate } from "react-router-dom";
import { http } from "@/modules/http";
import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email("请输入正确的邮箱地址"),
  password: z.string().min(6, "密码至少 6 位"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const [errorText, setErrorText] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setErrorText("");
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;

    try {
      const res = await http.post("/auth/login", values);
      setToken(res.data.accessToken);

      const me = await http.get("/auth/me", {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      });
      setPermissions(me.data.permissions || []);
      navigate("/main/users");
    } catch {
      setErrorText("登录失败，请检查账号密码后重试");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-muted/20 px-4 py-12">
      <section className="w-full max-w-sm rounded-2xl border border-border/80 bg-card px-7 py-8 shadow-sm">
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">登录后台</h1>
          <p className="text-base text-muted-foreground">LingoPath Admin</p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2.5">
            <label className="block text-sm font-medium text-foreground/90" htmlFor="email">
              邮箱
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@lingopath.local"
              aria-invalid={Boolean(errors.email)}
              className="h-11 px-4"
              {...register("email")}
            />
            <p className="min-h-4 text-xs text-destructive">{errors.email?.message ?? ""}</p>
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-medium text-foreground/90" htmlFor="password">
              密码
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入密码"
              aria-invalid={Boolean(errors.password)}
              className="h-11 px-4"
              {...register("password")}
            />
            <p className="min-h-4 text-xs text-destructive">{errors.password?.message ?? ""}</p>
          </div>

          {errorText ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorText}
            </p>
          ) : null}

          <Button className="mt-1 h-11 w-full text-base" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登录中..." : "登录"}
          </Button>
        </form>
      </section>
    </main>
  );
}
