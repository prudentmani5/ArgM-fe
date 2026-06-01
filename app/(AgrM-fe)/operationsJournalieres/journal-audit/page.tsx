'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';

import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

const OJ_URL = buildApiUrl('/api/operations-journalieres');

interface JournalAudit {
    journalId: number;
    dateJour: string;
    horodatage: string;
    typeEvenement: string;
    utilisateurId: string;
    utilisateurNom: string;
    agenceCode: string;
    agenceNom: string;
    description: string;
    adresseIp?: string;
    statut: 'SUCCES' | 'ECHEC' | 'ALERTE';
    details?: string;
    nombreTransactions?: number;
    montantTotal?: number;
}

const toApiDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatDateTime = (value: string | undefined) => {
    if (!value) return '-';
    try { return new Date(value).toLocaleString('fr-FR'); } catch { return value; }
};

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString('fr-FR');
};

const TYPE_EVENEMENTS = [
    { label: 'Tous les types', value: '' },
    { label: 'Ouverture Système', value: 'OUVERTURE' },
    { label: 'Fermeture Système', value: 'FERMETURE' },
    { label: 'Pré-Fermeture', value: 'PRE_FERMETURE' },
    { label: 'Démarrage EOD', value: 'EOD_DEBUT' },
    { label: 'Fin EOD', value: 'EOD_FIN' },
    { label: 'Étape EOD', value: 'EOD_ETAPE' },
    { label: 'Alerte Sécurité', value: 'ALERTE_SECURITE' },
    { label: 'Accès Hors Horaire', value: 'ACCES_HORS_HORAIRE' },
    { label: 'Modification Paramètre', value: 'MODIFICATION_PARAMETRE' },
];

const STATUTS_FILTER = [
    { label: 'Tous les statuts', value: '' },
    { label: 'Succès', value: 'SUCCES' },
    { label: 'Échec', value: 'ECHEC' },
    { label: 'Alerte', value: 'ALERTE' },
];

const JournalAuditPage = () => {
    const [journaux, setJournaux] = useState<JournalAudit[]>([]);
    const [selectedJournal, setSelectedJournal] = useState<JournalAudit | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filterDateDebut, setFilterDateDebut] = useState<Date | null>(null);
    const [filterDateFin, setFilterDateFin] = useState<Date | null>(null);
    const [filterType, setFilterType] = useState('');
    const [filterStatut, setFilterStatut] = useState('');
    const [stats, setStats] = useState({ ouvertures: 0, fermetures: 0, alertes: 0, eod: 0 });

    const toast = useRef<Toast>(null);
    const journauxApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    useEffect(() => {
        loadJournaux();
    }, []);

    const buildUrl = () => {
        const params = new URLSearchParams();
        if (filterDateDebut) params.append('dateDebut', toApiDate(filterDateDebut));
        if (filterDateFin) params.append('dateFin', toApiDate(filterDateFin));
        if (filterType) params.append('type', filterType);
        if (filterStatut) params.append('statut', filterStatut);
        const query = params.toString();
        return `${OJ_URL}/journal-audit${query ? '?' + query : ''}`;
    };

    const loadJournaux = () => {
        journauxApi.fetchData(null, 'GET', buildUrl(), 'loadJournaux');
    };

    useEffect(() => {
        if (journauxApi.data && journauxApi.callType === 'loadJournaux') {
            const data = Array.isArray(journauxApi.data) ? journauxApi.data as JournalAudit[] : [];
            setJournaux(data);
            setStats({
                ouvertures: data.filter(j => j.typeEvenement === 'OUVERTURE').length,
                fermetures: data.filter(j => j.typeEvenement === 'FERMETURE').length,
                alertes: data.filter(j => j.statut === 'ALERTE').length,
                eod: data.filter(j => j.typeEvenement?.startsWith('EOD')).length,
            });
        }
        if (journauxApi.error && journauxApi.callType === 'loadJournaux') {
            showToast('error', 'Erreur', journauxApi.error.message || 'Erreur lors du chargement');
        }
    }, [journauxApi.data, journauxApi.error, journauxApi.callType]);

    const handleSearch = () => {
        loadJournaux();
    };

    const handleReset = () => {
        setFilterDateDebut(null);
        setFilterDateFin(null);
        setFilterType('');
        setFilterStatut('');
        setGlobalFilter('');
        journauxApi.fetchData(null, 'GET', `${OJ_URL}/journal-audit`, 'loadJournaux');
    };

    const getStatutTag = (statut: string) => {
        const map: Record<string, { severity: 'success' | 'danger' | 'warning' }> = {
            SUCCES: { severity: 'success' },
            ECHEC: { severity: 'danger' },
            ALERTE: { severity: 'warning' },
        };
        return <Tag value={statut} severity={map[statut]?.severity || 'info'} />;
    };

    const getTypeTag = (type: string) => {
        const colorMap: Record<string, string> = {
            OUVERTURE: '#4CAF50',
            FERMETURE: '#F44336',
            PRE_FERMETURE: '#FF9800',
            EOD_DEBUT: '#9C27B0',
            EOD_FIN: '#673AB7',
            EOD_ETAPE: '#3F51B5',
            ALERTE_SECURITE: '#FF5722',
            ACCES_HORS_HORAIRE: '#795548',
            MODIFICATION_PARAMETRE: '#607D8B',
        };
        const color = colorMap[type] || '#2196F3';
        return <Tag value={type?.replace(/_/g, ' ')} style={{ background: color }} />;
    };

    const openDetail = (journal: JournalAudit) => {
        setSelectedJournal(journal);
        setDetailVisible(true);
    };

    const actionTemplate = (rowData: JournalAudit) => (
        <Button icon="pi pi-eye" rounded outlined onClick={() => openDetail(rowData)} tooltip="Voir détails" />
    );

    const header = (
        <div className="flex flex-column gap-3">
            <div className="flex flex-wrap gap-2 align-items-end">
                <div className="flex flex-column gap-1">
                    <label className="text-xs text-500">Date Début</label>
                    <Calendar value={filterDateDebut} onChange={e => setFilterDateDebut(e.value as Date)} dateFormat="dd/mm/yy" showButtonBar placeholder="Du" style={{ width: '160px' }} />
                </div>
                <div className="flex flex-column gap-1">
                    <label className="text-xs text-500">Date Fin</label>
                    <Calendar value={filterDateFin} onChange={e => setFilterDateFin(e.value as Date)} dateFormat="dd/mm/yy" showButtonBar placeholder="Au" style={{ width: '160px' }} />
                </div>
                <div className="flex flex-column gap-1">
                    <label className="text-xs text-500">Type</label>
                    <Dropdown value={filterType} options={TYPE_EVENEMENTS} onChange={e => setFilterType(e.value)} style={{ width: '200px' }} />
                </div>
                <div className="flex flex-column gap-1">
                    <label className="text-xs text-500">Statut</label>
                    <Dropdown value={filterStatut} options={STATUTS_FILTER} onChange={e => setFilterStatut(e.value)} style={{ width: '160px' }} />
                </div>
                <Button label="Rechercher" icon="pi pi-search" onClick={handleSearch} />
                <Button label="Réinitialiser" icon="pi pi-times" outlined severity="secondary" onClick={handleReset} />
            </div>
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Recherche rapide..." style={{ width: '250px' }} />
                </span>
            </div>
        </div>
    );

    return (
        <ProtectedPage requiredAuthorities={['OJ_JOURNAL_VIEW', 'ADMIN']}>
            <Toast ref={toast} />

            <div className="card">
                <div className="flex align-items-center gap-3 mb-4">
                    <i className="pi pi-history text-4xl" style={{ color: '#607D8B' }} />
                    <div>
                        <h2 className="m-0 text-900">Journal d'Audit du Système</h2>
                        <p className="m-0 text-500 text-sm">Piste d'audit complète des événements d'ouverture, fermeture et EOD — conservée 7 ans minimum</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid mb-4">
                    {[
                        { label: 'Ouvertures', val: stats.ouvertures, icon: 'pi-sun', color: '#4CAF50', bg: 'bg-green-50' },
                        { label: 'Fermetures', val: stats.fermetures, icon: 'pi-moon', color: '#F44336', bg: 'bg-red-50' },
                        { label: 'Alertes', val: stats.alertes, icon: 'pi-exclamation-triangle', color: '#FF9800', bg: 'bg-orange-50' },
                        { label: 'Traitements EOD', val: stats.eod, icon: 'pi-cog', color: '#9C27B0', bg: 'bg-purple-50' },
                    ].map(item => (
                        <div key={item.label} className="col-12 md:col-6 lg:col-3">
                            <Card className={`text-center ${item.bg}`}>
                                <i className={`pi ${item.icon} text-2xl mb-1`} style={{ color: item.color }} />
                                <div className="text-2xl font-bold" style={{ color: item.color }}>{item.val}</div>
                                <div className="text-500 text-sm">{item.label}</div>
                            </Card>
                        </div>
                    ))}
                </div>

                <DataTable
                    value={journaux}
                    loading={journauxApi.loading}
                    globalFilter={globalFilter}
                    stripedRows showGridlines paginator rows={15}
                    rowsPerPageOptions={[15, 25, 50, 100]}
                    emptyMessage="Aucun événement d'audit trouvé"
                    header={header}
                    sortField="horodatage"
                    sortOrder={-1}
                >
                    <Column field="horodatage" header="Horodatage" sortable body={(r) => formatDateTime(r.horodatage)} style={{ minWidth: '160px' }} />
                    <Column field="typeEvenement" header="Type d'Événement" sortable body={(r) => getTypeTag(r.typeEvenement)} style={{ minWidth: '180px' }} />
                    <Column field="utilisateurNom" header="Utilisateur" sortable style={{ minWidth: '150px' }} />
                    <Column field="agenceNom" header="Agence" sortable style={{ minWidth: '150px' }} />
                    <Column field="description" header="Description" style={{ minWidth: '250px' }} />
                    <Column field="adresseIp" header="Adresse IP" style={{ minWidth: '120px' }} />
                    <Column field="statut" header="Statut" sortable body={(r) => getStatutTag(r.statut)} style={{ minWidth: '100px' }} />
                    <Column header="Détails" body={actionTemplate} style={{ minWidth: '80px' }} />
                </DataTable>
            </div>

            {/* Detail Dialog */}
            <Dialog
                header="Détails de l'Événement d'Audit"
                visible={detailVisible}
                style={{ width: '600px' }}
                onHide={() => setDetailVisible(false)}
                footer={<Button label="Fermer" icon="pi pi-times" outlined onClick={() => setDetailVisible(false)} />}
            >
                {selectedJournal && (
                    <div className="p-fluid">
                        <div className="grid">
                            <div className="col-6 field">
                                <label className="font-bold text-500 text-sm">Horodatage</label>
                                <p className="mt-1">{formatDateTime(selectedJournal.horodatage)}</p>
                            </div>
                            <div className="col-6 field">
                                <label className="font-bold text-500 text-sm">Type</label>
                                <div className="mt-1">{getTypeTag(selectedJournal.typeEvenement)}</div>
                            </div>
                            <div className="col-6 field">
                                <label className="font-bold text-500 text-sm">Utilisateur</label>
                                <p className="mt-1">{selectedJournal.utilisateurNom} ({selectedJournal.utilisateurId})</p>
                            </div>
                            <div className="col-6 field">
                                <label className="font-bold text-500 text-sm">Agence</label>
                                <p className="mt-1">{selectedJournal.agenceNom} ({selectedJournal.agenceCode})</p>
                            </div>
                            <div className="col-6 field">
                                <label className="font-bold text-500 text-sm">Adresse IP</label>
                                <p className="mt-1">{selectedJournal.adresseIp || '-'}</p>
                            </div>
                            <div className="col-6 field">
                                <label className="font-bold text-500 text-sm">Statut</label>
                                <div className="mt-1">{getStatutTag(selectedJournal.statut)}</div>
                            </div>
                        </div>
                        <Divider />
                        <div className="field">
                            <label className="font-bold text-500 text-sm">Description</label>
                            <p className="mt-1">{selectedJournal.description}</p>
                        </div>
                        {selectedJournal.nombreTransactions !== undefined && (
                            <div className="field">
                                <label className="font-bold text-500 text-sm">Transactions traitées</label>
                                <p className="mt-1">{formatNumber(selectedJournal.nombreTransactions)}</p>
                            </div>
                        )}
                        {selectedJournal.montantTotal !== undefined && (
                            <div className="field">
                                <label className="font-bold text-500 text-sm">Montant total</label>
                                <p className="mt-1">{formatNumber(selectedJournal.montantTotal)} BIF</p>
                            </div>
                        )}
                        {selectedJournal.details && (
                            <>
                                <Divider />
                                <div className="field">
                                    <label className="font-bold text-500 text-sm">Détails Techniques</label>
                                    <pre className="mt-1 p-2 border-1 border-round bg-gray-50 text-xs overflow-auto" style={{ maxHeight: '200px' }}>
                                        {selectedJournal.details}
                                    </pre>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Dialog>
        </ProtectedPage>
    );
};

export default JournalAuditPage;
