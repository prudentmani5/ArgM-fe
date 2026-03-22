'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ProtectedPage } from '@/components/ProtectedPage';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Chip } from 'primereact/chip';
import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { AppUserResponse, AppUserRoleResponse, getFullName, getAccountStatusLabel, getAccountStatusSeverity } from '../types';
import { API_BASE_URL } from '../../../../utils/apiConfig';

const UsersPage = () => {
    const baseUrl = API_BASE_URL;

    // State for data
    const [users, setUsers] = useState<AppUserResponse[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<AppUserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<AppUserResponse | null>(null);

    // State for roles and branches (for edit form)
    const [roles, setRoles] = useState<AppUserRoleResponse[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    // State for lazy loading
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');

    // State for dialogs
    const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [toggleEnabledDialog, setToggleEnabledDialog] = useState(false);
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);

    // State for edit form
    const [editFormData, setEditFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        roleId: null as number | null,
        branchId: null as number | null
    });

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const rolesApi = useConsumApi('');
    const branchesApi = useConsumApi('');
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
        rolesApi.fetchData(null, 'GET', `${baseUrl}/api/roles`, 'loadRoles');
        branchesApi.fetchData(null, 'GET', `${baseUrl}/api/reference-data/branches/findall`, 'loadBranches');
    }, []);

    // Handle roles data
    useEffect(() => {
        if (rolesApi.data) {
            const data = Array.isArray(rolesApi.data) ? rolesApi.data : [];
            setRoles(data.filter((r: AppUserRoleResponse) => r.active));
        }
    }, [rolesApi.data]);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            const data = Array.isArray(branchesApi.data) ? branchesApi.data : [];
            setBranches(data.filter((b: any) => b.isActive));
        }
    }, [branchesApi.data]);

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
            } else if (callType === 'updateUser') {
                showMessage('success', 'Succès', 'Utilisateur modifié avec succès');
                setEditDialog(false);
                loadUsers();
            } else if (callType === 'toggleEnabled') {
                const updatedUser = data as AppUserResponse;
                const statusMsg = updatedUser.enabled ? 'activé' : 'désactivé';
                showMessage('success', 'Succès', `Utilisateur ${statusMsg} avec succès`);
                setToggleEnabledDialog(false);
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

    // Handle edit user
    const openEditDialog = (user: AppUserResponse) => {
        setSelectedUser(user);
        setEditFormData({
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            roleId: user.roleId || null,
            branchId: user.branchId || null
        });
        setEditDialog(true);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: name === 'lastname' ? value.toUpperCase() : value
        }));
    };

    const handleUpdateUser = () => {
        if (!selectedUser) return;

        if (!editFormData.firstname || !editFormData.lastname || !editFormData.email) {
            showMessage('error', 'Validation', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (!editFormData.roleId) {
            showMessage('error', 'Validation', 'Veuillez sélectionner un rôle');
            return;
        }

        setBtnLoading(true);
        const dataToSend = {
            firstname: editFormData.firstname,
            lastname: editFormData.lastname,
            email: editFormData.email,
            phoneNumber: editFormData.phoneNumber,
            roleId: editFormData.roleId,
            branchId: editFormData.branchId,
            userAction: getUserAction()
        };
        fetchData(dataToSend, 'PUT', `${baseUrl}/api/users/${selectedUser.id}`, 'updateUser');
    };

    // Handle view details
    const openDetailsDialog = (user: AppUserResponse) => {
        setSelectedUser(user);
        setDetailsDialog(true);
    };

    // Handle toggle enabled/disabled
    const confirmToggleEnabled = (user: AppUserResponse) => {
        setSelectedUser(user);
        setToggleEnabledDialog(true);
    };

    const handleToggleEnabled = () => {
        if (!selectedUser) return;

        setBtnLoading(true);
        fetchData({ userAction: getUserAction() }, 'PATCH', `${baseUrl}/api/users/${selectedUser.id}/toggle-enabled`, 'toggleEnabled');
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
            <div className="flex gap-1">
                <Button
                    icon="pi pi-eye"
                    rounded
                    outlined
                    onClick={() => openDetailsDialog(rowData)}
                    tooltip="Voir détails"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    severity="info"
                    onClick={() => openEditDialog(rowData)}
                    tooltip="Modifier l'utilisateur"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon={rowData.enabled ? 'pi pi-ban' : 'pi pi-check-circle'}
                    rounded
                    outlined
                    severity={rowData.enabled ? 'danger' : 'success'}
                    onClick={() => confirmToggleEnabled(rowData)}
                    tooltip={rowData.enabled ? 'Désactiver' : 'Activer'}
                    tooltipOptions={{ position: 'top' }}
                />
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
                            Recherchez et gérez tous les utilisateurs du système. Vous pouvez modifier, activer/désactiver et réinitialiser leurs mots de passe.
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
                                style={{ width: '200px' }}
                            />
                        </DataTable>
                    </div>
                </div>
            </div>

            {/* User Details Dialog */}
            <Dialog
                header="Détails de l'utilisateur"
                visible={detailsDialog}
                style={{ width: '650px' }}
                modal
                onHide={() => setDetailsDialog(false)}
            >
                {selectedUser && (
                    <div>
                        <div className="flex align-items-center gap-3 mb-4 pb-3 border-bottom-1 surface-border">
                            <div className="bg-primary border-circle flex align-items-center justify-content-center" style={{ width: '3.5rem', height: '3.5rem' }}>
                                <i className="pi pi-user text-white text-2xl"></i>
                            </div>
                            <div>
                                <h4 className="m-0">{getFullName(selectedUser)}</h4>
                                <span className="text-500">{selectedUser.email}</span>
                                <div className="mt-1">
                                    <Tag
                                        value={getAccountStatusLabel(selectedUser)}
                                        severity={getAccountStatusSeverity(selectedUser)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Prénom</label>
                                    <span>{selectedUser.firstname}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Nom</label>
                                    <span>{selectedUser.lastname}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Nom d'utilisateur</label>
                                    <span>{selectedUser.email}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Téléphone</label>
                                    <span>{selectedUser.phoneNumber || '-'}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Rôle</label>
                                    <span className="font-semibold">{selectedUser.roleName}</span>
                                    {selectedUser.roleDescription && (
                                        <div className="text-sm text-500">{selectedUser.roleDescription}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Agence</label>
                                    <span>{selectedUser.branchName || 'Toutes les agences'}</span>
                                </div>
                            </div>
                            {selectedUser.compteComptable && (
                                <div className="col-12 md:col-6">
                                    <div className="mb-3">
                                        <label className="font-semibold text-500 block mb-1">Compte Comptable</label>
                                        <span>{selectedUser.compteComptable}</span>
                                    </div>
                                </div>
                            )}
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Date de création</label>
                                    <span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Dernière connexion</label>
                                    <span>{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Jamais'}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Approuvé</label>
                                    <Tag value={selectedUser.approved ? 'Oui' : 'Non'} severity={selectedUser.approved ? 'success' : 'warning'} />
                                    {selectedUser.approvedBy && (
                                        <span className="text-sm text-500 ml-2">par {selectedUser.approvedBy}</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="mb-3">
                                    <label className="font-semibold text-500 block mb-1">Compte actif</label>
                                    <Tag value={selectedUser.enabled ? 'Oui' : 'Non'} severity={selectedUser.enabled ? 'success' : 'danger'} />
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="font-semibold text-500 block mb-2">Autorisations</label>
                                <div className="flex flex-wrap gap-1">
                                    {selectedUser.authorities.map((auth, idx) => {
                                        const label = typeof auth === 'string' ? auth : (auth as any).code || String(auth);
                                        return <Chip key={idx} label={label} className="text-xs" />;
                                    })}
                                    {selectedUser.authorities.length === 0 && (
                                        <span className="text-500">Aucune autorisation</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-content-end mt-4">
                            <Button
                                label="Fermer"
                                icon="pi pi-times"
                                outlined
                                onClick={() => setDetailsDialog(false)}
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog
                header="Modifier l'utilisateur"
                visible={editDialog}
                style={{ width: '600px' }}
                modal
                onHide={() => setEditDialog(false)}
            >
                {selectedUser && (
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="edit-firstname" className="font-semibold">
                                Prénom <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="edit-firstname"
                                name="firstname"
                                value={editFormData.firstname}
                                onChange={handleEditInputChange}
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="edit-lastname" className="font-semibold">
                                Nom <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="edit-lastname"
                                name="lastname"
                                value={editFormData.lastname}
                                onChange={handleEditInputChange}
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="edit-email" className="font-semibold">
                                Nom d'utilisateur <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="edit-email"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditInputChange}
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="edit-phoneNumber" className="font-semibold">
                                Numéro de téléphone
                            </label>
                            <InputText
                                id="edit-phoneNumber"
                                name="phoneNumber"
                                value={editFormData.phoneNumber}
                                onChange={handleEditInputChange}
                                placeholder="+257 XX XX XX XX"
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="edit-roleId" className="font-semibold">
                                Rôle <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                id="edit-roleId"
                                value={editFormData.roleId}
                                options={roles}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, roleId: e.value }))}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Sélectionner un rôle"
                                className="w-full"
                                filter
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="edit-branchId" className="font-semibold">
                                Agence
                            </label>
                            <Dropdown
                                id="edit-branchId"
                                value={editFormData.branchId}
                                options={branches}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, branchId: e.value }))}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Sélectionner une agence"
                                className="w-full"
                                filter
                                showClear
                                itemTemplate={(option: any) => (
                                    <span>{option.code} - {option.name}</span>
                                )}
                            />
                        </div>

                        <div className="col-12 flex justify-content-end gap-2 mt-3">
                            <Button
                                label="Annuler"
                                icon="pi pi-times"
                                outlined
                                onClick={() => setEditDialog(false)}
                            />
                            <Button
                                label="Enregistrer"
                                icon="pi pi-check"
                                onClick={handleUpdateUser}
                                loading={btnLoading}
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Toggle Enabled Confirmation Dialog */}
            <Dialog
                header={selectedUser?.enabled ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
                visible={toggleEnabledDialog}
                style={{ width: '450px' }}
                modal
                onHide={() => setToggleEnabledDialog(false)}
            >
                <div className="flex align-items-center gap-3">
                    <i
                        className={`pi ${selectedUser?.enabled ? 'pi-ban text-red-500' : 'pi-check-circle text-green-500'}`}
                        style={{ fontSize: '3rem' }}
                    />
                    {selectedUser && (
                        <div>
                            <p className="m-0">
                                Voulez-vous {selectedUser.enabled ? 'désactiver' : 'activer'} l'utilisateur{' '}
                                <strong>{getFullName(selectedUser)}</strong> ?
                            </p>
                            <p className="m-0 mt-2 text-sm text-500">
                                Email: {selectedUser.email}<br />
                                Statut actuel: <strong>{selectedUser.enabled ? 'Actif' : 'Désactivé'}</strong>
                            </p>
                            {selectedUser.enabled && (
                                <p className="m-0 mt-2 text-sm text-orange-500">
                                    L'utilisateur ne pourra plus se connecter au système.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        outlined
                        onClick={() => setToggleEnabledDialog(false)}
                    />
                    <Button
                        label={selectedUser?.enabled ? 'Désactiver' : 'Activer'}
                        icon={selectedUser?.enabled ? 'pi pi-ban' : 'pi pi-check-circle'}
                        severity={selectedUser?.enabled ? 'danger' : 'success'}
                        onClick={handleToggleEnabled}
                        loading={btnLoading}
                    />
                </div>
            </Dialog>

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

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['USER_VIEW', 'USER_CREATE', 'USER_UPDATE']}>
            <UsersPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
