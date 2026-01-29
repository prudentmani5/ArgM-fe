'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';

import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

import {
    DossierContentieux,
    DossierContentieuxClass,
    STATUTS_CONTENTIEUX,
    ISSUES_JUGEMENT
} from '../types/RemboursementTypes';

const ContentieuxPage = () => {
    const [dossiers, setDossiers] = useState<DossierContentieux[]>([]);
    const [dossier, setDossier] = useState<DossierContentieux>(new DossierContentieuxClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [showJudgmentDialog, setShowJudgmentDialog] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState<DossierContentieux | null>(null);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [judgment, setJudgment] = useState({
        judgmentDate: new Date(),
        judgmentOutcome: '',
        awardedAmount: 0,
        notes: ''
    });

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/legal-cases');

    useEffect(() => {
        loadDossiers();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDossiers':
                    setDossiers(Array.isArray(data) ? data : data.content || []);
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
                case 'dgApprove':
                    showToast('success', 'Succès', 'Dossier approuvé par la DG');
                    setShowApprovalDialog(false);
                    loadDossiers();
                    break;
                case 'dgReject':
                    showToast('info', 'Info', 'Dossier rejeté par la DG');
                    setShowApprovalDialog(false);
                    loadDossiers();
                    break;
                case 'recordJudgment':
                    showToast('success', 'Succès', 'Jugement enregistré');
                    setShowJudgmentDialog(false);
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

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setDossier(new DossierContentieuxClass());
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

    const handleSubmit = () => {
        if (!dossier.loanId || !dossier.disputedAmount) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires');
            return;
        }

        if (dossier.id) {
            fetchData(dossier, 'PUT', `${BASE_URL}/update/${dossier.id}`, 'update');
        } else {
            fetchData(dossier, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: DossierContentieux) => {
        setDossier({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleEdit = (rowData: DossierContentieux) => {
        setDossier({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleDgApproval = (rowData: DossierContentieux) => {
        setSelectedDossier(rowData);
        setApprovalNotes('');
        setShowApprovalDialog(true);
    };

    const handleApprove = () => {
        fetchData(null, 'POST', `${BASE_URL}/dgapprove/${selectedDossier?.id}?approvedBy=1&notes=${encodeURIComponent(approvalNotes)}`, 'dgApprove');
    };

    const handleReject = () => {
        if (!approvalNotes) {
            showToast('warn', 'Attention', 'Veuillez fournir une raison de rejet');
            return;
        }
        fetchData(null, 'POST', `${BASE_URL}/dgreject/${selectedDossier?.id}?rejectedBy=1&reason=${encodeURIComponent(approvalNotes)}`, 'dgReject');
    };

    const handleRecordJudgment = (rowData: DossierContentieux) => {
        setSelectedDossier(rowData);
        setJudgment({
            judgmentDate: new Date(),
            judgmentOutcome: '',
            awardedAmount: 0,
            notes: ''
        });
        setShowJudgmentDialog(true);
    };

    const handleSaveJudgment = () => {
        if (!judgment.judgmentOutcome) {
            showToast('warn', 'Attention', 'Veuillez sélectionner l\'issue du jugement');
            return;
        }
        const params = new URLSearchParams({
            judgmentDate: judgment.judgmentDate.toISOString().split('T')[0],
            judgmentOutcome: judgment.judgmentOutcome,
            awardedAmount: judgment.awardedAmount.toString()
        });
        if (judgment.notes) params.append('notes', judgment.notes);

        fetchData(null, 'POST', `${BASE_URL}/recordjudgment/${selectedDossier?.id}?${params.toString()}`, 'recordJudgment');
    };

    // Column body templates
    const statusBodyTemplate = (rowData: DossierContentieux) => {
        const severityMap: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
            'PENDING_DG_APPROVAL': 'warning',
            'DG_APPROVED': 'success',
            'DG_REJECTED': 'danger',
            'FILED': 'info',
            'HEARING_SCHEDULED': 'info',
            'AWAITING_JUDGMENT': 'warning',
            'JUDGMENT_RENDERED': 'success',
            'EXECUTION': 'info',
            'CLOSED': 'secondary'
        };
        const labelMap: { [key: string]: string } = {
            'PENDING_DG_APPROVAL': 'Attente DG',
            'DG_APPROVED': 'Approuvé DG',
            'DG_REJECTED': 'Rejeté DG',
            'FILED': 'Déposé',
            'HEARING_SCHEDULED': 'Audience prévue',
            'AWAITING_JUDGMENT': 'Attente jugement',
            'JUDGMENT_RENDERED': 'Jugement rendu',
            'EXECUTION': 'En exécution',
            'CLOSED': 'Clôturé'
        };
        return (
            <Tag
                value={labelMap[rowData.status || 'PENDING_DG_APPROVAL'] || rowData.status}
                severity={severityMap[rowData.status || 'PENDING_DG_APPROVAL'] || 'info'}
            />
        );
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const dateBodyTemplate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const actionsBodyTemplate = (rowData: DossierContentieux) => (
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
            {rowData.status === 'PENDING_DG_APPROVAL' && (
                <Button
                    icon="pi pi-check-circle"
                    rounded
                    text
                    severity="success"
                    tooltip="Approbation DG"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleDgApproval(rowData)}
                />
            )}
            {['DG_APPROVED', 'FILED', 'HEARING_SCHEDULED', 'AWAITING_JUDGMENT'].includes(rowData.status || '') && (
                <Button
                    icon="pi pi-file-edit"
                    rounded
                    text
                    severity="help"
                    tooltip="Enregistrer Jugement"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleRecordJudgment(rowData)}
                />
            )}
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
                <i className="pi pi-briefcase mr-2"></i>
                Dossiers Contentieux
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

    const pendingApproval = dossiers.filter(d => d.status === 'PENDING_DG_APPROVAL').length;

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Alerte approbations en attente */}
            {pendingApproval > 0 && (
                <Message
                    severity="warn"
                    className="mb-3 w-full"
                    text={`${pendingApproval} dossier(s) en attente d'approbation de la Direction Générale`}
                />
            )}

            {/* Statistiques */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="text-center">
                        <div className="text-2xl font-bold text-orange-500">{pendingApproval}</div>
                        <div className="text-color-secondary">En Attente DG</div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="text-center">
                        <div className="text-2xl font-bold text-blue-500">
                            {dossiers.filter(d => ['FILED', 'HEARING_SCHEDULED', 'AWAITING_JUDGMENT'].includes(d.status || '')).length}
                        </div>
                        <div className="text-color-secondary">En Cours</div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                            {dossiers.filter(d => d.status === 'JUDGMENT_RENDERED').length}
                        </div>
                        <div className="text-color-secondary">Jugement Rendu</div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="text-center">
                        <div className="text-2xl font-bold text-primary">
                            {currencyBodyTemplate(dossiers.reduce((sum, d) => sum + (d.disputedAmount || 0), 0))}
                        </div>
                        <div className="text-color-secondary">Total en Litige</div>
                    </Card>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Dossier" leftIcon="pi pi-plus mr-2">
                    <Message
                        severity="info"
                        className="mb-3 w-full"
                        text="Les dossiers contentieux nécessitent l'approbation de la Direction Générale avant toute action judiciaire."
                    />

                    <div className="grid">
                        {/* Informations Générales */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-folder mr-2"></i>
                                    Informations du Dossier
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">N° Dossier</label>
                                        <InputText value={dossier.caseNumber || ''} disabled className="w-full" placeholder="Auto-généré" />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">ID Crédit *</label>
                                        <InputNumber
                                            value={dossier.loanId || null}
                                            onValueChange={(e) => handleNumberChange('loanId', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">ID Dossier Recouvrement</label>
                                        <InputNumber
                                            value={dossier.recoveryCaseId || null}
                                            onValueChange={(e) => handleNumberChange('recoveryCaseId', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Date de Dépôt</label>
                                        <Calendar
                                            value={dossier.filingDate ? new Date(dossier.filingDate) : null}
                                            onChange={(e) => handleDateChange('filingDate', e.value as Date)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            dateFormat="dd/mm/yy"
                                            showIcon
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Statut</label>
                                        <Dropdown
                                            value={dossier.status}
                                            options={STATUTS_CONTENTIEUX}
                                            onChange={(e) => handleDropdownChange('status', e.value)}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Montants */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-money-bill mr-2"></i>
                                    Montants et Frais
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold text-red-500">Montant en Litige *</label>
                                        <InputNumber
                                            value={dossier.disputedAmount || null}
                                            onValueChange={(e) => handleNumberChange('disputedAmount', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Frais d'Avocat</label>
                                        <InputNumber
                                            value={dossier.legalFees || null}
                                            onValueChange={(e) => handleNumberChange('legalFees', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Frais d'Huissier</label>
                                        <InputNumber
                                            value={dossier.bailiffFees || null}
                                            onValueChange={(e) => handleNumberChange('bailiffFees', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Autres Frais</label>
                                        <InputNumber
                                            value={dossier.otherCosts || null}
                                            onValueChange={(e) => handleNumberChange('otherCosts', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tribunal et Avocat */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-building mr-2"></i>
                                    Tribunal et Représentation
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold">Tribunal</label>
                                        <InputText
                                            name="courtName"
                                            value={dossier.courtName || ''}
                                            onChange={handleChange}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold">Lieu</label>
                                        <InputText
                                            name="courtLocation"
                                            value={dossier.courtLocation || ''}
                                            onChange={handleChange}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold">N° Affaire Tribunal</label>
                                        <InputText
                                            name="courtCaseNumber"
                                            value={dossier.courtCaseNumber || ''}
                                            onChange={handleChange}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold">Nom Avocat</label>
                                        <InputText
                                            name="lawyerName"
                                            value={dossier.lawyerName || ''}
                                            onChange={handleChange}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold">Contact Avocat</label>
                                        <InputText
                                            name="lawyerContact"
                                            value={dossier.lawyerContact || ''}
                                            onChange={handleChange}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold">Date Audience</label>
                                        <Calendar
                                            value={dossier.hearingDate ? new Date(dossier.hearingDate) : null}
                                            onChange={(e) => handleDateChange('hearingDate', e.value as Date)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            dateFormat="dd/mm/yy"
                                            showIcon
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-file-edit mr-2"></i>
                                    Notes
                                </h5>
                                <InputTextarea
                                    name="notes"
                                    value={dossier.notes || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

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
                        sortField="filingDate"
                        sortOrder={-1}
                    >
                        <Column field="caseNumber" header="N° Dossier" sortable filter style={{ width: '10%' }} />
                        <Column field="loanId" header="ID Crédit" sortable filter style={{ width: '8%' }} />
                        <Column
                            field="filingDate"
                            header="Date Dépôt"
                            body={(rowData) => dateBodyTemplate(rowData.filingDate)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="disputedAmount"
                            header="Montant Litige"
                            body={(rowData) => currencyBodyTemplate(rowData.disputedAmount)}
                            sortable
                            style={{ width: '12%' }}
                        />
                        <Column field="courtName" header="Tribunal" sortable style={{ width: '12%' }} />
                        <Column field="lawyerName" header="Avocat" sortable style={{ width: '10%' }} />
                        <Column
                            field="hearingDate"
                            header="Audience"
                            body={(rowData) => dateBodyTemplate(rowData.hearingDate)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="status"
                            header="Statut"
                            body={statusBodyTemplate}
                            sortable
                            filter
                            style={{ width: '12%' }}
                        />
                        <Column
                            header="Actions"
                            body={actionsBodyTemplate}
                            style={{ width: '12%' }}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog Approbation DG */}
            <Dialog
                visible={showApprovalDialog}
                onHide={() => setShowApprovalDialog(false)}
                header="Approbation Direction Générale"
                style={{ width: '40vw' }}
                modal
                footer={
                    <div className="flex justify-content-between">
                        <Button
                            label="Rejeter"
                            icon="pi pi-times"
                            severity="danger"
                            onClick={handleReject}
                        />
                        <Button
                            label="Approuver"
                            icon="pi pi-check"
                            severity="success"
                            onClick={handleApprove}
                        />
                    </div>
                }
            >
                <div className="p-3">
                    <div className="grid mb-3">
                        <div className="col-6">
                            <p><strong>N° Dossier:</strong> {selectedDossier?.caseNumber}</p>
                            <p><strong>ID Crédit:</strong> {selectedDossier?.loanId}</p>
                        </div>
                        <div className="col-6">
                            <p className="text-2xl text-red-500 font-bold">
                                {currencyBodyTemplate(selectedDossier?.disputedAmount)}
                            </p>
                            <p className="text-color-secondary">Montant en litige</p>
                        </div>
                    </div>

                    <Divider />

                    <div className="field">
                        <label className="font-semibold">Notes / Raison de rejet</label>
                        <InputTextarea
                            value={approvalNotes}
                            onChange={(e) => setApprovalNotes(e.target.value)}
                            className="w-full"
                            rows={4}
                            placeholder="Commentaires ou raison de rejet..."
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog Jugement */}
            <Dialog
                visible={showJudgmentDialog}
                onHide={() => setShowJudgmentDialog(false)}
                header="Enregistrer le Jugement"
                style={{ width: '40vw' }}
                modal
                footer={
                    <div>
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setShowJudgmentDialog(false)}
                        />
                        <Button
                            label="Enregistrer"
                            icon="pi pi-check"
                            onClick={handleSaveJudgment}
                        />
                    </div>
                }
            >
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Date du Jugement *</label>
                        <Calendar
                            value={judgment.judgmentDate}
                            onChange={(e) => setJudgment(prev => ({ ...prev, judgmentDate: e.value as Date }))}
                            className="w-full"
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Issue du Jugement *</label>
                        <Dropdown
                            value={judgment.judgmentOutcome}
                            options={ISSUES_JUGEMENT}
                            onChange={(e) => setJudgment(prev => ({ ...prev, judgmentOutcome: e.value }))}
                            className="w-full"
                            placeholder="Sélectionner..."
                        />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Montant Accordé</label>
                        <InputNumber
                            value={judgment.awardedAmount}
                            onValueChange={(e) => setJudgment(prev => ({ ...prev, awardedAmount: e.value ?? 0 }))}
                            className="w-full"
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                        />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Notes</label>
                        <InputTextarea
                            value={judgment.notes}
                            onChange={(e) => setJudgment(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full"
                            rows={3}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ContentieuxPage;
