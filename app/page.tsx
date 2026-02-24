"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/axios";
import {
  ArrowRight, ShieldCheck, HeartPulse, Award, Building2, Users, UserCircle2,
  Menu, X, Facebook, Instagram, Twitter, Linkedin
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import LandingHeader from "@/components/LandingHeader";
import LandingFooter from "@/components/LandingFooter";

export default function LandingPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ countEtablissement: 0, countProfessionnel: 0, countVisite: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "https://images.unsplash.com/photo-1538108149393-cebb47ac17e1?q=80&w=2696&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576091160550-217359f4b84c?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2653&auto=format&fit=crop"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch("/statistique/web-site-statistique/");
        if (res?.data) {
          setStats({
            countEtablissement: res.data.countEtablissement || 0,
            countProfessionnel: res.data.countProfessionnel || 0,
            countVisite: res.data.countVisiteur || 0,
          });
        }
      } catch (e) {
        console.warn("Failed to fetch stats for landing page", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <LandingHeader />

      {/* ── HERO SLIDER ── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <div className="absolute inset-0 bg-black/50 z-10" />
            <Image
              src={slide}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        <div className="relative z-20 max-w-5xl mx-auto text-center px-4">
          <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 mb-6 py-2 px-6 backdrop-blur-md text-sm uppercase tracking-widest font-bold">Plateforme Officielle</Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-tight drop-shadow-lg">
            Direction des Établissements Privés <br />
            <span className="text-blue-400">et des Professions Sanitaires</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed drop-shadow">
            Garantir l'excellence, la sécurité et la qualité des soins au cœur du secteur privé de la santé en Côte d'Ivoire.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/inscription" className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 text-lg">
              S'inscrire <ArrowRight className="w-6 h-6" />
            </Link>
            <Link href="#services" className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white font-bold rounded-2xl border border-white/30 hover:bg-white/20 backdrop-blur-md transition-all flex items-center justify-center text-lg">
              En savoir plus
            </Link>
          </div>
        </div>

        {/* Slider Navigation Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-white w-8" : "bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </section>

      {/* ── DOMAINES D'EXCELLENCE ── */}
      <section id="services" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Nos Domaines d'Excellence</h2>
            <p className="text-lg text-slate-600">
              La DEPPS s'engage dans trois domaines clés pour garantir la qualité des soins et encadrer le secteur privé de la santé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<HeartPulse className="w-8 h-8 text-purple-600" />}
              title="Qualité Médicale"
              desc="Rôle central dans le suivi et l'évaluation continue des pratiques médicales privées."
              color="bg-white"
              iconColor="bg-purple-50"
            />
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
              title="Sécurité & Hygiène"
              desc="Encadrement strict des normes d'hygiène et de sécurité dans les établissements."
              color="bg-white"
              iconColor="bg-blue-50"
            />
            <FeatureCard
              icon={<Award className="w-8 h-8 text-emerald-600" />}
              title="Agréments & Suivi"
              desc="Délivrance et renouvellement des autorisations d'exercer pour les professionnels."
              color="bg-white"
              iconColor="bg-emerald-50"
            />
          </div>
        </div>
      </section>

      {/* ── ABOUT / MY DEPPS ── */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square md:aspect-[4/5] relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-slate-50">
                <Image
                  src="/images/new_Image/2150796734-removebg-preview.png"
                  alt="MYDEPPS Mission"
                  fill
                  className="object-contain bg-slate-50"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-[#0052CC] text-white p-10 rounded-[32px] shadow-2xl max-w-xs hidden md:block border-4 border-white">
                <p className="font-bold text-xl mb-3">Notre Mission</p>
                <p className="text-blue-100 text-sm leading-relaxed">Garantir à chaque citoyen l'accès à des soins de santé privés sûrs, certifiés et de haute qualité sur tout le territoire.</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <Badge className="bg-blue-50 text-blue-600 mb-4 px-4 py-1.5 border-blue-100">À Propos de nous</Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">MY DEPPS</h2>
              </div>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-light">
                <p>
                  Fidèle à notre mission, nous assurons la qualité des soins avec une rigueur absolue. La Direction des Établissements Privés et des Professions Sanitaires (DEPPS) veille à chaque étape vitale pour votre bien-être et votre sécurité.
                </p>
                <p>
                  En tant que régulateur et partenaire du secteur santé, nous mettons tout en œuvre pour offrir des soins d'excellence, garantissant ainsi votre confiance envers les structures privées certifiées.
                </p>
              </div>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link href="#stats" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all hover:translate-y-[-2px] shadow-lg">
                  Nos Statistiques <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#services" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-2xl font-bold transition-all">
                  Nos Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS / REALISATIONS ── */}
      <section id="stats" className="py-24 relative overflow-hidden bg-[#0A1628]">
        <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Nos Réalisations</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
              Des professionnels qualifiés et des établissements certifiés au service de la santé publique ivoirienne.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StatCard icon={<UserCircle2 className="w-12 h-12 text-blue-400" />} number={stats.countProfessionnel || 12450} label="Professionnels de santé" />
            <StatCard icon={<Building2 className="w-12 h-12 text-emerald-400" />} number={stats.countEtablissement || 3280} label="Établissements sanitaires" />
            <StatCard icon={<Users className="w-12 h-12 text-purple-400" />} number={stats.countVisite || 58900} label="Visiteurs & Acteurs" />
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

// ── HELPER COMPONENTS ──

function FeatureCard({ icon, title, desc, color, iconColor }: { icon: React.ReactNode, title: string, desc: string, color: string, iconColor: string }) {
  return (
    <div className={`p-8 rounded-3xl ${color} border border-white/50 shadow-sm hover:shadow-md transition-shadow group cursor-pointer hover:border-blue-200`}>
      <div className={`w-16 h-16 rounded-2xl ${iconColor} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm font-light">{desc}</p>
    </div>
  );
}

function StatCard({ icon, number, label }: { icon: React.ReactNode, number: number | string, label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-10 backdrop-blur-md text-center hover:bg-white/10 transition-all hover:translate-y-[-8px] group">
      <div className="mx-auto w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <div className="text-5xl font-bold text-white mb-3 tracking-tight">{number}</div>
      <div className="text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px]">{label}</div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold ${className}`}>{children}</span>;
}
