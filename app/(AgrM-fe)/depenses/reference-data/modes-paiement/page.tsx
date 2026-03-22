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
import { ModePaiementDepense, ModePaiementDepenseClass } from '../../types/DepenseTypes';

const ModesPaiementPage = () => {
    const [modes, setModes] = useState<ModePaiementDepense[]>([]);
    const [mode, setMode] = useState<ModePaiementDepense>(new ModePaiementDepenseClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/depenses/modes-paiement');

    useEffect(() => { loadModes(); }, []);

    useEffect(() => {
        if (listData) setModes(Array.isArray(listData) ? listData : listData.content || []);
        if (listError) showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
    }, [listData, listError]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'create': case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm(); loadModes(); setActiveIndex(1); break;
                case 'delete':
                    showToast('success', 'Succès', 'Mode de paiement supprimé');
                    loadModes(); break;
            }
        }
        if (actionError) showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
    }, [actionData, actionError, callType]);

    const loadModes = () => { fetchList(null, 'GET', `${BASE_URL}/findall`, 'loadModes'); };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => { setMode(new ModePaiementDepenseClass()); setIsViewMode(false); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMode(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!mode.code || !mode.name || !mode.nameFr) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires');
            return;
        }
        const dataToSend = { ...mode, userAction: getUserAction() };
        if (mode.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${mode.id}`, 'update');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: ModePaiementDepense) => { setMode({ ...rowData }); setIsViewMode(true); setActiveIndex(0); };
    const handleEdit = (rowData: ModePaiementDepense) => { setMode({ ...rowData }); setIsViewMode(false); setActiveIndex(0); };
    const handleDelete = (rowData: ModePaiementDepense) => {
        confirmDialog({
            message: `Supprimer le mode "${rowData.nameFr}" ?`,
            header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger', acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => { fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete'); }
        });
    };

    const boolBodyTemplate = (value: boolean | undefined) => (
        <Tag value={value ? 'Oui' : 'Non'} severity={value ? 'success' : 'secondary'} />
    );

    const actionsBodyTemplate = (rowData: ModePaiementDepense) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" tooltipOptions={{ position: 'top' }} onClick={() => handleView(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(rowData)} />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-credit-card mr-2"></i>Modes de Paiement</h4>
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
                <TabPanel header={mode.id ? 'Modifier' : 'Nouveau Mode'} leftIcon="pi pi-plus mr-2">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="code">Code *</label>
                            <InputText id="code" name="code" value={mode.code} onChange={handleChange} disabled={isViewMode} placeholder="Ex: ESPECES" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="name">Nom (EN) *</label>
                            <InputText id="name" name="name" value={mode.name} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="nameFr">Nom (FR) *</label>
                            <InputText id="nameFr" name="nameFr" value={mode.nameFr} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="sortOrder">Ordre</label>
                            <InputNumber id="sortOrder" value={mode.sortOrder} onValueChange={(e) => setMode(prev => ({ ...prev, sortOrder: e.value ?? 0 }))} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-2">
                            <label>Reçu obligatoire</label>
                            <div><InputSwitch checked={mode.requiresReceipt ?? true} onChange={(e) => setMode(prev => ({ ...prev, requiresReceipt: e.value }))} disabled={isViewMode} /></div>
                        </div>
                        <div className="field col-12 md:col-2">
                            <label>Référence obligatoire</label>
                            <div><InputSwitch checked={mode.requiresReference ?? false} onChange={(e) => setMode(prev => ({ ...prev, requiresReference: e.value }))} disabled={isViewMode} /></div>
                        </div>
                        <div className="field col-12 md:col-2">
                            <label>Double signature</label>
                            <div><InputSwitch checked={mode.requiresDoubleSignature ?? false} onChange={(e) => setMode(prev => ({ ...prev, requiresDoubleSignature: e.value }))} disabled={isViewMode} /></div>
                        </div>
                        <div className="field col-12 md:col-2">
                            <label>Actif</label>
                            <div><InputSwitch checked={mode.isActive ?? true} onChange={(e) => setMode(prev => ({ ...prev, isActive: e.value }))} disabled={isViewMode} /></div>
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="description">Description</label>
                            <InputTextarea id="description" name="description" value={mode.description} onChange={handleChange} disabled={isViewMode} rows={3} />
                        </div>
                    </div>
                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && <Button label={mode.id ? 'Modifier' : 'Créer'} icon="pi pi-check" onClick={handleSubmit} loading={loadingAction} />}
                    </div>
                </TabPanel>
                <TabPanel header="Liste" leftIcon="pi pi-list mr-2">
                    <DataTable value={modes} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} loading={loadingList} globalFilter={globalFilter} header={header} emptyMessage="Aucun mode trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter style={{ width: '12%' }} />
                        <Column field="nameFr" header="Nom (FR)" sortable filter style={{ width: '20%' }} />
                        <Column header="Reçu" body={(row) => boolBodyTemplate(row.requiresReceipt)} style={{ width: '10%' }} />
                        <Column header="Référence" body={(row) => boolBodyTemplate(row.requiresReference)} style={{ width: '10%' }} />
                        <Column header="Double Signature" body={(row) => boolBodyTemplate(row.requiresDoubleSignature)} style={{ width: '12%' }} />
                        <Column header="Statut" body={(row) => <Tag value={row.isActive ? 'Actif' : 'Inactif'} severity={row.isActive ? 'success' : 'danger'} />} style={{ width: '10%' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '15%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default ModesPaiementPage;
