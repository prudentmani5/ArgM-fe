'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Chip } from 'primereact/chip';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { AppUserResponse, getFullName, getAccountStatusLabel, getAccountStatusSeverity } from '../types';
import { API_BASE_URL } from '../../../../utils/apiConfig';

const UsersPage = () => {
    const baseUrl = API_BASE_URL;

    // State for data
    const [users, setUsers] = useState<AppUserResponse[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<AppUserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<AppUserResponse | null>(null);

    // State for lazy loading
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');

    // State for dialogs
    const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 5000
        });
    };

    // Load all users
    const loadUsers = () => {
        fetchData(null, 'GET', `${baseUrl}/api/users`, 'loadUsers');
    };

    // Initial load
    useEffect(() => {
        loadUsers();
    }, []);

    // Handle API responses
    useEffect(() => {
        if (data) {
            setBtnLoading(false);

            if (callType === 'loadUsers') {
                const usersData = Array.isArray(data) ? data : [];
                setUsers(usersData);
                setFilteredUsers(usersData);
                setTotalRecords(usersData.length);
            } else if (callType === 'resetPassword') {
                showMessage('success', 'Succès', 'Mot de passe réinitialisé avec succès à "gps123GPS"');
                setResetPasswordDialog(false);
                loadUsers();
            }
        }

        if (error) {
            setBtnLoading(false);
            const errorMessage = error.message || 'Une erreur s\'est produite';
            showMessage('error', 'Erreur', errorMessage);
        }
    }, [data, error, callType]);

    // Handle search by username
    useEffect(() => {
        if (!searchTerm) {
            setFilteredUsers(users);
            setTotalRecords(users.length);
            return;
        }

        const filtered = users.filter(user =>
            getFullName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
        setTotalRecords(filtered.length);
        setFirst(0); // Reset to first page when searching
    }, [searchTerm, users]);

    // Handle page change
    const onPage = (event: DataTablePageEvent) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    // Handle password reset
    const confirmResetPassword = (user: AppUserResponse) => {
        setSelectedUser(user);
        setResetPasswordDialog(true);
    };

    const handleResetPassword = () => {
        if (!selectedUser) return;

        setBtnLoading(true);
        fetchData(null, 'PATCH', `${baseUrl}/api/users/${selectedUser.id}/reset-password`, 'resetPassword');
    };

    // Column templates
    const nameBodyTemplate = (rowData: AppUserResponse) => {
        return (
            <div>
                <div className="font-semibold">{getFullName(rowData)}</div>
                <div className="text-sm text-500">{rowData.email}</div>
            </div>
        );
    };

    const roleBodyTemplate = (rowData: AppUserResponse) => {
        return (
            <div>
                <div className="font-semibold">{rowData.roleName}</div>
                <div className="text-sm text-500">{rowData.roleDescription}</div>
            </div>
        );
    };

    const authoritiesBodyTemplate = (rowData: AppUserResponse) => {
        // Handle both string[] and AuthorityResponse[] formats
        const getAuthorityLabel = (auth: any): string => {
            if (typeof auth === 'string') return auth;
            if (auth && typeof auth === 'object' && auth.code) return auth.code;
            return String(auth);
        };

        return (
            <div className="flex flex-wrap gap-1">
                {rowData.authorities.slice(0, 2).map((auth, idx) => (
                    <Chip key={idx} label={getAuthorityLabel(auth)} className="text-xs" />
                ))}
                {rowData.authorities.length > 2 && (
                    <Chip label={`+${rowData.authorities.length - 2}`} className="text-xs" />
                )}
            </div>
        );
    };

    const statusBodyTemplate = (rowData: AppUserResponse) => {
        return (
            <Tag
                value={getAccountStatusLabel(rowData)}
                severity={getAccountStatusSeverity(rowData)}
            />
        );
    };

    const createdAtBodyTemplate = (rowData: AppUserResponse) => {
        if (!rowData.createdAt) return '-';
        return new Date(rowData.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const lastLoginBodyTemplate = (rowData: AppUserResponse) => {
        if (!rowData.lastLoginAt) return '-';
        return new Date(rowData.lastLoginAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const actionsTemplate = (rowData: AppUserResponse) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-key"
                    rounded
                    outlined
                    severity="warning"
                    onClick={() => confirmResetPassword(rowData)}
                    tooltip="Réinitialiser mot de passe"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    // Render search header
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <div className="flex align-items-center gap-2">
                    <h5 className="m-0">Tous les Utilisateurs</h5>
                    <Button
                        icon="pi pi-refresh"
                        rounded
                        outlined
                        onClick={loadUsers}
                        loading={loading}
                    />
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Rechercher par nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '300px' }}
                    />
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <h5 className="mb-2">Gestion des Utilisateurs</h5>
                        <p className="text-600 mb-4">
                            Recherchez et gérez tous les utilisateurs du système. Vous pouvez réinitialiser leurs mots de passe.
                        </p>

                        <DataTable
                            value={filteredUsers}
                            loading={loading}
                            header={renderHeader()}
                            emptyMessage="Aucun utilisateur trouvé"
                            paginator
                            lazy={false}
                            first={first}
                            rows={rows}
                            totalRecords={totalRecords}
                            onPage={onPage}
                            rowsPerPageOptions={[10, 20, 30, 50]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
                            globalFilter={globalFilter}
                            sortMode="multiple"
                        >
                            <Column
                                field="firstname"
                                header="Utilisateur"
                                body={nameBodyTemplate}
                                sortable
                                filter
                                filterPlaceholder="Rechercher par nom"
                            />
                            <Column
                                field="phoneNumber"
                                header="Téléphone"
                                sortable
                            />
                            <Column
                                field="roleName"
                                header="Rôle"
                                body={roleBodyTemplate}
                                sortable
                            />
                            <Column
                                header="Autorisations"
                                body={authoritiesBodyTemplate}
                            />
                            <Column
                                header="Statut"
                                body={statusBodyTemplate}
                                sortable
                            />
                            <Column
                                field="createdAt"
                                header="Date de création"
                                body={createdAtBodyTemplate}
                                sortable
                            />
                            <Column
                                field="lastLoginAt"
                                header="Dernière connexion"
                                body={lastLoginBodyTemplate}
                                sortable
                            />
                            <Column
                                header="Actions"
                                body={actionsTemplate}
                                exportable={false}
                                style={{ width: '100px' }}
                            />
                        </DataTable>
                    </div>
                </div>
            </div>

            {/* Reset Password Confirmation Dialog */}
            <Dialog
                header="Réinitialiser le mot de passe"
                visible={resetPasswordDialog}
                style={{ width: '450px' }}
                modal
                onHide={() => setResetPasswordDialog(false)}
            >
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-yellow-500" style={{ fontSize: '3rem' }} />
                    {selectedUser && (
                        <div>
                            <p className="m-0">
                                Voulez-vous réinitialiser le mot de passe de{' '}
                                <strong>{getFullName(selectedUser)}</strong> ?
                            </p>
                            <p className="m-0 mt-2 text-sm text-500">
                                Email: {selectedUser.email}<br />
                                Le nouveau mot de passe sera: <strong>gps123GPS</strong>
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        outlined
                        onClick={() => setResetPasswordDialog(false)}
                    />
                    <Button
                        label="Réinitialiser"
                        icon="pi pi-key"
                        severity="warning"
                        onClick={handleResetPassword}
                        loading={btnLoading}
                    />
                </div>
            </Dialog>
        </>
    );
};

export default UsersPage;
