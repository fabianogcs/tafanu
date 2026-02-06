import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import BusinessEditor from "@/components/BusinessEditor";

export default async function NewBusinessPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, document: true, phone: true },
  });

  // TRAVA DE SEGURANÇA: Se não for Assinante ou Admin, ou não estiver validado, bloqueia.
  if (!user || (user.role !== "ASSINANTE" && user.role !== "ADMIN")) {
    redirect("/anunciar");
  }

  if (user.role === "ASSINANTE" && (!user.document || !user.phone)) {
    redirect("/dashboard/perfil?error=validacao");
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
