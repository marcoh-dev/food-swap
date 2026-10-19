import Toast from "@/components/Toast";
import { UserLogin } from "@/components/user/UserLogin";
import { Suspense } from "react";

export default function Login() {
  return (
    <>
      <h2>Was tauschst du heute?</h2>
      <UserLogin />
    </>
  );
}
