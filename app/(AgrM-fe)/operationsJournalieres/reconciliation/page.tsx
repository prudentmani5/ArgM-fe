'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { InputText } from 'primereact/inputtext';

import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

const OJ_URL = buildApiUrl('/api/operations-journalieres');
const BRANCHES_URL = buildApiUrl('/api/reference-data/branches');

interface ReconciliationCompte {
    reconciliationId: number;
    dateJour: string;
    agenceCode: string;
    agenceNom: string;
    numeroCompte: string;
    nomCompte: string;
    typeCompte: string;
    soldePrecedent: number;
    totalCredits: number;
    totalDebits: number;
    soldeCalcule: number;
    soldeReel: number;
    ecart: number;
    statut: 'EQUILIBRE' | 'ECART' | 'EN_ATTENTE' | 'VALIDE';
    nombreTransactions: number;
}

interface ReconciliationSummary {
    dateJour: string;
    agenceNom: string;
    totalComptes: number;
    comptesEquilibres: number;
    comptesAvecEcart: number;
    totalEcartMontant: number;
    statut: 'COMPLET' | 'PARTIEL' | 'ECARTS_DETECTES' | 'EN_ATTENTE';
}

const toApiDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('fr-FR');
};

const ReconciliationPage = () => {
    const [reconciliations, setReconciliations] = useState<ReconciliationCompte[]>([]);
    const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
    const [selectedRec, setSelectedRec] = useState<ReconciliationCompte | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [filterDate, setFilterDate] = useState<Date>(new Date());
    const [filterStatut, setFilterStatut] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');

    const toast = useRef<Toast>(null);
    const recApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const summaryApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    useEffect(() => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        loadData();
    }, []);

    useEffect(() => {
        if (branchesApi.data && branchesApi.callType === 'loadBranches') {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        }
    }, [branchesApi.data, branchesApi.callType]);

    const buildUrl = () => {
        const params = new URLSearchParams();
        if (filterDate) params.append('date', toApiDate(filterDate));
        if (selectedBranch) params.append('agenceId', String(selectedBranch));
        if (filterStatut) params.append('statut', filterStatut);
        return `${OJ_URL}/reconciliation?${params.toString()}`;
    };

    const loadData = () => {
        const url = buildUrl();
        recApi.fetchData(null, 'GET', url, 'loadRec');
        summaryApi.fetchData(null, 'GET', `${url}&summary=true`, 'loadSummary');
    };

    useEffect(() => {
        if (recApi.data && recApi.callType === 'loadRec') {
            setReconciliations(Array.isArray(recApi.data) ? recApi.data : []);
        }
        if (recApi.error && recApi.callType === 'loadRec') {
            showToast('error', 'Erreur', recApi.error.message || 'Erreur lors du chargement');
        }
    }, [recApi.data, recApi.error, recApi.callType]);

    useEffect(() => {
        if (summaryApi.data && summaryApi.callType === 'loadSummary') {
            setSummary(summaryApi.data as ReconciliationSummary);
        }
    }, [summaryApi.data, summaryApi.callType]);

    const getStatutTag = (statut: string) => {
        const map: Record<string, { label: string; severity: 'success' | 'danger' | 'warning' | 'info' | 'secondary' }> = {
            EQUILIBRE: { label: 'Équilibré', severity: 'success' },
            ECART: { label: 'Écart', severity: 'danger' },
            EN_ATTENTE: { label: 'En Attente', severity: 'warning' },
            VALIDE: { label: 'Validé', severity: 'info' },
        };
        const s = map[statut] || { label: statut, severity: 'secondary' as const };
        return <Tag value={s.label} severity={s.severity} />;
    };

    const getSummaryStatutTag = (statut: string) => {
        const map: Record<string, { severity: 'success' | 'danger' | 'warning' | 'info' }> = {
            COMPLET: { severity: 'success' },
            PARTIEL: { severity: 'warning' },
            ECARTS_DETECTES: { severity: 'danger' },
            EN_ATTENTE: { severity: 'info' },
        };
        return <Tag value={statut?.replace(/_/g, ' ')} severity={map[statut]?.severity || 'info'} />;
    };

    const ecartTemplate = (rowData: ReconciliationCompte) => {
        const ecart = rowData.ecart || 0;
        return (
            <span className={`font-bold ${ecart !== 0 ? 'text-red-500' : 'text-green-600'}`}>
                {formatNumber(ecart)}
            </span>
        );
    };

    const formulaTemplate = (rowData: ReconciliationCompte) => (
        <span className="text-xs text-500">
            {formatNumber(rowData.soldePrecedent)} + {formatNumber(rowData.totalCredits)} - {formatNumber(rowData.totalDebits)} = {formatNumber(rowData.soldeCalcule)}
        </span>
    );

    const actionTemplate = (rowData: ReconciliationCompte) => (
        <Button icon="pi pi-eye" rounded outlined onClick={() => { setSelectedRec(rowData); setDetailVisible(true); }} tooltip="Détails" />
    );

    const statutOptions = [
        { label: 'Tous les statuts', value: '' },
        { label: 'Équilibré', value: 'EQUILIBRE' },
        { label: 'Écart détecté', value: 'ECART' },
        { label: 'En Attente', value: 'EN_ATTENTE' },
        { label: 'Validé', value: 'VALIDE' },
    ];

    const header = (
        <div className="flex flex-wrap gap-2 align-items-end justify-content-between">
            <div className="flex flex-wrap gap-2 align-items-end">
                <div className="flex flex-column gap-1">
                    <label className="text-xs text-500">Date</label>
                    <Calendar value={filterDate} onChange={e => setFilterDate(e.value as Date)} dateFormat="dd/mm/yy" style={{ width: '160px' }} />
                </div>
                <div className="flex flex-column gap-1">
                    <label className="text-xs text-500">Agence</label>
                    <Dropdown
                        value={selectedBranch}
                        options={branches.map(b => ({ label: b.agenceName || b.name, value: b.agenceId || b.id }))}
                        onChange={e => setSelectedBranch(e.value)}
                        placeholder="Toutes les agences"
                        style={{ width: '200px' }}
                        showClear
                    />
                </div>
                <div className="flex flex-column gap-1">
                    <label className="text-xs text-500">Statut</label>
                    <Dropdown value={filterStatut} options={statutOptions} onChange={e => setFilterStatut(e.value)} style={{ width: '160px' }} />
                </div>
                <Button label="Rechercher" icon="pi pi-search" onClick={loadData} />
            </div>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Recherche..." style={{ width: '220px' }} />
            </span>
        </div>
    );

    return (
        <ProtectedPage requiredAuthorities={['OJ_RECONCILIATION_VIEW', 'ADMIN']}>
            <Toast ref={toast} />

            <div className="card">
                <div className="flex align-items-center gap-3 mb-4">
                    <i className="pi pi-check-square text-4xl" style={{ color: '#2196F3' }} />
                    <div>
                        <h2 className="m-0 text-900">Réconciliation des Données</h2>
                        <p className="m-0 text-500 text-sm">
                            Vérification : Solde Ouverture + Total Crédits − Total Débits = Solde Fermeture
                        </p>
                    </div>
                </div>

                {/* Summary */}
                {summary && (
                    <div className="grid mb-4">
                        <div className="col-12">
                            <Card className={`shadow-2 ${summary.statut === 'ECARTS_DETECTES' ? 'border-left-3 border-red-500' : summary.statut === 'COMPLET' ? 'border-left-3 border-green-500' : 'border-left-3 border-orange-500'}`}>
                                <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                                    <div>
                                        <p className="text-500 text-sm m-0">Synthèse de Réconciliation — {summary.dateJour}</p>
                                        <div className="mt-2">{getSummaryStatutTag(summary.statut)}</div>
                                        {summary.agenceNom && <p className="text-sm m-0 mt-1"><strong>Agence :</strong> {summary.agenceNom}</p>}
                                    </div>
                                    <div className="flex gap-4 flex-wrap">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{summary.totalComptes}</div>
                                            <div className="text-500 text-xs">Total Comptes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{summary.comptesEquilibres}</div>
                                            <div className="text-500 text-xs">Équilibrés</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${summary.comptesAvecEcart > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {summary.comptesAvecEcart}
                                            </div>
                                            <div className="text-500 text-xs">Avec Écart</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${summary.totalEcartMontant !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatNumber(summary.totalEcartMontant)}
                                            </div>
                                            <div className="text-500 text-xs">Écart Total (BIF)</div>
                                        </div>
                                    </div>
                                </div>
                                {summary.comptesAvecEcart > 0 && (
                                    <Message
                                        severity="error"
                                        text={`${summary.comptesAvecEcart} compte(s) présentent des écarts non réconciliés. Ces écarts ont été signalés et doivent être escaladés au Responsable Financier.`}
                                        className="mt-3"
                                    />
                                )}
                            </Card>
                        </div>
                    </div>
                )}

                <DataTable
                    value={reconciliations}
                    loading={recApi.loading}
                    globalFilter={globalFilter}
                    stripedRows showGridlines paginator rows={15}
                    rowsPerPageOptions={[15, 25, 50]}
                    emptyMessage="Aucune réconciliation trouvée"
                    header={header}
                    rowClassName={(rowData: ReconciliationCompte) => (rowData.ecart !== 0 ? 'bg-red-50' : '')}
                >
                    <Column field="dateJour" header="Date" sortable style={{ minWidth: '110px' }} />
                    <Column field="agenceNom" header="Agence" sortable style={{ minWidth: '140px' }} />
                    <Column field="numeroCompte" header="N° Compte" sortable style={{ minWidth: '130px' }} />
                    <Column field="nomCompte" header="Nom Compte" sortable style={{ minWidth: '180px' }} />
                    <Column field="soldePrecedent" header="Solde Ouverture" sortable body={(r) => formatNumber(r.soldePrecedent)} style={{ minWidth: '140px' }} />
                    <Column field="totalCredits" header="Total Crédits" sortable body={(r) => formatNumber(r.totalCredits)} style={{ minWidth: '130px' }} bodyClassName="text-green-700" />
                    <Column field="totalDebits" header="Total Débits" sortable body={(r) => formatNumber(r.totalDebits)} style={{ minWidth: '130px' }} bodyClassName="text-red-700" />
                    <Column field="soldeCalcule" header="Solde Calculé" sortable body={(r) => formatNumber(r.soldeCalcule)} style={{ minWidth: '130px' }} />
                    <Column field="soldeReel" header="Solde Réel" sortable body={(r) => formatNumber(r.soldeReel)} style={{ minWidth: '120px' }} />
                    <Column field="ecart" header="Écart" sortable body={ecartTemplate} style={{ minWidth: '110px' }} />
                    <Column field="nombreTransactions" header="Nb. Txn" sortable body={(r) => formatNumber(r.nombreTransactions)} style={{ minWidth: '90px' }} />
                    <Column field="statut" header="Statut" sortable body={(r) => getStatutTag(r.statut)} style={{ minWidth: '110px' }} />
                    <Column header="" body={actionTemplate} style={{ minWidth: '70px' }} />
                </DataTable>
            </div>

            {/* Detail Dialog */}
            <Dialog
                header="Détail de Réconciliation"
                visible={detailVisible}
                style={{ width: '580px' }}
                onHide={() => setDetailVisible(false)}
                footer={<Button label="Fermer" icon="pi pi-times" outlined onClick={() => setDetailVisible(false)} />}
            >
                {selectedRec && (
                    <div>
                        <div className="grid">
                            <div className="col-6"><label className="text-500 text-sm">Date</label><p className="mt-0 font-bold">{selectedRec.dateJour}</p></div>
                            <div className="col-6"><label className="text-500 text-sm">Agence</label><p className="mt-0 font-bold">{selectedRec.agenceNom}</p></div>
                            <div className="col-6"><label className="text-500 text-sm">N° Compte</label><p className="mt-0 font-bold">{selectedRec.numeroCompte}</p></div>
                            <div className="col-6"><label className="text-500 text-sm">Nom</label><p className="mt-0 font-bold">{selectedRec.nomCompte}</p></div>
                        </div>
                        <Divider />
                        <div className="border-1 border-round p-3 mb-3" style={{ background: '#f9f9f9', fontFamily: 'monospace' }}>
                            <p className="m-0 text-sm text-center font-bold mb-2">Formule de Réconciliation</p>
                            <p className="m-0 text-center">
                                <span className="text-blue-600">{formatNumber(selectedRec.soldePrecedent)}</span>
                                <span className="mx-2">+</span>
                                <span className="text-green-600">{formatNumber(selectedRec.totalCredits)}</span>
                                <span className="mx-2">−</span>
                                <span className="text-red-600">{formatNumber(selectedRec.totalDebits)}</span>
                                <span className="mx-2">=</span>
                                <span className="font-bold">{formatNumber(selectedRec.soldeCalcule)}</span>
                            </p>
                        </div>
                        <div className="grid">
                            <div className="col-6"><label className="text-500 text-sm">Solde Calculé</label><p className="mt-0 font-bold text-primary">{formatNumber(selectedRec.soldeCalcule)}</p></div>
                            <div className="col-6"><label className="text-500 text-sm">Solde Réel</label><p className="mt-0 font-bold text-primary">{formatNumber(selectedRec.soldeReel)}</p></div>
                        </div>
                        <div className="flex justify-content-center mt-2">
                            <Card className={`text-center ${selectedRec.ecart !== 0 ? 'bg-red-50' : 'bg-green-50'}`} style={{ minWidth: '200px' }}>
                                <div className={`text-3xl font-bold ${selectedRec.ecart !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatNumber(selectedRec.ecart)}
                                </div>
                                <div className="text-500 text-sm">Écart (BIF)</div>
                                <div className="mt-2">{getStatutTag(selectedRec.statut)}</div>
                            </Card>
                        </div>
                        {selectedRec.ecart !== 0 && (
                            <Message severity="warn" text="Cet écart doit être signalé au Responsable Financier et documenté dans le Rapport d'Exceptions." className="mt-3" />
                        )}
                    </div>
                )}
            </Dialog>
        </ProtectedPage>
    );
};

export default ReconciliationPage;
