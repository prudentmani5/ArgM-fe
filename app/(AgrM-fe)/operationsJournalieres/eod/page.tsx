'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from 'primereact/divider';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Timeline } from 'primereact/timeline';
import { Calendar } from 'primereact/calendar';

import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

const OJ_URL = buildApiUrl('/api/operations-journalieres');

interface EodStep {
    etapeOrdre: number;
    etapeCode: string;
    etapeNom: string;
    etapeDescription: string;
    statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ERREUR' | 'IGNORE';
    heureDebut?: string;
    heureFin?: string;
    dureeSecondes?: number;
    messageErreur?: string;
}

interface EodStatut {
    eodId?: number;
    dateJour: string;
    statut: 'NON_DEMARRE' | 'EN_COURS' | 'TERMINE' | 'ERREUR' | 'PARTIEL';
    progression: number;
    heureDebut?: string;
    heureFin?: string;
    demarrePar?: string;
    etapes: EodStep[];
    agenceNom?: string;
}

interface EodHistorique {
    eodId: number;
    dateJour: string;
    statut: string;
    heureDebut: string;
    heureFin?: string;
    demarrePar: string;
    progression: number;
    agenceNom: string;
}

const formatDateTime = (value: string | undefined) => {
    if (!value) return '-';
    try { return new Date(value).toLocaleString('fr-FR'); } catch { return value; }
};

const toApiDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const EOD_STEPS_DEFAULT: EodStep[] = [
    { etapeOrdre: 1, etapeCode: 'CLOSE_SESSIONS', etapeNom: 'Clôture des Sessions', etapeDescription: 'Fermeture de force de toutes les sessions actives et journalisation', statut: 'EN_ATTENTE' },
    { etapeOrdre: 2, etapeCode: 'FINALIZE_TXN', etapeNom: 'Finalisation des Transactions', etapeDescription: 'Les transactions en attente sont finalisées ou annulées', statut: 'EN_ATTENTE' },
    { etapeOrdre: 3, etapeCode: 'UPDATE_DPD', etapeNom: 'Mise à Jour DPD', etapeDescription: 'Incrémentation des compteurs de jours de retard pour les comptes en souffrance', statut: 'EN_ATTENTE' },
    { etapeOrdre: 4, etapeCode: 'RECONCILE', etapeNom: 'Réconciliation des Soldes', etapeDescription: 'Vérification : Solde Ouverture + Débits - Crédits = Solde Fermeture', statut: 'EN_ATTENTE' },
    { etapeOrdre: 5, etapeCode: 'GENERATE_REPORTS', etapeNom: 'Génération des Rapports', etapeDescription: 'Résumés financiers journaliers, rapports d\'exceptions et journaux d\'audit', statut: 'EN_ATTENTE' },
    { etapeOrdre: 6, etapeCode: 'BACKUP', etapeNom: 'Sauvegarde des Données', etapeDescription: 'Sauvegarde complète exécutée et stockée dans un emplacement sécurisé', statut: 'EN_ATTENTE' },
    { etapeOrdre: 7, etapeCode: 'MAINTENANCE', etapeNom: 'Maintenance Système', etapeDescription: 'Correctifs logiciels, optimisation des index et maintenance de la base de données', statut: 'EN_ATTENTE' },
];

const EodPage = () => {
    const [eodStatut, setEodStatut] = useState<EodStatut | null>(null);
    const [historique, setHistorique] = useState<EodHistorique[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterDate, setFilterDate] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const toast = useRef<Toast>(null);
    const statutApi = useConsumApi('');
    const demarrerApi = useConsumApi('');
    const historiqueApi = useConsumApi('');
    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 5000 });
    };

    useEffect(() => {
        loadStatut();
        loadHistorique();
        return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); };
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            refreshIntervalRef.current = setInterval(loadStatut, 10000);
        } else {
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
        }
        return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); };
    }, [autoRefresh]);

    const loadStatut = () => {
        setLoading(true);
        statutApi.fetchData(null, 'GET', `${OJ_URL}/eod/statut`, 'loadEodStatut');
    };

    const loadHistorique = (date?: Date) => {
        let url = `${OJ_URL}/eod/historique`;
        if (date) url += `?date=${toApiDate(date)}`;
        historiqueApi.fetchData(null, 'GET', url, 'loadHistorique');
    };

    useEffect(() => {
        if (statutApi.data && statutApi.callType === 'loadEodStatut') {
            const data = statutApi.data as EodStatut;
            if (!data.etapes || data.etapes.length === 0) {
                data.etapes = EOD_STEPS_DEFAULT;
            }
            setEodStatut(data);
            setLoading(false);
            if (data.statut === 'EN_COURS') {
                setAutoRefresh(true);
            } else {
                setAutoRefresh(false);
            }
        }
        if (statutApi.error && statutApi.callType === 'loadEodStatut') {
            setEodStatut({ dateJour: new Date().toISOString().split('T')[0], statut: 'NON_DEMARRE', progression: 0, etapes: EOD_STEPS_DEFAULT });
            setLoading(false);
        }
    }, [statutApi.data, statutApi.error, statutApi.callType]);

    useEffect(() => {
        if (historiqueApi.data && historiqueApi.callType === 'loadHistorique') {
            setHistorique(Array.isArray(historiqueApi.data) ? historiqueApi.data : []);
        }
    }, [historiqueApi.data, historiqueApi.callType]);

    useEffect(() => {
        if (demarrerApi.data && demarrerApi.callType === 'demarrerEod') {
            showToast('success', 'EOD Démarré', 'Le traitement de fin de journée a démarré avec succès');
            setAutoRefresh(true);
            loadStatut();
            loadHistorique();
        }
        if (demarrerApi.error && demarrerApi.callType === 'demarrerEod') {
            showToast('error', 'Erreur', demarrerApi.error.message || 'Impossible de démarrer l\'EOD');
        }
    }, [demarrerApi.data, demarrerApi.error, demarrerApi.callType]);

    const handleDemarrerEod = () => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir démarrer le traitement EOD ? Cette opération est critique et ne peut pas être annulée une fois lancée.',
            header: 'Confirmer le Démarrage EOD',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, Démarrer',
            rejectLabel: 'Annuler',
            accept: () => demarrerApi.fetchData({ userAction: getUserAction() }, 'POST', `${OJ_URL}/eod/demarrer`, 'demarrerEod'),
        });
    };

    const getEodStatutTag = (statut: string | undefined) => {
        const map: Record<string, { label: string; severity: 'success' | 'danger' | 'warning' | 'info' | 'secondary' }> = {
            NON_DEMARRE: { label: 'NON DÉMARRÉ', severity: 'secondary' },
            EN_COURS: { label: 'EN COURS', severity: 'warning' },
            TERMINE: { label: 'TERMINÉ', severity: 'success' },
            ERREUR: { label: 'ERREUR', severity: 'danger' },
            PARTIEL: { label: 'PARTIEL', severity: 'warning' },
        };
        const s = map[statut || ''] || { label: statut || '-', severity: 'info' as const };
        return <Tag value={s.label} severity={s.severity} />;
    };

    const getEtapeStatutTag = (statut: string) => {
        const map: Record<string, { label: string; severity: 'success' | 'danger' | 'warning' | 'info' | 'secondary' }> = {
            EN_ATTENTE: { label: 'En Attente', severity: 'secondary' },
            EN_COURS: { label: 'En Cours', severity: 'warning' },
            TERMINE: { label: 'Terminé', severity: 'success' },
            ERREUR: { label: 'Erreur', severity: 'danger' },
            IGNORE: { label: 'Ignoré', severity: 'info' },
        };
        const s = map[statut] || { label: statut, severity: 'info' as const };
        return <Tag value={s.label} severity={s.severity} />;
    };

    const getEtapeIcon = (statut: string) => {
        const icons: Record<string, string> = {
            EN_ATTENTE: 'pi pi-circle text-gray-400',
            EN_COURS: 'pi pi-spin pi-spinner text-orange-500',
            TERMINE: 'pi pi-check-circle text-green-500',
            ERREUR: 'pi pi-times-circle text-red-500',
            IGNORE: 'pi pi-minus-circle text-blue-400',
        };
        return icons[statut] || 'pi pi-circle text-gray-400';
    };

    const timelineContent = (step: EodStep) => (
        <div className="border-1 border-round p-3 mb-2 shadow-1" style={{ background: step.statut === 'EN_COURS' ? '#fff8e1' : step.statut === 'TERMINE' ? '#f1f8e9' : step.statut === 'ERREUR' ? '#fce4ec' : '#fafafa' }}>
            <div className="flex align-items-center justify-content-between">
                <span className="font-bold text-sm">{step.etapeNom}</span>
                {getEtapeStatutTag(step.statut)}
            </div>
            <p className="text-500 text-xs m-0 mt-1">{step.etapeDescription}</p>
            {step.heureDebut && <p className="text-xs m-0 mt-1 text-600">Début : {formatDateTime(step.heureDebut)}</p>}
            {step.heureFin && <p className="text-xs m-0 text-600">Fin : {formatDateTime(step.heureFin)}</p>}
            {step.dureeSecondes !== undefined && step.dureeSecondes !== null && (
                <p className="text-xs m-0 text-600">Durée : {step.dureeSecondes}s</p>
            )}
            {step.messageErreur && <p className="text-xs text-red-500 m-0 mt-1">{step.messageErreur}</p>}
        </div>
    );

    const timelineMarker = (step: EodStep) => (
        <span className={getEtapeIcon(step.statut)} style={{ fontSize: '1.5rem' }} />
    );

    const peutDemarrer = eodStatut?.statut === 'NON_DEMARRE';
    const enCours = eodStatut?.statut === 'EN_COURS';

    return (
        <ProtectedPage requiredAuthorities={['OJ_EOD_VIEW', 'OJ_EOD_EXECUTE', 'ADMIN']}>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="card">
                <div className="flex align-items-center gap-3 mb-4">
                    <i className="pi pi-cog text-4xl" style={{ color: '#9C27B0' }} />
                    <div>
                        <h2 className="m-0 text-900">Traitement de Fin de Journée (EOD)</h2>
                        <p className="m-0 text-500 text-sm">Suivi et contrôle du processus automatisé de clôture quotidienne</p>
                    </div>
                </div>

                {/* Status Overview */}
                <div className="grid mb-4">
                    <div className="col-12 md:col-8">
                        <Card className="shadow-2">
                            <div className="flex align-items-center justify-content-between mb-3">
                                <div>
                                    <p className="text-500 text-sm m-0">Statut EOD - {eodStatut?.dateJour}</p>
                                    <div className="mt-2">{getEodStatutTag(eodStatut?.statut)}</div>
                                    {eodStatut?.heureDebut && <p className="text-sm m-0 mt-2"><strong>Démarré à :</strong> {formatDateTime(eodStatut.heureDebut)}</p>}
                                    {eodStatut?.heureFin && <p className="text-sm m-0 mt-1"><strong>Terminé à :</strong> {formatDateTime(eodStatut.heureFin)}</p>}
                                    {eodStatut?.demarrePar && <p className="text-sm m-0 mt-1"><strong>Démarré par :</strong> {eodStatut.demarrePar}</p>}
                                </div>
                                <i className="pi pi-server text-5xl" style={{ color: '#9C27B0', opacity: 0.4 }} />
                            </div>

                            <div className="mb-3">
                                <div className="flex justify-content-between text-sm mb-1">
                                    <span>Progression</span>
                                    <span className="font-bold">{eodStatut?.progression || 0}%</span>
                                </div>
                                <ProgressBar value={eodStatut?.progression || 0} showValue={false} />
                            </div>

                            {enCours && (
                                <Message severity="info" text="Traitement EOD en cours... Actualisation automatique toutes les 10 secondes." className="mb-3" />
                            )}

                            <div className="flex gap-2 flex-wrap">
                                {peutDemarrer && (
                                    <Button
                                        label="Démarrer le Traitement EOD"
                                        icon="pi pi-play"
                                        severity="danger"
                                        onClick={handleDemarrerEod}
                                        loading={demarrerApi.loading}
                                    />
                                )}
                                <Button
                                    label={autoRefresh ? 'Arrêter l\'actualisation auto' : 'Actualisation auto'}
                                    icon={autoRefresh ? 'pi pi-pause' : 'pi pi-refresh'}
                                    outlined
                                    severity={autoRefresh ? 'warning' : 'secondary'}
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                />
                                <Button label="Actualiser" icon="pi pi-refresh" outlined onClick={loadStatut} />
                            </div>
                        </Card>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="grid">
                            {[
                                { label: 'Terminées', val: eodStatut?.etapes?.filter(e => e.statut === 'TERMINE').length || 0, color: '#4CAF50', bg: 'bg-green-50' },
                                { label: 'En Cours', val: eodStatut?.etapes?.filter(e => e.statut === 'EN_COURS').length || 0, color: '#FF9800', bg: 'bg-orange-50' },
                                { label: 'En Attente', val: eodStatut?.etapes?.filter(e => e.statut === 'EN_ATTENTE').length || 0, color: '#9E9E9E', bg: 'bg-gray-50' },
                                { label: 'Erreurs', val: eodStatut?.etapes?.filter(e => e.statut === 'ERREUR').length || 0, color: '#F44336', bg: 'bg-red-50' },
                            ].map(item => (
                                <div key={item.label} className="col-6">
                                    <Card className={`text-center ${item.bg}`}>
                                        <div className="text-2xl font-bold" style={{ color: item.color }}>{item.val}</div>
                                        <div className="text-500 text-xs">{item.label}</div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* EOD Steps Timeline */}
                <Divider />
                <h3 className="m-0 mb-3">Étapes du Traitement EOD</h3>
                {eodStatut?.etapes && eodStatut.etapes.length > 0 ? (
                    <Timeline
                        value={eodStatut.etapes}
                        content={timelineContent}
                        marker={timelineMarker}
                        className="customized-timeline"
                    />
                ) : (
                    <Message severity="info" text="Aucune étape EOD configurée." />
                )}

                {/* History */}
                <Divider />
                <div className="flex align-items-center justify-content-between mb-3">
                    <h3 className="m-0">Historique EOD</h3>
                    <div className="flex gap-2 align-items-center">
                        <Calendar
                            value={filterDate}
                            onChange={e => { setFilterDate(e.value as Date); loadHistorique(e.value as Date); }}
                            placeholder="Filtrer par date"
                            dateFormat="dd/mm/yy"
                            showButtonBar
                            style={{ width: '180px' }}
                        />
                        <Button icon="pi pi-refresh" outlined onClick={() => loadHistorique()} />
                    </div>
                </div>

                <DataTable
                    value={historique}
                    loading={historiqueApi.loading}
                    stripedRows showGridlines paginator rows={10}
                    emptyMessage="Aucun historique EOD trouvé"
                >
                    <Column field="dateJour" header="Date" sortable style={{ minWidth: '110px' }} />
                    <Column field="heureDebut" header="Heure Début" sortable body={(r) => formatDateTime(r.heureDebut)} style={{ minWidth: '150px' }} />
                    <Column field="heureFin" header="Heure Fin" sortable body={(r) => formatDateTime(r.heureFin)} style={{ minWidth: '150px' }} />
                    <Column field="demarrePar" header="Démarré Par" sortable style={{ minWidth: '150px' }} />
                    <Column field="agenceNom" header="Agence" sortable style={{ minWidth: '150px' }} />
                    <Column field="progression" header="Progression" sortable body={(r) => <ProgressBar value={r.progression || 0} style={{ height: '12px' }} />} style={{ minWidth: '150px' }} />
                    <Column field="statut" header="Statut" body={(r) => getEodStatutTag(r.statut)} style={{ minWidth: '120px' }} />
                </DataTable>
            </div>
        </ProtectedPage>
    );
};

export default EodPage;
