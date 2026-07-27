import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4">
      <AdminLoginForm />
    </div>
  );
}
