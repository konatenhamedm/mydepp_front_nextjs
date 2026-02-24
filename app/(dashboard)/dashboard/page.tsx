"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/axios";
import { ClientOnly } from '@/components/ui/client-only';
import {
  FileText,
  Bell,
  Search,
  CreditCard,
  Library,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
  Building2,
  Lock,
  Camera,
  AlertCircle
} from "lucide-react";
import Image from "next/image";

// ─────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────
interface DashboardStats {
  documentCount: number;
  notificationCount: number;
  unreadNotifications: number;
  forumCount: number;
  paymentCount: number;
  validatedDocuments: number;
  waitingDocuments: number;
}

interface UserInfo {
  expire: boolean;
  date_expiration: string;
  montant: string;
}

// ─────────────────────────────────────────
// Dashboard Professionnel
// ─────────────────────────────────────────
export default function ProfessionnelDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    documentCount: 0,
    notificationCount: 0,
    unreadNotifications: 0,
    forumCount: 0,
    paymentCount: 0,
    validatedDocuments: 0,
    waitingDocuments: 0
  });

  const [paymentInfo, setPaymentInfo] = useState<UserInfo>({
    expire: false,
    date_expiration: "",
    montant: ""
  });

  const [firstPaymentDate, setFirstPaymentDate] = useState<string | null>(null);
  const [statusDossier, setStatusDossier] = useState<string>("none");

  const user = session?.user as any;

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);

        // 1. Notifications
        const notifRes = await apiFetch(`/notification/by/${user.id}`);
        const notifications = notifRes?.data || [];
        const unreadCount = notifications.filter((n: any) => !n.isRead).length;

        // 2. Admin Documents
        const docRes = await apiFetch(`/adminDocument/`);
        const docCount = docRes?.data?.length || 0;

        // 3. Forum
        const forumRes = await apiFetch(`/forum/`);
        const fCount = forumRes?.data?.length || 0;

        // 4. Payment Status & Expiry
        const paymentStatusRes = await apiFetch(`/paiement/status/renouvellement/${user.id}`);
        if (paymentStatusRes?.data) {
          setPaymentInfo({
            expire: paymentStatusRes.data.expire,
            date_expiration: paymentStatusRes.data.date_expiration,
            montant: paymentStatusRes.data.montant
          });
        }

        // 5. Payment History
        const paymentHistRes = await apiFetch(`/paiement/historique/by/user/${user.id}`);
        const payments = paymentHistRes?.data || [];
        setFirstPaymentDate(payments[0]?.createdAt || null);

        // 6. Dossier Status (if Etablissement)
        if (user?.type === "ETABLISSEMENT" || user?.typeUser === "ETABLISSEMENT") {
          const profileRes = await apiFetch(`/etablissement/get/one/${user.personneId}`);
          if (profileRes?.data?.personne) {
            setStatusDossier(profileRes.data.personne.status);
          }
        }

        setStats({
          documentCount: docCount,
          notificationCount: notifications.length,
          unreadNotifications: unreadCount,
          forumCount: fCount,
          paymentCount: payments.length,
          validatedDocuments: 0, // Placeholder as Svelte doesn't seem to fetch this yet
          waitingDocuments: 0    // Placeholder
        });

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, user?.personneId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-40 bg-white border border-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 bg-white border border-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const getAvatarSrc = (avatar: string | null | undefined) => {
    if (!avatar || typeof avatar !== 'string' || avatar.trim() === '') {
      return "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";
    }
    if (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('/')) {
      return avatar;
    }
    return `https://backend.leadagro.net/uploads/${avatar}`;
  };

  const isExpired = paymentInfo.expire;

  const CARDS = [
    {
      title: "Mise à jour du dossier",
      icon: <FileText className="w-6 h-6" />,
      color: "from-blue-100 to-blue-50 text-blue-600 border-blue-100",
      badge: "À jour",
      badgeColor: "bg-green-100 text-green-700",
      link: "/dashboard/mon_dossier",
      description: "Mettre à jour vos informations",
      isProtected: true,
    },
    {
      title: "Alertes",
      icon: <Bell className="w-6 h-6" />,
      color: "from-orange-100 to-orange-50 text-orange-600 border-orange-100",
      badge: stats.unreadNotifications.toString(),
      badgeColor: "bg-red-500 text-white",
      link: "/dashboard/alerts",
      description: "Notifications importantes",
      isProtected: true,
    },
    {
      title: "Suivi de mon dossier",
      icon: <Search className="w-6 h-6" />,
      color: "from-green-100 to-green-50 text-green-600 border-green-100",
      badge: "En cours",
      badgeColor: "bg-green-100 text-green-700",
      link: "/dashboard/suivi_dossier",
      description: "État d'avancement du dossier",
      isProtected: true,
    },
    {
      title: "Historique paiements",
      icon: <CreditCard className="w-6 h-6" />,
      color: "from-indigo-100 to-indigo-50 text-indigo-600 border-indigo-100",
      link: "/dashboard/historique_payment",
      description: "Consulter vos paiements",
      isProtected: false,
    },
    {
      title: "Documenthèque",
      icon: <Library className="w-6 h-6" />,
      color: "from-red-100 to-red-50 text-red-600 border-red-100",
      badge: stats.documentCount.toString(),
      badgeColor: "bg-red-500 text-white",
      link: "/dashboard/documentheque",
      description: "Accéder aux documents",
      isProtected: false,
    },
    {
      title: "Forum",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-purple-100 to-purple-50 text-purple-600 border-purple-100",
      badge: stats.forumCount.toString(),
      badgeColor: "bg-red-500 text-white",
      link: "/dashboard/forum",
      description: "Échanger avec la communauté",
      isProtected: false,
    },
  ];

  return (
    <ClientOnly>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">

        {/* ── Welcome Header ── */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-grow space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Bienvenue sur <span className="text-[#0052CC]">MYDEPPS</span>
              </h1>
              <p className="text-slate-500 mt-1">
                Gérez vos démarches administratives et suivez l'évolution de vos dossiers.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {user?.type ? user.type.toLowerCase() : "Prestataire"} de Santé
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Côte d'Ivoire
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Inscrit depuis le {firstPaymentDate ? new Date(firstPaymentDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </span>
            </div>

            {isExpired && (
              <div className="mt-4 p-4 border-l-4 border-rose-500 bg-rose-50/50 rounded-r-2xl animate-pulse">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-800">Abonnement expiré</h4>
                    <p className="text-xs text-rose-600 font-medium">
                      Votre abonnement a expiré le {new Date(paymentInfo.date_expiration).toLocaleDateString('fr-FR')}.
                      Veuillez renouveler pour un montant de {paymentInfo.montant} FCFA pour continuer à utiliser tous les services.
                    </p>
                    <Link
                      href={user?.type === "ETABLISSEMENT" ? "/dashboard/oep_initie" : "/dashboard/renouvellement"}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-rose-700 hover:text-rose-900 underline"
                    >
                      {user?.type === "ETABLISSEMENT" ? "Réinitialiser mon OEP" : "Renouveler maintenant"} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 min-w-[200px]">
            <div className="text-center">
              <p className="font-bold text-slate-800 leading-none mb-1">{user?.nom}</p>
              <p className="text-xs text-slate-400">{user?.username}</p>
            </div>
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md relative">
                <Image
                  src={getAvatarSrc(user?.avatar)}
                  alt="Profil"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Changer</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md border-2 border-white">
                <Building2 className="w-4 h-4 text-[#0052CC]" />
              </div>
            </div>
          </div>
        </div>

        {statusDossier === "acp_dossier_valide_directrice" && (
          <div className="mt-6 flex justify-center">
            <Link
              href="/dashboard/oep_initie"
              className="px-8 py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-3"
            >
              Passer à l'initialisation OEP <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Summary Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatMiniCard title="Documents validés" value={stats.validatedDocuments} icon={<CheckCircle2 className="w-5 h-5" />} color="text-green-600" />
          <StatMiniCard title="En attente" value={stats.waitingDocuments} icon={<Clock className="w-5 h-5" />} color="text-amber-500" />
          <StatMiniCard title="Paiements" value={stats.paymentCount} icon={<CreditCard className="w-5 h-5" />} color="text-blue-600" />
          <StatMiniCard title="Messages" value={stats.notificationCount} icon={<MessageSquare className="w-5 h-5" />} color="text-purple-600" />
        </div>

        {/* ── Main Action Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <Link
              key={i}
              href={card.isProtected && isExpired ? "#" : card.link}
              className={`
                relative p-6 rounded-3xl border shadow-sm transition-all duration-300 flex flex-col h-full
                ${card.isProtected && isExpired ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : `bg-gradient-to-br ${card.color} hover:shadow-lg hover:-translate-y-1 group cursor-pointer`}
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-white/60 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <div className="flex items-center gap-2">
                  {card.badge && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  )}
                  {card.isProtected && isExpired && <Lock className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#0052CC] transition-colors mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light mb-4">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 mt-auto flex items-center justify-between group-hover:border-slate-100 transition-colors">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${card.isProtected && isExpired ? 'text-slate-400' : 'text-[#0052CC]'}`}>
                  {card.isProtected && isExpired ? "Service verrouillé" : "Accéder au service"}
                </span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${card.isProtected && isExpired ? 'text-slate-400' : 'text-[#0052CC]'}`} />
              </div>

              {card.isProtected && isExpired && (
                <div className="absolute inset-0 bg-white/10 flex items-center justify-center backdrop-blur-[1px] rounded-3xl">
                  <div className="bg-slate-900/10 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600">
                    Souscription requise
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* ── Recent Activity ── */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Activité récente</h3>
            <button className="text-sm font-bold text-[#0052CC] hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {stats.notificationCount === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucune activité récente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Document validé</p>
                      <p className="text-xs text-slate-500 mt-0.5">Votre diplôme d'Etat a été validé par l'instructeur.</p>
                      <p className="text-[10px] text-slate-400 mt-2">Il y a 2 heures</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </ClientOnly>
  );
}

function StatMiniCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl bg-slate-50 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}