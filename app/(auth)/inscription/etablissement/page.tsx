'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Select, { StylesConfig } from 'react-select';
import {
  Building2, User, Mail, Lock, Phone, MapPin,
  FileText, CreditCard, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, Upload, CheckCircle,
  Eye, EyeOff
} from 'lucide-react';
import { ClientOnly } from '@/components/ui/client-only';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { apiFetch } from '@/lib/axios';

// Regex constants
const REGEX_EMAIL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const REGEX_PHONE = /^(07|01|05)[0-9]{8}$/;
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function EtablissementInscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data Options
  const [options, setOptions] = useState<Record<string, any[]>>({
    niveauIntervention: [],
    typePersonne: [],
    typeDocument: []
  });

  // Form State
  const [formData, setFormData] = useState<any>({
    email: '',
    password: '',
    confirmPassword: '',
    niveauIntervention: '',
    typePersonne: '', // PHYSIQUE or MORALE
    nom: '',
    prenoms: '',
    telephone: '',
    bp: '',
    emailAutre: '',
    adresse: '',
    nomRepresentant: '',
    denomination: '',
    agrement: null,
    statuts: null,
    registre: null,
    fiscale: null
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [niveaux, types] = await Promise.all([
          apiFetch('/niveauIntervention/'),
          apiFetch('/typePersonne/')
        ]);
        setOptions(prev => ({
          ...prev,
          niveauIntervention: niveaux.data.map((d: any) => ({ value: d.id, label: d.libelle })),
          typePersonne: types.data.map((d: any) => ({ value: d.libelle.toUpperCase() === 'PHYSIQUE' ? 'PHYSIQUE' : 'MORALE', label: d.libelle }))
        }));
      } catch (err) {
        console.error("Error loading options", err);
      }
    };
    loadOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleSelectChange = (name: string, selectedOption: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: selectedOption?.value || '' }));
    if (errors[name]) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const getLabelFromValue = (category: string, value: any) => {
    if (!value) return "Non renseigné";
    const found = options[category]?.find((o: any) => String(o.value) === String(value));
    return found ? found.label : value;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({ ...prev, [name]: file }));
      if (errors[name]) setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = async (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.email) { newErrors.email = "L'email est requis"; isValid = false; }
      else if (!REGEX_EMAIL.test(formData.email)) { newErrors.email = "Email invalide"; isValid = false; }
      else {
        try {
          const response = await apiFetch(`/user/check/email/existe/${formData.email}`);
          if (response.data === true) {
            newErrors.email = "Cet email est déjà utilisé par un autre compte";
            isValid = false;
          }
        } catch (err) {
          console.error("Erreur check email:", err);
        }
      }

      if (!formData.password) { newErrors.password = "Le mot de passe est requis"; isValid = false; }
      else if (!REGEX_PASSWORD.test(formData.password)) { newErrors.password = "8+ caractères, 1 Maj, 1 Min, 1 Chiffre, 1 Spécial"; isValid = false; }

      if (formData.password !== formData.confirmPassword) { newErrors.confirmPassword = "Mots de passe différents"; isValid = false; }
    }
    else if (currentStep === 2) {
      if (!formData.niveauIntervention) { newErrors.niveauIntervention = "Niveau requis"; isValid = false; }
      if (!formData.typePersonne) { newErrors.typePersonne = "Type requis"; isValid = false; }

      if (formData.typePersonne === 'PHYSIQUE') {
        const req = ['nom', 'prenoms', 'telephone', 'bp', 'emailAutre'];
        req.forEach(f => { if (!formData[f]) { newErrors[f] = "Requis"; isValid = false; } });
        if (formData.telephone && !REGEX_PHONE.test(formData.telephone)) { newErrors.telephone = "Format invalide"; isValid = false; }
      } else {
        const req = ['denomination', 'nomRepresentant', 'adresse'];
        req.forEach(f => { if (!formData[f]) { newErrors[f] = "Requis"; isValid = false; } });
      }
    }
    else if (currentStep === 3) {
      const req = ['agrement', 'statuts', 'registre', 'fiscale'];
      req.forEach(f => { if (!formData[f]) { newErrors[f] = "Document requis"; isValid = false; } });
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = async () => {
    setIsNextLoading(true);
    const isValid = await validateStep(step);
    setIsNextLoading(false);
    if (isValid) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderIndicator = () => {
    const labels = ["Compte", "Établissement", "Documents", "Validation"];
    return (
      <div className="flex items-start justify-between mb-12 max-w-6xl mx-auto px-4">
        {labels.map((label, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={label} className="flex flex-col items-center flex-1 relative">
              <div className="flex items-center w-full">
                {/* Line Before */}
                <div className={`h-[2px] flex-grow transition-all duration-500 ${num === 1 ? 'opacity-0' : (isDone || isActive ? 'bg-emerald-500' : 'bg-slate-200')}`}></div>

                {/* Circle */}
                <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${isActive ? 'bg-blue-600 text-white ring-8 ring-blue-100 shadow-xl scale-110' :
                  isDone ? 'bg-emerald-500 text-white shadow-lg' :
                    'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : num}
                </div>

                {/* Line After */}
                <div className={`h-[2px] flex-grow transition-all duration-500 ${num === totalSteps ? 'opacity-0' : (isDone ? 'bg-emerald-500' : 'bg-slate-200')}`}></div>
              </div>
              <span className={`mt-3 text-[10px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-blue-600' : isDone ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <LandingHeader />

      <main className="flex-grow pt-20">

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-800 py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight animate-fade-in-up uppercase">
              Établissement de Santé
            </h1>
            <p className="text-blue-100 text-xl font-medium max-w-3xl mx-auto opacity-90">
              Inscrivez votre structure sur le portail officiel e-DEPPS et gérez vos accréditations.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto w-full px-4 py-12 relative z-10 -mt-10">
          {renderIndicator()}

          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top duration-300">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-semibold">Veuillez vérifier les champs marqués d&apos;une erreur.</p>
            </div>
          )}

          <div className="bg-white rounded-[28px] shadow-2xl border border-slate-100 p-6 md:p-10 mb-10">
            {step === 1 && (
              <div className="space-y-6 animate-slide-in-right">
                <SectionHeader icon={<Lock />} title="Sécurité" subtitle="Identifiants de l'administrateur" />
                <div className="space-y-4">
                  <InputField label="Email de connexion *" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} icon={<Mail />} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <InputField label="Mot de passe *" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} error={errors.password} icon={<Lock />} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-slate-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <InputField label="Confirmation *" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} icon={<Lock />} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[38px] text-slate-400">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <Navigation next={nextStep} isNextLoading={isNextLoading} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-slide-in-right">
                <SectionHeader icon={<Building2 />} title="Structure" subtitle="Détails de l'établissement sanitaire" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField label="Niveau d'intervention *" options={options.niveauIntervention} value={formData.niveauIntervention} onChange={(v: any) => handleSelectChange('niveauIntervention', v)} error={errors.niveauIntervention} />
                  <SelectField label="Entité juridique *" options={options.typePersonne} value={formData.typePersonne} onChange={(v: any) => handleSelectChange('typePersonne', v)} error={errors.typePersonne} />

                  {formData.typePersonne === 'PHYSIQUE' ? (
                    <>
                      <InputField label="Nom *" name="nom" value={formData.nom} onChange={handleChange} error={errors.nom} />
                      <InputField label="Prénoms *" name="prenoms" value={formData.prenoms} onChange={handleChange} error={errors.prenoms} />
                      <InputField label="Téléphone *" name="telephone" value={formData.telephone} onChange={handleChange} error={errors.telephone} icon={<Phone />} />
                      <InputField label="Boîte Postale *" name="bp" value={formData.bp} onChange={handleChange} error={errors.bp} />
                      <InputField label="Email secondaire *" name="emailAutre" value={formData.emailAutre} onChange={handleChange} error={errors.emailAutre} icon={<Mail />} />
                    </>
                  ) : formData.typePersonne === 'MORALE' ? (
                    <>
                      <InputField label="Dénomination *" name="denomination" value={formData.denomination} onChange={handleChange} error={errors.denomination} />
                      <InputField label="Nom du représentant *" name="nomRepresentant" value={formData.nomRepresentant} onChange={handleChange} error={errors.nomRepresentant} />
                      <InputField label="Adresse géographique *" name="adresse" value={formData.adresse} onChange={handleChange} error={errors.adresse} icon={<MapPin />} />
                    </>
                  ) : null}
                </div>
                <Navigation next={nextStep} prev={prevStep} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-slide-in-right">
                <SectionHeader icon={<FileText />} title="Justificatifs" subtitle="Documents légaux de l'établissement" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FileUploadBox label="Agrément d'ouverture *" id="agrement" value={formData.agrement} onChange={(e: any) => handleFileChange(e, 'agrement')} error={errors.agrement} />
                  <FileUploadBox label="Statuts *" id="statuts" value={formData.statuts} onChange={(e: any) => handleFileChange(e, 'statuts')} error={errors.statuts} />
                  <FileUploadBox label="Registre de commerce *" id="registre" value={formData.registre} onChange={(e: any) => handleFileChange(e, 'registre')} error={errors.registre} />
                  <FileUploadBox label="Déclaration fiscale *" id="fiscale" value={formData.fiscale} onChange={(e: any) => handleFileChange(e, 'fiscale')} error={errors.fiscale} />
                </div>
                <Navigation next={nextStep} prev={prevStep} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-slide-in-right">
                <SectionHeader icon={<CheckCircle2 />} title="Vérification & Validation" subtitle="Dernière étape avant finalisation" />

                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-xs font-bold uppercase">Veuillez vérifier vos informations avant de valider.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Compte */}
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <h3 className="text-xs font-black uppercase text-blue-600 mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px]">1</span>
                        Compte
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Email de connexion</p>
                      <p className="text-sm font-medium text-slate-900">{formData.email}</p>
                    </div>

                    {/* Structure */}
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <h3 className="text-xs font-black uppercase text-purple-600 mb-4 flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[10px]">2</span>
                        Établissement
                      </h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Dénomination / Nom</p>
                          <p className="text-sm font-medium text-slate-900">{formData.denomination || `${formData.nom} ${formData.prenoms}`}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Type</p>
                          <p className="text-sm font-medium text-slate-900">{formData.typePersonne}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Niveau</p>
                          <p className="text-sm font-medium text-slate-900">{getLabelFromValue('niveauIntervention', formData.niveauIntervention)}</p>
                        </div>
                        {formData.typePersonne === 'PHYSIQUE' ? (
                          <>
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Téléphone</p>
                              <p className="text-sm font-medium text-slate-900">{formData.telephone}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">BP</p>
                              <p className="text-sm font-medium text-slate-900">{formData.bp}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Représentant</p>
                              <p className="text-sm font-medium text-slate-900">{formData.nomRepresentant}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Adresse</p>
                              <p className="text-sm font-medium text-slate-900">{formData.adresse}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[24px] text-white shadow-xl border border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                      <div>
                        <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Frais d'inscription</p>
                        <h3 className="text-5xl font-black">50 000 <span className="text-2xl font-bold opacity-50">FCFA</span></h3>
                        <p className="mt-4 text-blue-100 text-sm font-medium opacity-80 italic">
                          Accréditation officielle pour établissement de santé.
                        </p>
                      </div>
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <CreditCard className="w-10 h-10" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all">Précédent</button>
                  <button className="flex-[2] py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                    Confirmer et Payer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

const SectionHeader = ({ icon, title, subtitle }: any) => (
  <div className="flex items-center gap-5 mb-10 pb-6 border-b border-slate-100">
    <div className="w-14 h-14 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 group-hover:scale-110 transition-all">
      {React.cloneElement(icon, { className: "w-7 h-7" })}
    </div>
    <div>
      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{title}</h2>
      <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
    </div>
  </div>
);

const InputField = ({ label, name, type = 'text', value, onChange, icon, error }: any) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">{icon}</div>}
      <input
        name={name} type={type} value={value} onChange={onChange}
        className={`w-full ${icon ? 'pl-11' : 'px-4'} h-12 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all text-sm`}
      />
    </div>
    {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
  </div>
);

const SelectField = ({ label, options, value, onChange, error }: any) => {
  const instanceId = React.useId();
  return (
    <div className="space-y-1.5 flex flex-col">
      <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 ml-1">{label}</label>
      <Select
        instanceId={instanceId}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        styles={{
          control: (b, s) => ({ ...b, minHeight: '48px', borderRadius: '12px', border: error ? '1px solid #ef4444' : (s.isFocused ? '1px solid #0052cc' : '1px solid #e2e8f0'), backgroundColor: '#f8fafc', boxShadow: s.isFocused ? '0 0 0 4px rgba(0, 82, 204, 0.05)' : 'none' }),
          placeholder: (b) => ({ ...b, fontSize: '13px', color: '#94a3b8' }),
          singleValue: (b) => ({ ...b, fontSize: '14px', color: '#1e293b' }),
          menuPortal: base => ({ ...base, zIndex: 9999 })
        }}
        options={options} value={options?.find((o: any) => o.value === value)} onChange={onChange} placeholder="Sélectionner..."
      />
      {error && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{error}</p>}
    </div>
  );
};

const FileUploadBox = ({ label, id, subtitle, onChange, value, error }: any) => (
  <div className={`group relative p-8 bg-slate-50 rounded-[28px] border-2 border-dashed ${error ? 'border-red-300' : 'border-slate-200'} hover:border-blue-400 hover:bg-white hover:shadow-2xl transition-all duration-300`}>
    <div className="flex flex-col items-center text-center space-y-4">
      <div className={`w-14 h-14 rounded-2xl ${value ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-400'} shadow-sm flex items-center justify-center group-hover:scale-110 transition-all border border-slate-100`}>
        {value ? <CheckCircle2 className="w-7 h-7" /> : <Upload className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{label}</p>
        <p className="text-[10px] text-slate-500 font-bold bg-slate-100 px-4 py-1.5 rounded-full mt-3 group-hover:bg-blue-600 group-hover:text-white transition-all whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
          {value ? (typeof value === 'string' ? value : value.name) : "Charger le document"}
        </p>
      </div>
      <input type="file" id={id} onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold text-center mt-3">{error}</p>}
  </div>
);

const Navigation = ({ next, prev, isNextLoading }: any) => (
  <div className={`pt-10 flex ${prev ? 'justify-between' : 'justify-end'} gap-4`}>
    {prev && (
      <button type="button" onClick={prev} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Précédent
      </button>
    )}
    <button type="button" onClick={next} disabled={isNextLoading} className="px-12 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">
      {isNextLoading ? 'Vérification...' : 'Continuer'} <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);