'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/committee-sessions');

interface Session {
    id?: number;
    sessionNumber?: string;
    sessionDate?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    branchId?: number;
    statusCode?: string;
    statusName?: string;
    notes?: string;
    totalApplications?: number;
    approvedCount?: number;
    rejectedCount?: number;
}

const SessionStatuts = [
    { code: 'PLANIFIEE', label: 'Planifiée' },
    { code: 'EN_COURS', label: 'En Cours' },
    { code: 'TERMINEE', label: 'Terminée' },
    { code: 'ANNULEE', label: 'Annulée' }
];

export default function ComiteSessionsPage() {
    const [session, setSession] = useState<Session>({});
    const [sessions, setSessions] = useState<Session[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadSessions();
        loadBranches();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadSessions':
                    setSessions(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadBranches':
                    setBranches(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Session créée avec succès');
                    resetForm();
                    loadSessions();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Session modifiée avec succès');
                    resetForm();
                    loadSessions();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Session supprimée avec succès');
                    loadSessions();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadSessions = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadSessions');
    };

    const loadBranches = () => {
        fetchData(null, 'GET', buildApiUrl('/api/branches/findall'), 'loadBranches');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setSession({});
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSession(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setSession(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setSession(prev => ({ ...prev, [name]: value?.toISOString() }));
    };

    const handleSubmit = () => {
        if (!session.sessionDate) {
            showToast('error', 'Erreur de validation', 'La date de session est obligatoire');
            return;
        }

        if (session.id) {
            fetchData(session, 'PUT', `${BASE_URL}/update/${session.id}`, 'update');
        } else {
            fetchData(session, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: Session) => {
        setSession({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: Session) => {
        setSession({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: Session) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer cette session ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const statusBodyTemplate = (rowData: Session) => {
        const colors: Record<string, string> = {
            'PLANIFIEE': 'info',
            'EN_COURS': 'warning',
            'TERMINEE': 'success',
            'ANNULEE': 'danger'
        };
        return <Tag value={rowData.statusName || rowData.statusCode || 'Planifiée'} severity={colors[rowData.statusCode || ''] as any || 'info'} />;
    };

    const actionsBodyTemplate = (rowData: Session) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleView(rowData)} tooltip="Voir" />
            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Sessions</h5>
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

            <h4 className="mb-4">
                <i className="pi pi-users mr-2"></i>
                Sessions du Comité de Crédit
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Session" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-calendar mr-2"></i>Informations de la Session</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="sessionNumber" className="font-semibold">Numéro de Session</label>
                                <InputText id="sessionNumber" name="sessionNumber" value={session.sessionNumber || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Auto-généré" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="sessionDate" className="font-semibold">Date de Session *</label>
                                <Calendar id="sessionDate" value={session.sessionDate ? new Date(session.sessionDate) : null} onChange={(e) => handleDateChange('sessionDate', e.value as Date)} className="w-full" disabled={isViewMode} dateFormat="dd/mm/yy" showIcon />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="branchId" className="font-semibold">Agence</label>
                                <Dropdown id="branchId" value={session.branchId} options={branches} onChange={(e) => handleDropdownChange('branchId', e.value)} optionLabel="name" optionValue="id" placeholder="Sélectionner une agence" className="w-full" disabled={isViewMode} filter />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="startTime" className="font-semibold">Heure de Début</label>
                                <InputText id="startTime" name="startTime" value={session.startTime || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="09:00" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="endTime" className="font-semibold">Heure de Fin</label>
                                <InputText id="endTime" name="endTime" value={session.endTime || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="12:00" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="location" className="font-semibold">Lieu</label>
                                <InputText id="location" name="location" value={session.location || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Salle de réunion" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="statusCode" className="font-semibold">Statut</label>
                                <Dropdown id="statusCode" value={session.statusCode} options={SessionStatuts} onChange={(e) => handleDropdownChange('statusCode', e.value)} optionLabel="label" optionValue="code" placeholder="Sélectionner un statut" className="w-full" disabled={isViewMode} />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="notes" className="font-semibold">Notes</label>
                                <InputTextarea id="notes" name="notes" value={session.notes || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Notes et observations..." />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={session.id ? 'Modifier' : 'Créer la Session'} icon={session.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Sessions" leftIcon="pi pi-list mr-2">
                    <DataTable value={sessions} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadSessions'} globalFilter={globalFilter} header={header} emptyMessage="Aucune session trouvée" className="p-datatable-sm">
                        <Column field="sessionNumber" header="N° Session" sortable filter />
                        <Column field="sessionDate" header="Date" body={(row) => formatDate(row.sessionDate)} sortable />
                        <Column field="startTime" header="Heure" />
                        <Column field="location" header="Lieu" sortable filter />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column field="totalApplications" header="Dossiers" sortable />
                        <Column field="approvedCount" header="Approuvés" sortable />
                        <Column field="rejectedCount" header="Rejetés" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
