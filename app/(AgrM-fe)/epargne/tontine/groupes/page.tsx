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
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { TontineGroup, TontineGroupClass, TontineMember, ContributionFrequency } from './TontineGroup';

const BASE_URL = `${API_BASE_URL}/api/epargne/tontine-groups`;
const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const BRANCHES_URL = `${API_BASE_URL}/api/branches`;
const STATUSES_URL = `${API_BASE_URL}/api/epargne/tontine-statuses`;
const CURRENCIES_URL = `${API_BASE_URL}/api/currencies`;

function TontineGroupPage() {
    const [group, setGroup] = useState<TontineGroup>(new TontineGroupClass());
    const [groups, setGroups] = useState<TontineGroup[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [memberDialog, setMemberDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<TontineGroup | null>(null);
    const [newMemberClientId, setNewMemberClientId] = useState<number | null>(null);
    const toast = useRef<Toast>(null);
    const { data, error, fetchData, callType } = useConsumApi('');

    const frequencyOptions = [
        { label: 'Hebdomadaire', value: ContributionFrequency.WEEKLY },
        { label: 'Bi-mensuel', value: ContributionFrequency.BI_WEEKLY },
        { label: 'Mensuel', value: ContributionFrequency.MONTHLY }
    ];

    const dayOptions = [
        { label: 'Lundi', value: 'MONDAY' },
        { label: 'Mardi', value: 'TUESDAY' },
        { label: 'Mercredi', value: 'WEDNESDAY' },
        { label: 'Jeudi', value: 'THURSDAY' },
        { label: 'Vendredi', value: 'FRIDAY' },
        { label: 'Samedi', value: 'SATURDAY' },
        { label: 'Dimanche', value: 'SUNDAY' }
    ];

    useEffect(() => {
        loadReferenceData();
        loadGroups();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadGroups':
                    setGroups(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadClients':
                    setClients(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadBranches':
                    setBranches(Array.isArray(data) ? data : []);
                    break;
                case 'loadStatuses':
                    setStatuses(Array.isArray(data) ? data : []);
                    break;
                case 'loadCurrencies':
                    setCurrencies(Array.isArray(data) ? data : []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Groupe de tontine créé avec succès');
                    resetForm();
                    loadGroups();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Groupe mis à jour avec succès');
                    loadGroups();
                    break;
                case 'addMember':
                    showToast('success', 'Succès', 'Membre ajouté avec succès');
                    setMemberDialog(false);
                    loadGroups();
                    break;
                case 'removeMember':
                    showToast('success', 'Succès', 'Membre retiré du groupe');
                    loadGroups();
                    break;
                case 'startGroup':
                    showToast('success', 'Succès', 'Groupe démarré avec succès');
                    loadGroups();
                    break;
                case 'startCycle':
                    showToast('success', 'Succès', 'Nouveau cycle démarré');
                    loadGroups();
                    break;
                case 'endGroup':
                    showToast('success', 'Succès', 'Groupe clôturé');
                    loadGroups();
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Groupe supprimé');
                    loadGroups();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadReferenceData = () => {
        fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        fetchData(null, 'GET', `${STATUSES_URL}/findall`, 'loadStatuses');
        fetchData(null, 'GET', `${CURRENCIES_URL}/findall`, 'loadCurrencies');
    };

    const loadGroups = () => {
        setLoading(true);
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadGroups');
        setLoading(false);
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setGroup(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setGroup(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setGroup(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : null
        }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setGroup(prev => ({ ...prev, [name]: value || 0 }));
    };

    const validateForm = (): boolean => {
        if (!group.groupName?.trim()) {
            showToast('warn', 'Attention', 'Le nom du groupe est obligatoire');
            return false;
        }
        if (!group.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        if (group.contributionAmount < 1000) {
            showToast('warn', 'Attention', 'La cotisation minimum est de 1 000 FBU');
            return false;
        }
        if (group.maxMembers < 10 || group.maxMembers > 30) {
            showToast('warn', 'Attention', 'Le groupe doit avoir entre 10 et 30 membres');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (group.id) {
            fetchData(group, 'PUT', `${BASE_URL}/update/${group.id}`, 'update');
        } else {
            fetchData(group, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const resetForm = () => {
        setGroup(new TontineGroupClass());
    };

    const viewGroup = (rowData: TontineGroup) => {
        setSelectedGroup(rowData);
        setViewDialog(true);
    };

    const editGroup = (rowData: TontineGroup) => {
        setGroup({ ...rowData });
        setActiveIndex(0);
    };

    const openMemberDialog = (rowData: TontineGroup) => {
        setSelectedGroup(rowData);
        setNewMemberClientId(null);
        setMemberDialog(true);
    };

    const addMember = () => {
        if (selectedGroup && newMemberClientId) {
            fetchData(
                { clientId: newMemberClientId },
                'POST',
                `${BASE_URL}/${selectedGroup.id}/addmember`,
                'addMember'
            );
        }
    };

    const removeMember = (groupId: number, memberId: number) => {
        confirmDialog({
            message: 'Retirer ce membre du groupe ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData({}, 'POST', `${BASE_URL}/${groupId}/removemember/${memberId}`, 'removeMember');
            }
        });
    };

    const startGroup = (rowData: TontineGroup) => {
        confirmDialog({
            message: `Démarrer le groupe "${rowData.groupName}" ? Un premier cycle sera créé automatiquement.`,
            header: 'Démarrer le Groupe',
            icon: 'pi pi-play',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Démarrer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData({}, 'POST', `${BASE_URL}/start/${rowData.id}`, 'startGroup');
            }
        });
    };

    const startNewCycle = (rowData: TontineGroup) => {
        confirmDialog({
            message: `Démarrer un nouveau cycle pour "${rowData.groupName}" ?`,
            header: 'Nouveau Cycle',
            icon: 'pi pi-refresh',
            acceptClassName: 'p-button-info',
            acceptLabel: 'Démarrer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData({}, 'POST', `${BASE_URL}/${rowData.id}/startnewcycle`, 'startCycle');
            }
        });
    };

    const endGroup = (rowData: TontineGroup) => {
        confirmDialog({
            message: `Clôturer le groupe "${rowData.groupName}" ?`,
            header: 'Clôturer le Groupe',
            icon: 'pi pi-times-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Clôturer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData({}, 'POST', `${BASE_URL}/end/${rowData.id}`, 'endGroup');
            }
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const getStatusSeverity = (status: any): 'success' | 'info' | 'warning' | 'danger' => {
        if (!status) return 'info';
        switch (status.code) {
            case 'ACTIVE': return 'success';
            case 'FORMING': return 'warning';
            case 'COMPLETED': return 'info';
            case 'SUSPENDED':
            case 'CLOSED': return 'danger';
            default: return 'info';
        }
    };

    const statusBodyTemplate = (rowData: TontineGroup) => {
        const status = rowData.status;
        return (
            <Tag
                value={status?.name || 'Formation'}
                severity={getStatusSeverity(status)}
            />
        );
    };

    const membersBodyTemplate = (rowData: TontineGroup) => {
        const progress = (rowData.currentMemberCount / rowData.maxMembers) * 100;
        return (
            <div className="flex flex-column gap-1">
                <span className="text-sm">{rowData.currentMemberCount} / {rowData.maxMembers}</span>
                <ProgressBar value={progress} showValue={false} style={{ height: '6px' }} />
            </div>
        );
    };

    const actionsBodyTemplate = (rowData: TontineGroup) => {
        const status = rowData.status?.code;
        const isForming = status === 'FORMING' || !status;
        const isActive = status === 'ACTIVE';
        const canStart = isForming && rowData.currentMemberCount >= 10;

        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewGroup(rowData)}
                    tooltip="Voir"
                />
                {isForming && (
                    <>
                        <Button
                            icon="pi pi-pencil"
                            className="p-button-rounded p-button-warning p-button-sm"
                            onClick={() => editGroup(rowData)}
                            tooltip="Modifier"
                        />
                        <Button
                            icon="pi pi-user-plus"
                            className="p-button-rounded p-button-success p-button-sm"
                            onClick={() => openMemberDialog(rowData)}
                            tooltip="Ajouter membre"
                            disabled={rowData.currentMemberCount >= rowData.maxMembers}
                        />
                        {canStart && (
                            <Button
                                icon="pi pi-play"
                                className="p-button-rounded p-button-success p-button-sm"
                                onClick={() => startGroup(rowData)}
                                tooltip="Démarrer"
                            />
                        )}
                    </>
                )}
                {isActive && (
                    <>
                        <Button
                            icon="pi pi-refresh"
                            className="p-button-rounded p-button-info p-button-sm"
                            onClick={() => startNewCycle(rowData)}
                            tooltip="Nouveau cycle"
                        />
                        <Button
                            icon="pi pi-stop"
                            className="p-button-rounded p-button-danger p-button-sm"
                            onClick={() => endGroup(rowData)}
                            tooltip="Clôturer"
                        />
                    </>
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Groupes de Tontine</h5>
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
                <i className="pi pi-users mr-2"></i>
                Tontine Digitale - Épargne Groupe
            </h4>

            <div className="surface-100 p-3 border-round mb-4">
                <h6 className="m-0 mb-2">
                    <i className="pi pi-info-circle mr-2 text-blue-500"></i>
                    Avantages de la Tontine
                </h6>
                <div className="grid">
                    <div className="col-12 md:col-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-check-circle text-green-500"></i>
                            <span>Discipline d'épargne collective</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-check-circle text-green-500"></i>
                            <span>Pas de frais de gestion</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-check-circle text-green-500"></i>
                            <span>Transparence totale</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-check-circle text-green-500"></i>
                            <span>Historique pour accès crédit</span>
                        </div>
                    </div>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Groupe" leftIcon="pi pi-plus mr-2">
                    <div className="card p-fluid">
                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">
                                <i className="pi pi-info-circle mr-2"></i>
                                Informations du Groupe
                            </h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="groupName" className="font-medium">Nom du Groupe *</label>
                                    <InputText
                                        id="groupName"
                                        name="groupName"
                                        value={group.groupName}
                                        onChange={handleChange}
                                        placeholder="Ex: Twiyunge, Terimbere"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="branchId" className="font-medium">Agence *</label>
                                    <Dropdown
                                        id="branchId"
                                        value={group.branchId}
                                        options={branches}
                                        onChange={(e) => handleDropdownChange('branchId', e.value)}
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder="Sélectionner l'agence"
                                        filter
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12">
                                    <label htmlFor="description" className="font-medium">Description</label>
                                    <InputTextarea
                                        id="description"
                                        name="description"
                                        value={group.description || ''}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="Description du groupe..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">
                                <i className="pi pi-dollar mr-2"></i>
                                Paramètres de Cotisation
                            </h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="contributionAmount" className="font-medium">Cotisation (FBU) *</label>
                                    <InputNumber
                                        id="contributionAmount"
                                        value={group.contributionAmount}
                                        onValueChange={(e) => handleNumberChange('contributionAmount', e.value)}
                                        mode="decimal"
                                        suffix=" FBU"
                                        min={1000}
                                        className="w-full"
                                    />
                                    <small className="text-500">Identique pour tous les membres</small>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="contributionFrequency" className="font-medium">Fréquence *</label>
                                    <Dropdown
                                        id="contributionFrequency"
                                        value={group.contributionFrequency}
                                        options={frequencyOptions}
                                        onChange={(e) => handleDropdownChange('contributionFrequency', e.value)}
                                        placeholder="Sélectionner"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="maxMembers" className="font-medium">Nombre de Membres *</label>
                                    <InputNumber
                                        id="maxMembers"
                                        value={group.maxMembers}
                                        onValueChange={(e) => handleNumberChange('maxMembers', e.value)}
                                        min={10}
                                        max={30}
                                        className="w-full"
                                    />
                                    <small className="text-500">Entre 10 et 30 membres</small>
                                </div>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">
                                <i className="pi pi-calendar mr-2"></i>
                                Réunions et Pénalités
                            </h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="meetingDay" className="font-medium">Jour de Réunion</label>
                                    <Dropdown
                                        id="meetingDay"
                                        value={group.meetingDay}
                                        options={dayOptions}
                                        onChange={(e) => handleDropdownChange('meetingDay', e.value)}
                                        placeholder="Sélectionner"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="meetingLocation" className="font-medium">Lieu de Réunion</label>
                                    <InputText
                                        id="meetingLocation"
                                        name="meetingLocation"
                                        value={group.meetingLocation || ''}
                                        onChange={handleChange}
                                        placeholder="Ex: Bureau de l'agence"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="coordinatorId" className="font-medium">Coordinateur</label>
                                    <Dropdown
                                        id="coordinatorId"
                                        value={group.coordinatorId}
                                        options={clients}
                                        onChange={(e) => handleDropdownChange('coordinatorId', e.value)}
                                        optionLabel={(item) => `${item.firstName} ${item.lastName}`}
                                        optionValue="id"
                                        placeholder="Sélectionner"
                                        filter
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="latePaymentPenaltyRate" className="font-medium">Pénalité Retard (%)</label>
                                    <InputNumber
                                        id="latePaymentPenaltyRate"
                                        value={group.latePaymentPenaltyRate}
                                        onValueChange={(e) => handleNumberChange('latePaymentPenaltyRate', e.value)}
                                        mode="decimal"
                                        suffix=" %"
                                        min={0}
                                        max={100}
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="missedPaymentPenaltyRate" className="font-medium">Pénalité Absence (%)</label>
                                    <InputNumber
                                        id="missedPaymentPenaltyRate"
                                        value={group.missedPaymentPenaltyRate}
                                        onValueChange={(e) => handleNumberChange('missedPaymentPenaltyRate', e.value)}
                                        mode="decimal"
                                        suffix=" %"
                                        min={0}
                                        max={100}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            label={group.id ? 'Mettre à jour' : 'Créer le Groupe'}
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

                <TabPanel header="Liste des Groupes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={groups}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun groupe trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                    >
                        <Column field="groupCode" header="Code" sortable />
                        <Column field="groupName" header="Nom" sortable />
                        <Column field="branch.name" header="Agence" sortable />
                        <Column
                            field="contributionAmount"
                            header="Cotisation"
                            body={(row) => formatCurrency(row.contributionAmount)}
                            sortable
                        />
                        <Column header="Membres" body={membersBodyTemplate} />
                        <Column
                            field="currentCycleNumber"
                            header="Cycle"
                            body={(row) => `${row.currentCycleNumber || 0} / ${row.totalCycles || row.maxMembers}`}
                        />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '200px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog pour ajouter un membre */}
            <Dialog
                header="Ajouter un Membre"
                visible={memberDialog}
                style={{ width: '450px' }}
                onHide={() => setMemberDialog(false)}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setMemberDialog(false)} className="p-button-text" />
                        <Button
                            label="Ajouter"
                            icon="pi pi-user-plus"
                            onClick={addMember}
                            className="p-button-success"
                            disabled={!newMemberClientId}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Groupe: <strong>{selectedGroup?.groupName}</strong><br />
                        Membres: <strong>{selectedGroup?.currentMemberCount} / {selectedGroup?.maxMembers}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="newMemberClientId" className="font-medium">Sélectionner le Client *</label>
                        <Dropdown
                            id="newMemberClientId"
                            value={newMemberClientId}
                            options={clients}
                            onChange={(e) => setNewMemberClientId(e.value)}
                            optionLabel={(item) => `${item.firstName} ${item.lastName} - ${item.clientNumber}`}
                            optionValue="id"
                            placeholder="Rechercher un client..."
                            filter
                            filterPlaceholder="Rechercher..."
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog pour voir les détails */}
            <Dialog
                header="Détails du Groupe de Tontine"
                visible={viewDialog}
                style={{ width: '900px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedGroup && (
                    <div>
                        <div className="grid mb-4">
                            <div className="col-12 md:col-6">
                                <Card title="Informations Générales">
                                    <p><strong>Code:</strong> {selectedGroup.groupCode}</p>
                                    <p><strong>Nom:</strong> {selectedGroup.groupName}</p>
                                    <p><strong>Agence:</strong> {selectedGroup.branch?.name}</p>
                                    <p><strong>Date de Formation:</strong> {selectedGroup.formationDate}</p>
                                    <p><strong>Description:</strong> {selectedGroup.description || '-'}</p>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card title="Paramètres">
                                    <p><strong>Cotisation:</strong> {formatCurrency(selectedGroup.contributionAmount)}</p>
                                    <p><strong>Fréquence:</strong> {selectedGroup.contributionFrequency}</p>
                                    <p><strong>Membres:</strong> {selectedGroup.currentMemberCount} / {selectedGroup.maxMembers}</p>
                                    <p><strong>Cycle actuel:</strong> {selectedGroup.currentCycleNumber} / {selectedGroup.totalCycles}</p>
                                    <p><strong>Cagnotte par cycle:</strong> {formatCurrency(selectedGroup.contributionAmount * selectedGroup.maxMembers)}</p>
                                </Card>
                            </div>
                        </div>

                        {selectedGroup.members && selectedGroup.members.length > 0 && (
                            <Card title="Liste des Membres">
                                <DataTable value={selectedGroup.members} size="small" stripedRows>
                                    <Column field="memberNumber" header="N°" />
                                    <Column
                                        field="client"
                                        header="Membre"
                                        body={(row) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-'}
                                    />
                                    <Column field="payoutOrder" header="Ordre Paiement" />
                                    <Column
                                        field="hasReceivedPayout"
                                        header="A reçu"
                                        body={(row) => row.hasReceivedPayout ? <Tag value="Oui" severity="success" /> : <Tag value="Non" severity="warning" />}
                                    />
                                    <Column
                                        field="totalContributed"
                                        header="Total Cotisé"
                                        body={(row) => formatCurrency(row.totalContributed || 0)}
                                    />
                                    <Column
                                        header="Actions"
                                        body={(row) => (
                                            <Button
                                                icon="pi pi-user-minus"
                                                className="p-button-rounded p-button-danger p-button-sm"
                                                onClick={() => removeMember(selectedGroup.id!, row.id)}
                                                tooltip="Retirer"
                                                disabled={selectedGroup.status?.code !== 'FORMING'}
                                            />
                                        )}
                                    />
                                </DataTable>
                            </Card>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
}

export default TontineGroupPage;
