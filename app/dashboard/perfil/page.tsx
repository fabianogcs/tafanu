import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // 🚀 FERRAMENTA DE LEITURA INSERIDA AQUI
import { User } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // 🚀 ESCUDO ZERO TRUST: Selecionamos a dedo os campos para não vazar a senha (hash) na tela!
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      document: true,
      role: true,
      affiliateId: true,
    },
  });

  if (!user) redirect("/login");

  // 🚀 A PONTE DE SEGURANÇA: Lê o cookie invisível do servidor e prepara para o frontend
  const cookieStore = await cookies();
  const affiliateCode = cookieStore.get("tafanu_ref")?.value;

  // 🚀 A TRAVA FOI REMOVIDA: Visitantes não chegam aqui por causa do Middleware,
  // mas se um Assinante recém-comprado chegar e o crachá ainda estiver atualizando,
  // nós permitimos que ele preencha o perfil sem ser expulso!

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
        <ProfileForm user={user} affiliateCode={affiliateCode} />
      </div>
    </div>
  );
}
