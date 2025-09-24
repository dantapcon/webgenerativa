import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

function LoginFormWrapper() {
  return <LoginForm />;
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Cargando...</div>}>
          <LoginFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}
