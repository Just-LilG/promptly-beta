import { AuthForm } from "@/components/auth-form";
import { isGoogleAuthConfigured } from "@/lib/auth-config";

export default function SignupPage() {
  return <AuthForm mode="signup" googleEnabled={isGoogleAuthConfigured()} />;
}
