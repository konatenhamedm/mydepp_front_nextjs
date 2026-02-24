"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, Users, Settings, Activity,
  ChevronDown, Package, ShoppingCart, ClipboardList,
  UserCheck, BarChart2, Store, Boxes, Ruler, X,
  User, Tag, CreditCard, Wallet, TrendingUp, DollarSign,
  Truck, ShieldCheck, Phone, Info, FileText, Star,
  Printer, RefreshCw, LogOut, Layers, HelpCircle,
  ShoppingBag, ChevronUp, Check, Map, Compass, GraduationCap,
  Briefcase, Send, FileCode, Building2, Landmark,
  BarChart, History, CheckSquare, Search,
} from 'lucide-react';
import menuData from '@/lib/menu.json';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface SubItem { title: string; path: string }
interface MenuItem {
  title: string;
  icon?: string | React.ReactNode;
  path?: string;
  subItems?: SubItem[];
  isSectionTitle?: boolean;
  exact?: boolean;
  isAction?: boolean;
  onClick?: () => void;
}
interface MenuSection {
  section: string;
  items: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

// ─────────────────────────────────────────────────────────────
// Icônes dynamiques
// ─────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  'uil uil-home': <LayoutDashboard className="w-4 h-4" />,
  'uil uil-apps': <Activity className="w-4 h-4" />,
  'uil uil-users-alt': <Users className="w-4 h-4" />,
  'uil uil-setting': <Settings className="w-4 h-4" />,
  'fa-solid fa-upload': <RefreshCw className="w-4 h-4" />,
  'uil uil-book-open': <ClipboardList className="w-4 h-4" />,
  'uil uil-chart-bar': <BarChart2 className="w-4 h-4" />,
  'uil uil-store': <Store className="w-4 h-4" />,
  'uil uil-minus': <div className="w-1 h-1 rounded-full bg-current" />,
};

function getIcon(iconStr: string | React.ReactNode) {
  if (React.isValidElement(iconStr)) return iconStr;
  if (typeof iconStr !== 'string') return <Activity className="w-4 h-4" />;

  // Clean icon string if it has uil class
  const icon = iconStr.trim();
  return ICON_MAP[icon] || <Activity className="w-4 h-4" />;
}

// ─────────────────────────────────────────────────────────────
// Sidebar principal
// ─────────────────────────────────────────────────────────────
export default function MoomenProSidebar({
  isOpen, onToggle, isCollapsed, onCollapsedChange,
}: SidebarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const u = session?.user as any;
  const userRole = u?.type || 'ADMINISTRATEUR'; // Default to admin for testing if not set

  const menuItems = useMemo(() => {
    const menus = menuData as Record<string, any[]>;
    return menus[userRole] || menus['ADMINISTRATEUR'] || [];
  }, [userRole]);

  // Group items into sections for the UI
  const sections = useMemo(() => {
    const result: MenuSection[] = [];
    let currentSection: MenuSection | null = null;

    menuItems.forEach((item: any) => {
      if (item.isSectionTitle) {
        currentSection = { section: item.title, items: [] };
        result.push(currentSection);
      } else {
        if (!currentSection) {
          currentSection = { section: '', items: [] };
          result.push(currentSection);
        }
        currentSection.items.push(item);
      }
    });

    return result;
  }, [menuItems]);

  const displayName = u?.nom ? `${u.prenoms || ''} ${u.nom}`.trim() : (session?.user?.email ?? 'Utilisateur');
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

  const toggleMenu = (title: string) => {
    if (isCollapsed) {
      onCollapsedChange(false);
      setTimeout(() => setOpenMenus([title]), 150);
    } else {
      setOpenMenus(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
    }
  };

  const isActive = (path?: string, exact = false) => {
    if (!path || path === '#') return false;
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggle} />}

      <div className={`
        fixed top-0 left-0 h-full z-50 bg-[#0A1628] text-white flex flex-col
        transition-all duration-300 ease-in-out border-r border-white/5
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-[68px]' : 'w-60'}
      `}>

        {/* ── Logo ── */}
        <div className={`flex items-center border-b border-white/8 flex-shrink-0 ${isCollapsed ? 'h-16 justify-center px-2' : 'h-[72px] px-4 gap-3'}`}>
          {isCollapsed ? (
            <div className="relative w-[38px] h-[38px] rounded-full flex items-center justify-center bg-white shadow-sm overflow-hidden">
              <Image src="/images/new_Image/logo-depps.png" alt="MyDepp" fill className="object-contain p-1" priority />
            </div>
          ) : (
            <>
              <div className="relative w-[44px] h-[44px] rounded-full flex items-center justify-center bg-white shadow-md overflow-hidden flex-shrink-0">
                <Image src="/images/new_Image/logo-depps.png" alt="MyDepp" fill className="object-contain p-1.5" priority />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white leading-tight truncate">MyDepp</p>
                <p className="text-[10px] text-white/40 leading-tight mt-0.5">SYGAPE CI</p>
              </div>
              <button onClick={onToggle} className="ml-auto lg:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 custom-scrollbar">
          {status === 'loading' ? (
            <div className="space-y-3 px-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-9 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            sections.map((sec, si) => (
              <div key={`sec-${si}`} className={si > 0 ? 'mt-6' : ''}>
                {!isCollapsed && sec.section && (
                  <p className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] mb-1">
                    {sec.section}
                  </p>
                )}
                {isCollapsed && sec.section && si > 0 && (
                  <div className="mx-3 my-2 h-px bg-white/5" />
                )}

                <div className="space-y-0.5">
                  {sec.items.map((item, ii) => {
                    const hasSubItems = !!item.subItems?.length;
                    const isOpen = openMenus.includes(item.title);
                    const active = isActive(item.path, item.exact);
                    const childActive = item.subItems?.some(s => isActive(s.path));

                    if (hasSubItems) {
                      return (
                        <div key={`item-${si}-${ii}`} className="space-y-0.5">
                          <button
                            onClick={() => toggleMenu(item.title)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${childActive ? 'text-white font-medium bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'} ${isCollapsed ? 'justify-center' : ''}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`flex-shrink-0 ${childActive ? 'text-[#0052CC]' : ''}`}>{getIcon(item.icon)}</span>
                              {!isCollapsed && <span className="truncate">{item.title}</span>}
                            </div>
                            {!isCollapsed && (
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                            )}
                          </button>
                          {!isCollapsed && isOpen && (
                            <div className="ml-7 mt-0.5 pl-3 border-l border-white/5 space-y-0.5">
                              {item.subItems?.map((sub: any, subI: number) => (
                                <Link
                                  key={`sub-${si}-${ii}-${subI}`}
                                  href={sub.path}
                                  className={`block px-3 py-2 text-[13px] rounded-lg transition-all duration-200 ${isActive(sub.path) ? 'text-white bg-[#0052CC] font-medium' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                  {sub.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={`item-${si}-${ii}`}
                        href={item.path || '#'}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${active ? 'bg-[#0052CC] text-white shadow-lg shadow-[#0052CC]/25 font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'} ${isCollapsed ? 'justify-center' : ''}`}
                      >
                        <span className="flex-shrink-0">{getIcon(item.icon)}</span>
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* ── User Profile ── */}
        <div className="p-4 border-t border-white/5">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2 py-2 rounded-2xl bg-white/5'}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-[#0052CC] to-[#003D99] rounded-xl flex items-center justify-center shadow-lg shadow-[#0052CC]/20 flex-shrink-0">
              <span className="text-white text-xs font-bold tracking-wider">{initials}</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">{displayName}</p>
                <p className="text-[10px] text-white/30 truncate mt-0.5 uppercase tracking-wider font-medium">{userRole}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
}