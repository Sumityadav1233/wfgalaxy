import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('wf_galaxy_admin_session')?.value;

  if (adminCookie) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const isUserAdmin = await checkIsAdmin(user.email, user.id);
    if (isUserAdmin) {
      redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4">
      <AdminLoginForm />
    </div>
  );
}
