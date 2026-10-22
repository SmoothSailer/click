import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
