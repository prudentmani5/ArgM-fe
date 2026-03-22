'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Steps } from 'primereact/steps';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useRouter } from 'next/navigation';
import useConsumApi, { getUserAction } from '../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../utils/apiConfig';
import { RapprochementBancaire, MOIS_OPTIONS } from './types';
import { ProtectedPage } from '@/components/ProtectedPage';

const RapprochementDashboard = () => {
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const [releves, setReleves] = useState<any[]>([]);
    const [rapprochements, setRapprochements] = useState<RapprochementBancaire[]>([]);

    // API hooks - separate for each data source
    const { data: relevesData, error: relevesError, fetchData: fetchReleves } = useConsumApi('');
    const { data: rapData, error: rapError, fetchData: fetchRapprochements } = useConsumApi('');

    useEffect(() => {
        fetchReleves(null, 'GET', buildApiUrl('/api/rapprochement/releves/findall'), 'loadReleves');
        fetchRapprochements(null, 'GET', buildApiUrl('/api/rapprochement/rapprochements/findall'), 'loadRap');
    }, []);

    useEffect(() => {
        if (relevesData) {
            const data = Array.isArray(relevesData) ? relevesData : relevesData.content || [];
            setReleves(data);
        }
        if (relevesError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: relevesError.message || 'Erreur de chargement des relevés', life: 3000 });
        }
    }, [relevesData, relevesError]);

    useEffect(() => {
        if (rapData) {
            const data = Array.isArray(rapData) ? rapData : rapData.content || [];
            setRapprochements(data);
        }
        if (rapError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: rapError.message || 'Erreur de chargement des rapprochements', life: 3000 });
        }
    }, [rapData, rapError]);

    // Computed stats
    const totalReleves = releves.length;
    const totalRapprochements = rapprochements.length;
    const enCours = rapprochements.filter((r) => r.statut === 'EN_COURS').length;
    const valides = rapprochements.filter((r) => r.statut === 'VALIDE').length;
    const brouillons = rapprochements.filter((r) => r.statut === 'BROUILLON').length;
    const termines = rapprochements.filter((r) => r.statut === 'TERMINE').length;

    // Recent rapprochements for quick access
    const recentRapprochements = [...rapprochements]
        .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
        .slice(0, 5);

    const workflowSteps = [
        { label: 'Import Relevé' },
        { label: 'Créer Rapprochement' },
        { label: 'Rapprochement Auto' },
        { label: 'Traitement Écarts' },
        { label: 'Validation' }
    ];

    const getMoisLabel = (mois: number) => {
        return MOIS_OPTIONS.find(m => m.value === mois)?.label || '';
    };

    const getStatutSeverity = (statut: string): 'info' | 'warning' | 'success' | 'danger' | null => {
        const map: Record<string, 'info' | 'warning' | 'success' | 'danger' | null> = {
            'BROUILLON': null, 'EN_COURS': 'warning', 'TERMINE': 'info', 'VALIDE': 'success'
        };
        return map[statut] || 'info';
    };

    const getStatutLabel = (statut: string): string => {
        const map: Record<string, string> = { 'BROUILLON': 'Brouillon', 'EN_COURS': 'En cours', 'TERMINE': 'Terminé', 'VALIDE': 'Validé' };
        return map[statut] || statut;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal', minimumFractionDigits: 0 }).format(value) + ' FBU';
    };

    const formatDate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Header */}
            <div className="col-12">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h2 className="m-0">
                        <i className="pi pi-check-square mr-2"></i>
                        Module Rapprochement Bancaire
                    </h2>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="col-12 md:col-3">
                <Card className="shadow-2 cursor-pointer" onClick={() => router.push('/rapprochement/releves')}>
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <span className="block text-500 font-medium mb-2">Relevés Bancaires</span>
                            <div className="text-900 font-bold text-3xl">{totalReleves}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-file-import text-blue-500 text-xl"></i>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-3">
                <Card className="shadow-2 cursor-pointer" onClick={() => router.push('/rapprochement/rapprochements')}>
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <span className="block text-500 font-medium mb-2">Rapprochements</span>
                            <div className="text-900 font-bold text-3xl">{totalRapprochements}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-check-circle text-green-500 text-xl"></i>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-3">
                <Card className="shadow-2">
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <span className="block text-500 font-medium mb-2">En cours</span>
                            <div className="text-orange-500 font-bold text-3xl">{enCours}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-clock text-orange-500 text-xl"></i>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-3">
                <Card className="shadow-2">
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <span className="block text-500 font-medium mb-2">Validés</span>
                            <div className="text-green-500 font-bold text-3xl">{valides}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-verified text-purple-500 text-xl"></i>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Workflow Steps */}
            <div className="col-12">
                <Card title="Processus de Rapprochement Bancaire" className="shadow-2">
                    <Steps model={workflowSteps} activeIndex={-1} readOnly className="mb-4" />
                </Card>
            </div>

            {/* Quick Actions + Recent Rapprochements */}
            <div className="col-12 md:col-6">
                <Card title="Actions rapides" className="shadow-2 h-full">
                    <div className="flex flex-column gap-3">
                        <Button
                            label="Importer un relevé bancaire"
                            icon="pi pi-file-import"
                            severity="info"
                            className="w-full"
                            onClick={() => router.push('/rapprochement/releves')}
                        />
                        <Button
                            label="Créer un nouveau rapprochement"
                            icon="pi pi-plus"
                            className="w-full"
                            onClick={() => router.push('/rapprochement/rapprochements')}
                        />
                        <Button
                            label="Gérer les écarts"
                            icon="pi pi-exclamation-triangle"
                            severity="warning"
                            className="w-full"
                            onClick={() => router.push('/rapprochement/ecarts')}
                        />
                        <Button
                            label="Imprimer un rapport"
                            icon="pi pi-print"
                            severity="success"
                            outlined
                            className="w-full"
                            onClick={() => router.push('/rapprochement/rapports')}
                        />
                    </div>
                </Card>
            </div>

            <div className="col-12 md:col-6">
                <Card title="Rapprochements récents" className="shadow-2 h-full">
                    {recentRapprochements.length > 0 ? (
                        <DataTable
                            value={recentRapprochements}
                            className="p-datatable-sm"
                            emptyMessage="Aucun rapprochement"
                            rows={5}
                        >
                            <Column field="reference" header="Référence" />
                            <Column header="Période" body={(row) => `${getMoisLabel(row.mois)} ${row.annee}`} />
                            <Column header="Banque" body={(row) => row.releveBancaire?.nomBanque || '-'} />
                            <Column header="Écart" body={(row) => (
                                <span className={row.ecart !== 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                                    {formatCurrency(row.ecart || 0)}
                                </span>
                            )} />
                            <Column header="Statut" body={(row) => (
                                <Tag value={getStatutLabel(row.statut)} severity={getStatutSeverity(row.statut)} />
                            )} />
                        </DataTable>
                    ) : (
                        <div className="text-center text-500 p-4">
                            <i className="pi pi-inbox text-3xl mb-2 block"></i>
                            <p>Aucun rapprochement créé</p>
                            <Button label="Créer le premier" icon="pi pi-plus" size="small" onClick={() => router.push('/rapprochement/rapprochements')} />
                        </div>
                    )}
                </Card>
            </div>

            {/* Status Summary */}
            {totalRapprochements > 0 && (
                <div className="col-12">
                    <Card title="Résumé par statut" className="shadow-2">
                        <div className="flex flex-wrap gap-3">
                            <Tag value={`${brouillons} Brouillon(s)`} className="text-base p-2" />
                            <Tag value={`${enCours} En cours`} severity="warning" className="text-base p-2" />
                            <Tag value={`${termines} Terminé(s)`} severity="info" className="text-base p-2" />
                            <Tag value={`${valides} Validé(s)`} severity="success" className="text-base p-2" />
                        </div>
                    </Card>
                </div>
            )}

            {/* 4 Types of Reconciliation */}
            <div className="col-12">
                <h3 className="mt-2 mb-3"><i className="pi pi-th-large mr-2"></i>Types de Rapprochement</h3>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="shadow-2 h-full border-top-3 border-blue-500">
                    <div className="flex align-items-center mb-3">
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round mr-2" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-building text-blue-500 text-lg"></i>
                        </div>
                        <h4 className="m-0">Rapprochement Bancaire</h4>
                    </div>
                    <p className="text-600 line-height-3 text-sm">
                        Comparer le <strong>relevé bancaire</strong> avec le <strong>journal comptable</strong>.
                        Rapprochement automatique et manuel des écritures.
                    </p>
                    <p className="text-500 text-xs">
                        Données: Comptabilité (comptes classe 5, écritures)
                    </p>
                    <Divider />
                    <Button label="Ouvrir" icon="pi pi-building" severity="info" outlined className="w-full" onClick={() => router.push('/rapprochement/rapprochements')} />
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="shadow-2 h-full border-top-3 border-green-500">
                    <div className="flex align-items-center mb-3">
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round mr-2" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-wallet text-green-500 text-lg"></i>
                        </div>
                        <h4 className="m-0">Rapprochement Caisse</h4>
                    </div>
                    <p className="text-600 line-height-3 text-sm">
                        Comparer le <strong>solde théorique</strong> (livres comptables) avec le <strong>solde physique</strong> (comptage de caisse/billetage).
                    </p>
                    <p className="text-500 text-xs">
                        Données: Comptabilité (caisses, billetage, mouvements)
                    </p>
                    <Divider />
                    <Button label="Ouvrir" icon="pi pi-wallet" severity="success" outlined className="w-full" onClick={() => router.push('/rapprochement/rapprochement-caisse')} />
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="shadow-2 h-full border-top-3 border-orange-500">
                    <div className="flex align-items-center mb-3">
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round mr-2" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-briefcase text-orange-500 text-lg"></i>
                        </div>
                        <h4 className="m-0">Portefeuille Crédits</h4>
                    </div>
                    <p className="text-600 line-height-3 text-sm">
                        Vérifier que les <strong>montants décaissés</strong>, <strong>remboursés</strong> et <strong>en cours</strong> correspondent entre le système et les reçus.
                    </p>
                    <p className="text-500 text-xs">
                        Données: Crédits (dossiers) + Remboursements (paiements, échéanciers)
                    </p>
                    <Divider />
                    <Button label="Ouvrir" icon="pi pi-briefcase" severity="warning" outlined className="w-full" onClick={() => router.push('/rapprochement/rapprochement-credits')} />
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="shadow-2 h-full border-top-3 border-purple-500">
                    <div className="flex align-items-center mb-3">
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round mr-2" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-money-bill text-purple-500 text-lg"></i>
                        </div>
                        <h4 className="m-0">Dépôts Épargne</h4>
                    </div>
                    <p className="text-600 line-height-3 text-sm">
                        Comparer les <strong>soldes des comptes épargnants</strong> dans le système avec les relevés individuels par agence et type de compte.
                    </p>
                    <p className="text-500 text-xs">
                        Données: Épargne (comptes, soldes, types)
                    </p>
                    <Divider />
                    <Button label="Ouvrir" icon="pi pi-money-bill" outlined className="w-full" onClick={() => router.push('/rapprochement/rapprochement-depots')} />
                </Card>
            </div>
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_VIEW']}>
            <RapprochementDashboard />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
