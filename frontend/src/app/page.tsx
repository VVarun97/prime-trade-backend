"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [token, isLoading, router]);

  return (
    <div className="loading-page">
      <div className="spinner" />
    </div>
  );
}
