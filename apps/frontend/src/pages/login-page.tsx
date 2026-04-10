import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { http } from "../modules/http";
import { useAuthStore } from "../stores/auth-store";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    const res = await http.post("/auth/login", values);
    setToken(res.data.accessToken);
    navigate("/main/users");
  };

  return (
    <div style={{ maxWidth: 360, margin: "40px auto" }}>
      <h2>登录</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="邮箱" {...register("email")} />
        <input placeholder="密码" type="password" {...register("password")} />
        <button type="submit">登录</button>
      </form>
    </div>
  );
}
