import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { CommissionStatus } from "@prisma/client";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params?.q || "";

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin");
  }

  const emailSessao = session.user.email.toLowerCase();
  const adminEmailEnv = process.env.ADMIN_EMAIL?.toLowerCase() || "";

  // 1. AUTENTICAÇÃO BLINDADA
  const usuarioNoBanco = await db.user.findUnique({
    where: { email: emailSessao },
    select: { role: true },
  });

  const isEmailAutorizado = emailSessao === adminEmailEnv;
  const isAdminNoBanco = usuarioNoBanco?.role === "ADMIN";

  if (!isEmailAutorizado && !isAdminNoBanco) {
    redirect("/");
  }

  const agora = new Date();

  // 2. BUSCAS SEPARADAS: TABELA vs MÉTRICAS
  // Fazemos tudo em paralelo, mas com consultas otimizadas!
  const [
    usersData,
    reports,
    flaggedComments,
    comissoesAgregadas,
    lojasAtivasGerais,
    historicoSaques, // 🚀 RECIBOS DE SAQUE
  ] = await Promise.all([
    // A. LISTA DE USUÁRIOS (Para a tabela - Limitado para não travar a tela)
    db.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { document: { contains: q } },
            ],
          }
        : {},
      take: q ? 100 : 1000,
      // 🚀 CIRURGIA: Usa 'select' explícito para barrar as senhas no nível do banco de dados
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        document: true,
        isBanned: true,
        lastLogin: true,
        createdAt: true,
        businesses: {
          include: {
            _count: { select: { favorites: true } },
          },
        },
        referrals: { select: { id: true } },
        affiliate: { select: { id: true, name: true, referralCode: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    // B. RELATÓRIOS E COMENTÁRIOS
    db.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        business: { select: { name: true, slug: true } },
        reporter: { select: { id: true, name: true, email: true } }, // 🚀 O Prisma faz a mágica aqui!
      },
    }),
    db.comment.findMany({
      where: { isFlagged: true },
      include: {
        user: { select: { name: true, image: true } },
        business: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    // C. 🚀 OTIMIZAÇÃO: Soma o dinheiro das comissões direto no PostgreSQL!
    db.commission.aggregate({
      where: { status: CommissionStatus.AVAILABLE },
      _sum: { amount: true },
    }),

    // D. 🚀 OTIMIZAÇÃO: Traz de forma levíssima TODAS as lojas ativas para calcular o MRR Global
    db.business.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: agora },
      },
      select: {
        planType: true,
        user: {
          select: { affiliateId: true, isBanned: true, email: true },
        },
      },
    }),

    // E. 🚀 HISTÓRICO DE SAQUES: Traz os recibos pagos para o Admin
    db.withdrawal.findMany({
      take: 100, // 🚀 CIRURGIA: Trava de memória! Evita que o painel caia por excesso de dados
      include: { affiliate: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // 3. PREPARAÇÃO DE DADOS PARA A TABELA (Limitado aos 1000)
  const users = usersData.map((u) => {
    // 🚀 CIRURGIA: Linha da senha removida, o banco já entregou os dados limpos!

    let totalViews = 0;
    let totalLeads = 0;
    let totalFavs = 0;

    u.businesses?.forEach((b: any) => {
      totalViews += b.views || 0;
      totalLeads += (b.whatsapp_clicks || 0) + (b.phone_clicks || 0);
      totalFavs += b._count?.favorites || 0;
    });

    return {
      ...u, // 🚀 Repassamos o 'u' inteiro
      referredBy: u.affiliate
        ? `${u.affiliate.name} (${u.affiliate.referralCode})`
        : null,
      referralCount: u.referrals?.length || 0,
      totalViews,
      totalLeads,
      totalFavs,
    };
  });

  const businessOwnerMap = new Map<string, string>();
  users.forEach((u) => {
    u.businesses.forEach((b) => {
      businessOwnerMap.set(b.id, u.id);
    });
  });

  // 4. CÁLCULO DAS MÉTRICAS DE CEO (Em cima da base GERAL otimizada)
  let mrrBruto = 0;
  let mrrLiquido = 0;
  let totalPagantes = 0;

  lojasAtivasGerais.forEach((loja) => {
    // Ignora se o usuário foi banido ou se é a conta do próprio Admin
    if (
      loja.user?.isBanned ||
      loja.user?.email?.toLowerCase() === adminEmailEnv
    )
      return;

    totalPagantes += 1;

    let valorMrr = 39.9;
    let comissaoMrr = 10.0;

    if (loja.planType === "yearly") {
      valorMrr = 358.8 / 12;
      comissaoMrr = 120.0 / 12;
    } else if (loja.planType === "quarterly") {
      valorMrr = 104.7 / 3;
      comissaoMrr = 30.0 / 3;
    }

    mrrBruto += valorMrr;

    if (loja.user?.affiliateId) {
      mrrLiquido += valorMrr - comissaoMrr;
    } else {
      mrrLiquido += valorMrr;
    }
  });

  const totalComissoesDevidas = comissoesAgregadas._sum.amount || 0;

  const adminData = {
    users,
    reports,
    flaggedComments,
    historicoSaques, // 🚀 Faltava colocar isso aqui para a tela conseguir ler!
    businessOwnerMap: Object.fromEntries(businessOwnerMap),
    metricas: {
      mrrBruto,
      mrrLiquido,
      totalComissoesDevidas,
      totalPagantes,
    },
  };

  return (
    <AdminDashboard data={adminData} adminEmail={process.env.ADMIN_EMAIL} />
  );
}
