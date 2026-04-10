import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useNavigate } from "react-router-dom";
import { http } from "@/modules/http";
import { useAuthStore } from "@/stores/auth-store";

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
    <main className="grid min-h-screen place-items-center bg-base-200 px-4 py-12">
      <section className="card card-border w-full max-w-sm bg-base-100 shadow-sm">
        <div className="card-body px-7 py-8">
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">登录后台</h1>
          <p className="text-base opacity-70">LingoPath Admin</p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2.5">
            <label className="label pb-0" htmlFor="email">
              <span className="label-text font-medium">邮箱</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@lingopath.local"
              aria-invalid={Boolean(errors.email)}
              className="input input-bordered w-full"
              {...register("email")}
            />
            <p className="min-h-4 text-xs text-error">{errors.email?.message ?? ""}</p>
          </div>

          <div className="space-y-2.5">
            <label className="label pb-0" htmlFor="password">
              <span className="label-text font-medium">密码</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入密码"
              aria-invalid={Boolean(errors.password)}
              className="input input-bordered w-full"
              {...register("password")}
            />
            <p className="min-h-4 text-xs text-error">{errors.password?.message ?? ""}</p>
          </div>

          {errorText ? (
            <p className="alert alert-error py-2 text-xs">
              {errorText}
            </p>
          ) : null}

          <button className="btn btn-primary mt-1 w-full text-base" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登录中..." : "登录"}
          </button>
        </form>
        </div>
      </section>
    </main>
  );
}
