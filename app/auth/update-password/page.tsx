import { Suspense } from "react";
import { UpdatePasswordForm } from "@/components/update-password-form";

function UpdatePasswordContent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <UpdatePasswordContent />
    </Suspense>
  );
}
