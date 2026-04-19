'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ProgressBar } from 'primereact/progressbar';
import { Message } from 'primereact/message';
import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { printReport } from '../../../../utils/pdfExport';
import {
    Immobilisation, PlanAmortissementLigne, ImmoSynthese,
    CATEGORIES_IMMO, METHODES_AMORT, ETATS_IMMO, TYPES_FINANCEMENT, CptExercice, CptCompte
} from '../types';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';

const BASE_URL  = buildApiUrl('/api/comptability/immobilisations');
const COMPTES_URL = buildApiUrl('/api/comptability/ecritures/findListCompte');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number | null | undefined) =>
    v != null ? new Intl.NumberFormat('fr-FR').format(v) + ' FBU' : '-';

const fmtCcy = (v: number | null | undefined) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', minimumFractionDigits: 0 }).format(v || 0);

const fmtDate = (s: string | null | undefined) =>
    s ? new Date(s).toLocaleDateString('fr-FR') : '-';

const toIso = (d: Date | null) => {
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getCatLabel = (code: string) => CATEGORIES_IMMO.find(c => c.code === code)?.label || code || '-';
const getEtatCfg = (code: string) => ETATS_IMMO.find(e => e.code === code) || { label: code, severity: 'info' };
const pct = (i: Immobilisation) =>
    i.valeurAcquisition ? Math.round(((i.amortissementsCumules || 0) / i.valeurAcquisition) * 100) : 0;

// ──────────────────────────────────────────────────────────────────────────────

const AmortissementComponent: React.FC = () => {
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]>>(null);

    // ── Data state ──
    const [immobilisations, setImmobilisations] = useState<Immobilisation[]>([]);
    const [synthese, setSynthese] = useState<ImmoSynthese[]>([]);
    const [alertesAmortis, setAlertesAmortis] = useState<Immobilisation[]>([]);
    const [alertesProcheFin, setAlertesProcheFin] = useState<Immobilisation[]>([]);
    const [alertesGarantie, setAlertesGarantie] = useState<Immobilisation[]>([]);
    const [alertesEntretien, setAlertesEntretien] = useState<Immobilisation[]>([]);
    const [planLignes, setPlanLignes] = useState<PlanAmortissementLigne[]>([]);
    const [selected, setSelected] = useState<Immobilisation | null>(null);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);

    // ── Filter state ──
    const [globalFilter, setGlobalFilter] = useState('');
    const [filterCategorie, setFilterCategorie] = useState<string | null>(null);
    const [filterEtat, setFilterEtat] = useState<string | null>(null);

    // ── Dialog state ──
    const [immo, setImmo] = useState<Immobilisation>(new Immobilisation());
    const [editMode, setEditMode] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showPlanDialog, setShowPlanDialog] = useState(false);
    const [showCessionDialog, setShowCessionDialog] = useState(false);
    const [showRebutDialog, setShowRebutDialog] = useState(false);

    // ── Calendar fields (separate state for PrimeReact) ──
    const [dateAcq, setDateAcq] = useState<Date | null>(null);
    const [dateMES, setDateMES] = useState<Date | null>(null);
    const [dateGarantie, setDateGarantie] = useState<Date | null>(null);
    const [dateEntretien, setDateEntretien] = useState<Date | null>(null);
    const [dateCessionVal, setDateCessionVal] = useState<Date | null>(new Date());
    const [prixCessionVal, setPrixCessionVal] = useState<number>(0);
    const [motifCession, setMotifCession] = useState('');
    const [motifRebut, setMotifRebut] = useState('');

    // ── Comptes state ──
    const [comptes, setComptes] = useState<CptCompte[]>([]);

    // ── API hooks ──
    const immoApi    = useConsumApi('');
    const synApi     = useConsumApi('');
    const alertApi1  = useConsumApi('');
    const alertApi2  = useConsumApi('');
    const alertApi3  = useConsumApi('');
    const alertApi4  = useConsumApi('');
    const saveApi    = useConsumApi('');
    const planApi    = useConsumApi('');
    const deleteApi  = useConsumApi('');
    const cessionApi = useConsumApi('');
    const rebutApi   = useConsumApi('');
    const comptesApi = useConsumApi('');

    // ── Init ──
    useEffect(() => {
        const saved = Cookies.get('currentExercice');
        if (saved) { try { setCurrentExercice(JSON.parse(saved)); } catch {} }
        loadAll();
        loadSynthese();
        loadAlertes();
        comptesApi.fetchData(null, 'GET', COMPTES_URL, 'loadComptes');
    }, []);

    useEffect(() => {
        if (comptesApi.data) setComptes(Array.isArray(comptesApi.data) ? comptesApi.data : []);
    }, [comptesApi.data]);

    // ── API responses ──
    useEffect(() => {
        if (immoApi.data) setImmobilisations(Array.isArray(immoApi.data) ? immoApi.data : []);
        if (immoApi.error) showErr(immoApi.error.message);
    }, [immoApi.data, immoApi.error]);

    useEffect(() => {
        if (synApi.data) setSynthese(Array.isArray(synApi.data) ? synApi.data : []);
    }, [synApi.data]);

    useEffect(() => { if (alertApi1.data) setAlertesAmortis(Array.isArray(alertApi1.data) ? alertApi1.data : []); }, [alertApi1.data]);
    useEffect(() => { if (alertApi2.data) setAlertesProcheFin(Array.isArray(alertApi2.data) ? alertApi2.data : []); }, [alertApi2.data]);
    useEffect(() => { if (alertApi3.data) setAlertesGarantie(Array.isArray(alertApi3.data) ? alertApi3.data : []); }, [alertApi3.data]);
    useEffect(() => { if (alertApi4.data) setAlertesEntretien(Array.isArray(alertApi4.data) ? alertApi4.data : []); }, [alertApi4.data]);

    useEffect(() => {
        if (saveApi.data) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: editMode ? 'Immobilisation modifiée' : 'Immobilisation créée', life: 3000 });
            setShowDialog(false);
            loadAll(); loadSynthese();
        }
        if (saveApi.error) showErr(saveApi.error.message);
    }, [saveApi.data, saveApi.error]);

    useEffect(() => {
        if (planApi.data) { setPlanLignes(Array.isArray(planApi.data) ? planApi.data : []); setShowPlanDialog(true); }
        if (planApi.error) showErr(planApi.error.message);
    }, [planApi.data, planApi.error]);

    useEffect(() => {
        if (deleteApi.data !== null && deleteApi.data !== undefined) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Immobilisation supprimée', life: 3000 });
            loadAll(); loadSynthese(); loadAlertes();
        }
        if (deleteApi.error) showErr(deleteApi.error.message);
    }, [deleteApi.data, deleteApi.error]);

    useEffect(() => {
        if (cessionApi.data) {
            toast.current?.show({ severity: 'success', summary: 'Cession enregistrée', detail: 'La cession a été enregistrée avec succès', life: 3000 });
            setShowCessionDialog(false);
            loadAll(); loadSynthese(); loadAlertes();
        }
        if (cessionApi.error) showErr(cessionApi.error.message);
    }, [cessionApi.data, cessionApi.error]);

    useEffect(() => {
        if (rebutApi.data) {
            toast.current?.show({ severity: 'success', summary: 'Mise au rebut', detail: 'Le bien a été mis au rebut', life: 3000 });
            setShowRebutDialog(false);
            loadAll(); loadSynthese(); loadAlertes();
        }
        if (rebutApi.error) showErr(rebutApi.error.message);
    }, [rebutApi.data, rebutApi.error]);

    // ── Load functions ──
    const loadAll = () => immoApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadAll');
    const loadSynthese = () => synApi.fetchData(null, 'GET', `${BASE_URL}/synthese/par-categorie`, 'synthese');
    const loadAlertes = () => {
        alertApi1.fetchData(null, 'GET', `${BASE_URL}/alertes/totalement-amortis`, 'a1');
        alertApi2.fetchData(null, 'GET', `${BASE_URL}/alertes/proche-fin?nbMois=6`, 'a2');
        alertApi3.fetchData(null, 'GET', `${BASE_URL}/alertes/garantie-expirant?nbMois=3`, 'a3');
        alertApi4.fetchData(null, 'GET', `${BASE_URL}/alertes/entretien-prochain?nbJours=30`, 'a4');
    };
    const showErr  = (msg: string) => toast.current?.show({ severity: 'error',   summary: 'Erreur',    detail: msg, life: 4000 });
    const showWarn = (msg: string) => toast.current?.show({ severity: 'warn',    summary: 'Attention', detail: msg, life: 4000 });

    // ── CRUD handlers ──
    const openNew = () => {
        const n = new Immobilisation();
        if (currentExercice) n.exerciceId = Number(currentExercice.exerciceId);
        setImmo(n);
        setDateAcq(null); setDateMES(null); setDateGarantie(null); setDateEntretien(null);
        setEditMode(false); setShowDialog(true);
    };

    const openEdit = (row: Immobilisation) => {
        setImmo({ ...row });
        setDateAcq(row.dateAcquisition ? new Date(row.dateAcquisition) : null);
        setDateMES(row.dateMiseEnService ? new Date(row.dateMiseEnService) : null);
        setDateGarantie(row.garantieExpiration ? new Date(row.garantieExpiration) : null);
        setDateEntretien(row.dateProchainEntretien ? new Date(row.dateProchainEntretien) : null);
        setEditMode(true); setShowDialog(true);
    };

    const handleCategorieChange = (catCode: string) => {
        const cat = CATEGORIES_IMMO.find(c => c.code === catCode);
        if (cat) setImmo(p => ({
            ...p, categorie: catCode,
            methodeAmortissement: cat.methode, dureeVieUtile: cat.duree,
            tauxAmortissement: Math.round((100 / cat.duree) * 100) / 100,
            compteImmoCode: cat.compteImmo, compteAmortCode: cat.compteAmort
        }));
        else setImmo(p => ({ ...p, categorie: catCode }));
    };

    const saveImmo = () => {
        if (!immo.designation.trim()) { showWarn('La désignation est obligatoire'); return; }
        if (!immo.categorie) { showWarn('La catégorie est obligatoire'); return; }
        if (!immo.valeurAcquisition || immo.valeurAcquisition <= 0) { showWarn("La valeur d'acquisition doit être supérieure à 0"); return; }
        const acqDate = dateAcq || (immo.dateAcquisition ? new Date(immo.dateAcquisition) : null);
        if (!acqDate) { showWarn("La date d'acquisition est obligatoire"); return; }
        if (!immo.dureeVieUtile || immo.dureeVieUtile < 1) { showWarn('La durée de vie utile doit être d\'au moins 1 an'); return; }
        const mesDate = dateMES || (immo.dateMiseEnService ? new Date(immo.dateMiseEnService) : null);
        if (mesDate && acqDate && mesDate < acqDate) {
            showWarn('La date de mise en service ne peut pas être antérieure à la date d\'acquisition');
            return;
        }
        const payload = {
            ...immo,
            dateAcquisition: toIso(dateAcq) || immo.dateAcquisition,
            dateMiseEnService: toIso(dateMES) || immo.dateMiseEnService,
            garantieExpiration: toIso(dateGarantie) || immo.garantieExpiration,
            dateProchainEntretien: toIso(dateEntretien) || immo.dateProchainEntretien,
            userAction: getUserAction()
        };
        if (editMode && immo.immoId) saveApi.fetchData(payload, 'PUT', `${BASE_URL}/update/${immo.immoId}`, 'save');
        else saveApi.fetchData(payload, 'POST', `${BASE_URL}/new`, 'save');
    };

    const confirmDelete = (row: Immobilisation) => {
        confirmDialog({
            message: `Supprimer "${row.designation}" ? Cette action est irréversible.`,
            header: 'Confirmer la suppression', icon: 'pi pi-trash', acceptClassName: 'p-button-danger',
            accept: () => deleteApi.fetchData(null, 'DELETE', `${BASE_URL}/delete/${row.immoId}`, 'delete')
        });
    };

    const viewPlan = (row: Immobilisation) => {
        setSelected(row);
        planApi.fetchData(null, 'GET', `${BASE_URL}/${row.immoId}/plan`, 'loadPlan');
    };

    const regeneratePlan = (row: Immobilisation) => {
        confirmDialog({
            message: `Régénérer le plan de "${row.designation}" ?`, header: 'Confirmer', icon: 'pi pi-exclamation-triangle',
            accept: () => planApi.fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/${row.immoId}/generate-plan`, 'genPlan')
        });
    };

    const openCession = (row: Immobilisation) => {
        setSelected(row);
        setDateCessionVal(new Date()); setPrixCessionVal(0); setMotifCession('');
        setShowCessionDialog(true);
    };

    const saveCession = () => {
        if (!selected) return;
        if (!dateCessionVal) { showWarn('La date de cession est obligatoire'); return; }
        if (prixCessionVal < 0) { showWarn('Le prix de cession ne peut pas être négatif'); return; }
        if (!motifCession.trim()) { showWarn('Le motif de cession est obligatoire'); return; }
        const params = new URLSearchParams({
            dateCession: toIso(dateCessionVal),
            prixCession: String(prixCessionVal),
            motif: motifCession,
            userAction: getUserAction()
        });
        cessionApi.fetchData(null, 'POST', `${BASE_URL}/${selected.immoId}/ceder?${params}`, 'ceder');
    };

    const openRebut = (row: Immobilisation) => { setSelected(row); setMotifRebut(''); setShowRebutDialog(true); };

    const saveRebut = () => {
        if (!selected) return;
        if (!motifRebut.trim()) { showWarn('Le motif de mise au rebut est obligatoire'); return; }
        const params = new URLSearchParams({ motif: motifRebut, userAction: getUserAction() });
        rebutApi.fetchData(null, 'POST', `${BASE_URL}/${selected.immoId}/rebut?${params}`, 'rebut');
    };

    // ── Filtered list ──
    const filtered = immobilisations.filter(i => {
        if (filterCategorie && i.categorie !== filterCategorie) return false;
        if (filterEtat && i.etat !== filterEtat) return false;
        return true;
    });

    // ── Statistics ──
    const totalValeur = immobilisations.reduce((s, i) => s + (i.valeurAcquisition || 0), 0);
    const totalAmort  = immobilisations.reduce((s, i) => s + (i.amortissementsCumules || 0), 0);
    const totalVNC    = immobilisations.reduce((s, i) => s + (i.vnc || 0), 0);
    const totalAssur  = immobilisations.reduce((s, i) => s + (i.valeurAssurable || 0), 0);
    const enService   = immobilisations.filter(i => i.etat === 'EN_SERVICE').length;
    const totalAlertes = alertesAmortis.length + alertesProcheFin.length + alertesGarantie.length + alertesEntretien.length;

    // ── PDF exports ──
    const exportPlanPdf = () => {
        if (!selected || !planLignes.length) return;
        printReport({
            title: `Plan d'Amortissement — ${selected.designation}`,
            dateRange: `${getCatLabel(selected.categorie)} | ${selected.methodeAmortissement} | ${selected.dureeVieUtile} ans`,
            columns: [
                { header: 'An',           dataKey: 'annee',                align: 'center' },
                { header: 'Exercice',      dataKey: 'exerciceLabel',         align: 'center' },
                { header: 'Valeur brute',  dataKey: 'valeurBrute',           formatter: fmt, align: 'right' },
                { header: 'Dotation',      dataKey: 'dotation',              formatter: fmt, align: 'right' },
                { header: 'Amort. cumulés',dataKey: 'amortissementsCumules', formatter: fmt, align: 'right' },
                { header: 'VNC',           dataKey: 'vnc',                   formatter: fmt, align: 'right' },
                { header: 'Taux (%)',       dataKey: 'taux',                  align: 'right' },
            ],
            data: planLignes,
            statistics: [
                { label: "Valeur d'acquisition",  value: fmt(selected.valeurAcquisition) },
                { label: 'Valeur résiduelle',     value: fmt(selected.valeurResiduelle) },
                { label: 'Méthode',               value: selected.methodeAmortissement },
                { label: 'Durée',                 value: `${selected.dureeVieUtile} ans` },
            ]
        });
    };

    const exportRegistrePdf = () => {
        printReport({
            title: 'Registre des Immobilisations',
            dateRange: `Exercice : ${currentExercice?.codeExercice || 'Tous'} — ${new Date().toLocaleDateString('fr-FR')}`,
            columns: [
                { header: 'Code',         dataKey: 'codeImmo' },
                { header: 'N° Inv.',      dataKey: 'numeroInventaire' },
                { header: 'Désignation',  dataKey: 'designation' },
                { header: 'Catégorie',    dataKey: 'categorie', formatter: (v: any) => getCatLabel(v) },
                { header: 'Date Acq.',    dataKey: 'dateAcquisition', formatter: (v: any) => fmtDate(v) },
                { header: 'Val. Brute',   dataKey: 'valeurAcquisition', formatter: fmt, align: 'right' },
                { header: 'Amort. Cum.',  dataKey: 'amortissementsCumules', formatter: fmt, align: 'right' },
                { header: 'VNC',          dataKey: 'vnc', formatter: fmt, align: 'right' },
                { header: 'État',         dataKey: 'etat', formatter: (v: any) => getEtatCfg(v).label },
            ],
            data: filtered,
            statistics: [
                { label: 'Total biens',       value: filtered.length },
                { label: 'Valeur brute',      value: fmt(totalValeur) },
                { label: 'Amort. cumulés',    value: fmt(totalAmort) },
                { label: 'VNC totale',        value: fmt(totalVNC) },
            ]
        });
    };

    const exportCsv = () => {
        const BOM = '\uFEFF';
        const headers = ['Code','N° Inventaire','Désignation','Catégorie','Date Acq.','Date MES','Val. Acq. (FBU)',
            'Val. Résid. (FBU)','Val. Assurable (FBU)','Durée (ans)','Taux (%)','Méthode',
            'Amort. Cumulés (FBU)','VNC (FBU)','État','Type Financement','Localisation','Fournisseur',
            'N° Série','Réf. Achat','Compte Immo','Compte Amort','Garantie expir.','Prochain entretien'];
        const rows = filtered.map(i => [
            i.codeImmo, i.numeroInventaire, i.designation, getCatLabel(i.categorie),
            i.dateAcquisition, i.dateMiseEnService, i.valeurAcquisition, i.valeurResiduelle,
            i.valeurAssurable, i.dureeVieUtile, i.tauxAmortissement, i.methodeAmortissement,
            i.amortissementsCumules, i.vnc, i.etat, i.typeFinancement, i.localisation,
            i.fournisseur, i.numeroSerie, i.referenceAchat, i.compteImmoCode, i.compteAmortCode,
            i.garantieExpiration, i.dateProchainEntretien
        ].map(v => `"${v ?? ''}"`).join(';'));
        const csv = BOM + [headers.join(';'), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'registre_immobilisations.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    // ── Column bodies ──
    const etatBody = (row: Immobilisation) => {
        const cfg = getEtatCfg(row.etat);
        return <Tag value={cfg.label} severity={cfg.severity as any} />;
    };

    const pctBody = (row: Immobilisation) => (
        <div className="flex align-items-center gap-2">
            <ProgressBar value={pct(row)} style={{ height: '8px', width: '80px' }} showValue={false} />
            <span className="text-sm font-semibold">{pct(row)}%</span>
        </div>
    );

    const actionsBody = (row: Immobilisation) => (
        <div className="flex gap-1 flex-wrap">
            <Button icon="pi pi-chart-line" rounded text severity="info"    tooltip="Plan d'amortissement"  onClick={() => viewPlan(row)} />
            <Button icon="pi pi-pencil"     rounded text severity="warning" tooltip="Modifier"              onClick={() => openEdit(row)} disabled={['CEDE','REBUT'].includes(row.etat)} />
            <Button icon="pi pi-refresh"    rounded text severity="help"    tooltip="Régénérer plan"        onClick={() => regeneratePlan(row)} disabled={['CEDE','REBUT'].includes(row.etat)} />
            <Button icon="pi pi-sign-out"   rounded text severity="warning" tooltip="Enregistrer cession"   onClick={() => openCession(row)} disabled={['CEDE','REBUT'].includes(row.etat)} />
            <Button icon="pi pi-ban"        rounded text severity="danger"  tooltip="Mettre au rebut"       onClick={() => openRebut(row)}   disabled={['CEDE','REBUT'].includes(row.etat)} />
            <Button icon="pi pi-trash"      rounded text severity="danger"  tooltip="Supprimer"             onClick={() => confirmDelete(row)} />
        </div>
    );

    const tableHeader = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0"><i className="pi pi-building mr-2"></i>Registre des Immobilisations</h5>
            <div className="flex gap-2 align-items-center flex-wrap">
                <Dropdown value={filterCategorie} options={CATEGORIES_IMMO} onChange={e => setFilterCategorie(e.value)}
                    optionLabel="label" optionValue="code" placeholder="Toutes catégories" showClear className="w-14rem" />
                <Dropdown value={filterEtat} options={ETATS_IMMO} onChange={e => setFilterEtat(e.value)}
                    optionLabel="label" optionValue="code" placeholder="Tous états" showClear className="w-10rem" />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" className="w-12rem" />
                </span>
                <Button icon="pi pi-file-pdf"   label="PDF"  severity="danger"   outlined onClick={exportRegistrePdf} />
                <Button icon="pi pi-file-excel" label="CSV"  severity="success"  outlined onClick={exportCsv} />
                <Button icon="pi pi-plus"       label="Nouveau" onClick={openNew} />
            </div>
        </div>
    );

    // ──────────────────────────────────────────────────────────────────────────
    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Exercice banner */}
            {currentExercice && (
                <div className="surface-100 p-3 border-round mb-3 flex align-items-center gap-3">
                    <i className="pi pi-calendar text-primary text-xl"></i>
                    <div>
                        <span className="font-bold text-primary">{currentExercice.codeExercice}</span>
                        <span className="text-600 text-sm ml-2">{currentExercice.description}</span>
                    </div>
                    {totalAlertes > 0 && (
                        <Tag value={`${totalAlertes} alerte(s)`} severity="warning" className="ml-auto" />
                    )}
                </div>
            )}

            {/* Stats cards */}
            <div className="grid mb-3">
                <div className="col-6 md:col-2">
                    <div className="surface-100 p-3 border-round text-center">
                        <p className="text-500 m-0 text-xs">Biens</p>
                        <p className="text-2xl font-bold m-0">{immobilisations.length}</p>
                        <p className="text-500 m-0 text-xs">{enService} en service</p>
                    </div>
                </div>
                <div className="col-6 md:col-2">
                    <div className="bg-blue-50 p-3 border-round text-center">
                        <p className="text-500 m-0 text-xs">Valeur Brute</p>
                        <p className="text-lg font-bold text-blue-700 m-0">{fmtCcy(totalValeur)}</p>
                    </div>
                </div>
                <div className="col-6 md:col-2">
                    <div className="bg-orange-50 p-3 border-round text-center">
                        <p className="text-500 m-0 text-xs">Amort. Cumulés</p>
                        <p className="text-lg font-bold text-orange-600 m-0">{fmtCcy(totalAmort)}</p>
                    </div>
                </div>
                <div className="col-6 md:col-2">
                    <div className="bg-green-50 p-3 border-round text-center">
                        <p className="text-500 m-0 text-xs">VNC Totale</p>
                        <p className="text-lg font-bold text-green-700 m-0">{fmtCcy(totalVNC)}</p>
                    </div>
                </div>
                <div className="col-6 md:col-2">
                    <div className="bg-purple-50 p-3 border-round text-center">
                        <p className="text-500 m-0 text-xs">Val. Assurable</p>
                        <p className="text-lg font-bold text-purple-700 m-0">{fmtCcy(totalAssur)}</p>
                    </div>
                </div>
                <div className="col-6 md:col-2">
                    <div className={`p-3 border-round text-center ${totalAlertes > 0 ? 'bg-red-50' : 'surface-100'}`}>
                        <p className="text-500 m-0 text-xs">Alertes</p>
                        <p className={`text-2xl font-bold m-0 ${totalAlertes > 0 ? 'text-red-600' : ''}`}>{totalAlertes}</p>
                    </div>
                </div>
            </div>

            {/* Main tabs */}
            <TabView>

                {/* ══ Tab 1 — Registre ══ */}
                <TabPanel header="Registre" leftIcon="pi pi-list mr-2">
                    <DataTable ref={dt} value={filtered} paginator rows={10} rowsPerPageOptions={[5,10,25,50]}
                        loading={immoApi.loading} header={tableHeader} globalFilter={globalFilter}
                        emptyMessage="Aucune immobilisation" className="p-datatable-sm"
                        sortField="codeImmo" sortOrder={1}>
                        <Column field="codeImmo"           header="Code"       sortable style={{ width: '7rem' }} />
                        <Column field="numeroInventaire"   header="N° Inv."    sortable style={{ width: '6rem' }} />
                        <Column field="designation"        header="Désignation" sortable />
                        <Column field="categorie"          header="Catégorie"   body={r => getCatLabel(r.categorie)} sortable />
                        <Column field="dateAcquisition"    header="Date Acq."   body={r => fmtDate(r.dateAcquisition)} sortable />
                        <Column field="valeurAcquisition"  header="Val. Brute"  body={r => fmtCcy(r.valeurAcquisition)} sortable />
                        <Column field="methodeAmortissement" header="Méthode"   sortable style={{ width: '6rem' }} />
                        <Column field="dureeVieUtile"      header="Durée"       body={r => `${r.dureeVieUtile} ans`} sortable style={{ width: '5rem' }} />
                        <Column header="% Amorti"          body={pctBody} style={{ width: '9rem' }} />
                        <Column field="vnc"                header="VNC"         body={r => fmtCcy(r.vnc)} sortable />
                        <Column field="etat"               header="État"        body={etatBody} sortable style={{ width: '8rem' }} />
                        <Column header="Actions"           body={actionsBody}   style={{ width: '14rem' }} />
                    </DataTable>
                </TabPanel>

                {/* ══ Tab 2 — Synthèse par catégorie ══ */}
                <TabPanel header="Synthèse" leftIcon="pi pi-chart-bar mr-2">
                    <DataTable value={synthese} loading={synApi.loading} className="p-datatable-sm"
                        emptyMessage="Aucune donnée de synthèse" showGridlines>
                        <Column field="categorie" header="Catégorie" body={r => getCatLabel(r.categorie)} />
                        <Column field="nombreBiens"    header="Total" style={{ width: '5rem', textAlign: 'center' }} />
                        <Column field="enService"      header="En service" style={{ width: '6rem', textAlign: 'center' }}
                            body={r => <Tag value={r.enService} severity="success" />} />
                        <Column field="amortis"        header="Amortis" style={{ width: '6rem', textAlign: 'center' }}
                            body={r => r.amortis > 0 ? <Tag value={r.amortis} severity="info" /> : '-'} />
                        <Column field="cedes"          header="Cédés" style={{ width: '5rem', textAlign: 'center' }}
                            body={r => r.cedes > 0 ? <Tag value={r.cedes} severity="warning" /> : '-'} />
                        <Column field="valeurBrute"    header="Val. Brute (FBU)"   body={r => fmtCcy(r.valeurBrute)} bodyStyle={{ textAlign: 'right' }} />
                        <Column field="amortissementsCumules" header="Amort. Cumulés (FBU)" body={r => fmtCcy(r.amortissementsCumules)} bodyStyle={{ textAlign: 'right', color: '#d97706' }} />
                        <Column field="vnc"            header="VNC (FBU)"          body={r => fmtCcy(r.vnc)} bodyStyle={{ textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }} />
                        <Column field="valeurAssurable" header="Val. Assurable (FBU)" body={r => r.valeurAssurable > 0 ? fmtCcy(r.valeurAssurable) : '-'} bodyStyle={{ textAlign: 'right' }} />
                    </DataTable>

                    {/* Synthèse totaux */}
                    {synthese.length > 0 && (
                        <div className="surface-100 p-3 border-round mt-3">
                            <div className="grid text-center">
                                <div className="col-3"><p className="text-500 text-sm m-0">Total biens</p><p className="font-bold text-xl m-0">{immobilisations.length}</p></div>
                                <div className="col-3"><p className="text-500 text-sm m-0">Valeur brute</p><p className="font-bold text-xl text-blue-700 m-0">{fmtCcy(totalValeur)}</p></div>
                                <div className="col-3"><p className="text-500 text-sm m-0">Amort. cumulés</p><p className="font-bold text-xl text-orange-600 m-0">{fmtCcy(totalAmort)}</p></div>
                                <div className="col-3"><p className="text-500 text-sm m-0">VNC totale</p><p className="font-bold text-xl text-green-700 m-0">{fmtCcy(totalVNC)}</p></div>
                            </div>
                        </div>
                    )}
                </TabPanel>

                {/* ══ Tab 3 — Alertes ══ */}
                <TabPanel header={`Alertes ${totalAlertes > 0 ? '('+totalAlertes+')' : ''}`} leftIcon="pi pi-bell mr-2">

                    {/* Totalement amortis mais en service */}
                    <div className="mb-4">
                        <div className="flex align-items-center gap-2 mb-2">
                            <i className="pi pi-exclamation-triangle text-orange-500 text-lg"></i>
                            <h6 className="m-0 font-bold">Biens totalement amortis encore en service ({alertesAmortis.length})</h6>
                        </div>
                        {alertesAmortis.length === 0
                            ? <Message severity="info" text="Aucun bien totalement amorti en service." className="w-full" />
                            : <DataTable value={alertesAmortis} className="p-datatable-sm" showGridlines>
                                <Column field="codeImmo"    header="Code" />
                                <Column field="designation" header="Désignation" />
                                <Column field="categorie"   header="Catégorie" body={r => getCatLabel(r.categorie)} />
                                <Column field="valeurAcquisition" header="Val. Brute" body={r => fmtCcy(r.valeurAcquisition)} />
                                <Column field="dateAcquisition"   header="Date Acq."  body={r => fmtDate(r.dateAcquisition)} />
                                <Column header="Action recommandée" body={() => <Tag value="Révision plan ou mise au rebut" severity="warning" />} />
                              </DataTable>
                        }
                    </div>

                    {/* Proche fin de vie (6 mois) */}
                    <div className="mb-4">
                        <div className="flex align-items-center gap-2 mb-2">
                            <i className="pi pi-clock text-red-500 text-lg"></i>
                            <h6 className="m-0 font-bold">Fin de vie dans les 6 prochains mois ({alertesProcheFin.length})</h6>
                        </div>
                        {alertesProcheFin.length === 0
                            ? <Message severity="success" text="Aucun bien en fin de vie imminente." className="w-full" />
                            : <DataTable value={alertesProcheFin} className="p-datatable-sm" showGridlines>
                                <Column field="codeImmo"    header="Code" />
                                <Column field="designation" header="Désignation" />
                                <Column field="categorie"   header="Catégorie" body={r => getCatLabel(r.categorie)} />
                                <Column field="vnc"         header="VNC actuelle" body={r => fmtCcy(r.vnc)} />
                                <Column header="Fin de vie estimée" body={r => {
                                    if (!r.dateMiseEnService || !r.dureeVieUtile) return '-';
                                    const d = new Date(r.dateMiseEnService);
                                    d.setFullYear(d.getFullYear() + r.dureeVieUtile);
                                    return d.toLocaleDateString('fr-FR');
                                }} />
                                <Column header="Action" body={() => <Tag value="Planifier remplacement" severity="danger" />} />
                              </DataTable>
                        }
                    </div>

                    {/* Garantie expirant (3 mois) */}
                    <div className="mb-4">
                        <div className="flex align-items-center gap-2 mb-2">
                            <i className="pi pi-shield text-yellow-500 text-lg"></i>
                            <h6 className="m-0 font-bold">Garantie expirant dans les 3 prochains mois ({alertesGarantie.length})</h6>
                        </div>
                        {alertesGarantie.length === 0
                            ? <Message severity="success" text="Aucune garantie n'expire prochainement." className="w-full" />
                            : <DataTable value={alertesGarantie} className="p-datatable-sm" showGridlines>
                                <Column field="codeImmo"           header="Code" />
                                <Column field="designation"        header="Désignation" />
                                <Column field="fournisseur"        header="Fournisseur" />
                                <Column field="garantieExpiration" header="Expiration garantie" body={r => fmtDate(r.garantieExpiration)} />
                                <Column header="Action" body={() => <Tag value="Contacter fournisseur" severity="warning" />} />
                              </DataTable>
                        }
                    </div>

                    {/* Entretien planifié (30 jours) */}
                    <div className="mb-2">
                        <div className="flex align-items-center gap-2 mb-2">
                            <i className="pi pi-wrench text-blue-500 text-lg"></i>
                            <h6 className="m-0 font-bold">Entretien préventif dans les 30 prochains jours ({alertesEntretien.length})</h6>
                        </div>
                        {alertesEntretien.length === 0
                            ? <Message severity="success" text="Aucun entretien planifié dans les 30 jours." className="w-full" />
                            : <DataTable value={alertesEntretien} className="p-datatable-sm" showGridlines>
                                <Column field="codeImmo"               header="Code" />
                                <Column field="designation"            header="Désignation" />
                                <Column field="localisation"           header="Localisation" />
                                <Column field="dateProchainEntretien"  header="Date entretien" body={r => fmtDate(r.dateProchainEntretien)} />
                                <Column header="Action" body={() => <Tag value="Planifier intervention" severity="info" />} />
                              </DataTable>
                        }
                    </div>
                </TabPanel>

                {/* ══ Tab 4 — Cessions & Sorties ══ */}
                <TabPanel header="Cessions / Sorties" leftIcon="pi pi-sign-out mr-2">
                    <DataTable value={immobilisations.filter(i => ['CEDE','REBUT'].includes(i.etat))}
                        className="p-datatable-sm" emptyMessage="Aucune cession ou mise au rebut enregistrée" showGridlines>
                        <Column field="codeImmo"      header="Code" />
                        <Column field="designation"   header="Désignation" />
                        <Column field="etat"          header="Type sortie" body={etatBody} />
                        <Column field="dateCession"   header="Date sortie"  body={r => fmtDate(r.dateCession)} />
                        <Column field="prixCession"   header="Prix cession" body={r => r.prixCession > 0 ? fmtCcy(r.prixCession) : '-'} />
                        <Column field="plusMoinsValue" header="+/- value" body={r => {
                            if (r.plusMoinsValue == null) return '-';
                            const color = r.plusMoinsValue >= 0 ? '#16a34a' : '#dc2626';
                            return <span style={{ color, fontWeight: 'bold' }}>{fmtCcy(r.plusMoinsValue)}</span>;
                        }} />
                        <Column field="motifSortie"   header="Motif" />
                        <Column field="valeurAcquisition" header="Val. Brute initiale" body={r => fmtCcy(r.valeurAcquisition)} />
                        <Column field="amortissementsCumules" header="Amort. cumulés" body={r => fmtCcy(r.amortissementsCumules)} />
                    </DataTable>

                    {/* SYSCOHADA écriture cession */}
                    <div className="surface-50 p-3 border-round border-1 border-200 mt-3 text-sm">
                        <p className="font-bold mb-2"><i className="pi pi-book mr-1 text-primary"></i>Écritures SYSCOHADA — Cession d'immobilisation :</p>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <p className="m-1">D : <strong>28xxx</strong> – Amortissements cumulés (montant amorti)</p>
                                <p className="m-1">D : <strong>6512</strong> – Moins-value de cession (si perte)</p>
                            </div>
                            <div className="col-12 md:col-6">
                                <p className="m-1">C : <strong>2xxx</strong> – Immobilisations (valeur brute)</p>
                                <p className="m-1">C : <strong>7512</strong> – Plus-value de cession (si gain)</p>
                            </div>
                        </div>
                    </div>
                </TabPanel>

            </TabView>

            {/* ══════════ DIALOG CRÉATION / MODIFICATION ══════════ */}
            <Dialog header={editMode ? "Modifier l'Immobilisation" : 'Nouvelle Immobilisation'}
                visible={showDialog} style={{ width: '960px' }} onHide={() => setShowDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setShowDialog(false)} />
                        <Button label="Enregistrer" icon="pi pi-save" loading={saveApi.loading} onClick={saveImmo} />
                    </div>
                }>
                <TabView>

                    {/* Tab — Identification */}
                    <TabPanel header="Identification" leftIcon="pi pi-id-card mr-2">
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold block mb-1">Code immobilisation</label>
                                <InputText value={immo.codeImmo} onChange={e => setImmo({ ...immo, codeImmo: e.target.value })}
                                    placeholder="Auto-généré si vide" className="w-full" />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold block mb-1">N° Inventaire (étiquette)</label>
                                <InputText value={immo.numeroInventaire} onChange={e => setImmo({ ...immo, numeroInventaire: e.target.value })}
                                    placeholder="ex. INV-2024-001" className="w-full" />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold block mb-1">Désignation *</label>
                                <InputText value={immo.designation} onChange={e => setImmo({ ...immo, designation: e.target.value })}
                                    placeholder="ex. Serveur principal HP" className="w-full" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Catégorie</label>
                                <Dropdown value={immo.categorie} options={CATEGORIES_IMMO}
                                    onChange={e => handleCategorieChange(e.value)}
                                    optionLabel="label" optionValue="code" placeholder="Sélectionner" className="w-full" filter />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Type de financement</label>
                                <Dropdown value={immo.typeFinancement} options={TYPES_FINANCEMENT}
                                    onChange={e => setImmo({ ...immo, typeFinancement: e.value })}
                                    optionLabel="label" optionValue="code" className="w-full" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">État</label>
                                <Dropdown value={immo.etat} options={ETATS_IMMO}
                                    onChange={e => setImmo({ ...immo, etat: e.value })}
                                    optionLabel="label" optionValue="code" className="w-full" />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold block mb-1">Date d'acquisition *</label>
                                <Calendar value={dateAcq} onChange={e => setDateAcq(e.value as Date | null)}
                                    dateFormat="dd/mm/yy" showIcon className="w-full" />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold block mb-1">Date mise en service</label>
                                <Calendar value={dateMES} onChange={e => setDateMES(e.value as Date | null)}
                                    dateFormat="dd/mm/yy" showIcon className="w-full" />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold block mb-1">Expiration garantie</label>
                                <Calendar value={dateGarantie} onChange={e => setDateGarantie(e.value as Date | null)}
                                    dateFormat="dd/mm/yy" showIcon className="w-full" />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold block mb-1">Prochain entretien</label>
                                <Calendar value={dateEntretien} onChange={e => setDateEntretien(e.value as Date | null)}
                                    dateFormat="dd/mm/yy" showIcon className="w-full" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Localisation</label>
                                <InputText value={immo.localisation} onChange={e => setImmo({ ...immo, localisation: e.target.value })}
                                    placeholder="Agence / Bureau" className="w-full" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Fournisseur</label>
                                <InputText value={immo.fournisseur} onChange={e => setImmo({ ...immo, fournisseur: e.target.value })} className="w-full" />
                            </div>
                            <div className="field col-12 md:col-2">
                                <label className="font-semibold block mb-1">N° Série</label>
                                <InputText value={immo.numeroSerie} onChange={e => setImmo({ ...immo, numeroSerie: e.target.value })} className="w-full" />
                            </div>
                            <div className="field col-12 md:col-2">
                                <label className="font-semibold block mb-1">Réf. achat</label>
                                <InputText value={immo.referenceAchat} onChange={e => setImmo({ ...immo, referenceAchat: e.target.value })} className="w-full" />
                            </div>
                        </div>
                    </TabPanel>

                    {/* Tab — Amortissement */}
                    <TabPanel header="Amortissement" leftIcon="pi pi-chart-line mr-2">
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Valeur d'acquisition (FBU) *</label>
                                <InputNumber value={immo.valeurAcquisition}
                                    onValueChange={e => setImmo({ ...immo, valeurAcquisition: e.value || 0 })}
                                    locale="fr-FR" className="w-full" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Valeur résiduelle (FBU)</label>
                                <InputNumber value={immo.valeurResiduelle}
                                    onValueChange={e => setImmo({ ...immo, valeurResiduelle: e.value || 0 })}
                                    locale="fr-FR" className="w-full" />
                                <small className="text-500">Valeur estimée en fin de vie utile</small>
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Valeur assurable (FBU)</label>
                                <InputNumber value={immo.valeurAssurable}
                                    onValueChange={e => setImmo({ ...immo, valeurAssurable: e.value || 0 })}
                                    locale="fr-FR" className="w-full" />
                                <small className="text-500">Valeur déclarée à l'assureur</small>
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Méthode d'amortissement</label>
                                <Dropdown value={immo.methodeAmortissement} options={METHODES_AMORT}
                                    onChange={e => setImmo({ ...immo, methodeAmortissement: e.value })}
                                    optionLabel="label" optionValue="code" className="w-full" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Durée de vie utile (années)</label>
                                <InputNumber value={immo.dureeVieUtile}
                                    onValueChange={e => { const d = e.value || 1; setImmo({ ...immo, dureeVieUtile: d, tauxAmortissement: Math.round((100 / d) * 100) / 100 }); }}
                                    min={1} max={50} className="w-full" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold block mb-1">Taux annuel (%)</label>
                                <InputNumber value={immo.tauxAmortissement || 0}
                                    onValueChange={e => setImmo({ ...immo, tauxAmortissement: e.value })}
                                    suffix="%" minFractionDigits={2} maxFractionDigits={4} className="w-full" />
                            </div>
                            <div className="col-12">
                                <div className="surface-50 p-3 border-round border-1 border-200">
                                    <p className="font-semibold text-700 mb-1"><i className="pi pi-info-circle mr-1"></i>Formule applicable</p>
                                    {immo.methodeAmortissement === 'DEGRESSIF' ? (
                                        <div className="text-sm text-600">
                                            <p className="m-1">Coefficient = <strong>{immo.dureeVieUtile <= 4 ? '1,5' : '2,0'}</strong> (durée {immo.dureeVieUtile <= 4 ? '≤ 4 ans' : '> 4 ans'})</p>
                                            <p className="m-1">Taux dégressif = {immo.tauxAmortissement}% × {immo.dureeVieUtile <= 4 ? '1,5' : '2,0'} = <strong>{Math.round((immo.tauxAmortissement || 0) * (immo.dureeVieUtile <= 4 ? 1.5 : 2.0) * 100) / 100}%</strong></p>
                                            <p className="m-1">Dotation N = VNC début N × taux dégressif (bascule linéaire si plus favorable)</p>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-600">
                                            <p className="m-1">Dotation annuelle = Valeur amortissable ÷ {immo.dureeVieUtile} = <strong>{immo.valeurAcquisition > 0 ? fmtCcy((immo.valeurAcquisition - immo.valeurResiduelle) / immo.dureeVieUtile) : '-'}</strong></p>
                                            <p className="m-1">Prorata temporis appliqué sur la 1ère année selon la date de mise en service (SYSCOHADA).</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* Tab — Comptes SYSCOHADA */}
                    <TabPanel header="Comptes Comptables" leftIcon="pi pi-book mr-2">
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold block mb-1">Compte immobilisation (2xxx)</label>
                                <Dropdown
                                    value={comptes.find(c => c.codeCompte === immo.compteImmoCode)?.compteId || null}
                                    options={comptes}
                                    optionLabel="codeCompte"
                                    optionValue="compteId"
                                    onChange={e => {
                                        const sel = comptes.find(c => c.compteId === e.value);
                                        setImmo({ ...immo, compteImmoCode: sel?.codeCompte || '' });
                                    }}
                                    placeholder="Sélectionner un compte"
                                    filter
                                    showClear
                                    className="w-full"
                                    itemTemplate={(opt: CptCompte) => <span>{opt.codeCompte} – {opt.libelle}</span>}
                                    valueTemplate={(opt: CptCompte | null) => opt ? <span>{opt.codeCompte} – {opt.libelle}</span> : <span className="text-500">Sélectionner un compte</span>}
                                />
                                <small className="text-500">Débité lors de l'acquisition</small>
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold block mb-1">Compte amortissements (28xxx)</label>
                                <Dropdown
                                    value={comptes.find(c => c.codeCompte === immo.compteAmortCode)?.compteId || null}
                                    options={comptes}
                                    optionLabel="codeCompte"
                                    optionValue="compteId"
                                    onChange={e => {
                                        const sel = comptes.find(c => c.compteId === e.value);
                                        setImmo({ ...immo, compteAmortCode: sel?.codeCompte || '' });
                                    }}
                                    placeholder="Sélectionner un compte"
                                    filter
                                    showClear
                                    className="w-full"
                                    itemTemplate={(opt: CptCompte) => <span>{opt.codeCompte} – {opt.libelle}</span>}
                                    valueTemplate={(opt: CptCompte | null) => opt ? <span>{opt.codeCompte} – {opt.libelle}</span> : <span className="text-500">Sélectionner un compte</span>}
                                />
                                <small className="text-500">Crédité par les dotations 6811 → 28xxx</small>
                            </div>
                            <div className="col-12">
                                <div className="surface-50 p-3 border-round border-1 border-200">
                                    <p className="font-semibold mb-2">Écritures types (SYSCOHADA révisé)</p>
                                    <div className="grid text-sm">
                                        <div className="col-12 md:col-4">
                                            <p className="font-semibold text-700 mb-1">Acquisition :</p>
                                            <p className="m-1">D : <strong>{immo.compteImmoCode || '2xxx'}</strong> – Immobilisations</p>
                                            <p className="m-1">C : <strong>4011</strong> – Fournisseurs</p>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <p className="font-semibold text-700 mb-1">Dotation annuelle :</p>
                                            <p className="m-1">D : <strong>6811</strong> – Dotation aux amortissements</p>
                                            <p className="m-1">C : <strong>{immo.compteAmortCode || '28xxx'}</strong> – Amortissements cumulés</p>
                                        </div>
                                        <div className="col-12 md:col-4">
                                            <p className="font-semibold text-700 mb-1">Cession :</p>
                                            <p className="m-1">D : <strong>{immo.compteAmortCode || '28xxx'}</strong> + <strong>6512</strong></p>
                                            <p className="m-1">C : <strong>{immo.compteImmoCode || '2xxx'}</strong> + <strong>7512</strong></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="field col-12">
                                <label className="font-semibold block mb-1">Notes / Observations</label>
                                <InputTextarea value={immo.notes}
                                    onChange={e => setImmo({ ...immo, notes: e.target.value })}
                                    className="w-full" rows={3} maxLength={500} />
                            </div>
                        </div>
                    </TabPanel>

                </TabView>
            </Dialog>

            {/* ══════════ DIALOG PLAN D'AMORTISSEMENT ══════════ */}
            <Dialog header={selected ? `Plan d'Amortissement — ${selected.designation}` : "Plan d'Amortissement"}
                visible={showPlanDialog} style={{ width: '900px' }} onHide={() => setShowPlanDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Exporter PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportPlanPdf} />
                        <Button label="Fermer" icon="pi pi-times" outlined onClick={() => setShowPlanDialog(false)} />
                    </div>
                }>
                {selected && (
                    <>
                        <div className="grid mb-3">
                            {[
                                { label: 'Valeur Brute',     val: fmtCcy(selected.valeurAcquisition), cls: '' },
                                { label: 'Amort. Cumulés',   val: fmtCcy(selected.amortissementsCumules), cls: 'bg-orange-50' },
                                { label: 'VNC Actuelle',     val: fmtCcy(selected.vnc || 0), cls: 'bg-green-50' },
                                { label: 'Méthode / Durée',  val: `${selected.methodeAmortissement} / ${selected.dureeVieUtile} ans`, cls: '' },
                            ].map(c => (
                                <div key={c.label} className="col-6 md:col-3">
                                    <div className={`${c.cls || 'surface-100'} p-2 border-round text-center`}>
                                        <p className="text-500 m-0 text-xs">{c.label}</p>
                                        <p className="font-bold m-0 text-sm">{c.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DataTable value={planLignes} className="p-datatable-sm" loading={planApi.loading}
                            emptyMessage="Aucune ligne. Cliquez sur Régénérer plan.">
                            <Column field="annee"                header="An"          style={{ width: '3rem' }} />
                            <Column field="exerciceLabel"        header="Exercice"    style={{ width: '5rem' }} />
                            <Column field="valeurBrute"          header="Val. Brute"  body={r => fmtCcy(r.valeurBrute)} />
                            <Column field="dotation"             header="Dotation"    body={r => fmtCcy(r.dotation)} bodyStyle={{ color: '#d97706', fontWeight: 'bold' }} />
                            <Column field="amortissementsCumules" header="Amort. Cum." body={r => fmtCcy(r.amortissementsCumules)} />
                            <Column field="vnc"                  header="VNC"         body={r => fmtCcy(r.vnc)} bodyStyle={{ color: '#16a34a', fontWeight: 'bold' }} />
                            <Column field="taux"                 header="Taux %"      body={r => `${r.taux}%`}  style={{ width: '5rem' }} />
                            <Column field="comptabilise"         header="Comptab."    body={r => <Tag value={r.comptabilise ? 'Oui' : 'Non'} severity={r.comptabilise ? 'success' : 'secondary'} />} style={{ width: '6rem' }} />
                        </DataTable>
                        <div className="surface-50 p-3 border-round border-1 border-200 mt-3 text-sm">
                            <p className="font-semibold mb-1"><i className="pi pi-info-circle mr-1 text-primary"></i>Écriture fin d'exercice :</p>
                            <p className="m-1">D : <strong>6811</strong> – Dotation aux amortissements &nbsp;|&nbsp; C : <strong>{selected.compteAmortCode || '28xxx'}</strong> – Amortissements cumulés</p>
                        </div>
                    </>
                )}
            </Dialog>

            {/* ══════════ DIALOG CESSION ══════════ */}
            <Dialog header={`Cession — ${selected?.designation || ''}`}
                visible={showCessionDialog} style={{ width: '520px' }} onHide={() => setShowCessionDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setShowCessionDialog(false)} />
                        <Button label="Enregistrer la cession" icon="pi pi-check" severity="warning" loading={cessionApi.loading} onClick={saveCession} />
                    </div>
                }>
                {selected && (
                    <div className="formgrid grid">
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-3 text-sm">
                                <p className="m-1">VNC à la cession : <strong className="text-green-700">{fmtCcy(selected.vnc || 0)}</strong></p>
                                <p className="m-1 text-500">Plus-value = Prix cession − VNC &nbsp;|&nbsp; Moins-value = VNC − Prix cession</p>
                            </div>
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold block mb-1">Date de cession *</label>
                            <Calendar value={dateCessionVal} onChange={e => setDateCessionVal(e.value as Date | null)}
                                dateFormat="dd/mm/yy" showIcon className="w-full" />
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold block mb-1">Prix de cession (FBU)</label>
                            <InputNumber value={prixCessionVal} onValueChange={e => setPrixCessionVal(e.value || 0)}
                                locale="fr-FR" className="w-full" />
                            {prixCessionVal > 0 && selected.vnc != null && (
                                <small className={prixCessionVal >= (selected.vnc || 0) ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                    {prixCessionVal >= (selected.vnc || 0)
                                        ? `→ Plus-value : ${fmtCcy(prixCessionVal - (selected.vnc || 0))}`
                                        : `→ Moins-value : ${fmtCcy((selected.vnc || 0) - prixCessionVal)}`}
                                </small>
                            )}
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold block mb-1">Motif / Observations</label>
                            <InputTextarea value={motifCession} onChange={e => setMotifCession(e.target.value)}
                                className="w-full" rows={3} placeholder="Vente, échange, donation…" />
                        </div>
                        <div className="col-12">
                            <div className="surface-50 p-2 border-round border-1 border-200 text-sm text-600">
                                <p className="m-1 font-semibold">Écritures SYSCOHADA générées :</p>
                                <p className="m-1">D : <strong>{selected.compteAmortCode || '28xxx'}</strong> (amort. cumulés) + D : <strong>6512</strong> (moins-value éventuelle)</p>
                                <p className="m-1">C : <strong>{selected.compteImmoCode || '2xxx'}</strong> (valeur brute) + C : <strong>7512</strong> (plus-value éventuelle)</p>
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* ══════════ DIALOG MISE AU REBUT ══════════ */}
            <Dialog header={`Mise au rebut — ${selected?.designation || ''}`}
                visible={showRebutDialog} style={{ width: '480px' }} onHide={() => setShowRebutDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setShowRebutDialog(false)} />
                        <Button label="Confirmer le rebut" icon="pi pi-ban" severity="danger" loading={rebutApi.loading} onClick={saveRebut} />
                    </div>
                }>
                {selected && (
                    <div>
                        <Message severity="warn" className="w-full mb-3"
                            text={`La VNC résiduelle de ${fmtCcy(selected.vnc || 0)} sera enregistrée comme moins-value (6512). Cette opération est irréversible.`} />
                        <div className="field">
                            <label className="font-semibold block mb-1">Motif de mise au rebut *</label>
                            <InputTextarea value={motifRebut} onChange={e => setMotifRebut(e.target.value)}
                                className="w-full" rows={4} placeholder="Panne irréparable, obsolescence, sinistre, vol…" />
                        </div>
                    </div>
                )}
            </Dialog>

        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_VIEW', 'IMMO_VIEW']}>
            <AmortissementComponent />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
