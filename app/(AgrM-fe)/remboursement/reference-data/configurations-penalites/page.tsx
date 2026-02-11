'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

interface ConfigurationPenalite {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    dailyRate?: number;
    maxCapPercentage?: number;
    calculationBase?: string;
    appliesToPrincipal?: boolean;
    appliesToInterest?: boolean;
    description?: string;
    isActive?: boolean;
}

class ConfigurationPenaliteClass implements ConfigurationPenalite {
    id?: number;
    code?: string = '';
    name?: string = '';
    nameFr?: string = '';
    dailyRate?: number = 0.5;
    maxCapPercentage?: number = 10;
    calculationBase?: string = 'OVERDUE_AMOUNT';
    appliesToPrincipal?: boolean = true;
    appliesToInterest?: boolean = true;
    description?: string = '';
    isActive?: boolean = true;
}

const BASES_CALCUL = [
    { label: 'Montant en Retard', value: 'OVERDUE_AMOUNT' },
    { label: 'Capital Restant Dû', value: 'OUTSTANDING_PRINCIPAL' },
    { label: 'Échéance Totale', value: 'TOTAL_INSTALLMENT' }
];

export default function ConfigurationsPenalitesPage() {
    const [configurations, setConfigurations] = useState<ConfigurationPenalite[]>([]);
    const [configuration, setConfiguration] = useState<ConfigurationPenalite>(new ConfigurationPenaliteClass());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/penalty-configurations');

    useEffect(() => {
        loadConfigurations();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setConfigurations(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: isEdit ? 'Configuration modifiée' : 'Configuration créée', life: 3000 });
                    loadConfigurations();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Configuration supprimée', life: 3000 });
                    loadConfigurations();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const loadConfigurations = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setConfiguration(new ConfigurationPenaliteClass());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: ConfigurationPenalite) => {
        setConfiguration({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!configuration.code || !configuration.name || !configuration.nameFr || configuration.dailyRate === undefined) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir les champs obligatoires', life: 3000 });
            return;
        }

        if (isEdit && configuration.id) {
            fetchData(configuration, 'PUT', `${BASE_URL}/update/${configuration.id}`, 'update');
        } else {
            fetchData(configuration, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const confirmDelete = (rowData: ConfigurationPenalite) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la configuration "${rowData.nameFr || rowData.name}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setConfiguration(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setConfiguration(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setConfiguration(prev => ({ ...prev, [name]: value }));
    };

    const leftToolbarTemplate = () => {
        return (
            <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} />
        );
    };

    const actionBodyTemplate = (rowData: ConfigurationPenalite) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const activeBodyTemplate = (rowData: ConfigurationPenalite) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const rateBodyTemplate = (rowData: ConfigurationPenalite) => {
        return `${rowData.dailyRate}%`;
    };

    const maxCapBodyTemplate = (rowData: ConfigurationPenalite) => {
        return rowData.maxCapPercentage ? `${rowData.maxCapPercentage}%` : '-';
    };

    const baseCalculBodyTemplate = (rowData: ConfigurationPenalite) => {
        const base = BASES_CALCUL.find(b => b.value === rowData.calculationBase);
        return base ? base.label : rowData.calculationBase;
    };

    const appliesBodyTemplate = (rowData: ConfigurationPenalite) => {
        const applies = [];
        if (rowData.appliesToPrincipal) applies.push('Principal');
        if (rowData.appliesToInterest) applies.push('Intérêt');
        return applies.length > 0 ? applies.join(', ') : '-';
    };

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setDialogVisible(false)} />
            <Button label="Enregistrer" icon="pi pi-check" onClick={handleSave} loading={loading && (callType === 'create' || callType === 'update')} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="mb-4">
                <i className="pi pi-percentage mr-2"></i>
                Configurations des Pénalités
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <p className="m-0">
                    <i className="pi pi-info-circle mr-2"></i>
                    <strong>Formule de calcul:</strong> Pénalité = (Montant en retard × Taux journalier × Nombre de jours de retard)
                    <br />
                    <span className="text-500 ml-4">Plafond maximum: 10% du capital restant dû (configurable)</span>
                </p>
            </div>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={configurations}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                emptyMessage="Aucune configuration trouvée"
                stripedRows
            >
                <Column field="code" header="Code" sortable />
                <Column field="nameFr" header="Nom (FR)" sortable />
                <Column field="name" header="Nom (EN)" sortable />
                <Column field="dailyRate" header="Taux Journalier" body={rateBodyTemplate} sortable />
                <Column field="maxCapPercentage" header="Plafond Max" body={maxCapBodyTemplate} sortable />
                <Column field="calculationBase" header="Base de Calcul" body={baseCalculBodyTemplate} />
                <Column header="S'applique à" body={appliesBodyTemplate} />
                <Column field="isActive" header="Statut" body={activeBodyTemplate} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '10rem' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier la Configuration' : 'Nouvelle Configuration de Pénalité'}
                style={{ width: '60vw' }}
                footer={dialogFooter}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="code" className="font-semibold">Code *</label>
                            <InputText
                                id="code"
                                name="code"
                                value={configuration.code || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: PENALITE_STANDARD"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="name" className="font-semibold">Nom (EN) *</label>
                            <InputText
                                id="name"
                                name="name"
                                value={configuration.name || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Standard Penalty"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="nameFr" className="font-semibold">Nom (FR) *</label>
                            <InputText
                                id="nameFr"
                                name="nameFr"
                                value={configuration.nameFr || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Pénalité Standard"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="dailyRate" className="font-semibold">Taux Journalier (%) *</label>
                            <InputNumber
                                id="dailyRate"
                                value={configuration.dailyRate || null}
                                onValueChange={(e) => handleNumberChange('dailyRate', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                minFractionDigits={2}
                                maxFractionDigits={5}
                                suffix="%"
                            />
                            <small className="text-500">Typiquement entre 0.5% et 2%</small>
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="maxCapPercentage" className="font-semibold">Plafond Maximum (%)</label>
                            <InputNumber
                                id="maxCapPercentage"
                                value={configuration.maxCapPercentage || null}
                                onValueChange={(e) => handleNumberChange('maxCapPercentage', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                suffix="%"
                            />
                            <small className="text-500">Maximum recommandé: 10%</small>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="calculationBase" className="font-semibold">Base de Calcul</label>
                            <Dropdown
                                id="calculationBase"
                                value={configuration.calculationBase}
                                options={BASES_CALCUL}
                                onChange={(e) => handleDropdownChange('calculationBase', e.value)}
                                className="w-full"
                                placeholder="Sélectionner..."
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="description" className="font-semibold">Description</label>
                            <InputTextarea
                                id="description"
                                name="description"
                                value={configuration.description || ''}
                                onChange={handleChange}
                                className="w-full"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="appliesToPrincipal" className="font-semibold block mb-2">S'applique au Principal</label>
                            <InputSwitch
                                id="appliesToPrincipal"
                                checked={configuration.appliesToPrincipal ?? true}
                                onChange={(e) => setConfiguration(prev => ({ ...prev, appliesToPrincipal: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="appliesToInterest" className="font-semibold block mb-2">S'applique à l'Intérêt</label>
                            <InputSwitch
                                id="appliesToInterest"
                                checked={configuration.appliesToInterest ?? true}
                                onChange={(e) => setConfiguration(prev => ({ ...prev, appliesToInterest: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="isActive" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="isActive"
                                checked={configuration.isActive ?? true}
                                onChange={(e) => setConfiguration(prev => ({ ...prev, isActive: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
