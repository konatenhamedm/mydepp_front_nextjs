'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Select, { StylesConfig } from 'react-select';
import {
    User, Mail, Lock, Phone, MapPin, Briefcase,
    FileText, CreditCard, ArrowRight, ArrowLeft,
    CheckCircle2, AlertCircle, Camera, Upload,
    Building2, GraduationCap, Calendar, Landmark,
    Eye, EyeOff
} from 'lucide-react';
import { ClientOnly } from '@/components/ui/client-only';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { apiFetch } from '@/lib/axios';

// Regex constants
const REGEX_EMAIL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const REGEX_PHONE = /^(07|01|05)[0-9]{8}$/;
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export default function ProfessionnelInscriptionPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const totalSteps = 6;
    const [loading, setLoading] = useState(false);
    const [isNextLoading, setIsNextLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Data Options from API
    const [options, setOptions] = useState<Record<string, any[]>>({
        civilite: [],
        nationalite: [],
        typeProfession: [],
        profession: [],
        typeDiplome: [],
        lieuObtentionDiplome: [],
        situationPro: [],
        region: [],
        district: [],
        ville: [],
        commune: [],
        ordre: [],
        situationMatrimoniale: [
            { value: 'Célibataire', label: 'Célibataire' },
            { value: 'Marié(e)', label: 'Marié(e)' },
            { value: 'Divorcé(e)', label: 'Divorcé(e)' },
            { value: 'Veuf (Veuve)', label: 'Veuf (Veuve)' }
        ]
    });

    // Form State
    const [formData, setFormData] = useState<any>({
        email: '',
        password: '',
        confirmPassword: '',
        nom: '',
        prenoms: '',
        nationalite: '',
        civilite: '',
        emailAutre: '',
        numero: '',
        dateNaissance: '',
        situation: '',

        typeProfession: '',
        profession: '',
        emailPro: '',
        dateDiplome: '',
        lieuDiplome: '',
        datePremierDiplome: '',
        diplome: '',
        situationPro: '',
        region: '',
        district: '',
        ville: '',
        commune: '',
        quartier: '',
        poleSanitaire: '',
        professionnel: '',
        lieuExercicePro: '',
        typeDiplome: '',
        statusPro: '',
        lieuObtentionDiplome: '',

        photo: null,
        cni: null,
        casier: null,
        diplomeFile: null,
        certificat: null,
        cv: null,

        appartenirOrganisation: '',
        organisationNom: '',
        appartenirOrdre: '',
        ordre: '',
        numeroInscription: '',
    });

    const [isValidNumeroInscription, setIsValidNumeroInscription] = useState(false);
    const [numeroInscriptionErrors, setNumeroInscriptionErrors] = useState("");

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [civ, pays, status, types, lieux, situations, regions, villes, districts, communes, ordres, typeProfessions] = await Promise.all([
                    apiFetch('/civilite/'),
                    apiFetch('/pays/'),
                    apiFetch('/statusPro'),
                    apiFetch('/typeDiplome'),
                    apiFetch('/lieuDiplome'),
                    apiFetch('/situationProfessionnelle/'),
                    apiFetch('/region'),
                    apiFetch('/ville'),
                    apiFetch('/district'),
                    apiFetch('/commune'),
                    apiFetch('/ordre/'),
                    apiFetch('/typeProfession')
                ]);

                setOptions(prev => ({
                    ...prev,
                    civilite: civ.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    nationalite: (pays.data || pays).map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    statusPro: status.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    typeDiplome: types.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    lieuObtentionDiplome: lieux.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    situationPro: situations.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    region: regions.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    ville: villes.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    district: districts.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    commune: communes.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    ordre: ordres.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                    typeProfession: typeProfessions.data?.map((d: any) => ({ value: d.id, label: d.libelle })) || [],
                }));
            } catch (err) {
                console.error("Error loading initial data", err);
            }
        };
        loadInitialData();
    }, []);

    const handleTypeProfessionChange = async (selected: any) => {
        setFormData(prev => ({ ...prev, typeProfession: selected?.value, profession: '' }));
        if (selected) {
            try {
                const res = await apiFetch(`/profession/get/profession/typeProfession/${selected.value}`);
                setOptions(prev => ({
                    ...prev,
                    profession: res.data?.map((d: any) => ({ value: d.code, label: d.libelle })) || []
                }));
            } catch (err) {
                console.error("Error loading professions", err);
            }
        }
    };

    const checkNumeroInscription = async (code: string) => {
        if (!code || code.length < 5) return;
        try {
            const res = await apiFetch(`/professionnel/check/code/existe/${code}`);
            if (res.data?.statut) {
                setIsValidNumeroInscription(true);
                setNumeroInscriptionErrors("");
                // Auto-fill available data like Svelte
                setFormData(prev => ({
                    ...prev,
                    nom: res.data.nom || prev.nom,
                    prenoms: res.data.prenoms || prev.prenoms,
                    profession: res.data.profession || prev.profession,
                    dateNaissance: res.data.DateNaissance || prev.dateNaissance,
                    civilite: res.data.sexe || prev.civilite,
                    nationalite: res.data.nationalite || prev.nationalite
                }));
                // Automatically redirect to final validation step
                setStep(6);
            } else {
                setIsValidNumeroInscription(false);
                setNumeroInscriptionErrors("Numéro d'inscription invalide ou non reconnu.");
            }
        } catch (err) {
            console.error("Error checking register number", err);
        }
    };

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

    const validateEmail = (email: string) => REGEX_EMAIL.test(String(email).toLowerCase());
    const validatePhone = (phone: string) => REGEX_PHONE.test(String(phone));
    const validatePassword = (password: string) => REGEX_PASSWORD.test(password);

    const validateStep = async (currentStep: number) => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.email) { newErrors.email = "L'email est requis"; isValid = false; }
            else if (!validateEmail(formData.email)) { newErrors.email = "Format d'email invalide"; isValid = false; }
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
            else if (!validatePassword(formData.password)) { newErrors.password = "Doit contenir 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre"; isValid = false; }

            if (formData.password !== formData.confirmPassword) { newErrors.confirmPassword = "Les mots de passe ne correspondent pas"; isValid = false; }
        }
        else if (currentStep === 2) {
            const required = ['nom', 'prenoms', 'nationalite', 'dateNaissance', 'numero', 'situation', 'civilite', 'emailAutre'];
            required.forEach(f => {
                if (!formData[f]) { newErrors[f] = "Ce champ est requis"; isValid = false; }
            });
            if (formData.numero && !validatePhone(formData.numero)) { newErrors.numero = "Format invalide (Ex: 07XXXXXXXX)"; isValid = false; }
        }
        else if (currentStep === 3) {
            const required = [
                'typeProfession', 'profession', 'emailPro', 'dateDiplome', 'lieuDiplome',
                'datePremierDiplome', 'diplome', 'situationPro', 'region', 'district',
                'ville', 'commune', 'quartier', 'professionnel', 'lieuExercicePro',
                'typeDiplome', 'statusPro', 'lieuObtentionDiplome'
            ];
            required.forEach(f => {
                if (!formData[f]) { newErrors[f] = "Ce champ est requis"; isValid = false; }
            });
        }
        else if (currentStep === 4) {
            const required = ['photo', 'cni', 'diplomeFile', 'casier'];
            required.forEach(f => {
                if (!formData[f]) { newErrors[f] = "Document requis"; isValid = false; }
            });
        }
        else if (currentStep === 5) {
            if (!formData.appartenirOrdre) { newErrors.appartenirOrdre = "Choix requis"; isValid = false; }
            if (formData.appartenirOrdre === 'oui') {
                if (!formData.ordre) { newErrors.ordre = "L'ordre est requis"; isValid = false; }
                if (!formData.numeroInscription) { newErrors.numeroInscription = "N° inscription requis"; isValid = false; }
            }
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

    const getLabelFromValue = (category: string, value: any) => {
        if (!value) return "Non renseigné";
        const found = options[category]?.find((o: any) => String(o.value) === String(value));
        return found ? found.label : value;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Real submission would happen here
        setTimeout(() => {
            setLoading(false);
            router.push('/connexion?signup=success');
        }, 2000);
    };

    const customSelectStyles: StylesConfig = {
        control: (base, state) => ({
            ...base,
            minHeight: '44px',
            borderRadius: '12px',
            borderColor: state.isFocused ? '#0052cc' : '#e2e8f0',
            backgroundColor: '#f8fafc',
            '&:hover': { borderColor: '#cbd5e1' },
        }),
        placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '13px' }),
        singleValue: (base) => ({ ...base, fontSize: '14px', color: '#1e293b' }),
    };

    const renderStepIndicator = () => {
        const stepsLabels = [
            "Information de Connexion",
            "Information Personnelles",
            "Informations professionnelles",
            "Documents Administratifs",
            "Informations Organisationnelles",
            "Document de Validation"
        ];

        return (
            <div className="flex items-start justify-between mb-12 max-w-6xl mx-auto px-4">
                {stepsLabels.map((label, i) => {
                    const num = i + 1;
                    const isActive = step === num;
                    const isDone = step > num;

                    return (
                        <div key={label} className="flex flex-col items-center flex-1 relative group">
                            <div className="flex items-center w-full">
                                {/* Line Before */}
                                <div className={`h-[2px] flex-grow transition-all duration-500 ${num === 1 ? 'opacity-0' : (isDone || isActive ? 'bg-emerald-500' : 'bg-slate-200')}`}></div>

                                {/* Circle */}
                                <div className={`z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 transform ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110 shadow-lg' :
                                    isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : num}
                                </div>

                                {/* Line After */}
                                <div className={`h-[2px] flex-grow transition-all duration-500 ${num === 6 ? 'opacity-0' : (isDone ? 'bg-emerald-500' : 'bg-slate-200')}`}></div>
                            </div>

                            {/* Label below */}
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
                            Professionnel de Santé
                        </h1>
                        <p className="text-blue-100 text-xl font-medium max-w-3xl mx-auto opacity-90">
                            Rejoignez le réseau e-DEPPS et accédez à votre espace professionnel sécurisé.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto w-full px-4 py-12 relative z-10 -mt-10">
                    {renderStepIndicator()}

                    {/* Error Message */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top duration-300">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-semibold">Veuillez corriger les erreurs avant de continuer.</p>
                        </div>
                    )}

                    <div className="bg-white rounded-[28px] shadow-2xl border border-slate-100 p-6 md:p-10 mb-10">
                        <form onSubmit={(e) => e.preventDefault()}>

                            {/* STEP 1: Connection */}
                            {step === 1 && (
                                <div className="space-y-6 animate-slide-in-right">
                                    <SectionTitle icon={<Lock />} title="Informations de connexion" subtitle="Vos identifiants de connexion" />

                                    <div className="space-y-4">
                                        <InputField label="E-mail *" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail />} error={errors.email} placeholder="votre.email@exemple.com" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <InputField label="Mot de passe *" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} icon={<Lock />} error={errors.password} placeholder="Votre mot de passe" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-slate-400">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <InputField label="Confirmer le mot de passe *" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} icon={<Lock />} error={errors.confirmPassword} placeholder="Confirmez votre mot de passe" />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[38px] text-slate-400">
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <NavigationButtons next={nextStep} isNextLoading={isNextLoading} />
                                </div>
                            )}

                            {/* STEP 2: Identity */}
                            {step === 2 && (
                                <div className="space-y-6 animate-slide-in-right">
                                    <SectionTitle icon={<User />} title="Informations personnelles" subtitle="Vos informations personnelles complètes" />

                                    <div className="space-y-6">
                                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <InputField
                                                label="Numéro d'inscription au registre"
                                                name="numeroInscription"
                                                value={formData.numeroInscription}
                                                onChange={(e: any) => {
                                                    handleChange(e);
                                                    if (e.target.value.length >= 5) checkNumeroInscription(e.target.value);
                                                }}
                                                placeholder="Votre numéro d'inscription"
                                            />
                                            {isValidNumeroInscription && <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Numéro d'inscription valide !</p>}
                                            {numeroInscriptionErrors && <p className="text-[10px] text-amber-600 font-bold mt-1">{numeroInscriptionErrors}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField label="Nom *" name="nom" value={formData.nom} onChange={(e: any) => setFormData((p: any) => ({ ...p, nom: e.target.value.toUpperCase() }))} error={errors.nom} placeholder="Votre nom" />
                                            <InputField label="Prénoms *" name="prenoms" value={formData.prenoms} onChange={(e: any) => setFormData((p: any) => ({ ...p, prenoms: e.target.value.toUpperCase() }))} error={errors.prenoms} placeholder="Entrez le prénoms" />
                                            <SelectField label="Nationalite *" options={options.nationalite} value={formData.nationalite} onChange={(v: any) => handleSelectChange('nationalite', v)} error={errors.nationalite} />
                                            <SelectField label="Civilité *" options={options.civilite} value={formData.civilite} onChange={(v: any) => handleSelectChange('civilite', v)} error={errors.civilite} />
                                            <InputField label="Email Professional *" name="emailAutre" type="email" value={formData.emailAutre} onChange={handleChange} icon={<Mail />} error={errors.emailAutre} placeholder="Votre email" />
                                            <InputField label="Contact *" name="numero" value={formData.numero} onChange={handleChange} icon={<Phone />} error={errors.numero} placeholder="Votre numéro de téléphone" />
                                            <InputField label="Date de Naissance*" name="dateNaissance" type="date" value={formData.dateNaissance} onChange={handleChange} error={errors.dateNaissance} />
                                            <SelectField label="Situation matrimoniale *" options={options.situationMatrimoniale} value={formData.situation} onChange={(v: any) => handleSelectChange('situation', v)} error={errors.situation} />
                                        </div>
                                    </div>

                                    <NavigationButtons next={nextStep} prev={prevStep} />
                                </div>
                            )}

                            {/* STEP 3: Expertise */}
                            {step === 3 && (
                                <div className="space-y-6 animate-slide-in-right">
                                    <SectionTitle icon={<Briefcase />} title="Informations professionnelles" subtitle="Formation et spécialisation" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SelectField label="Profession *" options={options.typeProfession} value={formData.typeProfession} onChange={handleTypeProfessionChange} error={errors.typeProfession} />
                                        <SelectField label="Spécialité *" options={options.profession} value={formData.profession} onChange={(v: any) => handleSelectChange('profession', v)} error={errors.profession} />

                                        <InputField label="Adresse email professionnel *" name="emailPro" value={formData.emailPro} onChange={handleChange} icon={<Mail />} error={errors.emailPro} placeholder="Confirmez votre adresse email" />
                                        <InputField label="Date d'obtention du diplôme *" name="dateDiplome" type="date" value={formData.dateDiplome} onChange={handleChange} error={errors.dateDiplome} />

                                        <InputField label="Lieu d'obtention du diplôme *" name="lieuDiplome" value={formData.lieuDiplome} onChange={(e: any) => setFormData((p: any) => ({ ...p, lieuDiplome: e.target.value.toUpperCase() }))} error={errors.lieuDiplome} placeholder="Votre lieu d'obtention du diplôme" />
                                        <InputField label="Date du premier emploi *" name="datePremierDiplome" type="date" value={formData.datePremierDiplome} onChange={handleChange} error={errors.datePremierDiplome} />

                                        <InputField label="Dénomination du diplôme *" name="diplome" value={formData.diplome} onChange={(e: any) => setFormData((p: any) => ({ ...p, diplome: e.target.value.toUpperCase() }))} error={errors.diplome} placeholder="Denomination du diplôme" />
                                        <SelectField label="Situation professionnelle *" options={options.situationPro} value={formData.situationPro} onChange={(v: any) => handleSelectChange('situationPro', v)} error={errors.situationPro} />

                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 italic">
                                            <SelectField label="Région sanitaire *" options={options.region} value={formData.region} onChange={(v: any) => handleSelectChange('region', v)} error={errors.region} />
                                            <SelectField label="District sanitaire *" options={options.district} value={formData.district} onChange={(v: any) => handleSelectChange('district', v)} error={errors.district} />
                                            <SelectField label="Ville *" options={options.ville} value={formData.ville} onChange={(v: any) => handleSelectChange('ville', v)} error={errors.ville} />
                                            <SelectField label="Commune *" options={options.commune} value={formData.commune} onChange={(v: any) => handleSelectChange('commune', v)} error={errors.commune} />
                                            <InputField label="Quartier *" name="quartier" value={formData.quartier} onChange={(e: any) => setFormData((p: any) => ({ ...p, quartier: e.target.value.toUpperCase() }))} error={errors.quartier} placeholder="Votre quartier" />
                                            <InputField label="Ilot,lot" name="poleSanitaire" value={formData.poleSanitaire} onChange={(e: any) => setFormData((p: any) => ({ ...p, poleSanitaire: e.target.value.toUpperCase() }))} placeholder="Votre Ilot,lot" />
                                            <InputField label="Structure d'exercice professionnel *" name="professionnel" value={formData.professionnel} onChange={(e: any) => setFormData((p: any) => ({ ...p, professionnel: e.target.value.toUpperCase() }))} error={errors.professionnel} placeholder="Votre strucuture d'exercice professionnel" />
                                            <InputField label="Lieu d'exercice professionnel *" name="lieuExercicePro" value={formData.lieuExercicePro} onChange={(e: any) => setFormData((p: any) => ({ ...p, lieuExercicePro: e.target.value.toUpperCase() }))} error={errors.lieuExercicePro} placeholder="Votre lieu d'exercice professionnel" />
                                        </div>

                                        <SelectField label="Type de diplôme *" options={options.typeDiplome} value={formData.typeDiplome} onChange={(v: any) => handleSelectChange('typeDiplome', v)} error={errors.typeDiplome} />
                                        <SelectField label="Status professionnel *" options={options.statusPro} value={formData.statusPro} onChange={(v: any) => handleSelectChange('statusPro', v)} error={errors.statusPro} />
                                        <SelectField label="Origine du diplôme *" options={options.lieuObtentionDiplome} value={formData.lieuObtentionDiplome} onChange={(v: any) => handleSelectChange('lieuObtentionDiplome', v)} error={errors.lieuObtentionDiplome} />
                                    </div>

                                    <NavigationButtons next={nextStep} prev={prevStep} />
                                </div>
                            )}

                            {/* STEP 4: Documents */}
                            {step === 4 && (
                                <div className="space-y-6 animate-slide-in-right">
                                    <SectionTitle icon={<FileText />} title="Documents requis" subtitle="Transférez vos pièces officielles" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FileUploader label="Photo d'identité *" id="photo" value={formData.photo} onChange={(e: any) => handleFileChange(e, 'photo')} error={errors.photo} />
                                        <FileUploader label="Carte nationale d'identité (CNI) *" id="cni" value={formData.cni} onChange={(e: any) => handleFileChange(e, 'cni')} error={errors.cni} />
                                        <FileUploader label="Diplôme *" id="diplomeFile" value={formData.diplomeFile} onChange={(e: any) => handleFileChange(e, 'diplomeFile')} error={errors.diplomeFile} />
                                        <FileUploader label="Casier judiciaire *" id="casier" value={formData.casier} onChange={(e: any) => handleFileChange(e, 'casier')} error={errors.casier} subtitle="- 3 mois" />
                                        <FileUploader label="Certificat (optionnel)" id="certificat" value={formData.certificat} onChange={(e: any) => handleFileChange(e, 'certificat')} />
                                        <FileUploader label="CV (optionnel)" id="cv" value={formData.cv} onChange={(e: any) => handleFileChange(e, 'cv')} />
                                    </div>

                                    <NavigationButtons next={nextStep} prev={prevStep} />
                                </div>
                            )}

                            {/* STEP 5: Affiliation */}
                            {step === 5 && (
                                <div className="space-y-6 animate-slide-in-right">
                                    <SectionTitle icon={<Landmark />} title="Informations Organisationnelles" subtitle="Ordre et organisations professionnelles" />

                                    <div className="space-y-6">
                                        <RadioChoice label="Appartenez-vous à une organisation ? *" name="appartenirOrganisation" value={formData.appartenirOrganisation} onChange={handleChange} error={errors.appartenirOrganisation} />

                                        {formData.appartenirOrganisation === 'oui' && (
                                            <div className="animate-in zoom-in duration-300">
                                                <InputField label="Nom de l'organisation *" name="organisationNom" value={formData.organisationNom} onChange={(e: any) => setFormData((p: any) => ({ ...p, organisationNom: e.target.value.toUpperCase() }))} error={errors.organisationNom} placeholder="Nom de l'organisation" />
                                            </div>
                                        )}

                                        <RadioChoice label="Appartenez-vous à un ordre ? *" name="appartenirOrdre" value={formData.appartenirOrdre} onChange={handleChange} error={errors.appartenirOrdre} />
                                        {formData.appartenirOrdre === 'oui' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in zoom-in duration-300">
                                                <SelectField label="Sélectionnez l'ordre *" options={options.ordre} value={formData.ordre} onChange={(v: any) => handleSelectChange('ordre', v)} error={errors.ordre} />
                                                <InputField label="Numéro d'inscription *" name="numeroInscription" value={formData.numeroInscription} onChange={handleChange} error={errors.numeroInscription} placeholder="Numéro d'inscription à l'ordre" />
                                            </div>
                                        )}
                                    </div>

                                    <NavigationButtons next={nextStep} prev={prevStep} />
                                </div>
                            )}

                            {/* STEP 6: Recap & Validation */}
                            {step === 6 && (
                                <div className="space-y-6 animate-slide-in-right">
                                    <SectionTitle icon={<CheckCircle2 />} title="Vérification & Validation" subtitle="Veuillez vérifier vos informations avant de valider" />

                                    <div className="space-y-4">
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <p className="text-xs font-bold uppercase">Vérification finale : Veuillez relire attentivement votre dossier.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {/* Section 1: Compte */}
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                <h3 className="text-xs font-black uppercase text-blue-600 mb-4 flex items-center gap-2">
                                                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px]">1</span>
                                                    Compte
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Email</p>
                                                        <p className="text-sm font-medium text-slate-900">{formData.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section 2: Identité */}
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                <h3 className="text-xs font-black uppercase text-purple-600 mb-4 flex items-center gap-2">
                                                    <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[10px]">2</span>
                                                    Informations personnelles
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Civilité</p>
                                                        <p className="text-sm font-medium text-slate-900">{getLabelFromValue('civilite', formData.civilite)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Nom</p>
                                                        <p className="text-sm font-medium text-slate-900">{formData.nom}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Prénoms</p>
                                                        <p className="text-sm font-medium text-slate-900">{formData.prenoms}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Nationalité</p>
                                                        <p className="text-sm font-medium text-slate-900">{getLabelFromValue('nationalite', formData.nationalite)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Date de naissance</p>
                                                        <p className="text-sm font-medium text-slate-900">{formData.dateNaissance}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Contact</p>
                                                        <p className="text-sm font-medium text-slate-900">{formData.numero}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {!isValidNumeroInscription && (
                                                <>
                                                    {/* Section 3: Expertise */}
                                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <h3 className="text-xs font-black uppercase text-emerald-600 mb-4 flex items-center gap-2">
                                                            <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-[10px]">3</span>
                                                            Informations professionnelles
                                                        </h3>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Profession</p>
                                                                <p className="text-sm font-medium text-slate-900">{getLabelFromValue('typeProfession', formData.typeProfession)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Spécialité</p>
                                                                <p className="text-sm font-medium text-slate-900">{getLabelFromValue('profession', formData.profession)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Diplôme</p>
                                                                <p className="text-sm font-medium text-slate-900">{formData.diplome}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Lieu d'exercice</p>
                                                                <p className="text-sm font-medium text-slate-900">{formData.professionnel}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {!isValidNumeroInscription ? (
                                            <div className="p-8 bg-gradient-to-br from-blue-700 to-blue-900 rounded-[24px] text-white shadow-xl shadow-blue-500/20 mb-8 border border-white/10">
                                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                                    <div>
                                                        <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Montant à régler</p>
                                                        <h3 className="text-5xl font-black">20 000 <span className="text-2xl font-bold opacity-50">FCFA</span></h3>
                                                    </div>
                                                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                        <CheckCircle2 className="w-12 h-12" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 italic text-sm">
                                                Votre numéro d'inscription a été vérifié avec succès. Veuillez valider vos informations pour terminer.
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <button type="button" onClick={prevStep} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-widest flex-1 order-2 sm:order-1">
                                            Précédent
                                        </button>
                                        <button type="submit" onClick={handleSubmit} disabled={loading} className="flex-[2] px-10 py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:bg-slate-300 order-1 sm:order-2">
                                            {loading ? 'Traitement...' : (isValidNumeroInscription ? 'Valider les informations' : 'Terminer l\'inscription')} <CreditCard className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}

const SectionTitle = ({ icon, title, subtitle }: any) => (
    <div className="flex items-center gap-4 pb-6 border-b border-slate-50 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
            {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h2>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
    </div>
);

const InputField = ({ label, name, type = 'text', value, onChange, icon, error, placeholder }: any) => (
    <div className="space-y-1.5">
        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider ml-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{React.cloneElement(icon, { className: "w-4 h-4" })}</div>}
            <input
                name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
                className={`w-full ${icon ? 'pl-11' : 'px-4'} pr-4 h-11 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all text-sm`}
            />
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
);

const SelectField = ({ label, options, value, onChange, error }: any) => {
    // Generate a unique ID for the Select instance to avoid hydration issues
    const instanceId = React.useId();

    return (
        <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider ml-1">{label}</label>
            <Select
                instanceId={instanceId}
                isSearchable={true}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                styles={{
                    control: (base, state) => ({
                        ...base,
                        minHeight: '44px',
                        borderRadius: '12px',
                        borderColor: error ? '#ef4444' : (state.isFocused ? '#0052cc' : '#e2e8f0'),
                        backgroundColor: '#f8fafc',
                        '&:hover': { borderColor: '#cbd5e1' },
                    }),
                    placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '13px' }),
                    singleValue: (base) => ({ ...base, fontSize: '14px', color: '#1e293b' }),
                    menuPortal: base => ({ ...base, zIndex: 9999 })
                }}
                options={options}
                value={options?.find((o: any) => o.value === value) || null}
                onChange={onChange}
                placeholder="Sélectionner..."
            />
            {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
};

const FileUploader = ({ label, id, subtitle, onChange, value, error }: any) => (
    <div className={`group relative p-6 bg-slate-50 rounded-[24px] border-2 border-dashed ${error ? 'border-red-300' : 'border-slate-200'} hover:border-blue-400 hover:bg-white hover:shadow-xl transition-all duration-300`}>
        <div className="flex flex-col items-center text-center space-y-3">
            <div className={`w-12 h-12 rounded-2xl ${value ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-400'} shadow-sm flex items-center justify-center group-hover:scale-110 transition-all`}>
                {value ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
                <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{label}</p>
                {subtitle && <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{subtitle}</p>}
            </div>
            <p className="text-[10px] text-slate-500 font-bold bg-slate-100 px-4 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                {value ? (typeof value === 'string' ? value : value.name) : "Charger le document"}
            </p>
            <input type="file" id={id} onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold text-center mt-2">{error}</p>}
    </div>
);

const RadioChoice = ({ label, name, value, onChange, error }: any) => (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <label className="block text-xs font-black text-slate-700 mb-4 ml-1 uppercase tracking-widest">{label}</label>
        <div className="flex gap-4">
            {['oui', 'non'].map(choice => (
                <label key={choice} className={`flex-1 flex items-center justify-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all hover:bg-white ${value === choice ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-100' : 'border-slate-200 text-slate-500'}`}>
                    <input type="radio" name={name} value={choice} checked={value === choice} onChange={onChange} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                    <span className="font-black text-sm uppercase tracking-widest">{choice}</span>
                </label>
            ))}
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold mt-3 ml-1">{error}</p>}
    </div>
);

const NavigationButtons = ({ next, prev, isNextLoading }: any) => (
    <div className={`pt-8 flex ${prev ? 'justify-between' : 'justify-end'} gap-4`}>
        {prev && (
            <button type="button" onClick={prev} className="px-8 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all text-xs tracking-widest uppercase">
                <ArrowLeft className="w-4 h-4" /> Précédent
            </button>
        )}
        <button type="button" onClick={next} disabled={isNextLoading} className="px-10 py-3.5 bg-blue-600 text-white rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 text-xs tracking-widest uppercase disabled:opacity-50">
            {isNextLoading ? 'Vérification...' : 'Suivant'} <ArrowRight className="w-4 h-4" />
        </button>
    </div>
);
