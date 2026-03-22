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
import { SeuilApprobation, SeuilApprobationClass } from '../../types/DepenseTypes';

const SeuilsApprobationPage = () => {
    const [seuils, setSeuils] = useState<SeuilApprobation[]>([]);
    const [seuil, setSeuil] = useState<SeuilApprobation>(new SeuilApprobationClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/depenses/seuils-approbation');

    useEffect(() => { loadSeuils(); }, []);

    useEffect(() => {
        if (listData) setSeuils(Array.isArray(listData) ? listData : listData.content || []);
        if (listError) showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
    }, [listData, listError]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'create': case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm(); loadSeuils(); setActiveIndex(1); break;
                case 'delete':
                    showToast('success', 'Succès', 'Seuil supprimé');
                    loadSeuils(); break;
            }
        }
        if (actionError) showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
    }, [actionData, actionError, callType]);

    const loadSeuils = () => { fetchList(null, 'GET', `${BASE_URL}/findall`, 'loadSeuils'); };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => { setSeuil(new SeuilApprobationClass()); setIsViewMode(false); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSeuil(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setSeuil(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!seuil.code || !seuil.name || !seuil.nameFr) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires');
            return;
        }
        const dataToSend = { ...seuil, userAction: getUserAction() };
        if (seuil.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${seuil.id}`, 'update');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: SeuilApprobation) => { setSeuil({ ...rowData }); setIsViewMode(true); setActiveIndex(0); };
    const handleEdit = (rowData: SeuilApprobation) => { setSeuil({ ...rowData }); setIsViewMode(false); setActiveIndex(0); };
    const handleDelete = (rowData: SeuilApprobation) => {
        confirmDialog({
            message: `Supprimer le seuil "${rowData.nameFr}" ?`,
            header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger', acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => { fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete'); }
        });
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const actionsBodyTemplate = (rowData: SeuilApprobation) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" tooltipOptions={{ position: 'top' }} onClick={() => handleView(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(rowData)} />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-sliders-h mr-2"></i>Seuils d'Approbation</h4>
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
                <TabPanel header={seuil.id ? 'Modifier' : 'Nouveau Seuil'} leftIcon="pi pi-plus mr-2">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="code">Code *</label>
                            <InputText id="code" name="code" value={seuil.code} onChange={handleChange} disabled={isViewMode} placeholder="Ex: N1" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="name">Nom (EN) *</label>
                            <InputText id="name" name="name" value={seuil.name} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="nameFr">Nom (FR) *</label>
                            <InputText id="nameFr" name="nameFr" value={seuil.nameFr} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="niveau">Niveau</label>
                            <InputNumber id="niveau" value={seuil.niveau} onValueChange={(e) => handleNumberChange('niveau', e.value ?? null)} disabled={isViewMode} min={1} max={4} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="responsable">Responsable</label>
                            <InputText id="responsable" name="responsable" value={seuil.responsable} onChange={handleChange} disabled={isViewMode} placeholder="Ex: Chef de Département" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="montantMin">Montant Min (FBU)</label>
                            <InputNumber id="montantMin" value={seuil.montantMin} onValueChange={(e) => handleNumberChange('montantMin', e.value ?? null)} disabled={isViewMode} mode="currency" currency="BIF" locale="fr-BI" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="montantMax">Montant Max (FBU)</label>
                            <InputNumber id="montantMax" value={seuil.montantMax} onValueChange={(e) => handleNumberChange('montantMax', e.value ?? null)} disabled={isViewMode} mode="currency" currency="BIF" locale="fr-BI" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="delaiMaxHeures">Délai Max (heures)</label>
                            <InputNumber id="delaiMaxHeures" value={seuil.delaiMaxHeures} onValueChange={(e) => handleNumberChange('delaiMaxHeures', e.value ?? null)} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-2">
                            <label>Actif</label>
                            <div><InputSwitch checked={seuil.isActive ?? true} onChange={(e) => setSeuil(prev => ({ ...prev, isActive: e.value }))} disabled={isViewMode} /></div>
                        </div>
                        <div className="field col-12 md:col-10">
                            <label htmlFor="description">Description</label>
                            <InputTextarea id="description" name="description" value={seuil.description} onChange={handleChange} disabled={isViewMode} rows={2} />
                        </div>
                    </div>
                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && <Button label={seuil.id ? 'Modifier' : 'Créer'} icon="pi pi-check" onClick={handleSubmit} loading={loadingAction} />}
                    </div>
                </TabPanel>
                <TabPanel header="Liste" leftIcon="pi pi-list mr-2">
                    <DataTable value={seuils} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} loading={loadingList} globalFilter={globalFilter} header={header} emptyMessage="Aucun seuil trouvé" className="p-datatable-sm" sortField="niveau" sortOrder={1}>
                        <Column field="code" header="Code" sortable filter style={{ width: '8%' }} />
                        <Column field="nameFr" header="Nom (FR)" sortable filter style={{ width: '15%' }} />
                        <Column field="niveau" header="Niveau" sortable style={{ width: '8%' }} />
                        <Column field="responsable" header="Responsable" sortable style={{ width: '15%' }} />
                        <Column header="Montant Min" body={(row) => currencyBodyTemplate(row.montantMin)} sortable style={{ width: '12%' }} />
                        <Column header="Montant Max" body={(row) => currencyBodyTemplate(row.montantMax)} sortable style={{ width: '12%' }} />
                        <Column field="delaiMaxHeures" header="Délai (h)" sortable style={{ width: '8%' }} />
                        <Column header="Statut" body={(row) => <Tag value={row.isActive ? 'Actif' : 'Inactif'} severity={row.isActive ? 'success' : 'danger'} />} style={{ width: '8%' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '14%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default SeuilsApprobationPage;
