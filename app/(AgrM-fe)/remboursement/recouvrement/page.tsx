'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';

import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

import DossierRecouvrementForm from './DossierRecouvrementForm';
import {
    DossierRecouvrement,
    DossierRecouvrementClass,
    ActionRecouvrement,
    ActionRecouvrementClass,
    STATUTS_DOSSIER_RECOUVREMENT,
    ETAPES_RECOUVREMENT,
    PRIORITES,
    TYPES_ACTION_RECOUVREMENT
} from '../types/RemboursementTypes';

const RecouvrementPage = () => {
    const [dossiers, setDossiers] = useState<DossierRecouvrement[]>([]);
    const [dossier, setDossier] = useState<DossierRecouvrement>(new DossierRecouvrementClass());
    const [actions, setActions] = useState<ActionRecouvrement[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [showActionDialog, setShowActionDialog] = useState(false);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState<DossierRecouvrement | null>(null);
    const [newAction, setNewAction] = useState<ActionRecouvrement>(new ActionRecouvrementClass());

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/recovery-cases');
    const ACTIONS_URL = buildApiUrl('/api/remboursement/action-logs');

    useEffect(() => {
        loadDossiers();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDossiers':
                    setDossiers(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadActions':
                    setActions(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm();
                    loadDossiers();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Dossier supprimé');
                    loadDossiers();
                    break;
                case 'logAction':
                    showToast('success', 'Succès', 'Action enregistrée');
                    setShowActionDialog(false);
                    if (selectedDossier) {
                        loadActionsForDossier(selectedDossier.id!);
                    }
                    break;
                case 'updateStage':
                    showToast('success', 'Succès', 'Étape mise à jour');
                    loadDossiers();
                    break;
                case 'escalate':
                    showToast('success', 'Succès', 'Dossier escaladé');
                    loadDossiers();
                    break;
                case 'close':
                    showToast('success', 'Succès', 'Dossier clôturé');
                    loadDossiers();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadDossiers = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDossiers');
    };

    const loadActionsForDossier = (caseId: number) => {
        fetchData(null, 'GET', `${ACTIONS_URL}/findbycaseidordered/${caseId}`, 'loadActions');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setDossier(new DossierRecouvrementClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDossier(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setDossier(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setDossier(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setDossier(prev => ({ ...prev, [name]: value?.toISOString().split('T')[0] }));
    };

    const handleCheckboxChange = (name: string, value: boolean) => {
        setDossier(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!dossier.loanId) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires');
            return;
        }

        if (dossier.id) {
            fetchData(dossier, 'PUT', `${BASE_URL}/update/${dossier.id}`, 'update');
        } else {
            fetchData(dossier, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: DossierRecouvrement) => {
        setDossier({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleEdit = (rowData: DossierRecouvrement) => {
        setDossier({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: DossierRecouvrement) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer ce dossier ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Non, annuler',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const handleAddAction = (rowData: DossierRecouvrement) => {
        setSelectedDossier(rowData);
        setNewAction(new ActionRecouvrementClass());
        setNewAction(prev => ({ ...prev, caseId: rowData.id, loanId: rowData.loanId }));
        setShowActionDialog(true);
    };

    const handleViewHistory = (rowData: DossierRecouvrement) => {
        setSelectedDossier(rowData);
        loadActionsForDossier(rowData.id!);
        setShowHistoryDialog(true);
    };

    const handleSaveAction = () => {
        if (!newAction.actionType) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le type d\'action');
            return;
        }
        fetchData(newAction, 'POST', `${ACTIONS_URL}/new`, 'logAction');
    };

    const handleEscalate = (rowData: DossierRecouvrement) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir escalader ce dossier ?',
            header: 'Confirmation d\'escalade',
            icon: 'pi pi-arrow-up',
            acceptClassName: 'p-button-warning',
            acceptLabel: 'Oui, escalader',
            rejectLabel: 'Non, annuler',
            accept: () => {
                fetchData(null, 'POST', `${BASE_URL}/escalate/${rowData.id}?escalationReason=Escalade manuelle&escalatedBy=1`, 'escalate');
            }
        });
    };

    // Column body templates
    const statusBodyTemplate = (rowData: DossierRecouvrement) => {
        const severityMap: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
            'OPEN': 'info',
            'IN_PROGRESS': 'warning',
            'ESCALATED': 'danger',
            'RESOLVED': 'success',
            'CLOSED': 'secondary',
            'LITIGATION': 'danger'
        };
        const labelMap: { [key: string]: string } = {
            'OPEN': 'Ouvert',
            'IN_PROGRESS': 'En cours',
            'ESCALATED': 'Escaladé',
            'RESOLVED': 'Résolu',
            'CLOSED': 'Fermé',
            'LITIGATION': 'Contentieux'
        };
        return (
            <Tag
                value={labelMap[rowData.status || 'OPEN'] || rowData.status}
                severity={severityMap[rowData.status || 'OPEN'] || 'info'}
            />
        );
    };

    const stageBodyTemplate = (rowData: DossierRecouvrement) => {
        const labelMap: { [key: string]: string } = {
            'NEGOTIATION': 'Négociation',
            'MEDIATION': 'Médiation',
            'FINAL_NOTICE': 'Mise en demeure',
            'LITIGATION': 'Contentieux'
        };
        return labelMap[rowData.currentStage || 'NEGOTIATION'] || rowData.currentStage;
    };

    const priorityBodyTemplate = (rowData: DossierRecouvrement) => {
        const severityMap: { [key: string]: 'success' | 'info' | 'warning' | 'danger' } = {
            'LOW': 'success',
            'NORMAL': 'info',
            'HIGH': 'warning',
            'CRITICAL': 'danger'
        };
        const labelMap: { [key: string]: string } = {
            'LOW': 'Faible',
            'NORMAL': 'Normale',
            'HIGH': 'Haute',
            'CRITICAL': 'Critique'
        };
        return (
            <Tag
                value={labelMap[rowData.priority || 'NORMAL'] || rowData.priority}
                severity={severityMap[rowData.priority || 'NORMAL'] || 'info'}
            />
        );
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const daysOverdueBodyTemplate = (rowData: DossierRecouvrement) => {
        const days = rowData.daysOverdue || 0;
        let severity: 'success' | 'warning' | 'danger' = 'success';
        if (days > 90) severity = 'danger';
        else if (days > 30) severity = 'warning';

        return <Tag value={`${days} jours`} severity={severity} />;
    };

    const actionsBodyTemplate = (rowData: DossierRecouvrement) => (
        <div className="flex gap-1">
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                tooltip="Voir"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleView(rowData)}
            />
            <Button
                icon="pi pi-plus"
                rounded
                text
                severity="success"
                tooltip="Ajouter Action"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleAddAction(rowData)}
            />
            <Button
                icon="pi pi-history"
                rounded
                text
                severity="help"
                tooltip="Historique"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleViewHistory(rowData)}
            />
            <Button
                icon="pi pi-arrow-up"
                rounded
                text
                severity="warning"
                tooltip="Escalader"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleEscalate(rowData)}
                disabled={rowData.isEscalated}
            />
            <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="warning"
                tooltip="Modifier"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleEdit(rowData)}
            />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">
                <i className="pi pi-folder-open mr-2"></i>
                Dossiers de Recouvrement
            </h4>
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

    // Timeline event template for action history
    const actionTimelineTemplate = (item: ActionRecouvrement) => {
        const actionLabel = TYPES_ACTION_RECOUVREMENT.find(t => t.value === item.actionType)?.label || item.actionType;
        return (
            <Card className="mb-2">
                <div className="flex justify-content-between align-items-center">
                    <Tag value={actionLabel} />
                    <small className="text-color-secondary">
                        {item.actionDate ? new Date(item.actionDate).toLocaleString('fr-FR') : '-'}
                    </small>
                </div>
                <p className="mt-2 mb-1">{item.actionDescription || '-'}</p>
                {item.outcome && <p className="text-color-secondary mb-1"><strong>Résultat:</strong> {item.outcome}</p>}
                {item.promiseToPayAmount && item.promiseToPayAmount > 0 && (
                    <p className="text-primary mb-0">
                        <strong>Promesse:</strong> {currencyBodyTemplate(item.promiseToPayAmount)}
                        {item.promiseToPayDate && ` pour le ${new Date(item.promiseToPayDate).toLocaleDateString('fr-FR')}`}
                    </p>
                )}
            </Card>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Statistiques */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="text-center">
                        <div className="text-2xl font-bold text-primary">{dossiers.filter(d => d.status === 'OPEN').length}</div>
                        <div className="text-color-secondary">Dossiers Ouverts</div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="text-center">
                        <div className="text-2xl font-bold text-orange-500">{dossiers.filter(d => d.status === 'IN_PROGRESS').length}</div>
                        <div className="text-color-secondary">En Cours</div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="text-center">
                        <div className="text-2xl font-bold text-red-500">{dossiers.filter(d => d.isEscalated).length}</div>
                        <div className="text-color-secondary">Escaladés</div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="text-center">
                        <div className="text-2xl font-bold text-green-500">{dossiers.filter(d => d.status === 'RESOLVED').length}</div>
                        <div className="text-color-secondary">Résolus</div>
                    </Card>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Dossier" leftIcon="pi pi-plus mr-2">
                    <DossierRecouvrementForm
                        dossier={dossier}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleCheckboxChange={handleCheckboxChange}
                        isViewMode={isViewMode}
                    />

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            severity="secondary"
                            onClick={resetForm}
                        />
                        {!isViewMode && (
                            <Button
                                label={dossier.id ? "Modifier" : "Créer Dossier"}
                                icon="pi pi-save"
                                onClick={handleSubmit}
                                loading={loading}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Dossiers" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={dossiers}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun dossier trouvé"
                        className="p-datatable-sm"
                        sortField="daysOverdue"
                        sortOrder={-1}
                        rowClassName={(data) => ({
                            'bg-red-50': data.daysOverdue > 90,
                            'bg-orange-50': data.daysOverdue > 30 && data.daysOverdue <= 90
                        })}
                    >
                        <Column field="caseNumber" header="N° Dossier" sortable filter style={{ width: '10%' }} />
                        <Column field="loanId" header="ID Crédit" sortable filter style={{ width: '8%' }} />
                        <Column
                            field="totalOverdueAmount"
                            header="Montant Impayé"
                            body={(rowData) => currencyBodyTemplate(rowData.totalOverdueAmount)}
                            sortable
                            style={{ width: '12%' }}
                        />
                        <Column
                            field="daysOverdue"
                            header="Jours Retard"
                            body={daysOverdueBodyTemplate}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="currentStage"
                            header="Étape"
                            body={stageBodyTemplate}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="priority"
                            header="Priorité"
                            body={priorityBodyTemplate}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="status"
                            header="Statut"
                            body={statusBodyTemplate}
                            sortable
                            filter
                            style={{ width: '10%' }}
                        />
                        <Column
                            header="Actions"
                            body={actionsBodyTemplate}
                            style={{ width: '18%' }}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog Nouvelle Action */}
            <Dialog
                visible={showActionDialog}
                onHide={() => setShowActionDialog(false)}
                header="Enregistrer une Action"
                style={{ width: '50vw' }}
                modal
                footer={
                    <div>
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setShowActionDialog(false)}
                        />
                        <Button
                            label="Enregistrer"
                            icon="pi pi-check"
                            onClick={handleSaveAction}
                            loading={loading}
                        />
                    </div>
                }
            >
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Type d'Action *</label>
                        <Dropdown
                            value={newAction.actionType}
                            options={TYPES_ACTION_RECOUVREMENT}
                            onChange={(e) => setNewAction(prev => ({ ...prev, actionType: e.value }))}
                            className="w-full"
                            placeholder="Sélectionner..."
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Contact</label>
                        <InputText
                            value={newAction.contactPerson || ''}
                            onChange={(e) => setNewAction(prev => ({ ...prev, contactPerson: e.target.value }))}
                            className="w-full"
                            placeholder="Nom du contact"
                        />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Description de l'Action</label>
                        <InputTextarea
                            value={newAction.actionDescription || ''}
                            onChange={(e) => setNewAction(prev => ({ ...prev, actionDescription: e.target.value }))}
                            className="w-full"
                            rows={3}
                        />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Résultat / Issue</label>
                        <InputTextarea
                            value={newAction.outcome || ''}
                            onChange={(e) => setNewAction(prev => ({ ...prev, outcome: e.target.value }))}
                            className="w-full"
                            rows={2}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Promesse de Paiement</label>
                        <InputNumber
                            value={newAction.promiseToPayAmount || null}
                            onValueChange={(e) => setNewAction(prev => ({ ...prev, promiseToPayAmount: e.value ?? 0 }))}
                            className="w-full"
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Date Promesse</label>
                        <Calendar
                            value={newAction.promiseToPayDate ? new Date(newAction.promiseToPayDate) : null}
                            onChange={(e) => setNewAction(prev => ({ ...prev, promiseToPayDate: (e.value as Date)?.toISOString().split('T')[0] }))}
                            className="w-full"
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Prochaine Action</label>
                        <Dropdown
                            value={newAction.nextActionType}
                            options={TYPES_ACTION_RECOUVREMENT}
                            onChange={(e) => setNewAction(prev => ({ ...prev, nextActionType: e.value }))}
                            className="w-full"
                            placeholder="Sélectionner..."
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Date Prochaine Action</label>
                        <Calendar
                            value={newAction.nextActionDate ? new Date(newAction.nextActionDate) : null}
                            onChange={(e) => setNewAction(prev => ({ ...prev, nextActionDate: (e.value as Date)?.toISOString().split('T')[0] }))}
                            className="w-full"
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog Historique Actions */}
            <Dialog
                visible={showHistoryDialog}
                onHide={() => setShowHistoryDialog(false)}
                header={`Historique des Actions - Dossier ${selectedDossier?.caseNumber}`}
                style={{ width: '60vw' }}
                modal
            >
                {actions.length > 0 ? (
                    <Timeline
                        value={actions}
                        content={actionTimelineTemplate}
                        className="customized-timeline"
                    />
                ) : (
                    <div className="text-center text-color-secondary py-4">
                        <i className="pi pi-info-circle text-4xl mb-3"></i>
                        <p>Aucune action enregistrée pour ce dossier</p>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default RecouvrementPage;
