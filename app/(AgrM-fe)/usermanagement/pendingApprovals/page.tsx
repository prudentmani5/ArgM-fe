'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Chip } from 'primereact/chip';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { useCurrentUser } from '../../../../hooks/fetchData/useCurrentUser';
import { AppUserResponse, AppUserRoleResponse, getFullName, getAccountStatusLabel, getAccountStatusSeverity } from '../types';
import { API_BASE_URL } from '../../../../utils/apiConfig';

const PendingApprovalsPage = () => {
    const baseUrl = API_BASE_URL;
    const [activeIndex, setActiveIndex] = useState(0);
    const [pendingUsers, setPendingUsers] = useState<AppUserResponse[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<AppUserResponse[]>([]);
    const [bannedUsers, setBannedUsers] = useState<AppUserResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<AppUserResponse[]>([]);
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [banDialog, setBanDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AppUserResponse | null>(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const [roles, setRoles] = useState<AppUserRoleResponse[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { user: currentUser } = useCurrentUser();
    const toast = useRef<Toast>(null);

    const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 5000
        });
    };

    // Load pending users (not approved)
    const loadPendingUsers = () => {
        fetchData(null, 'GET', `${baseUrl}/api/users/approved/false`, 'loadPending');
    };

    // Load approved users
    const loadApprovedUsers = () => {
        fetchData(null, 'GET', `${baseUrl}/api/users/approved/true`, 'loadApproved');
    };

    // Load banned users (disabled)
    const loadBannedUsers = () => {
        fetchData(null, 'GET', `${baseUrl}/api/users/enabled/false`, 'loadBanned');
    };

    // Load all roles
    const loadRoles = () => {
        fetchData(null, 'GET', `${baseUrl}/api/roles`, 'loadRoles');
    };

    // Initial load
    useEffect(() => {
        loadPendingUsers();
        loadRoles();
    }, []);

    // Handle API responses
    useEffect(() => {
        if (data) {
            setBtnLoading(false);

            if (callType === 'loadPending') {
                const users = Array.isArray(data) ? data : [];
                setPendingUsers(users);
                if (activeIndex === 0) {
                    setFilteredUsers(users);
                }
            } else if (callType === 'loadApproved') {
                const users = Array.isArray(data) ? data : [];
                setApprovedUsers(users);
                if (activeIndex === 1) {
                    setFilteredUsers(users);
                }
            } else if (callType === 'loadBanned') {
                const users = Array.isArray(data) ? data : [];
                setBannedUsers(users);
                if (activeIndex === 2) {
                    setFilteredUsers(users);
                }
            } else if (callType === 'loadRoles') {
                const rolesData = Array.isArray(data) ? data : [];
                console.log('Roles loaded:', rolesData);
                // Filter only active roles
                const activeRoles = rolesData.filter((role: AppUserRoleResponse) => role.active);
                setRoles(activeRoles);
                console.log('Active roles:', activeRoles);
            } else if (callType === 'updateUserRole') {
                // After updating role, approve the user
                if (selectedUser && currentUser) {
                    const approvedBy = currentUser.email;
                    fetchData(null, 'PATCH', `${baseUrl}/api/users/${selectedUser.id}/approve?approvedBy=${approvedBy}`, 'approveUser');
                }
            } else if (callType === 'approveUser') {
                showMessage('success', 'Succès', 'Utilisateur approuvé avec succès');
                setDetailsDialog(false);
                setSelectedRoleId(null);
                setSearchTerm(''); // Clear search term to show all results
                loadPendingUsers();
            } else if (callType === 'editUser') {
                showMessage('success', 'Succès', 'Rôle de l\'utilisateur mis à jour avec succès');
                setEditDialog(false);
                setSelectedRoleId(null);
                setSearchTerm(''); // Clear search term to show all results
                loadApprovedUsers();
            } else if (callType === 'banUser') {
                showMessage('success', 'Succès', 'Utilisateur banni avec succès');
                setBanDialog(false);
                setSearchTerm(''); // Clear search term to show all results
                loadApprovedUsers();
            } else if (callType === 'unbanUser') {
                showMessage('success', 'Succès', 'Utilisateur débanni avec succès');
                setSearchTerm(''); // Clear search term to show all results
                loadBannedUsers();
            }
        }

        if (error) {
            setBtnLoading(false);
            const errorMessage = error.message || 'Une erreur s\'est produite';
            showMessage('error', 'Erreur', errorMessage);
        }
    }, [data, error, callType]);

    // Handle view user details
    const viewUserDetails = (user: AppUserResponse) => {
        setSelectedUser(user);
        setSelectedRoleId(user.roleId); // Set current role as default
        setDetailsDialog(true);
    };

    // Handle open edit dialog for approved users
    const openEditDialog = (user: AppUserResponse) => {
        setSelectedUser(user);
        setSelectedRoleId(user.roleId); // Set current role as default
        setEditDialog(true);
    };

    const handleApprove = () => {
        if (!selectedUser || !currentUser || !selectedRoleId) {
            showMessage('error', 'Erreur', 'Veuillez sélectionner un rôle');
            return;
        }

        setBtnLoading(true);
        const approvedBy = currentUser.email;

        // First update the role if it has changed
        if (selectedRoleId !== selectedUser.roleId) {
            const updatePayload = {
                roleId: selectedRoleId
            };
            fetchData(updatePayload, 'PUT', `${baseUrl}/api/users/${selectedUser.id}`, 'updateUserRole');
        } else {
            // Just approve without updating role
            fetchData(null, 'PATCH', `${baseUrl}/api/users/${selectedUser.id}/approve?approvedBy=${approvedBy}`, 'approveUser');
        }
    };

    // Handle edit user (for approved users)
    const handleEditUser = () => {
        if (!selectedUser || !selectedRoleId) {
            showMessage('error', 'Erreur', 'Veuillez sélectionner un rôle');
            return;
        }

        // Check if role has changed
        if (selectedRoleId === selectedUser.roleId) {
            showMessage('info', 'Information', 'Aucune modification détectée');
            return;
        }

        setBtnLoading(true);
        const updatePayload = {
            roleId: selectedRoleId
        };
        fetchData(updatePayload, 'PUT', `${baseUrl}/api/users/${selectedUser.id}`, 'editUser');
    };

    // Handle ban user
    const confirmBan = (user: AppUserResponse) => {
        setSelectedUser(user);
        setBanDialog(true);
    };

    const handleBan = () => {
        if (!selectedUser) return;

        setBtnLoading(true);
        fetchData(null, 'PATCH', `${baseUrl}/api/users/${selectedUser.id}/toggle-enabled`, 'banUser');
    };

    // Handle unban user
    const handleUnban = (user: AppUserResponse) => {
        setBtnLoading(true);
        fetchData(null, 'PATCH', `${baseUrl}/api/users/${user.id}/toggle-enabled`, 'unbanUser');
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (!term) {
            if (activeIndex === 0) setFilteredUsers(pendingUsers);
            else if (activeIndex === 1) setFilteredUsers(approvedUsers);
            else setFilteredUsers(bannedUsers);
            return;
        }

        const sourceUsers = activeIndex === 0 ? pendingUsers : activeIndex === 1 ? approvedUsers : bannedUsers;
        const filtered = sourceUsers.filter(user =>
            getFullName(user).toLowerCase().includes(term.toLowerCase()) ||
            user.email.toLowerCase().includes(term.toLowerCase()) ||
            (user.roleName && user.roleName.toLowerCase().includes(term.toLowerCase()))
        );
        setFilteredUsers(filtered);
    };

    // Handle tab change
    const handleTabChange = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index);
        setSearchTerm('');

        if (e.index === 0) {
            loadPendingUsers();
        } else if (e.index === 1) {
            loadApprovedUsers();
        } else if (e.index === 2) {
            loadBannedUsers();
        }
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
        if (!rowData.roleName) {
            return (
                <div className="text-sm text-500 italic">
                    Aucun rôle assigné
                </div>
            );
        }

        return (
            <div>
                <div className="font-semibold">{rowData.roleName}</div>
                <div className="text-sm text-500">{rowData.roleDescription || '-'}</div>
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

        // Check if authorities exist and is an array
        if (!rowData.authorities || !Array.isArray(rowData.authorities) || rowData.authorities.length === 0) {
            return (
                <div className="text-sm text-500 italic">
                    Aucun rôle assigné
                </div>
            );
        }

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

    const approvedAtBodyTemplate = (rowData: AppUserResponse) => {
        if (!rowData.approvedAt) return '-';
        return (
            <div>
                <div>{new Date(rowData.approvedAt).toLocaleDateString('fr-FR')}</div>
                <div className="text-sm text-500">par {rowData.approvedBy}</div>
            </div>
        );
    };

    const pendingActionsTemplate = (rowData: AppUserResponse) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    severity="info"
                    onClick={() => viewUserDetails(rowData)}
                    tooltip="Modifier et approuver"
                />
            </div>
        );
    };

    const approvedActionsTemplate = (rowData: AppUserResponse) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    severity="info"
                    onClick={() => openEditDialog(rowData)}
                    tooltip="Modifier"
                />
                <Button
                    icon="pi pi-ban"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmBan(rowData)}
                    tooltip="Bannir"
                />
            </div>
        );
    };

    const bannedActionsTemplate = (rowData: AppUserResponse) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-check-circle"
                    rounded
                    outlined
                    severity="success"
                    onClick={() => handleUnban(rowData)}
                    tooltip="Débannir"
                    loading={btnLoading}
                />
            </div>
        );
    };

    // Render search header
    const renderSearchHeader = (title: string, onRefresh: () => void) => {
        return (
            <div className="flex justify-content-between">
                <div className="flex align-items-center gap-2">
                    <h5 className="m-0">{title}</h5>
                    <Button
                        icon="pi pi-refresh"
                        rounded
                        outlined
                        onClick={onRefresh}
                    />
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
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
                        <h5>Gestion des Demandes d'Accès</h5>

                        <TabView activeIndex={activeIndex} onTabChange={handleTabChange}>
                            {/* Pending Approvals Tab */}
                            <TabPanel header={`En Attente (${pendingUsers.length})`} leftIcon="pi pi-clock mr-2">
                                <DataTable
                                    value={filteredUsers}
                                    loading={loading}
                                    header={renderSearchHeader('Demandes en attente d\'approbation', loadPendingUsers)}
                                    emptyMessage="Aucune demande en attente"
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column
                                        field="firstname"
                                        header="Utilisateur"
                                        body={nameBodyTemplate}
                                        sortable
                                    />
                                    <Column field="phoneNumber" header="Téléphone" sortable />
                                    <Column
                                        field="roleName"
                                        header="Rôle Demandé"
                                        body={roleBodyTemplate}
                                        sortable
                                    />
                                    <Column
                                        header="Autorisations"
                                        body={authoritiesBodyTemplate}
                                    />
                                    <Column
                                        field="createdAt"
                                        header="Date de demande"
                                        body={createdAtBodyTemplate}
                                        sortable
                                    />
                                    <Column
                                        header="Actions"
                                        body={pendingActionsTemplate}
                                        exportable={false}
                                    />
                                </DataTable>
                            </TabPanel>

                            {/* Approved Users Tab */}
                            <TabPanel header={`Approuvés (${approvedUsers.length})`} leftIcon="pi pi-check-circle mr-2">
                                <DataTable
                                    value={filteredUsers}
                                    loading={loading}
                                    header={renderSearchHeader('Utilisateurs approuvés', loadApprovedUsers)}
                                    emptyMessage="Aucun utilisateur approuvé"
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column
                                        field="firstname"
                                        header="Utilisateur"
                                        body={nameBodyTemplate}
                                        sortable
                                    />
                                    <Column field="phoneNumber" header="Téléphone" sortable />
                                    <Column
                                        field="roleName"
                                        header="Rôle"
                                        body={roleBodyTemplate}
                                        sortable
                                    />
                                    <Column
                                        header="Statut"
                                        body={statusBodyTemplate}
                                        sortable
                                    />
                                    <Column
                                        field="approvedAt"
                                        header="Approuvé"
                                        body={approvedAtBodyTemplate}
                                        sortable
                                    />
                                    <Column
                                        header="Actions"
                                        body={approvedActionsTemplate}
                                        exportable={false}
                                    />
                                </DataTable>
                            </TabPanel>

                            {/* Banned Users Tab */}
                            <TabPanel header={`Bannis (${bannedUsers.length})`} leftIcon="pi pi-ban mr-2">
                                <DataTable
                                    value={filteredUsers}
                                    loading={loading}
                                    header={renderSearchHeader('Utilisateurs bannis', loadBannedUsers)}
                                    emptyMessage="Aucun utilisateur banni"
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column
                                        field="firstname"
                                        header="Utilisateur"
                                        body={nameBodyTemplate}
                                        sortable
                                    />
                                    <Column field="phoneNumber" header="Téléphone" sortable />
                                    <Column
                                        field="roleName"
                                        header="Rôle"
                                        body={roleBodyTemplate}
                                        sortable
                                    />
                                    <Column
                                        field="approvedAt"
                                        header="Banni depuis"
                                        body={createdAtBodyTemplate}
                                        sortable
                                    />
                                    <Column
                                        header="Actions"
                                        body={bannedActionsTemplate}
                                        exportable={false}
                                    />
                                </DataTable>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>

            {/* User Details Dialog */}
            <Dialog
                header="Détails de la demande d'accès"
                visible={detailsDialog}
                style={{ width: '600px' }}
                modal
                onHide={() => {
                    setDetailsDialog(false);
                    setSelectedRoleId(null);
                }}
            >
                {selectedUser && (
                    <div>
                        {/* User Information Section */}
                        <div className="mb-4">
                            <h6 className="text-900 font-semibold mb-3">Informations de l'utilisateur</h6>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="mb-3">
                                        <label className="block text-600 font-medium mb-1">Nom complet</label>
                                        <div className="text-900 font-semibold">{getFullName(selectedUser)}</div>
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="mb-3">
                                        <label className="block text-600 font-medium mb-1">Email</label>
                                        <div className="text-900">{selectedUser.email}</div>
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="mb-3">
                                        <label className="block text-600 font-medium mb-1">Téléphone</label>
                                        <div className="text-900">{selectedUser.phoneNumber || '-'}</div>
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="mb-3">
                                        <label className="block text-600 font-medium mb-1">Date de demande</label>
                                        <div className="text-900">
                                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : '-'}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="mb-3">
                                        <label className="block text-600 font-medium mb-1">Statut du compte</label>
                                        <Tag
                                            value={getAccountStatusLabel(selectedUser)}
                                            severity={getAccountStatusSeverity(selectedUser)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Role Information Section */}
                        <div className="mb-4">
                            <h6 className="text-900 font-semibold mb-3">Rôle demandé</h6>

                            <div className="mb-3">
                                <label className="block text-600 font-medium mb-1">Rôle actuel</label>
                                <div className="p-3 surface-100 border-round">
                                    {selectedUser.roleName ? (
                                        <>
                                            <div className="text-900 font-semibold">{selectedUser.roleName}</div>
                                            <div className="text-600 text-sm mt-1">{selectedUser.roleDescription || '-'}</div>
                                        </>
                                    ) : (
                                        <div className="text-500 italic">Aucun rôle assigné</div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="block text-600 font-medium mb-2">Autorisations associées</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.authorities && Array.isArray(selectedUser.authorities) && selectedUser.authorities.length > 0 ? (
                                        selectedUser.authorities.map((auth, idx) => {
                                            const label = typeof auth === 'string' ? auth : (auth as any)?.code || String(auth);
                                            return <Chip key={idx} label={label} className="text-sm" />;
                                        })
                                    ) : (
                                        <div className="text-sm text-500 italic">
                                            Aucune autorisation (aucun rôle assigné)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Role Assignment Section */}
                        <div className="mb-4">
                            <div className="flex justify-content-between align-items-center mb-3">
                                <h6 className="text-900 font-semibold m-0">Assigner un rôle</h6>
                                <Button
                                    icon="pi pi-refresh"
                                    rounded
                                    text
                                    size="small"
                                    onClick={loadRoles}
                                    tooltip="Recharger les rôles"
                                    loading={loading && callType === 'loadRoles'}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="role-dropdown" className="block text-600 font-medium mb-2">
                                    Sélectionner le rôle à attribuer * ({roles.length} rôles disponibles)
                                </label>
                                <Dropdown
                                    id="role-dropdown"
                                    value={selectedRoleId}
                                    onChange={(e) => setSelectedRoleId(e.value)}
                                    options={roles}
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Choisir un rôle"
                                    className="w-full"
                                    filter
                                    emptyMessage="Aucun rôle disponible"
                                    disabled={roles.length === 0}
                                    valueTemplate={(option: AppUserRoleResponse | null) => {
                                        if (!option) return "Choisir un rôle";
                                        const selectedRole = roles.find(r => r.id === selectedRoleId);
                                        return selectedRole ? selectedRole.name : "Choisir un rôle";
                                    }}
                                    itemTemplate={(option: AppUserRoleResponse) => (
                                        <div>
                                            <div className="font-semibold">{option.name}</div>
                                            <div className="text-sm text-600">{option.description}</div>
                                        </div>
                                    )}
                                />
                                {roles.length === 0 && (
                                    <small className="text-red-500 mt-2 block">
                                        <i className="pi pi-exclamation-circle mr-1"></i>
                                        Aucun rôle actif disponible. Veuillez créer des rôles d'abord.
                                    </small>
                                )}
                                <small className="text-500 mt-2 block">
                                    {selectedRoleId && selectedRoleId !== selectedUser.roleId && (
                                        <span className="text-orange-500">
                                            <i className="pi pi-info-circle mr-1"></i>
                                            Le rôle sera mis à jour lors de l'approbation
                                        </span>
                                    )}
                                </small>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-content-end gap-2 mt-4">
                            <Button
                                label="Annuler"
                                icon="pi pi-times"
                                outlined
                                onClick={() => {
                                    setDetailsDialog(false);
                                    setSelectedRoleId(null);
                                }}
                            />
                            <Button
                                label="Rejeter"
                                icon="pi pi-ban"
                                severity="danger"
                                outlined
                                onClick={() => {
                                    setDetailsDialog(false);
                                    confirmBan(selectedUser);
                                }}
                            />
                            <Button
                                label="Approuver"
                                icon="pi pi-check"
                                severity="success"
                                onClick={handleApprove}
                                loading={btnLoading}
                                disabled={!selectedRoleId}
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
                onHide={() => {
                    setEditDialog(false);
                    setSelectedRoleId(null);
                }}
            >
                {selectedUser && (
                    <div>
                        {/* User Information Section */}
                        <div className="mb-4">
                            <h6 className="text-900 font-semibold mb-3">Informations de l'utilisateur</h6>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="mb-3">
                                        <label className="block text-600 font-medium mb-1">Nom complet</label>
                                        <div className="text-900 font-semibold">{getFullName(selectedUser)}</div>
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="mb-3">
                                        <label className="block text-600 font-medium mb-1">Email</label>
                                        <div className="text-900">{selectedUser.email}</div>
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="mb-3">
                                        <label className="block text-600 font-medium mb-1">Téléphone</label>
                                        <div className="text-900">{selectedUser.phoneNumber || '-'}</div>
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="mb-3">
                                        <label className="block text-600 font-medium mb-1">Statut du compte</label>
                                        <Tag
                                            value={getAccountStatusLabel(selectedUser)}
                                            severity={getAccountStatusSeverity(selectedUser)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Current Role Information Section */}
                        <div className="mb-4">
                            <h6 className="text-900 font-semibold mb-3">Rôle actuel</h6>

                            <div className="mb-3">
                                <div className="p-3 surface-100 border-round">
                                    {selectedUser.roleName ? (
                                        <>
                                            <div className="text-900 font-semibold">{selectedUser.roleName}</div>
                                            <div className="text-600 text-sm mt-1">{selectedUser.roleDescription || '-'}</div>
                                        </>
                                    ) : (
                                        <div className="text-500 italic">Aucun rôle assigné</div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="block text-600 font-medium mb-2">Autorisations associées</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.authorities && Array.isArray(selectedUser.authorities) && selectedUser.authorities.length > 0 ? (
                                        selectedUser.authorities.map((auth, idx) => {
                                            const label = typeof auth === 'string' ? auth : (auth as any)?.code || String(auth);
                                            return <Chip key={idx} label={label} className="text-sm" />;
                                        })
                                    ) : (
                                        <div className="text-sm text-500 italic">
                                            Aucune autorisation (aucun rôle assigné)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Role Update Section */}
                        <div className="mb-4">
                            <div className="flex justify-content-between align-items-center mb-3">
                                <h6 className="text-900 font-semibold m-0">Modifier le rôle</h6>
                                <Button
                                    icon="pi pi-refresh"
                                    rounded
                                    text
                                    size="small"
                                    onClick={loadRoles}
                                    tooltip="Recharger les rôles"
                                    loading={loading && callType === 'loadRoles'}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="edit-role-dropdown" className="block text-600 font-medium mb-2">
                                    Sélectionner le nouveau rôle * ({roles.length} rôles disponibles)
                                </label>
                                <Dropdown
                                    id="edit-role-dropdown"
                                    value={selectedRoleId}
                                    onChange={(e) => setSelectedRoleId(e.value)}
                                    options={roles}
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Choisir un rôle"
                                    className="w-full"
                                    filter
                                    emptyMessage="Aucun rôle disponible"
                                    disabled={roles.length === 0}
                                    valueTemplate={(option: AppUserRoleResponse | null) => {
                                        if (!option) return "Choisir un rôle";
                                        const selectedRole = roles.find(r => r.id === selectedRoleId);
                                        return selectedRole ? selectedRole.name : "Choisir un rôle";
                                    }}
                                    itemTemplate={(option: AppUserRoleResponse) => (
                                        <div>
                                            <div className="font-semibold">{option.name}</div>
                                            <div className="text-sm text-600">{option.description}</div>
                                        </div>
                                    )}
                                />
                                {roles.length === 0 && (
                                    <small className="text-red-500 mt-2 block">
                                        <i className="pi pi-exclamation-circle mr-1"></i>
                                        Aucun rôle actif disponible. Veuillez créer des rôles d'abord.
                                    </small>
                                )}
                                <small className="text-500 mt-2 block">
                                    {selectedRoleId && selectedRoleId !== selectedUser.roleId && (
                                        <span className="text-orange-500">
                                            <i className="pi pi-info-circle mr-1"></i>
                                            Le rôle sera mis à jour immédiatement
                                        </span>
                                    )}
                                </small>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-content-end gap-2 mt-4">
                            <Button
                                label="Annuler"
                                icon="pi pi-times"
                                outlined
                                onClick={() => {
                                    setEditDialog(false);
                                    setSelectedRoleId(null);
                                }}
                            />
                            <Button
                                label="Enregistrer"
                                icon="pi pi-save"
                                severity="success"
                                onClick={handleEditUser}
                                loading={btnLoading}
                                disabled={!selectedRoleId || selectedRoleId === selectedUser.roleId}
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Ban Confirmation Dialog */}
            <Dialog
                header="Bannir l'utilisateur"
                visible={banDialog}
                style={{ width: '450px' }}
                modal
                onHide={() => setBanDialog(false)}
            >
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-red-500" style={{ fontSize: '3rem' }} />
                    {selectedUser && (
                        <div>
                            <p className="m-0">
                                Êtes-vous sûr de vouloir bannir l'utilisateur{' '}
                                <strong>{getFullName(selectedUser)}</strong> ?
                            </p>
                            <p className="m-0 mt-2 text-sm text-500">
                                Cette action désactivera complètement son compte.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        outlined
                        onClick={() => setBanDialog(false)}
                    />
                    <Button
                        label="Bannir"
                        icon="pi pi-ban"
                        severity="danger"
                        onClick={handleBan}
                        loading={btnLoading}
                    />
                </div>
            </Dialog>
        </>
    );
};

export default PendingApprovalsPage;
