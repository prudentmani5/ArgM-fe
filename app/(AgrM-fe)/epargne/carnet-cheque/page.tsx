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
import { Dialog } from 'primereact/dialog';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { CheckbookOrder, CheckbookOrderClass, CheckbookOrderStatus } from './CheckbookOrder';
import CheckbookOrderForm from './CheckbookOrderForm';
import PrintableCheckbookReceipt from './PrintableCheckbookReceipt';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';
import { getClientDisplayName } from '@/utils/clientUtils';

const BASE_URL = `${API_BASE_URL}/api/epargne/checkbook-orders`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const INTERNAL_ACCOUNTS_URL = `${API_BASE_URL}/api/comptability/internal-accounts`;

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

function CheckbookOrderPage() {
    const { can } = useAuthorizedAction();
    const [order, setOrder] = useState<CheckbookOrder>(new CheckbookOrderClass());
    const [orders, setOrders] = useState<CheckbookOrder[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [comptesComptables, setComptesComptables] = useState<any[]>([]);
    const [comptesCommission, setComptesCommission] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [deliverDialog, setDeliverDialog] = useState(false);
    const [printDialog, setPrintDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<CheckbookOrder | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [deliveredToName, setDeliveredToName] = useState('');
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const branchesApi = useConsumApi('');
    const savingsApi = useConsumApi('');
    const comptesApi = useConsumApi('');
    const ordersApi = useConsumApi('');
    const actionsApi = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadOrders();
    }, []);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        }
        if (branchesApi.error) {
            showToast('error', 'Erreur', branchesApi.error.message || 'Erreur lors du chargement des agences');
        }
    }, [branchesApi.data, branchesApi.error]);

    // Handle savings accounts data
    useEffect(() => {
        if (savingsApi.data) {
            setSavingsAccounts(Array.isArray(savingsApi.data) ? savingsApi.data : []);
        }
        if (savingsApi.error) {
            showToast('error', 'Erreur', savingsApi.error.message || 'Erreur lors du chargement des comptes');
        }
    }, [savingsApi.data, savingsApi.error]);

    // Handle internal accounts data
    useEffect(() => {
        if (comptesApi.data) {
            const data = Array.isArray(comptesApi.data) ? comptesApi.data : [];
            const mapAccount = (a: any) => ({
                compteId: a.compteComptableId,
                codeCompte: a.codeCompte,
                libelle: `${a.accountNumber} - ${a.libelle} (${a.codeCompte})`
            });
            // Compte coût du carnet: 603
            const costAccounts = data.filter((a: any) => a.actif !== false && a.codeCompte === '603').map(mapAccount);
            setComptesComptables(costAccounts);
            if (costAccounts.length > 0) {
                setOrder(prev => prev.accountingAccountId ? prev : { ...prev, accountingAccountId: costAccounts[0].compteId });
            }
            // Compte commission / revenus: 706
            const feeAccounts = data.filter((a: any) => a.actif !== false && a.codeCompte === '706').map(mapAccount);
            setComptesCommission(feeAccounts);
            if (feeAccounts.length > 0) {
                setOrder(prev => prev.feeAccountId ? prev : { ...prev, feeAccountId: feeAccounts[0].compteId });
            }
        }
        if (comptesApi.error) {
            showToast('error', 'Erreur', comptesApi.error.message || 'Erreur lors du chargement des comptes internes');
        }
    }, [comptesApi.data, comptesApi.error]);

    // Handle orders data
    useEffect(() => {
        if (ordersApi.data) {
            const data = Array.isArray(ordersApi.data) ? ordersApi.data : ordersApi.data?.content || [];
            setOrders(data);
            setLoading(false);
        }
        if (ordersApi.error) {
            showToast('error', 'Erreur', ordersApi.error.message || 'Erreur lors du chargement des commandes');
            setLoading(false);
        }
    }, [ordersApi.data, ordersApi.error]);

    // Handle actions
    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Commande créée avec succès');
                    resetForm();
                    loadOrders();
                    setActiveIndex(1);
                    break;
                case 'validate':
                    showToast('success', 'Succès', 'Commande validée avec succès');
                    loadOrders();
                    break;
                case 'reject':
                    showToast('success', 'Succès', 'Commande rejetée');
                    setRejectDialog(false);
                    loadOrders();
                    break;
                case 'cancel':
                    showToast('success', 'Succès', 'Commande annulée');
                    loadOrders();
                    break;
                case 'receive':
                    showToast('success', 'Succès', 'Carnet marqué comme reçu');
                    loadOrders();
                    break;
                case 'deliver':
                    showToast('success', 'Succès', 'Carnet livré au client');
                    setDeliverDialog(false);
                    loadOrders();
                    break;
            }
        }
        if (actionsApi.error) {
            showToast('error', 'Erreur', actionsApi.error.message || 'Une erreur est survenue');
        }
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    const loadReferenceData = () => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/findallactive`, 'loadSavingsAccounts');
        comptesApi.fetchData(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findactive`, 'loadComptes');
    };

    const loadOrders = () => {
        setLoading(true);
        ordersApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadOrders');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleSavingsAccountChange = (accountId: number) => {
        if (accountId) {
            const selectedAccount = savingsAccounts.find(acc => acc.id === accountId);
            if (selectedAccount && selectedAccount.client) {
                setOrder(prev => ({
                    ...prev,
                    savingsAccountId: accountId,
                    clientId: selectedAccount.client.id,
                    branchId: selectedAccount.branch?.id || prev.branchId
                }));
            }
        }
    };

    const validateForm = (): boolean => {
        if (!order.savingsAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un compte d\'épargne');
            return false;
        }
        if (!order.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        if (!order.accountingAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte comptable de destination');
            return false;
        }
        if (!order.unitPrice || order.unitPrice <= 0) {
            showToast('warn', 'Attention', 'Le prix doit être supérieur à 0');
            return false;
        }
        if (order.feeAmount && order.feeAmount > 0 && !order.feeAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte de commission (revenus)');
            return false;
        }
        // Check balance (total = price + fee)
        const totalToDebit = (order.unitPrice || 0) + (order.feeAmount || 0);
        const selectedAccount = savingsAccounts.find(acc => acc.id === order.savingsAccountId);
        if (selectedAccount) {
            const balance = selectedAccount.currentBalance || 0;
            if (balance < totalToDebit) {
                showToast('warn', 'Attention', `Solde insuffisant. Solde actuel: ${formatCurrency(balance)}, Montant requis: ${formatCurrency(totalToDebit)}`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const selectedAccount = savingsAccounts.find(acc => acc.id === order.savingsAccountId);
        const selectedCostCompte = comptesComptables.find((c: any) => c.compteId === order.accountingAccountId);
        const selectedFeeCompte = comptesCommission.find((c: any) => c.compteId === order.feeAccountId);
        const orderData = {
            ...order,
            clientId: selectedAccount?.client?.id || order.clientId,
            accountingAccountCode: selectedCostCompte?.codeCompte || '603',
            feeAccountCode: selectedFeeCompte?.codeCompte || '706',
            userAction: getCurrentUser()
        };
        actionsApi.fetchData(orderData, 'POST', `${BASE_URL}/new`, 'create');
    };

    const resetForm = () => {
        const autoCost = comptesComptables.find((c: any) => c.codeCompte === '603');
        const autoFee = comptesCommission.find((c: any) => c.codeCompte === '706');
        setOrder({ ...new CheckbookOrderClass(), accountingAccountId: autoCost?.compteId, feeAccountId: autoFee?.compteId });
    };

    const viewOrder = (rowData: CheckbookOrder) => {
        const clientId = rowData.clientId || rowData.client?.id;
        const branchId = rowData.branchId || rowData.branch?.id;
        setSelectedOrder({
            ...rowData,
            clientId,
            branchId
        });
        setViewDialog(true);
    };

    const validateOrder = (rowData: CheckbookOrder) => {
        confirmDialog({
            message: `Confirmer la validation de la commande ${rowData.orderNumber} pour un montant de ${formatCurrency(rowData.totalAmount)} ?`,
            header: 'Valider la Commande',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, valider',
            rejectLabel: 'Annuler',
            accept: () => {
                actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/validate/${rowData.id}`, 'validate');
            }
        });
    };

    const openRejectDialog = (rowData: CheckbookOrder) => {
        setSelectedOrder(rowData);
        setRejectionReason('');
        setRejectDialog(true);
    };

    const handleReject = () => {
        if (selectedOrder && rejectionReason) {
            actionsApi.fetchData(
                { rejectionReason, userAction: getCurrentUser() },
                'POST',
                `${BASE_URL}/reject/${selectedOrder.id}`,
                'reject'
            );
        }
    };

    const cancelOrder = (rowData: CheckbookOrder) => {
        confirmDialog({
            message: `Confirmer l'annulation de la commande ${rowData.orderNumber} ?`,
            header: 'Annuler la Commande',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, annuler',
            rejectLabel: 'Non',
            accept: () => {
                actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/cancel/${rowData.id}`, 'cancel');
            }
        });
    };

    const receiveOrder = (rowData: CheckbookOrder) => {
        confirmDialog({
            message: `Confirmer la réception du carnet de chèques ${rowData.orderNumber} ?`,
            header: 'Réception du Carnet',
            icon: 'pi pi-inbox',
            acceptClassName: 'p-button-info',
            acceptLabel: 'Oui, marquer reçu',
            rejectLabel: 'Non',
            accept: () => {
                actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/receive/${rowData.id}`, 'receive');
            }
        });
    };

    const openDeliverDialog = (rowData: CheckbookOrder) => {
        setSelectedOrder(rowData);
        const clientName = getClientDisplayName(rowData.client);
        setDeliveredToName(clientName === '-' ? '' : clientName);
        setDeliverDialog(true);
    };

    const handleDeliver = () => {
        if (selectedOrder) {
            actionsApi.fetchData(
                { deliveredToName, userAction: getCurrentUser() },
                'POST',
                `${BASE_URL}/deliver/${selectedOrder.id}`,
                'deliver'
            );
        }
    };

    const openPrintDialog = (rowData: CheckbookOrder) => {
        setSelectedOrder(rowData);
        setPrintDialog(true);
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML.replace(
                /src="\/layout\//g,
                `src="${window.location.origin}/layout/`
            );
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Commande Carnet - ${selectedOrder?.orderNumber}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: Arial, sans-serif; padding: 15mm; }
                            @page { margin: 15mm; }
                            @media print {
                                body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '0 FBU';
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const statusBodyTemplate = (rowData: CheckbookOrder) => {
        let severity: 'success' | 'info' | 'warning' | 'danger' = 'info';
        let label = rowData.status;
        switch (rowData.status) {
            case CheckbookOrderStatus.PENDING: severity = 'warning'; label = 'En attente'; break;
            case CheckbookOrderStatus.VALIDATED: severity = 'info'; label = 'Validé'; break;
            case CheckbookOrderStatus.RECEIVED: severity = 'success'; label = 'Reçu'; break;
            case CheckbookOrderStatus.DELIVERED: severity = 'success'; label = 'Livré'; break;
            case CheckbookOrderStatus.REJECTED: severity = 'danger'; label = 'Rejeté'; break;
            case CheckbookOrderStatus.CANCELLED: severity = 'danger'; label = 'Annulé'; break;
        }
        return <Tag value={label} severity={severity} />;
    };

    const clientBodyTemplate = (rowData: CheckbookOrder) => {
        return getClientDisplayName(rowData.client);
    };

    const actionsBodyTemplate = (rowData: CheckbookOrder) => {
        const isPending = rowData.status === CheckbookOrderStatus.PENDING;
        const isValidated = rowData.status === CheckbookOrderStatus.VALIDATED;
        const isReceived = rowData.status === CheckbookOrderStatus.RECEIVED;
        const isDelivered = rowData.status === CheckbookOrderStatus.DELIVERED;
        const canPrint = isValidated || isReceived || isDelivered;

        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewOrder(rowData)}
                    tooltip="Voir"
                />
                {isPending && can('EPARGNE_CHECKBOOK_VALIDATE') && (
                    <Button
                        icon="pi pi-check"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => validateOrder(rowData)}
                        tooltip="Valider"
                    />
                )}
                {isPending && can('EPARGNE_CHECKBOOK_VALIDATE') && (
                    <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => openRejectDialog(rowData)}
                        tooltip="Rejeter"
                    />
                )}
                {isPending && (
                    <Button
                        icon="pi pi-ban"
                        className="p-button-rounded p-button-warning p-button-sm"
                        onClick={() => cancelOrder(rowData)}
                        tooltip="Annuler"
                    />
                )}
                {isValidated && can('EPARGNE_CHECKBOOK_RECEIVE') && (
                    <Button
                        icon="pi pi-inbox"
                        className="p-button-rounded p-button-info p-button-sm"
                        onClick={() => receiveOrder(rowData)}
                        tooltip="Marquer reçu"
                    />
                )}
                {isReceived && can('EPARGNE_CHECKBOOK_DELIVER') && (
                    <Button
                        icon="pi pi-send"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => openDeliverDialog(rowData)}
                        tooltip="Livrer au client"
                    />
                )}
                {canPrint && (
                    <Button
                        icon="pi pi-print"
                        className="p-button-rounded p-button-secondary p-button-sm"
                        onClick={() => openPrintDialog(rowData)}
                        tooltip="Imprimer"
                    />
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Commandes de Carnets</h5>
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
                Commande de Carnet de Chèques
            </h4>

            <div className="surface-100 p-3 border-round mb-4">
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span><strong>Prix par défaut:</strong> 5 000 FBU</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-orange-500"></i>
                            <span><strong>Commission:</strong> Configurable (compte 706)</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-green-500"></i>
                            <span><strong>Cycle:</strong> Création → Validation → Réception → Livraison</span>
                        </div>
                    </div>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Commande" leftIcon="pi pi-plus mr-2">
                    <CheckbookOrderForm
                        order={order}
                        setOrder={setOrder}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        comptesComptables={comptesComptables}
                        comptesCommission={comptesCommission}
                        onSavingsAccountChange={handleSavingsAccountChange}
                    />
                    <div className="flex gap-2 mt-4">
                        <Button
                            label="Créer la Commande"
                            icon="pi pi-save"
                            onClick={handleSubmit}
                            className="p-button-success"
                            disabled={!can('EPARGNE_CHECKBOOK_CREATE')}
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={resetForm}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Commandes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={orders}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucune commande trouvée"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="orderDate"
                        sortOrder={-1}
                    >
                        <Column field="orderNumber" header="N° Commande" sortable />
                        <Column field="client" header="Client" body={clientBodyTemplate} sortable />
                        <Column field="orderDate" header="Date" sortable />
                        <Column field="numberOfLeaves" header="Feuilles" sortable />
                        <Column
                            field="unitPrice"
                            header="Prix Carnet"
                            sortable
                            body={(row) => formatCurrency(row.unitPrice)}
                        />
                        <Column
                            field="feeAmount"
                            header="Commission"
                            sortable
                            body={(row) => row.feeAmount > 0 ? formatCurrency(row.feeAmount) : '-'}
                        />
                        <Column
                            field="totalAmount"
                            header="Total"
                            sortable
                            body={(row) => <span className="font-bold">{formatCurrency(row.totalAmount)}</span>}
                        />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '250px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* View Dialog */}
            <Dialog
                header="Détails de la Commande"
                visible={viewDialog}
                style={{ width: '800px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedOrder && (
                    <CheckbookOrderForm
                        order={selectedOrder}
                        setOrder={() => {}}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        comptesComptables={comptesComptables}
                        comptesCommission={comptesCommission}
                        isViewMode={true}
                    />
                )}
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                header="Rejeter la Commande"
                visible={rejectDialog}
                style={{ width: '450px' }}
                onHide={() => setRejectDialog(false)}
                footer={
                    <div>
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setRejectDialog(false)} className="p-button-text" />
                        <Button
                            label="Rejeter"
                            icon="pi pi-ban"
                            onClick={handleReject}
                            className="p-button-danger"
                            disabled={!rejectionReason}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Commande: <strong>{selectedOrder?.orderNumber}</strong><br />
                        Montant: <strong>{formatCurrency(selectedOrder?.totalAmount)}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="rejectionReason" className="font-medium">Motif du rejet *</label>
                        <InputTextarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            placeholder="Expliquez la raison du rejet..."
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Deliver Dialog */}
            <Dialog
                header="Livraison du Carnet"
                visible={deliverDialog}
                style={{ width: '450px' }}
                onHide={() => setDeliverDialog(false)}
                footer={
                    <div>
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setDeliverDialog(false)} className="p-button-text" />
                        <Button
                            label="Confirmer la livraison"
                            icon="pi pi-check"
                            onClick={handleDeliver}
                            className="p-button-success"
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Commande: <strong>{selectedOrder?.orderNumber}</strong><br />
                        Client: <strong>{getClientDisplayName(selectedOrder?.client)}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="deliveredToName" className="font-medium">Remis à (nom du bénéficiaire)</label>
                        <InputText
                            id="deliveredToName"
                            value={deliveredToName}
                            onChange={(e) => setDeliveredToName(e.target.value)}
                            placeholder="Nom de la personne qui récupère le carnet..."
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Print Dialog */}
            <Dialog
                header="Aperçu du Reçu"
                visible={printDialog}
                style={{ width: '900px' }}
                onHide={() => setPrintDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Fermer"
                            icon="pi pi-times"
                            onClick={() => setPrintDialog(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Imprimer"
                            icon="pi pi-print"
                            onClick={handlePrint}
                            className="p-button-success"
                        />
                    </div>
                }
            >
                {selectedOrder && (
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        <PrintableCheckbookReceipt
                            ref={printRef}
                            order={selectedOrder}
                            companyName=" AGRINOVA MICROFINANCE"
                            companyAddress="Bujumbura, Burundi"
                            companyPhone="+257 22 XX XX XX"
                        />
                    </div>
                )}
            </Dialog>
        </div>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_VIEW']}>
            <CheckbookOrderPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
