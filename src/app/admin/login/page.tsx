import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('wf_galaxy_admin_session')?.value;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user || adminCookie) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4">
      <AdminLoginForm />
    </div>
  );
}
