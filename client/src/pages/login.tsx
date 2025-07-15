import { useState } from "react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem("token", token);
      setLocation("/");
    } else {
      alert("로그인 실패");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">로그인</h1>
      <input className="border p-2 w-full mb-2" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 w-full mb-2" type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-2 w-full" onClick={handleLogin}>로그인</button>
    </div>
  );
}
