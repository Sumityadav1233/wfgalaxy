import GoogleLoginButton from "@/components/GoogleLoginButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md w-full text-center">
        <img src="/logo.png" alt="WF GALAXY Logo" className="h-16 w-auto object-contain mb-4" />
        <h1 className="text-3xl font-serif text-[#3B2A20] mb-1 font-bold">WF GALAXY</h1>
        <p className="text-gray-500 mb-8 text-sm">Admin Dashboard Login</p>
        <GoogleLoginButton />
      </div>
    </div>
  );
}
