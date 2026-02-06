import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto pb-20 p-6 animate-in fade-in">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <User className="text-tafanu-blue" size={32} />
          Meus Dados
        </h1>
        <p className="text-gray-500 mt-2">
          Área segura. Alterações sensíveis exigem confirmação de senha.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
