'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { TermDuration, TermDurationClass } from './TermDuration';

const BASE_URL = `${API_BASE_URL}/api/epargne/term-durations`;

function TermDurationPage() {
    const [termDuration, setTermDuration] = useState<TermDuration>(new TermDurationClass());
    const [termDurations, setTermDurations] = useState<TermDuration[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const { data, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadData':
                    setTermDurations(Array.isArray(data) ? data : []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Durée créée avec succès');
                    resetForm();
                    loadData();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Durée mise à jour avec succès');
                    resetForm();
                    loadData();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Durée supprimée avec succès');
                    loadData();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadData = () => {
        setLoading(true);
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadData');
        setLoading(false);
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTermDuration(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setTermDuration(prev => ({ ...prev, [name]: value || 0 }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setTermDuration(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!termDuration.code?.trim()) {
            showToast('warn', 'Attention', 'Le code est obligatoire');
            return false;
        }
        if (!termDuration.name?.trim()) {
            showToast('warn', 'Attention', 'Le nom (anglais) est obligatoire');
            return false;
        }
        if (!termDuration.nameFr?.trim()) {
            showToast('warn', 'Attention', 'Le nom (français) est obligatoire');
            return false;
        }
        if (termDuration.months <= 0) {
            showToast('warn', 'Attention', 'La durée doit être supérieure à 0');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (termDuration.id) {
            fetchData(termDuration, 'PUT', `${BASE_URL}/update/${termDuration.id}`, 'update');
        } else {
            fetchData(termDuration, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const resetForm = () => {
        setTermDuration(new TermDurationClass());
    };

    const editItem = (rowData: TermDuration) => {
        setTermDuration({ ...rowData });
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: TermDuration) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la durée "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const formatPercent = (value: number) => {
        return value?.toFixed(2) + ' %';
    };

    const statusBodyTemplate = (rowData: TermDuration) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const actionsBodyTemplate = (rowData: TermDuration) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-warning p-button-sm"
                    onClick={() => editItem(rowData)}
                    tooltip="Modifier"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-sm"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Supprimer"
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Grille des Taux DAT</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="text-primary mb-4">
                <i className="pi pi-clock mr-2"></i>
                Gestion des Durées de Dépôt à Terme
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Durée" leftIcon="pi pi-plus mr-2">
                    <div className="card p-fluid">
                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">Informations Générales</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="code" className="font-medium">Code *</label>
                                    <InputText
                                        id="code"
                                        name="code"
                                        value={termDuration.code}
                                        onChange={handleChange}
                                        placeholder="Ex: DAT3M, DAT6M"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name" className="font-medium">Nom (Anglais) *</label>
                                    <InputText
                                        id="name"
                                        name="name"
                                        value={termDuration.name}
                                        onChange={handleChange}
                                        placeholder="Ex: 3 months, 6 months"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="nameFr" className="font-medium">Nom (Français) *</label>
                                    <InputText
                                        id="nameFr"
                                        name="nameFr"
                                        value={termDuration.nameFr}
                                        onChange={handleChange}
                                        placeholder="Ex: 3 mois, 6 mois"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">Durée et Taux</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="months" className="font-medium">Durée (mois) *</label>
                                    <InputNumber
                                        id="months"
                                        value={termDuration.months}
                                        onValueChange={(e) => handleNumberChange('months', e.value)}
                                        min={1}
                                        max={120}
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="interestRate" className="font-medium">Taux d'intérêt annuel (%)</label>
                                    <InputNumber
                                        id="interestRate"
                                        value={termDuration.interestRate}
                                        onValueChange={(e) => handleNumberChange('interestRate', e.value)}
                                        mode="decimal"
                                        minFractionDigits={2}
                                        maxFractionDigits={2}
                                        suffix=" %"
                                        min={0}
                                        max={100}
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="sortOrder" className="font-medium">Ordre d'affichage</label>
                                    <InputNumber
                                        id="sortOrder"
                                        value={termDuration.sortOrder}
                                        onValueChange={(e) => handleNumberChange('sortOrder', e.value)}
                                        min={0}
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <div className="flex align-items-center mt-4">
                                        <Checkbox
                                            inputId="isActive"
                                            checked={termDuration.isActive}
                                            onChange={(e) => handleCheckboxChange('isActive', e.checked || false)}
                                        />
                                        <label htmlFor="isActive" className="ml-2">Actif</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            label={termDuration.id ? 'Mettre à jour' : 'Enregistrer'}
                            icon="pi pi-save"
                            onClick={handleSubmit}
                            className="p-button-success"
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={resetForm}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Grille des Taux" leftIcon="pi pi-table mr-2">
                    <DataTable
                        value={termDurations}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucune durée trouvée"
                        stripedRows
                        showGridlines
                        size="small"
                    >
                        <Column field="code" header="Code" sortable />
                        <Column field="nameFr" header="Nom (FR)" sortable />
                        <Column field="name" header="Nom (EN)" sortable />
                        <Column field="months" header="Durée (mois)" sortable body={(row) => row.months + ' mois'} />
                        <Column field="interestRate" header="Taux annuel" sortable body={(row) => formatPercent(row.interestRate)} />
                        <Column field="sortOrder" header="Ordre" sortable />
                        <Column field="isActive" header="Statut" body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '120px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}

export default TermDurationPage;
