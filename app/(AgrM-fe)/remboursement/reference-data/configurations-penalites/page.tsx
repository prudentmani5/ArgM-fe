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
    configName?: string;
    dailyRate?: number;
    maxPenaltyCap?: number;
    calculationBase?: string;
    gracePeriodDays?: number;
    description?: string;
    active?: boolean;
}

class ConfigurationPenaliteClass implements ConfigurationPenalite {
    id?: number;
    configName?: string = '';
    dailyRate?: number = 0.5;
    maxPenaltyCap?: number = 10;
    calculationBase?: string = 'OVERDUE_AMOUNT';
    gracePeriodDays?: number = 0;
    description?: string = '';
    active?: boolean = true;
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
        if (!configuration.configName || configuration.dailyRate === undefined) {
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
            message: `Êtes-vous sûr de vouloir supprimer la configuration "${rowData.configName}" ?`,
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
        return <Tag value={rowData.active ? 'Actif' : 'Inactif'} severity={rowData.active ? 'success' : 'danger'} />;
    };

    const rateBodyTemplate = (rowData: ConfigurationPenalite) => {
        return `${rowData.dailyRate}%`;
    };

    const maxCapBodyTemplate = (rowData: ConfigurationPenalite) => {
        return rowData.maxPenaltyCap ? `${rowData.maxPenaltyCap}%` : '-';
    };

    const baseCalculBodyTemplate = (rowData: ConfigurationPenalite) => {
        const base = BASES_CALCUL.find(b => b.value === rowData.calculationBase);
        return base ? base.label : rowData.calculationBase;
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
                <Column field="configName" header="Nom" sortable />
                <Column field="dailyRate" header="Taux Journalier" body={rateBodyTemplate} sortable />
                <Column field="maxPenaltyCap" header="Plafond Max" body={maxCapBodyTemplate} sortable />
                <Column field="calculationBase" header="Base de Calcul" body={baseCalculBodyTemplate} />
                <Column field="gracePeriodDays" header="Jours de Grâce" sortable />
                <Column field="active" header="Statut" body={activeBodyTemplate} />
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
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="configName" className="font-semibold">Nom de la Configuration *</label>
                            <InputText
                                id="configName"
                                name="configName"
                                value={configuration.configName || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Pénalité Standard"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
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

                    <div className="col-12 md:col-4">
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
                                maxFractionDigits={4}
                                suffix="%"
                            />
                            <small className="text-500">Typiquement entre 0.5% et 2%</small>
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="maxPenaltyCap" className="font-semibold">Plafond Maximum (%)</label>
                            <InputNumber
                                id="maxPenaltyCap"
                                value={configuration.maxPenaltyCap || null}
                                onValueChange={(e) => handleNumberChange('maxPenaltyCap', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                suffix="%"
                            />
                            <small className="text-500">Maximum recommandé: 10%</small>
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="gracePeriodDays" className="font-semibold">Période de Grâce (jours)</label>
                            <InputNumber
                                id="gracePeriodDays"
                                value={configuration.gracePeriodDays || null}
                                onValueChange={(e) => handleNumberChange('gracePeriodDays', e.value ?? null)}
                                className="w-full"
                                min={0}
                                suffix=" jours"
                            />
                            <small className="text-500">Jours sans pénalité après échéance</small>
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
                            <label htmlFor="active" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="active"
                                checked={configuration.active ?? true}
                                onChange={(e) => setConfiguration(prev => ({ ...prev, active: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
