'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { VisiteTerrain, VisiteTerrainClass, EntretienClient, EntretienClientClass, StatutsVisite, EtatsCondition, AttitudesClient, NiveauxCooperation } from '../../types/VisiteTerrain';

const VISITS_URL = buildApiUrl('/api/credit/field-visits');
const INTERVIEWS_URL = buildApiUrl('/api/credit/client-interviews');
const HOUSING_STATUS_URL = buildApiUrl('/api/credit/housing-statuses');
const RECOMMENDATIONS_URL = buildApiUrl('/api/credit/visit-recommendations');
const APP_URL = buildApiUrl('/api/credit/applications');
const USERS_URL = buildApiUrl('/api/usermanagement/users');

export default function VisiteTerrainPage() {
    const params = useParams();
    const applicationId = Number(params.applicationId);

    const [application, setApplication] = useState<any>(null);
    const [visite, setVisite] = useState<VisiteTerrain>(new VisiteTerrainClass({ applicationId }));
    const [visites, setVisites] = useState<VisiteTerrain[]>([]);
    const [entretien, setEntretien] = useState<EntretienClient>(new EntretienClientClass());

    // Reference data
    const [agents, setAgents] = useState<any[]>([]);
    const [statutsLogement, setStatutsLogement] = useState<any[]>([]);
    const [recommandations, setRecommandations] = useState<any[]>([]);

    const [activeIndex, setActiveIndex] = useState(0);
    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        if (applicationId) {
            loadApplication();
            loadAgents();
            loadStatutsLogement();
            loadRecommandations();
            loadVisites();
        }
    }, [applicationId]);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadApplication':
                    setApplication(data);
                    break;
                case 'loadAgents':
                    setAgents(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadStatutsLogement':
                    setStatutsLogement(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadRecommandations':
                    setRecommandations(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadVisites':
                    setVisites(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'createVisite':
                case 'updateVisite':
                    showToast('success', 'Succès', 'Visite enregistrée avec succès');
                    resetVisiteForm();
                    loadVisites();
                    setActiveIndex(1);
                    break;
                case 'deleteVisite':
                    showToast('success', 'Succès', 'Visite supprimée avec succès');
                    loadVisites();
                    break;
                case 'completeVisite':
                    showToast('success', 'Succès', 'Visite marquée comme terminée');
                    loadVisites();
                    break;
                case 'loadEntretien':
                    if (data) setEntretien(data);
                    break;
                case 'createEntretien':
                case 'updateEntretien':
                    showToast('success', 'Succès', 'Entretien enregistré avec succès');
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadApplication = () => fetchData(null, 'GET', `${APP_URL}/findbyid/${applicationId}`, 'loadApplication');
    const loadAgents = () => fetchData(null, 'GET', `${USERS_URL}/findall`, 'loadAgents');
    const loadStatutsLogement = () => fetchData(null, 'GET', `${HOUSING_STATUS_URL}/findall/active`, 'loadStatutsLogement');
    const loadRecommandations = () => fetchData(null, 'GET', `${RECOMMENDATIONS_URL}/findall/active`, 'loadRecommandations');
    const loadVisites = () => fetchData(null, 'GET', `${VISITS_URL}/findbyapplication/${applicationId}`, 'loadVisites');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetVisiteForm = () => setVisite(new VisiteTerrainClass({ applicationId }));

    const handleSaveVisite = () => {
        const visiteToSave = { ...visite, applicationId };
        if (visite.id) {
            fetchData(visiteToSave, 'PUT', `${VISITS_URL}/update/${visite.id}`, 'updateVisite');
        } else {
            fetchData(visiteToSave, 'POST', `${VISITS_URL}/new`, 'createVisite');
        }
    };

    const handleEditVisite = (row: VisiteTerrain) => {
        setVisite({ ...row });
        setActiveIndex(0);
        if (row.id) {
            fetchData(null, 'GET', `${INTERVIEWS_URL}/findbyvisit/${row.id}`, 'loadEntretien');
        }
    };

    const handleDeleteVisite = (row: VisiteTerrain) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer cette visite ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => fetchData(null, 'DELETE', `${VISITS_URL}/delete/${row.id}`, 'deleteVisite')
        });
    };

    const handleCompleteVisite = (row: VisiteTerrain) => {
        fetchData(null, 'PUT', `${VISITS_URL}/complete/${row.id}`, 'completeVisite');
    };

    const handleSaveEntretien = () => {
        const entretienToSave = { ...entretien, visitId: visite.id };
        if (entretien.id) {
            fetchData(entretienToSave, 'PUT', `${INTERVIEWS_URL}/update/${entretien.id}`, 'updateEntretien');
        } else {
            fetchData(entretienToSave, 'POST', `${INTERVIEWS_URL}/new`, 'createEntretien');
        }
    };

    const statusBodyTemplate = (row: VisiteTerrain) => {
        const status = StatutsVisite.find(s => s.code === row.visitStatus);
        return <Tag value={status?.label || row.visitStatus} severity={status?.color as any || 'info'} />;
    };

    const formatDate = (date: string | undefined) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex justify-content-between align-items-center mb-4">
                <h4 className="m-0">
                    <i className="pi pi-map-marker mr-2"></i>
                    Visite Terrain - Dossier {application?.applicationNumber}
                </h4>
                <Button
                    label="Retour aux demandes"
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    onClick={() => window.location.href = '/credit/demandes'}
                />
            </div>

            {/* Client Info Card */}
            {application && (
                <Card className="mb-4">
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <strong>Client:</strong><br />
                            {application.client?.firstName} {application.client?.lastName}
                        </div>
                        <div className="col-12 md:col-3">
                            <strong>Montant demandé:</strong><br />
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', maximumFractionDigits: 0 }).format(application.amountRequested || 0)}
                        </div>
                        <div className="col-12 md:col-3">
                            <strong>Objet:</strong><br />
                            {application.creditPurpose?.nameFr || 'N/A'}
                        </div>
                        <div className="col-12 md:col-3">
                            <strong>Agent de crédit:</strong><br />
                            {application.creditOfficer?.fullName || 'N/A'}
                        </div>
                    </div>
                </Card>
            )}

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                {/* Tab: Nouvelle Visite */}
                <TabPanel header="Planifier / Saisir Visite" leftIcon="pi pi-plus mr-2">
                    {/* Planification */}
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5><i className="pi pi-calendar mr-2"></i>Planification de la Visite</h5>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Date Prévue *</label>
                                <Calendar
                                    value={visite.scheduledDate ? new Date(visite.scheduledDate) : null}
                                    onChange={(e) => setVisite(prev => ({ ...prev, scheduledDate: (e.value as Date)?.toISOString().split('T')[0] }))}
                                    className="w-full"
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Agent Assigné *</label>
                                <Dropdown
                                    value={visite.agentId}
                                    options={agents}
                                    onChange={(e) => setVisite(prev => ({ ...prev, agentId: e.value }))}
                                    optionLabel="fullName"
                                    optionValue="id"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                    filter
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Date Réelle</label>
                                <Calendar
                                    value={visite.actualDate ? new Date(visite.actualDate) : null}
                                    onChange={(e) => setVisite(prev => ({ ...prev, actualDate: (e.value as Date)?.toISOString().split('T')[0] }))}
                                    className="w-full"
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Statut</label>
                                <Dropdown
                                    value={visite.visitStatus}
                                    options={StatutsVisite}
                                    onChange={(e) => setVisite(prev => ({ ...prev, visitStatus: e.value }))}
                                    optionLabel="label"
                                    optionValue="code"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vérification Domicile */}
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5><i className="pi pi-home mr-2"></i>Vérification du Domicile</h5>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Statut de Logement</label>
                                <Dropdown
                                    value={visite.housingStatusId}
                                    options={statutsLogement}
                                    onChange={(e) => setVisite(prev => ({ ...prev, housingStatusId: e.value }))}
                                    optionLabel="nameFr"
                                    optionValue="id"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Nombre de Pièces</label>
                                <InputNumber
                                    value={visite.numberOfRooms || 0}
                                    onValueChange={(e) => setVisite(prev => ({ ...prev, numberOfRooms: e.value ?? 0 }))}
                                    className="w-full"
                                    min={0}
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">État du Logement</label>
                                <Dropdown
                                    value={visite.housingCondition}
                                    options={EtatsCondition}
                                    onChange={(e) => setVisite(prev => ({ ...prev, housingCondition: e.value }))}
                                    optionLabel="label"
                                    optionValue="code"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox
                                        checked={visite.hasElectricity || false}
                                        onChange={(e) => setVisite(prev => ({ ...prev, hasElectricity: e.checked ?? false }))}
                                    />
                                    <label>Électricité</label>
                                </div>
                            </div>
                            <div className="field col-12 md:col-3">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox
                                        checked={visite.hasWater || false}
                                        onChange={(e) => setVisite(prev => ({ ...prev, hasWater: e.checked ?? false }))}
                                    />
                                    <label>Eau courante</label>
                                </div>
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold">Description du voisinage</label>
                                <InputText
                                    value={visite.neighborhoodDescription || ''}
                                    onChange={(e) => setVisite(prev => ({ ...prev, neighborhoodDescription: e.target.value }))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vérification Activité */}
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5><i className="pi pi-briefcase mr-2"></i>Vérification de l'Activité Économique</h5>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-3">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox
                                        checked={visite.businessVerified || false}
                                        onChange={(e) => setVisite(prev => ({ ...prev, businessVerified: e.checked ?? false }))}
                                    />
                                    <label>Activité vérifiée</label>
                                </div>
                            </div>
                            <div className="field col-12 md:col-3">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox
                                        checked={visite.stockVerified || false}
                                        onChange={(e) => setVisite(prev => ({ ...prev, stockVerified: e.checked ?? false }))}
                                    />
                                    <label>Stock vérifié</label>
                                </div>
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Valeur Stock Estimée (BIF)</label>
                                <InputNumber
                                    value={visite.stockValueEstimated || 0}
                                    onValueChange={(e) => setVisite(prev => ({ ...prev, stockValueEstimated: e.value ?? 0 }))}
                                    className="w-full"
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">État de l'activité</label>
                                <Dropdown
                                    value={visite.businessCondition}
                                    options={EtatsCondition}
                                    onChange={(e) => setVisite(prev => ({ ...prev, businessCondition: e.value }))}
                                    optionLabel="label"
                                    optionValue="code"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12">
                                <label className="font-semibold">Affluence clientèle observée</label>
                                <InputTextarea
                                    value={visite.customerFlowObserved || ''}
                                    onChange={(e) => setVisite(prev => ({ ...prev, customerFlowObserved: e.target.value }))}
                                    className="w-full"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Évaluation Garanties */}
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5><i className="pi pi-shield mr-2"></i>Évaluation des Garanties</h5>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-3">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox
                                        checked={visite.guaranteesVerified || false}
                                        onChange={(e) => setVisite(prev => ({ ...prev, guaranteesVerified: e.checked ?? false }))}
                                    />
                                    <label>Garanties vérifiées</label>
                                </div>
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">État des garanties</label>
                                <Dropdown
                                    value={visite.guaranteesCondition}
                                    options={EtatsCondition}
                                    onChange={(e) => setVisite(prev => ({ ...prev, guaranteesCondition: e.value }))}
                                    optionLabel="label"
                                    optionValue="code"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Valeur Estimée (BIF)</label>
                                <InputNumber
                                    value={visite.guaranteesValue || 0}
                                    onValueChange={(e) => setVisite(prev => ({ ...prev, guaranteesValue: e.value ?? 0 }))}
                                    className="w-full"
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Conclusion */}
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5><i className="pi pi-check-circle mr-2"></i>Conclusion et Recommandation</h5>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Recommandation de l'agent *</label>
                                <Dropdown
                                    value={visite.recommendationId}
                                    options={recommandations}
                                    onChange={(e) => setVisite(prev => ({ ...prev, recommendationId: e.value }))}
                                    optionLabel="nameFr"
                                    optionValue="id"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Montant Recommandé (BIF)</label>
                                <InputNumber
                                    value={visite.recommendedAmount || 0}
                                    onValueChange={(e) => setVisite(prev => ({ ...prev, recommendedAmount: e.value ?? 0 }))}
                                    className="w-full"
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Durée Recommandée (mois)</label>
                                <InputNumber
                                    value={visite.recommendedDuration || 0}
                                    onValueChange={(e) => setVisite(prev => ({ ...prev, recommendedDuration: e.value ?? 0 }))}
                                    className="w-full"
                                    suffix=" mois"
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold">Points positifs</label>
                                <InputTextarea
                                    value={visite.positivePoints || ''}
                                    onChange={(e) => setVisite(prev => ({ ...prev, positivePoints: e.target.value }))}
                                    className="w-full"
                                    rows={3}
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold">Points de vigilance / Risques</label>
                                <InputTextarea
                                    value={visite.riskPoints || ''}
                                    onChange={(e) => setVisite(prev => ({ ...prev, riskPoints: e.target.value }))}
                                    className="w-full"
                                    rows={3}
                                />
                            </div>
                            <div className="field col-12">
                                <label className="font-semibold">Évaluation globale</label>
                                <InputTextarea
                                    value={visite.overallAssessment || ''}
                                    onChange={(e) => setVisite(prev => ({ ...prev, overallAssessment: e.target.value }))}
                                    className="w-full"
                                    rows={3}
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold">Coordonnées GPS</label>
                                <div className="flex gap-2">
                                    <InputText
                                        placeholder="Latitude"
                                        value={visite.gpsLatitude || ''}
                                        onChange={(e) => setVisite(prev => ({ ...prev, gpsLatitude: e.target.value }))}
                                        className="w-full"
                                    />
                                    <InputText
                                        placeholder="Longitude"
                                        value={visite.gpsLongitude || ''}
                                        onChange={(e) => setVisite(prev => ({ ...prev, gpsLongitude: e.target.value }))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetVisiteForm} />
                        <Button label={visite.id ? 'Modifier' : 'Enregistrer'} icon="pi pi-save" onClick={handleSaveVisite} loading={loading} />
                    </div>
                </TabPanel>

                {/* Tab: Liste des Visites */}
                <TabPanel header="Historique des Visites" leftIcon="pi pi-list mr-2">
                    <DataTable value={visites} emptyMessage="Aucune visite enregistrée" className="p-datatable-sm">
                        <Column field="scheduledDate" header="Date Prévue" body={(row) => formatDate(row.scheduledDate)} sortable />
                        <Column field="actualDate" header="Date Réelle" body={(row) => formatDate(row.actualDate)} />
                        <Column field="agent.fullName" header="Agent" />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column field="recommendation.nameFr" header="Recommandation" />
                        <Column
                            field="recommendedAmount"
                            header="Montant Recommandé"
                            body={(row) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', maximumFractionDigits: 0 }).format(row.recommendedAmount || 0)}
                        />
                        <Column header="Actions" body={(row) => (
                            <div className="flex gap-1">
                                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEditVisite(row)} tooltip="Modifier" />
                                <Button icon="pi pi-check" rounded text severity="success" onClick={() => handleCompleteVisite(row)} tooltip="Marquer terminée" disabled={row.visitStatus === 'COMPLETED'} />
                                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDeleteVisite(row)} tooltip="Supprimer" />
                            </div>
                        )} />
                    </DataTable>
                </TabPanel>

                {/* Tab: Entretien Client */}
                {visite.id && (
                    <TabPanel header="Entretien Client" leftIcon="pi pi-comments mr-2">
                        <div className="surface-100 p-3 border-round mb-4">
                            <h5><i className="pi pi-comments mr-2"></i>Entretien avec le Client</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Date de l'entretien</label>
                                    <Calendar
                                        value={entretien.interviewDate ? new Date(entretien.interviewDate) : null}
                                        onChange={(e) => setEntretien(prev => ({ ...prev, interviewDate: (e.value as Date)?.toISOString().split('T')[0] }))}
                                        className="w-full"
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Lieu de l'entretien</label>
                                    <InputText
                                        value={entretien.interviewLocation || ''}
                                        onChange={(e) => setEntretien(prev => ({ ...prev, interviewLocation: e.target.value }))}
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Présences</label>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex align-items-center gap-2">
                                            <Checkbox
                                                checked={entretien.clientPresent || false}
                                                onChange={(e) => setEntretien(prev => ({ ...prev, clientPresent: e.checked ?? false }))}
                                            />
                                            <label>Client</label>
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <Checkbox
                                                checked={entretien.spousePresent || false}
                                                onChange={(e) => setEntretien(prev => ({ ...prev, spousePresent: e.checked ?? false }))}
                                            />
                                            <label>Conjoint</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Confirmations</label>
                                    <div className="flex flex-column gap-2 mt-2">
                                        <div className="flex align-items-center gap-2">
                                            <Checkbox
                                                checked={entretien.incomeConfirmed || false}
                                                onChange={(e) => setEntretien(prev => ({ ...prev, incomeConfirmed: e.checked ?? false }))}
                                            />
                                            <label>Revenus confirmés</label>
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <Checkbox
                                                checked={entretien.expensesConfirmed || false}
                                                onChange={(e) => setEntretien(prev => ({ ...prev, expensesConfirmed: e.checked ?? false }))}
                                            />
                                            <label>Dépenses confirmées</label>
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <Checkbox
                                                checked={entretien.purposeConfirmed || false}
                                                onChange={(e) => setEntretien(prev => ({ ...prev, purposeConfirmed: e.checked ?? false }))}
                                            />
                                            <label>Objet du crédit confirmé</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Attitude du client</label>
                                    <Dropdown
                                        value={entretien.clientAttitude}
                                        options={AttitudesClient}
                                        onChange={(e) => setEntretien(prev => ({ ...prev, clientAttitude: e.value }))}
                                        optionLabel="label"
                                        optionValue="code"
                                        placeholder="Sélectionner"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold">Niveau de coopération</label>
                                    <Dropdown
                                        value={entretien.cooperationLevel}
                                        options={NiveauxCooperation}
                                        onChange={(e) => setEntretien(prev => ({ ...prev, cooperationLevel: e.value }))}
                                        optionLabel="label"
                                        optionValue="code"
                                        placeholder="Sélectionner"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12">
                                    <label className="font-semibold">Notes</label>
                                    <InputTextarea
                                        value={entretien.notes || ''}
                                        onChange={(e) => setEntretien(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-content-end">
                                <Button label="Enregistrer l'entretien" icon="pi pi-save" onClick={handleSaveEntretien} loading={loading} />
                            </div>
                        </div>
                    </TabPanel>
                )}
            </TabView>
        </div>
    );
}
