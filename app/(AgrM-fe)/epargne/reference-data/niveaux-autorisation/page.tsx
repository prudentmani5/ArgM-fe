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
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { WithdrawalAuthorizationLevel, WithdrawalAuthorizationLevelClass } from './WithdrawalAuthorizationLevel';

const BASE_URL = `${API_BASE_URL}/api/epargne/withdrawal-authorization-levels`;

function WithdrawalAuthorizationLevelPage() {
    const [authLevel, setAuthLevel] = useState<WithdrawalAuthorizationLevel>(new WithdrawalAuthorizationLevelClass());
    const [authLevels, setAuthLevels] = useState<WithdrawalAuthorizationLevel[]>([]);
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
                    setAuthLevels(Array.isArray(data) ? data : []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Niveau créé avec succès');
                    resetForm();
                    loadData();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Niveau mis à jour avec succès');
                    resetForm();
                    loadData();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Niveau supprimé avec succès');
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
        setAuthLevel(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setAuthLevel(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setAuthLevel(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!authLevel.code?.trim()) {
            showToast('warn', 'Attention', 'Le code est obligatoire');
            return false;
        }
        if (!authLevel.name?.trim()) {
            showToast('warn', 'Attention', 'Le nom (anglais) est obligatoire');
            return false;
        }
        if (!authLevel.nameFr?.trim()) {
            showToast('warn', 'Attention', 'Le nom (français) est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (authLevel.id) {
            fetchData(authLevel, 'PUT', `${BASE_URL}/update/${authLevel.id}`, 'update');
        } else {
            fetchData(authLevel, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const resetForm = () => {
        setAuthLevel(new WithdrawalAuthorizationLevelClass());
    };

    const editItem = (rowData: WithdrawalAuthorizationLevel) => {
        setAuthLevel({ ...rowData });
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: WithdrawalAuthorizationLevel) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le niveau "${rowData.nameFr}" ?`,
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const statusBodyTemplate = (rowData: WithdrawalAuthorizationLevel) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const booleanBodyTemplate = (value: boolean) => {
        return value ? <i className="pi pi-check text-green-500"></i> : <i className="pi pi-times text-red-500"></i>;
    };

    const actionsBodyTemplate = (rowData: WithdrawalAuthorizationLevel) => {
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
            <h5 className="m-0">Niveaux d'Autorisation de Retrait</h5>
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
                <i className="pi pi-shield mr-2"></i>
                Niveaux d'Autorisation de Retrait
            </h4>

            <div className="surface-100 p-3 border-round mb-4">
                <h6 className="m-0 mb-2">
                    <i className="pi pi-info-circle mr-2 text-blue-500"></i>
                    Contrôles de Sécurité pour les Retraits
                </h6>
                <ul className="m-0 pl-4">
                    <li>Vérification d'identité obligatoire selon le niveau</li>
                    <li>Double vérification pour montants importants</li>
                    <li>Autorisation du manager selon les seuils définis</li>
                    <li>Délai de préavis configurable</li>
                </ul>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Niveau" leftIcon="pi pi-plus mr-2">
                    <div className="card p-fluid">
                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">Informations Générales</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="code" className="font-medium">Code *</label>
                                    <InputText
                                        id="code"
                                        name="code"
                                        value={authLevel.code}
                                        onChange={handleChange}
                                        placeholder="Ex: NIV1, NIV2, NIV3"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name" className="font-medium">Nom (Anglais) *</label>
                                    <InputText
                                        id="name"
                                        name="name"
                                        value={authLevel.name}
                                        onChange={handleChange}
                                        placeholder="Ex: Standard, Supervisor, Manager"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="nameFr" className="font-medium">Nom (Français) *</label>
                                    <InputText
                                        id="nameFr"
                                        name="nameFr"
                                        value={authLevel.nameFr}
                                        onChange={handleChange}
                                        placeholder="Ex: Standard, Superviseur, Manager"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12">
                                    <label htmlFor="description" className="font-medium">Description</label>
                                    <InputTextarea
                                        id="description"
                                        name="description"
                                        value={authLevel.description || ''}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">Plafonds de Montant</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="minAmount" className="font-medium">Montant minimum (FBU)</label>
                                    <InputNumber
                                        id="minAmount"
                                        value={authLevel.minAmount}
                                        onValueChange={(e) => handleNumberChange('minAmount', e.value)}
                                        mode="decimal"
                                        suffix=" FBU"
                                        min={0}
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="maxAmount" className="font-medium">Montant maximum (FBU)</label>
                                    <InputNumber
                                        id="maxAmount"
                                        value={authLevel.maxAmount || null}
                                        onValueChange={(e) => handleNumberChange('maxAmount', e.value)}
                                        mode="decimal"
                                        suffix=" FBU"
                                        min={0}
                                        className="w-full"
                                        placeholder="Illimité si vide"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="requiresNoticeHours" className="font-medium">Délai de préavis (heures)</label>
                                    <InputNumber
                                        id="requiresNoticeHours"
                                        value={authLevel.requiresNoticeHours}
                                        onValueChange={(e) => handleNumberChange('requiresNoticeHours', e.value)}
                                        min={0}
                                        suffix=" h"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="sortOrder" className="font-medium">Ordre d'affichage</label>
                                    <InputNumber
                                        id="sortOrder"
                                        value={authLevel.sortOrder}
                                        onValueChange={(e) => handleNumberChange('sortOrder', e.value)}
                                        min={0}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">Exigences d'Autorisation</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="requiresIdVerification"
                                            checked={authLevel.requiresIdVerification}
                                            onChange={(e) => handleCheckboxChange('requiresIdVerification', e.checked || false)}
                                        />
                                        <label htmlFor="requiresIdVerification" className="ml-2">Vérification d'identité</label>
                                    </div>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="requiresDualVerification"
                                            checked={authLevel.requiresDualVerification}
                                            onChange={(e) => handleCheckboxChange('requiresDualVerification', e.checked || false)}
                                        />
                                        <label htmlFor="requiresDualVerification" className="ml-2">Double vérification</label>
                                    </div>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="requiresManagerApproval"
                                            checked={authLevel.requiresManagerApproval}
                                            onChange={(e) => handleCheckboxChange('requiresManagerApproval', e.checked || false)}
                                        />
                                        <label htmlFor="requiresManagerApproval" className="ml-2">Approbation manager</label>
                                    </div>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="requiresJustification"
                                            checked={authLevel.requiresJustification}
                                            onChange={(e) => handleCheckboxChange('requiresJustification', e.checked || false)}
                                        />
                                        <label htmlFor="requiresJustification" className="ml-2">Justification requise</label>
                                    </div>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="isActive"
                                            checked={authLevel.isActive}
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
                            label={authLevel.id ? 'Mettre à jour' : 'Enregistrer'}
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

                <TabPanel header="Liste des Niveaux" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={authLevels}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun niveau trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                    >
                        <Column field="code" header="Code" sortable />
                        <Column field="nameFr" header="Nom (FR)" sortable />
                        <Column field="minAmount" header="Montant min." sortable body={(row) => formatCurrency(row.minAmount)} />
                        <Column field="maxAmount" header="Montant max." sortable body={(row) => row.maxAmount ? formatCurrency(row.maxAmount) : 'Illimité'} />
                        <Column field="requiresIdVerification" header="ID" body={(row) => booleanBodyTemplate(row.requiresIdVerification)} />
                        <Column field="requiresDualVerification" header="Double" body={(row) => booleanBodyTemplate(row.requiresDualVerification)} />
                        <Column field="requiresManagerApproval" header="Manager" body={(row) => booleanBodyTemplate(row.requiresManagerApproval)} />
                        <Column field="requiresNoticeHours" header="Préavis" body={(row) => row.requiresNoticeHours > 0 ? row.requiresNoticeHours + 'h' : '-'} />
                        <Column field="isActive" header="Statut" body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '120px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}

export default WithdrawalAuthorizationLevelPage;
