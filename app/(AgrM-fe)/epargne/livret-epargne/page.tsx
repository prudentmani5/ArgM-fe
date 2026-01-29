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
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import Cookies from 'js-cookie';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { Passbook, PassbookClass } from './Passbook';
import PassbookForm from './PassbookForm';

const BASE_URL = `${API_BASE_URL}/api/epargne/passbooks`;
const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const STATUSES_URL = `${API_BASE_URL}/api/epargne/passbook-statuses`;

function PassbookPage() {
    const [passbook, setPassbook] = useState<Passbook>(new PassbookClass());
    const [passbooks, setPassbooks] = useState<Passbook[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [passbookStatuses, setPassbookStatuses] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [lostDialog, setLostDialog] = useState(false);
    const [replaceDialog, setReplaceDialog] = useState(false);
    const [selectedPassbook, setSelectedPassbook] = useState<Passbook | null>(null);
    const [policeReportNumber, setPoliceReportNumber] = useState('');
    const [replacementReason, setReplacementReason] = useState('');
    const [replacementFeePaid, setReplacementFeePaid] = useState(5000);
    const toast = useRef<Toast>(null);

    // Separate hook instances for each data type to avoid race conditions
    const clientsApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const statusesApi = useConsumApi('');
    const passbooksApi = useConsumApi('');
    const savingsApi = useConsumApi('');
    const actionsApi = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadPassbooks();
    }, []);

    // Handle clients data
    useEffect(() => {
        if (clientsApi.data) {
            setClients(Array.isArray(clientsApi.data) ? clientsApi.data : clientsApi.data.content || []);
        }
        if (clientsApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des clients');
        }
    }, [clientsApi.data, clientsApi.error]);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        }
        if (branchesApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des agences');
        }
    }, [branchesApi.data, branchesApi.error]);

    // Handle statuses data
    useEffect(() => {
        if (statusesApi.data) {
            setPassbookStatuses(Array.isArray(statusesApi.data) ? statusesApi.data : []);
        }
        if (statusesApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des statuts');
        }
    }, [statusesApi.data, statusesApi.error]);

    // Handle passbooks data
    useEffect(() => {
        if (passbooksApi.data) {
            setPassbooks(Array.isArray(passbooksApi.data) ? passbooksApi.data : passbooksApi.data.content || []);
            setLoading(false);
        }
        if (passbooksApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des livrets');
            setLoading(false);
        }
    }, [passbooksApi.data, passbooksApi.error]);

    // Handle savings accounts data
    useEffect(() => {
        if (savingsApi.data) {
            setSavingsAccounts(Array.isArray(savingsApi.data) ? savingsApi.data : []);
        }
        if (savingsApi.error) {
            showToast('error', 'Erreur', 'Erreur lors du chargement des comptes d\'épargne');
        }
    }, [savingsApi.data, savingsApi.error]);

    // Handle actions (create, update, delete, etc.)
    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Livret créé avec succès');
                    resetForm();
                    loadPassbooks();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Livret mis à jour avec succès');
                    resetForm();
                    loadPassbooks();
                    setActiveIndex(1);
                    break;
                case 'reportLost':
                    showToast('success', 'Succès', 'Livret déclaré perdu avec succès');
                    setLostDialog(false);
                    loadPassbooks();
                    break;
                case 'replace':
                    showToast('success', 'Succès', 'Livret remplacé avec succès');
                    setReplaceDialog(false);
                    loadPassbooks();
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Livret supprimé avec succès');
                    loadPassbooks();
                    break;
            }
        }
        if (actionsApi.error) {
            showToast('error', 'Erreur', actionsApi.error.message || 'Une erreur est survenue');
        }
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    const loadReferenceData = () => {
        clientsApi.fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        statusesApi.fetchData(null, 'GET', `${STATUSES_URL}/findall`, 'loadStatuses');
    };

    const loadPassbooks = () => {
        setLoading(true);
        passbooksApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadPassbooks');
    };

    const loadSavingsAccountsByClient = (clientId: number) => {
        if (clientId) {
            savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/findactivebyclient/${clientId}`, 'loadSavingsAccounts');
        }
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Get current user from cookies
    const getCurrentUser = (): string => {
        try {
            const appUserCookie = Cookies.get('appUser');
            if (appUserCookie) {
                const appUser = JSON.parse(appUserCookie);
                return `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim() || appUser.email || 'Unknown';
            }
        } catch (e) {
            console.error('Error parsing appUser cookie:', e);
        }
        return 'Unknown';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPassbook(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setPassbook(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setPassbook(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : null
        }));
    };

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setPassbook(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setPassbook(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!passbook.clientId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un client');
            return false;
        }
        if (!passbook.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        if (!passbook.savingsAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un compte d\'épargne');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        // Add user action info
        const currentUser = getCurrentUser();
        const passbookWithUser = {
            ...passbook,
            userAction: currentUser
        };

        if (passbook.id) {
            actionsApi.fetchData(passbookWithUser, 'PUT', `${BASE_URL}/update/${passbook.id}`, 'update');
        } else {
            actionsApi.fetchData(passbookWithUser, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const resetForm = () => {
        setPassbook(new PassbookClass());
        setSavingsAccounts([]);
    };

    const viewPassbook = (rowData: Passbook) => {
        // Set IDs from nested objects for proper dropdown display
        const clientId = rowData.client?.id || rowData.clientId;
        setSelectedPassbook({
            ...rowData,
            clientId: clientId,
            branchId: rowData.branch?.id || rowData.branchId,
            statusId: rowData.status?.id || rowData.statusId
        });
        // Load savings accounts for the client to display in the dropdown
        if (clientId) {
            loadSavingsAccountsByClient(clientId);
        }
        setViewDialog(true);
    };

    const editPassbook = (rowData: Passbook) => {
        // Extract IDs from nested objects
        const clientId = rowData.client?.id || rowData.clientId;
        setPassbook({
            ...rowData,
            clientId: clientId,
            branchId: rowData.branch?.id || rowData.branchId,
            statusId: rowData.status?.id || rowData.statusId
        });
        if (clientId) {
            loadSavingsAccountsByClient(clientId);
        }
        setActiveIndex(0);
    };

    const openLostDialog = (rowData: Passbook) => {
        setSelectedPassbook(rowData);
        setPoliceReportNumber('');
        setLostDialog(true);
    };

    const openReplaceDialog = (rowData: Passbook) => {
        setSelectedPassbook(rowData);
        setReplacementReason('');
        setReplacementFeePaid(5000);
        setReplaceDialog(true);
    };

    const handleReportLost = () => {
        if (selectedPassbook) {
            actionsApi.fetchData(
                { policeReportNumber },
                'POST',
                `${BASE_URL}/reportlost/${selectedPassbook.id}`,
                'reportLost'
            );
        }
    };

    const handleReplace = () => {
        if (selectedPassbook) {
            actionsApi.fetchData(
                { replacementReason, replacementFeePaid },
                'POST',
                `${BASE_URL}/replace/${selectedPassbook.id}`,
                'replace'
            );
        }
    };

    const confirmDelete = (rowData: Passbook) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le livret "${rowData.passbookNumber}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                actionsApi.fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: Passbook) => {
        const status = rowData.status;
        let severity: 'success' | 'info' | 'warning' | 'danger' = 'info';
        if (status?.code === 'ACTIVE' || status?.code === 'ACTIF') severity = 'success';
        else if (status?.code === 'LOST' || status?.code === 'PERDU') severity = 'danger';
        else if (status?.code === 'CLOSED' || status?.code === 'FERME') severity = 'warning';

        return (
            <Tag value={status?.nameFr || status?.name || 'N/A'} severity={severity} />
        );
    };

    const lostBodyTemplate = (rowData: Passbook) => {
        const isLost = !!rowData.reportedLostDate;
        return isLost ? (
            <Tag value="Perdu" severity="danger" icon="pi pi-exclamation-triangle" />
        ) : (
            <Tag value="En possession" severity="success" />
        );
    };

    const pagesBodyTemplate = (rowData: Passbook) => {
        const usedPercent = Math.round((rowData.pagesUsed / rowData.pagesTotal) * 100);
        return (
            <span className={usedPercent > 80 ? 'text-orange-500 font-semibold' : ''}>
                {rowData.pagesUsed}/{rowData.pagesTotal} ({usedPercent}%)
            </span>
        );
    };

    const actionsBodyTemplate = (rowData: Passbook) => {
        const isLost = !!rowData.reportedLostDate;
        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewPassbook(rowData)}
                    tooltip="Voir"
                />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-warning p-button-sm"
                    onClick={() => editPassbook(rowData)}
                    tooltip="Modifier"
                />
                {!isLost && (
                    <Button
                        icon="pi pi-exclamation-triangle"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => openLostDialog(rowData)}
                        tooltip="Déclarer perdu"
                    />
                )}
                {isLost && (
                    <Button
                        icon="pi pi-refresh"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => openReplaceDialog(rowData)}
                        tooltip="Remplacer"
                    />
                )}
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
            <h5 className="m-0">Liste des Livrets d'Épargne</h5>
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
                <i className="pi pi-book mr-2"></i>
                Gestion des Livrets d'Épargne
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Livret" leftIcon="pi pi-plus mr-2">
                    <PassbookForm
                        passbook={passbook}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        handleCheckboxChange={handleCheckboxChange}
                        clients={clients}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        passbookStatuses={passbookStatuses}
                        onClientChange={loadSavingsAccountsByClient}
                    />
                    <div className="flex gap-2 mt-4">
                        <Button
                            label={passbook.id ? 'Mettre à jour' : 'Créer le Livret'}
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

                <TabPanel header="Liste des Livrets" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={passbooks}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun livret trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                    >
                        <Column field="passbookNumber" header="N° Livret" sortable />
                        <Column
                            field="client"
                            header="Client"
                            sortable
                            body={(row) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-'}
                        />
                        <Column field="branch.name" header="Agence" sortable />
                        <Column field="issueDate" header="Date d'Émission" sortable />
                        <Column header="Pages" body={pagesBodyTemplate} />
                        <Column header="État" body={lostBodyTemplate} />
                        <Column field="status" header="Statut" body={statusBodyTemplate} />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '200px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog pour déclarer perdu */}
            <Dialog
                header="Déclarer le Livret Perdu"
                visible={lostDialog}
                style={{ width: '450px' }}
                onHide={() => setLostDialog(false)}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setLostDialog(false)} className="p-button-text" />
                        <Button label="Confirmer" icon="pi pi-check" onClick={handleReportLost} className="p-button-danger" />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Livret: <strong>{selectedPassbook?.passbookNumber}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="policeReportNumber" className="font-medium">N° Rapport de Police</label>
                        <InputText
                            id="policeReportNumber"
                            value={policeReportNumber}
                            onChange={(e) => setPoliceReportNumber(e.target.value)}
                            placeholder="Ex: RP/2024/001234"
                            className="w-full"
                        />
                        <small className="text-500">Optionnel mais recommandé</small>
                    </div>
                </div>
            </Dialog>

            {/* Dialog pour remplacer */}
            <Dialog
                header="Remplacer le Livret"
                visible={replaceDialog}
                style={{ width: '450px' }}
                onHide={() => setReplaceDialog(false)}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setReplaceDialog(false)} className="p-button-text" />
                        <Button label="Créer Nouveau Livret" icon="pi pi-plus" onClick={handleReplace} className="p-button-success" />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Ancien livret: <strong>{selectedPassbook?.passbookNumber}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="replacementReason" className="font-medium">Motif du Remplacement *</label>
                        <InputTextarea
                            id="replacementReason"
                            value={replacementReason}
                            onChange={(e) => setReplacementReason(e.target.value)}
                            rows={3}
                            placeholder="Ex: Livret déclaré perdu, demande de remplacement"
                            className="w-full"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="replacementFeePaid" className="font-medium">Frais de Remplacement (FBU)</label>
                        <InputNumber
                            id="replacementFeePaid"
                            value={replacementFeePaid}
                            onValueChange={(e) => setReplacementFeePaid(e.value || 0)}
                            mode="decimal"
                            suffix=" FBU"
                            min={0}
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog pour voir les détails */}
            <Dialog
                header="Détails du Livret"
                visible={viewDialog}
                style={{ width: '700px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedPassbook && (
                    <PassbookForm
                        passbook={selectedPassbook}
                        handleChange={() => {}}
                        handleDropdownChange={() => {}}
                        handleDateChange={() => {}}
                        handleNumberChange={() => {}}
                        handleCheckboxChange={() => {}}
                        clients={clients}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        passbookStatuses={passbookStatuses}
                        isViewMode={true}
                    />
                )}
            </Dialog>
        </div>
    );
}

export default PassbookPage;
