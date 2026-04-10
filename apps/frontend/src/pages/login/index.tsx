import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useNavigate } from "react-router-dom";
import { http } from "@/modules/http";
import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;
    const res = await http.post("/auth/login", values);
    setToken(res.data.accessToken);
    const me = await http.get("/auth/me", {
      headers: { Authorization: `Bearer ${res.data.accessToken}` },
    });
    setPermissions(me.data.permissions || []);
    navigate("/main/users");
  };

  return (
    <div className="mx-auto mt-20 max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-semibold tracking-tight">登录</h2>
      <p className="mb-4 text-sm text-muted-foreground">使用管理员账号进入后台</p>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="邮箱" {...register("email")} />
        <Input placeholder="密码" type="password" {...register("password")} />
        <Button className="w-full" type="submit">
          登录
        </Button>
      </form>
    </div>
  );
}
