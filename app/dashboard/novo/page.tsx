import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import BusinessEditor from "@/components/BusinessEditor";

export default async function NewBusinessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // 🚀 CORREÇÃO SÊNIOR: Já puxamos o "count" de lojas para saber quantas ele tem!
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      document: true,
      phone: true,
      _count: { select: { businesses: true } }, // ⬅️ Conta as lojas no banco rapidinho
    },
  });

  // TRAVA DE SEGURANÇA 1: Libera Assinante, Admin e Afiliado. Bloqueia o resto.
  if (
    !user ||
    (user.role !== "ASSINANTE" &&
      user.role !== "ADMIN" &&
      user.role !== "AFILIADO")
  ) {
    redirect("/anunciar");
  }

  // TRAVA DE SEGURANÇA 2: Dados incompletos
  if (user.role === "ASSINANTE" && (!user.document || !user.phone)) {
    redirect("/dashboard/perfil?error=validacao");
  }

  // 🚀 NOVA TRAVA DE SEGURANÇA 3: Limite de Lojas!
  // Se for Assinante comum e já tiver 1 loja ou mais, volta pro dashboard!
  if (user.role === "ASSINANTE" && user._count.businesses >= 1) {
    // Redireciona com um aviso na URL para você poder mostrar um Toast de erro se quiser
    redirect("/dashboard?error=limite_lojas");
  }

  const emptyBusiness = {
    name: "",
    slug: "",
    description: "",
    category: "Alimentação",
    subcategory: [],
    layout: "influencer",
    theme: "carbon",
    published: true,
    address: "",
    city: "",
    state: "SP",
    whatsapp: "",
    imageUrl: "",
    gallery: [],
    features: [],
    faqs: [],
    hours: [],
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <BusinessEditor business={emptyBusiness} isNew={true} />
    </div>
  );
}
