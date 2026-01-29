'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';
import { ProgressBar } from 'primereact/progressbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { AnalyseRevenu, AnalyseRevenuClass, AnalyseDepense, AnalyseDepenseClass, AnalyseCapacite, AnalyseCapaciteClass, TypesContrat, EvaluationsRisque } from '../../types/AnalyseFinanciere';

const INCOME_URL = buildApiUrl('/api/credit/income-analysis');
const EXPENSE_URL = buildApiUrl('/api/credit/expense-analysis');
const CAPACITY_URL = buildApiUrl('/api/credit/capacity-analysis');
const INCOME_TYPES_URL = buildApiUrl('/api/credit/income-types');
const EXPENSE_TYPES_URL = buildApiUrl('/api/credit/expense-types');
const APP_URL = buildApiUrl('/api/credit/applications');

export default function AnalyseFinancierePage() {
    const params = useParams();
    const applicationId = Number(params.applicationId);

    // State for application info
    const [application, setApplication] = useState<any>(null);

    // State for income analysis
    const [revenu, setRevenu] = useState<AnalyseRevenu>(new AnalyseRevenuClass());
    const [revenus, setRevenus] = useState<AnalyseRevenu[]>([]);
    const [typesRevenus, setTypesRevenus] = useState<any[]>([]);

    // State for expense analysis
    const [depense, setDepense] = useState<AnalyseDepense>(new AnalyseDepenseClass());
    const [depenses, setDepenses] = useState<AnalyseDepense[]>([]);
    const [typesDepenses, setTypesDepenses] = useState<any[]>([]);

    // State for capacity analysis
    const [capacite, setCapacite] = useState<AnalyseCapacite>(new AnalyseCapaciteClass());

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        if (applicationId) {
            loadApplication();
            loadTypesRevenus();
            loadTypesDepenses();
            loadRevenus();
            loadDepenses();
            loadCapacite();
        }
    }, [applicationId]);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadApplication':
                    setApplication(data);
                    break;
                case 'loadTypesRevenus':
                    setTypesRevenus(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadTypesDepenses':
                    setTypesDepenses(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadRevenus':
                    setRevenus(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadDepenses':
                    setDepenses(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadCapacite':
                    if (data) setCapacite(data);
                    break;
                case 'createRevenu':
                case 'updateRevenu':
                    showToast('success', 'Succès', 'Revenu enregistré avec succès');
                    resetRevenuForm();
                    loadRevenus();
                    break;
                case 'deleteRevenu':
                    showToast('success', 'Succès', 'Revenu supprimé avec succès');
                    loadRevenus();
                    break;
                case 'createDepense':
                case 'updateDepense':
                    showToast('success', 'Succès', 'Dépense enregistrée avec succès');
                    resetDepenseForm();
                    loadDepenses();
                    break;
                case 'deleteDepense':
                    showToast('success', 'Succès', 'Dépense supprimée avec succès');
                    loadDepenses();
                    break;
                case 'calculateCapacity':
                    showToast('success', 'Succès', 'Capacité de remboursement calculée');
                    setCapacite(data);
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadApplication = () => fetchData(null, 'GET', `${APP_URL}/findbyid/${applicationId}`, 'loadApplication');
    const loadTypesRevenus = () => fetchData(null, 'GET', `${INCOME_TYPES_URL}/findall/active`, 'loadTypesRevenus');
    const loadTypesDepenses = () => fetchData(null, 'GET', `${EXPENSE_TYPES_URL}/findall/active`, 'loadTypesDepenses');
    const loadRevenus = () => fetchData(null, 'GET', `${INCOME_URL}/findbyapplication/${applicationId}`, 'loadRevenus');
    const loadDepenses = () => fetchData(null, 'GET', `${EXPENSE_URL}/findbyapplication/${applicationId}`, 'loadDepenses');
    const loadCapacite = () => fetchData(null, 'GET', `${CAPACITY_URL}/findbyapplication/${applicationId}`, 'loadCapacite');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetRevenuForm = () => setRevenu(new AnalyseRevenuClass({ applicationId }));
    const resetDepenseForm = () => setDepense(new AnalyseDepenseClass({ applicationId }));

    // Calculate totals
    const totalRevenus = revenus.reduce((sum, r) => sum + (r.declaredAmount || 0), 0);
    const totalRevenusVerifies = revenus.reduce((sum, r) => sum + (r.verifiedAmount || 0), 0);
    const totalDepenses = depenses.reduce((sum, d) => sum + (d.monthlyAmount || 0), 0);
    const revenuDisponible = totalRevenusVerifies - totalDepenses;
    const capaciteRemboursement = revenuDisponible * 0.7;

    // Revenue CRUD
    const handleSaveRevenu = () => {
        const revenuToSave = { ...revenu, applicationId };
        if (revenu.id) {
            fetchData(revenuToSave, 'PUT', `${INCOME_URL}/update/${revenu.id}`, 'updateRevenu');
        } else {
            fetchData(revenuToSave, 'POST', `${INCOME_URL}/new`, 'createRevenu');
        }
    };

    const handleEditRevenu = (row: AnalyseRevenu) => setRevenu({ ...row });
    const handleDeleteRevenu = (row: AnalyseRevenu) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer ce revenu ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => fetchData(null, 'DELETE', `${INCOME_URL}/delete/${row.id}`, 'deleteRevenu')
        });
    };

    // Expense CRUD
    const handleSaveDepense = () => {
        const depenseToSave = { ...depense, applicationId };
        if (depense.id) {
            fetchData(depenseToSave, 'PUT', `${EXPENSE_URL}/update/${depense.id}`, 'updateDepense');
        } else {
            fetchData(depenseToSave, 'POST', `${EXPENSE_URL}/new`, 'createDepense');
        }
    };

    const handleEditDepense = (row: AnalyseDepense) => setDepense({ ...row });
    const handleDeleteDepense = (row: AnalyseDepense) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer cette dépense ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => fetchData(null, 'DELETE', `${EXPENSE_URL}/delete/${row.id}`, 'deleteDepense')
        });
    };

    // Calculate capacity
    const handleCalculateCapacity = () => {
        fetchData(null, 'POST', `${CAPACITY_URL}/calculate/${applicationId}`, 'calculateCapacity');
    };

    const formatCurrency = (value: number | undefined) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', maximumFractionDigits: 0 }).format(value || 0);
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex justify-content-between align-items-center mb-4">
                <h4 className="m-0">
                    <i className="pi pi-chart-line mr-2"></i>
                    Analyse Financière - Dossier {application?.applicationNumber}
                </h4>
                <Button
                    label="Retour aux demandes"
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    onClick={() => window.location.href = '/credit/demandes'}
                />
            </div>

            {/* Summary Cards */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-blue-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalRevenus)}</div>
                            <div className="text-500">Total Revenus Déclarés</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-green-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">{formatCurrency(totalRevenusVerifies)}</div>
                            <div className="text-500">Total Revenus Vérifiés</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-orange-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-700">{formatCurrency(totalDepenses)}</div>
                            <div className="text-500">Total Charges Mensuelles</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className={revenuDisponible >= 0 ? 'bg-teal-100' : 'bg-red-100'}>
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${revenuDisponible >= 0 ? 'text-teal-700' : 'text-red-700'}`}>
                                {formatCurrency(revenuDisponible)}
                            </div>
                            <div className="text-500">Revenu Disponible</div>
                        </div>
                    </Card>
                </div>
            </div>

            <TabView>
                {/* Tab: Revenus */}
                <TabPanel header="Évaluation des Revenus" leftIcon="pi pi-dollar mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5><i className="pi pi-plus mr-2"></i>Ajouter/Modifier un Revenu</h5>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Type de Revenu *</label>
                                <Dropdown
                                    value={revenu.incomeTypeId}
                                    options={typesRevenus}
                                    onChange={(e) => setRevenu(prev => ({ ...prev, incomeTypeId: e.value }))}
                                    optionLabel="nameFr"
                                    optionValue="id"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                    filter
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Montant Déclaré (BIF) *</label>
                                <InputNumber
                                    value={revenu.declaredAmount || 0}
                                    onValueChange={(e) => setRevenu(prev => ({ ...prev, declaredAmount: e.value ?? 0 }))}
                                    className="w-full"
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Montant Vérifié (BIF)</label>
                                <InputNumber
                                    value={revenu.verifiedAmount || 0}
                                    onValueChange={(e) => setRevenu(prev => ({ ...prev, verifiedAmount: e.value ?? 0 }))}
                                    className="w-full"
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label className="font-semibold">Vérifié</label>
                                <div className="flex align-items-center gap-2 mt-2">
                                    <Checkbox
                                        checked={revenu.isVerified || false}
                                        onChange={(e) => setRevenu(prev => ({ ...prev, isVerified: e.checked ?? false }))}
                                    />
                                    <span>{revenu.isVerified ? 'Oui' : 'Non'}</span>
                                </div>
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Employeur / Entreprise</label>
                                <input
                                    type="text"
                                    value={revenu.employerName || ''}
                                    onChange={(e) => setRevenu(prev => ({ ...prev, employerName: e.target.value }))}
                                    className="p-inputtext w-full"
                                    placeholder="Nom de l'employeur ou entreprise"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Type de Contrat</label>
                                <Dropdown
                                    value={revenu.contractType}
                                    options={TypesContrat}
                                    onChange={(e) => setRevenu(prev => ({ ...prev, contractType: e.value }))}
                                    optionLabel="label"
                                    optionValue="code"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Ancienneté (mois)</label>
                                <InputNumber
                                    value={revenu.employmentDuration || 0}
                                    onValueChange={(e) => setRevenu(prev => ({ ...prev, employmentDuration: e.value ?? 0 }))}
                                    className="w-full"
                                    suffix=" mois"
                                />
                            </div>
                        </div>
                        <div className="flex justify-content-end gap-2">
                            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetRevenuForm} />
                            <Button label={revenu.id ? 'Modifier' : 'Ajouter'} icon="pi pi-save" onClick={handleSaveRevenu} loading={loading} />
                        </div>
                    </div>

                    <DataTable value={revenus} emptyMessage="Aucun revenu enregistré" className="p-datatable-sm">
                        <Column field="incomeType.nameFr" header="Type" />
                        <Column field="declaredAmount" header="Déclaré" body={(row) => formatCurrency(row.declaredAmount)} />
                        <Column field="verifiedAmount" header="Vérifié" body={(row) => formatCurrency(row.verifiedAmount)} />
                        <Column field="isVerified" header="Statut" body={(row) => <Tag value={row.isVerified ? 'Vérifié' : 'Non vérifié'} severity={row.isVerified ? 'success' : 'warning'} />} />
                        <Column field="employerName" header="Source" />
                        <Column header="Actions" body={(row) => (
                            <div className="flex gap-2">
                                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEditRevenu(row)} />
                                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDeleteRevenu(row)} />
                            </div>
                        )} />
                    </DataTable>
                </TabPanel>

                {/* Tab: Dépenses */}
                <TabPanel header="Évaluation des Charges" leftIcon="pi pi-credit-card mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5><i className="pi pi-plus mr-2"></i>Ajouter/Modifier une Charge</h5>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Type de Charge *</label>
                                <Dropdown
                                    value={depense.expenseTypeId}
                                    options={typesDepenses}
                                    onChange={(e) => setDepense(prev => ({ ...prev, expenseTypeId: e.value }))}
                                    optionLabel="nameFr"
                                    optionValue="id"
                                    placeholder="Sélectionner"
                                    className="w-full"
                                    filter
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Montant Mensuel (BIF) *</label>
                                <InputNumber
                                    value={depense.monthlyAmount || 0}
                                    onValueChange={(e) => setDepense(prev => ({ ...prev, monthlyAmount: e.value ?? 0 }))}
                                    className="w-full"
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label className="font-semibold">Charge Essentielle</label>
                                <div className="flex align-items-center gap-2 mt-2">
                                    <Checkbox
                                        checked={depense.isEssential || false}
                                        onChange={(e) => setDepense(prev => ({ ...prev, isEssential: e.checked ?? false }))}
                                    />
                                    <span>{depense.isEssential ? 'Oui' : 'Non'}</span>
                                </div>
                            </div>
                            <div className="field col-12">
                                <label className="font-semibold">Description</label>
                                <InputTextarea
                                    value={depense.description || ''}
                                    onChange={(e) => setDepense(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full"
                                    rows={2}
                                    placeholder="Détails sur cette charge..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-content-end gap-2">
                            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetDepenseForm} />
                            <Button label={depense.id ? 'Modifier' : 'Ajouter'} icon="pi pi-save" onClick={handleSaveDepense} loading={loading} />
                        </div>
                    </div>

                    <DataTable value={depenses} emptyMessage="Aucune charge enregistrée" className="p-datatable-sm">
                        <Column field="expenseType.nameFr" header="Type" />
                        <Column field="monthlyAmount" header="Montant Mensuel" body={(row) => formatCurrency(row.monthlyAmount)} />
                        <Column field="isEssential" header="Essentielle" body={(row) => <i className={`pi ${row.isEssential ? 'pi-check text-green-500' : 'pi-times text-red-500'}`} />} />
                        <Column field="description" header="Description" />
                        <Column header="Actions" body={(row) => (
                            <div className="flex gap-2">
                                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEditDepense(row)} />
                                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDeleteDepense(row)} />
                            </div>
                        )} />
                    </DataTable>
                </TabPanel>

                {/* Tab: Capacité de Remboursement */}
                <TabPanel header="Capacité de Remboursement" leftIcon="pi pi-calculator mr-2">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <Card title="Calcul de la Capacité">
                                <div className="flex flex-column gap-3">
                                    <div className="flex justify-content-between">
                                        <span>Revenu mensuel vérifié:</span>
                                        <strong>{formatCurrency(totalRevenusVerifies)}</strong>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span>Charges mensuelles:</span>
                                        <strong className="text-orange-500">- {formatCurrency(totalDepenses)}</strong>
                                    </div>
                                    <hr />
                                    <div className="flex justify-content-between">
                                        <span>Revenu disponible:</span>
                                        <strong className={revenuDisponible >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {formatCurrency(revenuDisponible)}
                                        </strong>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span>Capacité de remboursement (70%):</span>
                                        <strong className="text-primary">{formatCurrency(capaciteRemboursement)}</strong>
                                    </div>
                                    <hr />
                                    <div className="flex justify-content-between">
                                        <span>Montant demandé:</span>
                                        <strong>{formatCurrency(application?.amountRequested)}</strong>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span>Ratio d'endettement:</span>
                                        <strong className={((application?.amountRequested / (application?.durationMonths || 1)) / totalRevenusVerifies * 100) < 40 ? 'text-green-500' : 'text-red-500'}>
                                            {totalRevenusVerifies > 0 ? ((application?.amountRequested / (application?.durationMonths || 1)) / totalRevenusVerifies * 100).toFixed(1) : 0}%
                                        </strong>
                                    </div>
                                </div>

                                <Button
                                    label="Recalculer la capacité"
                                    icon="pi pi-calculator"
                                    className="w-full mt-4"
                                    onClick={handleCalculateCapacity}
                                    loading={loading}
                                />
                            </Card>
                        </div>

                        <div className="col-12 md:col-6">
                            <Card title="Résumé et Recommandation">
                                {capacite.id ? (
                                    <div className="flex flex-column gap-3">
                                        <div>
                                            <label className="font-semibold">Score de capacité:</label>
                                            <ProgressBar value={capacite.capacityScore || 0} className="mt-2" />
                                        </div>
                                        <div>
                                            <label className="font-semibold">Évaluation du risque:</label>
                                            <div className="mt-2">
                                                <Tag
                                                    value={EvaluationsRisque.find(e => e.code === capacite.riskAssessment)?.label || capacite.riskAssessment}
                                                    severity={EvaluationsRisque.find(e => e.code === capacite.riskAssessment)?.color as any || 'info'}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-semibold">Montant recommandé:</label>
                                            <div className="text-xl font-bold text-primary mt-1">
                                                {formatCurrency(capacite.recommendedAmount)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-semibold">Durée recommandée:</label>
                                            <div className="text-lg mt-1">{capacite.recommendedDuration} mois</div>
                                        </div>
                                        <div>
                                            <label className="font-semibold">Notes d'analyse:</label>
                                            <p className="mt-1">{capacite.analysisNotes || 'Aucune note'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-500 text-center">
                                        Cliquez sur "Recalculer la capacité" pour générer l'analyse
                                    </p>
                                )}
                            </Card>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </div>
    );
}
