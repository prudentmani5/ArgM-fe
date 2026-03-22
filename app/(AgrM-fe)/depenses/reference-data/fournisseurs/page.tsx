'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import useConsumApi, { getUserAction } from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { Fournisseur, FournisseurClass } from '../../types/DepenseTypes';

const FournisseursPage = () => {
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const [fournisseur, setFournisseur] = useState<Fournisseur>(new FournisseurClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/depenses/fournisseurs');

    useEffect(() => {
        loadFournisseurs();
    }, []);

    useEffect(() => {
        if (listData) {
            setFournisseurs(Array.isArray(listData) ? listData : listData.content || []);
        }
        if (listError) {
            showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
        }
    }, [listData, listError]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'create':
                case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm();
                    loadFournisseurs();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Fournisseur supprimé');
                    loadFournisseurs();
                    break;
            }
        }
        if (actionError) {
            showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
        }
    }, [actionData, actionError, callType]);

    const loadFournisseurs = () => {
        fetchList(null, 'GET', `${BASE_URL}/findall`, 'loadFournisseurs');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setFournisseur(new FournisseurClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFournisseur(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setFournisseur(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name: string, value: boolean) => {
        setFournisseur(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!fournisseur.code || !fournisseur.nameFr) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires (Code, Nom)');
            return;
        }

        const dataToSend = { ...fournisseur, name: fournisseur.nameFr, userAction: getUserAction() };
        if (fournisseur.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${fournisseur.id}`, 'update');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: Fournisseur) => {
        setFournisseur({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleEdit = (rowData: Fournisseur) => {
        setFournisseur({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: Fournisseur) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le fournisseur "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Non, annuler',
            accept: () => {
                fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: Fournisseur) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: Fournisseur) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" tooltipOptions={{ position: 'top' }} onClick={() => handleView(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(rowData)} />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-users mr-2"></i>Fournisseurs</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header={fournisseur.id ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'} leftIcon="pi pi-plus mr-2">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="code">Code *</label>
                            <InputText id="code" name="code" value={fournisseur.code} onChange={handleChange} disabled={isViewMode} placeholder="Ex: FRN-001" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="nameFr">Nom *</label>
                            <InputText id="nameFr" name="nameFr" value={fournisseur.nameFr} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="contact">Personne de Contact</label>
                            <InputText id="contact" name="contact" value={fournisseur.contact} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="telephone">Téléphone</label>
                            <InputText id="telephone" name="telephone" value={fournisseur.telephone} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="email">Email</label>
                            <InputText id="email" name="email" value={fournisseur.email} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="nif">NIF</label>
                            <InputText id="nif" name="nif" value={fournisseur.nif} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="adresse">Adresse</label>
                            <InputText id="adresse" name="adresse" value={fournisseur.adresse} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-1">
                            <label htmlFor="sortOrder">Ordre</label>
                            <InputNumber id="sortOrder" value={fournisseur.sortOrder} onValueChange={(e) => handleNumberChange('sortOrder', e.value ?? null)} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-1">
                            <label htmlFor="isActive">Actif</label>
                            <div><InputSwitch checked={fournisseur.isActive ?? true} onChange={(e) => handleSwitchChange('isActive', e.value)} disabled={isViewMode} /></div>
                        </div>
                        <div className="field col-12">
                            <label htmlFor="description">Description</label>
                            <InputTextarea id="description" name="description" value={fournisseur.description} onChange={handleChange} disabled={isViewMode} rows={3} />
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={fournisseur.id ? 'Modifier' : 'Créer'} icon="pi pi-check" onClick={handleSubmit} loading={loadingAction} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Fournisseurs" leftIcon="pi pi-list mr-2">
                    <DataTable value={fournisseurs} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} loading={loadingList} globalFilter={globalFilter} header={header} emptyMessage="Aucun fournisseur trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter style={{ width: '10%' }} />
                        <Column field="nameFr" header="Nom" sortable filter style={{ width: '18%' }} />
                        <Column field="contact" header="Contact" sortable style={{ width: '12%' }} />
                        <Column field="telephone" header="Téléphone" sortable style={{ width: '10%' }} />
                        <Column field="email" header="Email" sortable style={{ width: '15%' }} />
                        <Column field="nif" header="NIF" sortable style={{ width: '10%' }} />
                        <Column header="Statut" body={statusBodyTemplate} style={{ width: '8%' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '12%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default FournisseursPage;
