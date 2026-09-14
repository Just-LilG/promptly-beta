import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-muted text-[14px] p-8 text-center">Loading...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
