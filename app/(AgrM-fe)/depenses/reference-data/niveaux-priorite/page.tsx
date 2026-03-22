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
import { NiveauPriorite, NiveauPrioriteClass } from '../../types/DepenseTypes';

const NiveauxPrioritePage = () => {
    const [niveaux, setNiveaux] = useState<NiveauPriorite[]>([]);
    const [niveau, setNiveau] = useState<NiveauPriorite>(new NiveauPrioriteClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/depenses/niveaux-priorite');

    useEffect(() => { loadNiveaux(); }, []);

    useEffect(() => {
        if (listData) setNiveaux(Array.isArray(listData) ? listData : listData.content || []);
        if (listError) showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
    }, [listData, listError]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'create': case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm(); loadNiveaux(); setActiveIndex(1); break;
                case 'delete':
                    showToast('success', 'Succès', 'Niveau de priorité supprimé');
                    loadNiveaux(); break;
            }
        }
        if (actionError) showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
    }, [actionData, actionError, callType]);

    const loadNiveaux = () => { fetchList(null, 'GET', `${BASE_URL}/findall`, 'loadNiveaux'); };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => { setNiveau(new NiveauPrioriteClass()); setIsViewMode(false); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNiveau(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!niveau.code || !niveau.name || !niveau.nameFr) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires');
            return;
        }
        const dataToSend = { ...niveau, userAction: getUserAction() };
        if (niveau.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${niveau.id}`, 'update');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: NiveauPriorite) => { setNiveau({ ...rowData }); setIsViewMode(true); setActiveIndex(0); };
    const handleEdit = (rowData: NiveauPriorite) => { setNiveau({ ...rowData }); setIsViewMode(false); setActiveIndex(0); };
    const handleDelete = (rowData: NiveauPriorite) => {
        confirmDialog({
            message: `Supprimer le niveau "${rowData.nameFr}" ?`,
            header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger', acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => { fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete'); }
        });
    };

    const statusBodyTemplate = (rowData: NiveauPriorite) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: NiveauPriorite) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" tooltipOptions={{ position: 'top' }} onClick={() => handleView(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(rowData)} />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-flag mr-2"></i>Niveaux de Priorité</h4>
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
                <TabPanel header={niveau.id ? 'Modifier' : 'Nouveau Niveau'} leftIcon="pi pi-plus mr-2">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="code">Code *</label>
                            <InputText id="code" name="code" value={niveau.code} onChange={handleChange} disabled={isViewMode} placeholder="Ex: P1" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="name">Nom (EN) *</label>
                            <InputText id="name" name="name" value={niveau.name} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="nameFr">Nom (FR) *</label>
                            <InputText id="nameFr" name="nameFr" value={niveau.nameFr} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="delaiTraitement">Délai de Traitement</label>
                            <InputText id="delaiTraitement" name="delaiTraitement" value={niveau.delaiTraitement} onChange={handleChange} disabled={isViewMode} placeholder="Ex: 48 heures" />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="approbationRequise">Approbation Requise</label>
                            <InputText id="approbationRequise" name="approbationRequise" value={niveau.approbationRequise} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-2">
                            <label htmlFor="sortOrder">Ordre</label>
                            <InputNumber id="sortOrder" value={niveau.sortOrder} onValueChange={(e) => setNiveau(prev => ({ ...prev, sortOrder: e.value ?? 0 }))} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-2">
                            <label htmlFor="isActive">Actif</label>
                            <div><InputSwitch checked={niveau.isActive ?? true} onChange={(e) => setNiveau(prev => ({ ...prev, isActive: e.value }))} disabled={isViewMode} /></div>
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="description">Description</label>
                            <InputTextarea id="description" name="description" value={niveau.description} onChange={handleChange} disabled={isViewMode} rows={3} />
                        </div>
                    </div>
                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && <Button label={niveau.id ? 'Modifier' : 'Créer'} icon="pi pi-check" onClick={handleSubmit} loading={loadingAction} />}
                    </div>
                </TabPanel>
                <TabPanel header="Liste" leftIcon="pi pi-list mr-2">
                    <DataTable value={niveaux} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} loading={loadingList} globalFilter={globalFilter} header={header} emptyMessage="Aucun niveau trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter style={{ width: '10%' }} />
                        <Column field="nameFr" header="Nom (FR)" sortable filter style={{ width: '20%' }} />
                        <Column field="delaiTraitement" header="Délai" sortable style={{ width: '15%' }} />
                        <Column field="approbationRequise" header="Approbation" sortable style={{ width: '20%' }} />
                        <Column header="Statut" body={statusBodyTemplate} style={{ width: '10%' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '15%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default NiveauxPrioritePage;
