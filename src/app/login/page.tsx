import { AuthForm } from "@/components/auth-form";
import { isGoogleAuthConfigured } from "@/lib/auth-config";

export default function LoginPage() {
  return <AuthForm mode="login" googleEnabled={isGoogleAuthConfigured()} />;
}
