'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Steps } from 'primereact/steps';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from 'primereact/divider';
import { useRouter } from 'next/navigation';
import useConsumApi, { getUserAction } from '../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

const RapprochementDashboard = () => {
    const toast = useRef<Toast>(null);
    const router = useRouter();

    // Stats state
    const [stats, setStats] = useState({
        totalReleves: 0,
        totalRapprochements: 0,
        enCours: 0,
        valides: 0,
        brouillons: 0,
        termines: 0,
        ecartsNonResolus: 0
    });

    // Sample data generation
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState(0);
    const [generationProgress, setGenerationProgress] = useState(0);

    // API hooks
    const { data: relevesData, fetchData: fetchReleves, callType: relevesCallType } = useConsumApi(buildApiUrl('/api/rapprochement/releves/findall'));
    const { data: rapData, fetchData: fetchRapprochements, callType: rapCallType } = useConsumApi(buildApiUrl('/api/rapprochement/rapprochements/findall'));
    const { data: createData, fetchData: postCreate, callType: createCallType } = useConsumApi(buildApiUrl('/api/rapprochement/releves/new'));

    // Load stats on mount
    useEffect(() => {
        fetchReleves(null, 'GET', buildApiUrl('/api/rapprochement/releves/findall'), 'loadReleves');
        fetchRapprochements(null, 'GET', buildApiUrl('/api/rapprochement/rapprochements/findall'), 'loadRap');
    }, []);

    useEffect(() => {
        if (relevesData && relevesCallType === 'loadReleves') {
            try {
                const data = Array.isArray(relevesData) ? relevesData : (typeof relevesData === 'string' ? JSON.parse(relevesData) : []);
                setStats(prev => ({ ...prev, totalReleves: data.length }));
            } catch (e) {}
        }
    }, [relevesData, relevesCallType]);

    useEffect(() => {
        if (rapData && rapCallType === 'loadRap') {
            try {
                const data = Array.isArray(rapData) ? rapData : (typeof rapData === 'string' ? JSON.parse(rapData) : []);
                setStats(prev => ({
                    ...prev,
                    totalRapprochements: data.length,
                    enCours: data.filter((r: any) => r.statut === 'EN_COURS').length,
                    valides: data.filter((r: any) => r.statut === 'VALIDE').length,
                    brouillons: data.filter((r: any) => r.statut === 'BROUILLON').length,
                    termines: data.filter((r: any) => r.statut === 'TERMINE').length
                }));
            } catch (e) {}
        }
    }, [rapData, rapCallType]);

    // Workflow steps
    const workflowSteps = [
        { label: 'Import Relevé' },
        { label: 'Créer Rapprochement' },
        { label: 'Rapprochement Auto' },
        { label: 'Traitement Écarts' },
        { label: 'Validation' }
    ];

    // Generate sample data
    const generateSampleData = async () => {
        setGenerating(true);
        setGenerationStep(0);
        setGenerationProgress(0);

        try {
            // Step 1: Create bank statement with lines
            setGenerationStep(1);
            setGenerationProgress(10);

            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();

            const releve = {
                nomBanque: 'BANCOBU',
                numeroCompte: '04001-12345-001',
                moisReleve: currentMonth,
                anneeReleve: currentYear,
                soldeDebut: 15000000,
                soldeFin: 12850000,
                dateImport: new Date().toISOString().split('T')[0],
                notes: 'Relevé de démonstration généré automatiquement',
                userAction: getUserAction(),
                lignes: [
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
                        reference: 'OUV-' + currentYear,
                        description: 'Solde reporté',
                        montantDebit: 0,
                        montantCredit: 15000000,
                        solde: 15000000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-03`,
                        reference: 'FTC-' + currentMonth + '-' + currentYear,
                        description: 'Frais de tenue de compte',
                        montantDebit: 25000,
                        montantCredit: 0,
                        solde: 14975000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
                        reference: 'CRED-' + currentYear + '-DEM01',
                        description: 'Décaissement crédit agricole - Groupe Terimbere',
                        montantDebit: 3000000,
                        montantCredit: 0,
                        solde: 11975000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-08`,
                        reference: 'RBT-' + currentYear + '-DEM01',
                        description: 'Remboursement mensuel NIYONZIMA Carine',
                        montantDebit: 0,
                        montantCredit: 350000,
                        solde: 12325000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`,
                        reference: 'VIR-' + currentYear + '-DEM01',
                        description: 'Versement caisse vers banque',
                        montantDebit: 0,
                        montantCredit: 2000000,
                        solde: 14325000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-12`,
                        reference: 'CRED-' + currentYear + '-DEM02',
                        description: 'Décaissement crédit petit commerce - BIGIRIMANA Jean',
                        montantDebit: 1500000,
                        montantCredit: 0,
                        solde: 12825000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
                        reference: 'RBT-' + currentYear + '-DEM02',
                        description: 'Remboursement mensuel NSABIMANA Pierre',
                        montantDebit: 0,
                        montantCredit: 275000,
                        solde: 13100000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`,
                        reference: 'SAL-' + currentMonth + '-' + currentYear,
                        description: 'Virement salaires personnel',
                        montantDebit: 1450000,
                        montantCredit: 0,
                        solde: 11650000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-25`,
                        reference: 'FB-' + currentYear + '-DEM',
                        description: 'Frais bancaires trimestriels',
                        montantDebit: 45000,
                        montantCredit: 0,
                        solde: 11605000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-28`,
                        reference: 'LOY-' + currentMonth + '-' + currentYear,
                        description: 'Paiement loyer bureau agence',
                        montantDebit: 800000,
                        montantCredit: 0,
                        solde: 10805000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-28`,
                        reference: 'INT-' + currentMonth + '-' + currentYear,
                        description: 'Intérêts créditeurs sur compte',
                        montantDebit: 0,
                        montantCredit: 45000,
                        solde: 10850000,
                        rapprochee: false,
                        userAction: getUserAction()
                    },
                    {
                        dateOperation: `${currentYear}-${String(currentMonth).padStart(2, '0')}-28`,
                        reference: 'DEP-TRANSIT-DEM',
                        description: 'Dépôt client NDAYISABA en transit',
                        montantDebit: 0,
                        montantCredit: 2000000,
                        solde: 12850000,
                        rapprochee: false,
                        userAction: getUserAction()
                    }
                ]
            };

            setGenerationProgress(30);

            await postCreate(releve, 'POST', buildApiUrl('/api/rapprochement/releves/new'), 'generateReleve');

            setGenerationStep(2);
            setGenerationProgress(70);

            // Wait for creation
            await new Promise(resolve => setTimeout(resolve, 1500));

            setGenerationStep(3);
            setGenerationProgress(100);

            toast.current?.show({
                severity: 'success',
                summary: 'Données générées',
                detail: 'Le relevé bancaire de démonstration avec 12 lignes a été créé. Allez dans "Relevés Bancaires" pour le voir, puis créez un rapprochement.',
                life: 8000
            });

            // Reload stats
            fetchReleves(null, 'GET', buildApiUrl('/api/rapprochement/releves/findall'), 'loadReleves');
            fetchRapprochements(null, 'GET', buildApiUrl('/api/rapprochement/rapprochements/findall'), 'loadRap');

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la génération des données',
                life: 5000
            });
        } finally {
            setGenerating(false);
            setShowGenerateDialog(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal', minimumFractionDigits: 0 }).format(value) + ' FBU';
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
                    <Button
                        label="Générer données démo"
                        icon="pi pi-database"
                        severity="help"
                        outlined
                        onClick={() => setShowGenerateDialog(true)}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="col-12 md:col-3">
                <Card className="shadow-2">
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <span className="block text-500 font-medium mb-2">Relevés Bancaires</span>
                            <div className="text-900 font-bold text-3xl">{stats.totalReleves}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-file-import text-blue-500 text-xl"></i>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-3">
                <Card className="shadow-2">
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <span className="block text-500 font-medium mb-2">Rapprochements</span>
                            <div className="text-900 font-bold text-3xl">{stats.totalRapprochements}</div>
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
                            <div className="text-900 font-bold text-3xl">{stats.enCours}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-spin pi-spinner text-orange-500 text-xl"></i>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-12 md:col-3">
                <Card className="shadow-2">
                    <div className="flex align-items-center">
                        <div className="flex-1">
                            <span className="block text-500 font-medium mb-2">Validés</span>
                            <div className="text-900 font-bold text-3xl">{stats.valides}</div>
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

            {/* Workflow Description Cards */}
            <div className="col-12 md:col-6 lg:col-4">
                <Card className="shadow-2 h-full">
                    <div className="flex align-items-center mb-3">
                        <Tag value="Étape 1" severity="info" className="mr-2" />
                        <h4 className="m-0">Importer le Relevé Bancaire</h4>
                    </div>
                    <p className="text-600 line-height-3">
                        Saisissez les informations du relevé bancaire reçu de votre banque (BANCOBU, INTERBANK, etc.).
                        Renseignez le <strong>nom de la banque</strong>, le <strong>numéro de compte</strong>, la <strong>période</strong> (mois/année),
                        et les <strong>soldes</strong> de début et fin de période.
                    </p>
                    <p className="text-600 line-height-3">
                        Ensuite, ajoutez chaque <strong>ligne du relevé</strong> : date d'opération, référence, description,
                        montant débit/crédit. Ces lignes seront comparées aux écritures comptables.
                    </p>
                    <Divider />
                    <Button
                        label="Aller aux Relevés"
                        icon="pi pi-file-import"
                        severity="info"
                        outlined
                        className="w-full"
                        onClick={() => router.push('/rapprochement/releves')}
                    />
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4">
                <Card className="shadow-2 h-full">
                    <div className="flex align-items-center mb-3">
                        <Tag value="Étape 2" severity="info" className="mr-2" />
                        <h4 className="m-0">Créer le Rapprochement</h4>
                    </div>
                    <p className="text-600 line-height-3">
                        Créez un nouveau rapprochement en sélectionnant le <strong>relevé bancaire</strong> importé
                        et le <strong>compte comptable</strong> correspondant (ex: 521 - Banque principale FBU).
                        Le système associe automatiquement la période et le solde bancaire.
                    </p>
                    <p className="text-600 line-height-3">
                        Le rapprochement est créé en statut <Tag value="BROUILLON" severity="secondary" />.
                        Ouvrez l'<strong>espace de travail</strong> pour lancer la réconciliation.
                    </p>
                    <Divider />
                    <Button
                        label="Aller aux Rapprochements"
                        icon="pi pi-check-circle"
                        severity="info"
                        outlined
                        className="w-full"
                        onClick={() => router.push('/rapprochement/rapprochements')}
                    />
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4">
                <Card className="shadow-2 h-full">
                    <div className="flex align-items-center mb-3">
                        <Tag value="Étape 3" severity="warning" className="mr-2" />
                        <h4 className="m-0">Rapprochement Automatique</h4>
                    </div>
                    <p className="text-600 line-height-3">
                        Dans l'espace de travail, cliquez sur <strong>"Rapprochement Auto"</strong>.
                        Le système compare chaque ligne du relevé avec les écritures comptables en 3 passes :
                    </p>
                    <ul className="text-600 line-height-3 pl-3">
                        <li><strong>Passe 1</strong> : Correspondance exacte (montant + date + référence) - Confiance 100%</li>
                        <li><strong>Passe 2</strong> : Montant + date proche (2 jours) - Confiance 75%</li>
                        <li><strong>Passe 3</strong> : Montant seul - Confiance 50%</li>
                    </ul>
                    <p className="text-600 line-height-3">
                        Les lignes non matchées deviennent des <strong>écarts</strong> à traiter.
                        Vous pouvez aussi faire un <strong>rapprochement manuel</strong> en sélectionnant une ligne bancaire et une écriture.
                    </p>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4">
                <Card className="shadow-2 h-full">
                    <div className="flex align-items-center mb-3">
                        <Tag value="Étape 4" severity="danger" className="mr-2" />
                        <h4 className="m-0">Traitement des Écarts</h4>
                    </div>
                    <p className="text-600 line-height-3">
                        Traitez chaque écart identifié. Les types d'écarts courants en microfinance au Burundi :
                    </p>
                    <ul className="text-600 line-height-3 pl-3">
                        <li><strong>Frais bancaires</strong> : tenue de compte, commissions, agios (BANCOBU, INTERBANK)</li>
                        <li><strong>Virements en cours</strong> : décaissements crédit ou remboursements en transit</li>
                        <li><strong>Chèques non débités</strong> : chèques émis pas encore présentés</li>
                        <li><strong>Erreurs de saisie</strong> : montants ou dates incorrects en comptabilité</li>
                    </ul>
                    <p className="text-600 line-height-3">
                        Pour chaque écart, ajoutez une <strong>justification</strong> et marquez-le comme <strong>résolu</strong>.
                    </p>
                    <Divider />
                    <Button
                        label="Aller aux Écarts"
                        icon="pi pi-exclamation-triangle"
                        severity="warning"
                        outlined
                        className="w-full"
                        onClick={() => router.push('/rapprochement/ecarts')}
                    />
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4">
                <Card className="shadow-2 h-full">
                    <div className="flex align-items-center mb-3">
                        <Tag value="Étape 5" severity="success" className="mr-2" />
                        <h4 className="m-0">Validation et Approbation</h4>
                    </div>
                    <p className="text-600 line-height-3">
                        Le processus de validation suit la hiérarchie de contrôle interne :
                    </p>
                    <ol className="text-600 line-height-3 pl-3">
                        <li>
                            <strong>Signature Comptable</strong> : Le comptable vérifie le rapprochement et le signe.
                            Statut passe à <Tag value="TERMINÉ" severity="info" />.
                        </li>
                        <li className="mt-2">
                            <strong>Visa Directeur Financier</strong> : Le directeur approuve et signe.
                            Statut passe à <Tag value="VALIDÉ" severity="success" />.
                        </li>
                    </ol>
                    <p className="text-600 line-height-3">
                        Une fois validé, le rapprochement est verrouillé et peut être imprimé comme document officiel.
                    </p>
                    <Divider />
                    <Button
                        label="Imprimer Rapports"
                        icon="pi pi-print"
                        severity="success"
                        outlined
                        className="w-full"
                        onClick={() => router.push('/rapprochement/rapports')}
                    />
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4">
                <Card className="shadow-2 h-full" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                    <div className="flex align-items-center mb-3">
                        <Tag value="Info" className="mr-2" />
                        <h4 className="m-0">Flux de Données</h4>
                    </div>
                    <p className="text-600 line-height-3">
                        <strong>Sources de données :</strong>
                    </p>
                    <ul className="text-600 line-height-3 pl-3">
                        <li><strong>Relevé bancaire</strong> : Saisi manuellement depuis le relevé papier/PDF de la banque</li>
                        <li><strong>Écritures comptables</strong> : Proviennent du module Comptabilité (comptes classe 5 - Trésorerie)</li>
                    </ul>
                    <p className="text-600 line-height-3">
                        <strong>Résultats :</strong>
                    </p>
                    <ul className="text-600 line-height-3 pl-3">
                        <li>Lignes rapprochées (matchées)</li>
                        <li>Écarts identifiés avec justifications</li>
                        <li>État de rapprochement signé (comptable + directeur)</li>
                    </ul>
                </Card>
            </div>

            {/* Quick Status Summary */}
            {stats.totalRapprochements > 0 && (
                <div className="col-12">
                    <Card title="Résumé des Rapprochements" className="shadow-2">
                        <div className="flex flex-wrap gap-3">
                            <Tag value={`${stats.brouillons} Brouillon(s)`} severity="secondary" className="text-base p-2" />
                            <Tag value={`${stats.enCours} En cours`} severity="warning" className="text-base p-2" />
                            <Tag value={`${stats.termines} Terminé(s)`} severity="info" className="text-base p-2" />
                            <Tag value={`${stats.valides} Validé(s)`} severity="success" className="text-base p-2" />
                        </div>
                    </Card>
                </div>
            )}

            {/* Generate Sample Data Dialog */}
            <Dialog
                header="Générer des Données de Démonstration"
                visible={showGenerateDialog}
                style={{ width: '550px' }}
                modal
                onHide={() => { if (!generating) setShowGenerateDialog(false); }}
                closable={!generating}
            >
                {!generating ? (
                    <div>
                        <p className="line-height-3">
                            Cette action va créer un <strong>relevé bancaire de démonstration</strong> pour le mois en cours
                            avec <strong>12 lignes</strong> représentant des opérations typiques d'une IMF au Burundi :
                        </p>
                        <ul className="line-height-3 pl-3">
                            <li>Décaissements de crédits (agricoles, petit commerce)</li>
                            <li>Remboursements de clients</li>
                            <li>Versement caisse vers banque</li>
                            <li>Paiement salaires</li>
                            <li>Frais bancaires et commissions</li>
                            <li>Loyer et charges</li>
                            <li>Intérêts créditeurs</li>
                            <li>Dépôt client en transit</li>
                        </ul>
                        <p className="text-600">
                            Après la génération, suivez les étapes du workflow ci-dessus pour effectuer le rapprochement.
                        </p>
                        <div className="flex justify-content-end gap-2 mt-4">
                            <Button label="Annuler" severity="secondary" outlined onClick={() => setShowGenerateDialog(false)} />
                            <Button label="Générer" icon="pi pi-database" onClick={generateSampleData} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="mb-3">Génération en cours...</p>
                        <ProgressBar value={generationProgress} className="mb-3" />
                        <div className="text-600">
                            {generationStep === 1 && 'Création du relevé bancaire et des lignes...'}
                            {generationStep === 2 && 'Enregistrement des données...'}
                            {generationStep === 3 && 'Terminé !'}
                        </div>
                    </div>
                )}
            </Dialog>
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
