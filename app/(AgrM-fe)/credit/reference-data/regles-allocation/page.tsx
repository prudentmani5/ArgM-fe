'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/allocation-rules');

interface RegleAllocation {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    minAmount?: number;
    maxAmount?: number;
    approvalLevel?: string;
    requiresCommittee?: boolean;
    isActive?: boolean;
}

const approvalLevels = [
    { label: 'Agent de Crédit', value: 'AGENT' },
    { label: 'Superviseur', value: 'SUPERVISOR' },
    { label: 'Directeur Agence', value: 'BRANCH_MANAGER' },
    { label: 'Directeur Crédit', value: 'CREDIT_DIRECTOR' },
    { label: 'Comité de Crédit', value: 'COMMITTEE' }
];

export default function ReglesAllocationPage() {
    const [regle, setRegle] = useState<RegleAllocation>({ isActive: true });
    const [regles, setRegles] = useState<RegleAllocation[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => { loadRegles(); }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadRegles':
                    setRegles(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Règle d\'allocation créée avec succès');
                    resetForm();
                    loadRegles();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Règle d\'allocation modifiée avec succès');
                    resetForm();
                    loadRegles();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Règle d\'allocation supprimée avec succès');
                    loadRegles();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadRegles = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadRegles');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setRegle({ isActive: true });
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRegle(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setRegle(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setRegle(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!regle.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!regle.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (regle.id) {
            fetchData(regle, 'PUT', `${BASE_URL}/update/${regle.id}`, 'update');
        } else {
            fetchData(regle, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: RegleAllocation) => {
        setRegle({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: RegleAllocation) => {
        setRegle({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: RegleAllocation) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la règle "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    const amountRangeTemplate = (rowData: RegleAllocation) => (
        <span>{formatCurrency(rowData.minAmount || 0)} - {formatCurrency(rowData.maxAmount || 0)}</span>
    );

    const levelTemplate = (rowData: RegleAllocation) => {
        const level = approvalLevels.find(l => l.value === rowData.approvalLevel);
        return <span>{level?.label || rowData.approvalLevel}</span>;
    };

    const committeeTemplate = (rowData: RegleAllocation) => (
        <i className={`pi ${rowData.requiresCommittee ? 'pi-check text-green-500' : 'pi-times text-red-500'}`} />
    );

    const statusBodyTemplate = (rowData: RegleAllocation) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: RegleAllocation) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleView(rowData)} tooltip="Voir" />
            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="mb-4">
                <i className="pi pi-sitemap mr-2"></i>
                Gestion des Règles d'Allocation
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Règle" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-sitemap mr-2"></i>Informations de la Règle d'Allocation</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={regle.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: RULE_001" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={regle.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Small Loans" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={regle.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Petits Crédits" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="minAmount" className="font-semibold">Montant Minimum</label>
                                <InputNumber id="minAmount" value={regle.minAmount} onValueChange={(e) => handleNumberChange('minAmount', e.value ?? 0)} className="w-full" disabled={isViewMode} mode="currency" currency="BIF" locale="fr-FR" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="maxAmount" className="font-semibold">Montant Maximum</label>
                                <InputNumber id="maxAmount" value={regle.maxAmount} onValueChange={(e) => handleNumberChange('maxAmount', e.value ?? 0)} className="w-full" disabled={isViewMode} mode="currency" currency="BIF" locale="fr-FR" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="approvalLevel" className="font-semibold">Niveau d'Approbation</label>
                                <Dropdown id="approvalLevel" value={regle.approvalLevel} options={approvalLevels} onChange={(e) => setRegle(prev => ({ ...prev, approvalLevel: e.value }))} className="w-full" disabled={isViewMode} placeholder="Sélectionner un niveau" />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={regle.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description de la règle..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="requiresCommittee" checked={regle.requiresCommittee || false} onChange={(e) => handleCheckboxChange('requiresCommittee', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="requiresCommittee" className="font-semibold">Requiert le Comité</label>
                                </div>
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={regle.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={regle.id ? 'Modifier' : 'Enregistrer'} icon={regle.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Règles" leftIcon="pi pi-list mr-2">
                    <DataTable value={regles} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadRegles'} emptyMessage="Aucune règle d'allocation trouvée" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column header="Plage de Montants" body={amountRangeTemplate} />
                        <Column header="Niveau d'Approbation" body={levelTemplate} />
                        <Column header="Comité Requis" body={committeeTemplate} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
