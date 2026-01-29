'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { AppUserRoleRequest, AppUserRoleResponse, AuthorityResponse } from '../types';
import { API_BASE_URL } from '../../../../utils/apiConfig';

const AppUserRolesPage = () => {
    const baseUrl = API_BASE_URL;
    const [activeIndex, setActiveIndex] = useState(0);
    const [roles, setRoles] = useState<AppUserRoleResponse[]>([]);
    const [authorities, setAuthorities] = useState<AuthorityResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRoles, setFilteredRoles] = useState<AppUserRoleResponse[]>([]);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState<AppUserRoleResponse | null>(null);
    const [btnLoading, setBtnLoading] = useState(false);

    const [formData, setFormData] = useState<AppUserRoleRequest>({
        name: '',
        description: '',
        authorityIds: [],
        active: true
    });

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

    // Load all roles
    const loadRoles = () => {
        fetchData(null, 'GET', `${baseUrl}/api/roles`, 'loadRoles');
    };

    // Load all authorities
    const loadAuthorities = () => {
        fetchData(null, 'GET', `${baseUrl}/api/authorities`, 'loadAuthorities');
    };

    // Initial load
    useEffect(() => {
        loadAuthorities();
    }, []);

    // Handle API responses
    useEffect(() => {
        if (data) {
            setBtnLoading(false);

            if (callType === 'loadRoles') {
                const rolesData = Array.isArray(data) ? data : [];
                setRoles(rolesData);
                setFilteredRoles(rolesData);
            } else if (callType === 'loadAuthorities') {
                const authData = Array.isArray(data) ? data : [];
                setAuthorities(authData);
            } else if (callType === 'createRole') {
                showMessage('success', 'Succès', 'Rôle créé avec succès');
                resetForm();
                loadRoles();
            } else if (callType === 'updateRole') {
                showMessage('success', 'Succès', 'Rôle mis à jour avec succès');
                setEditDialog(false);
                setSelectedRole(null);
                resetForm();
                loadRoles();
            } else if (callType === 'deleteRole') {
                showMessage('success', 'Succès', 'Rôle supprimé avec succès');
                setDeleteDialog(false);
                setSelectedRole(null);
                loadRoles();
            } else if (callType === 'toggleActive') {
                showMessage('success', 'Succès', 'Statut du rôle mis à jour');
                loadRoles();
            }
        }

        if (error) {
            setBtnLoading(false);
            const errorMessage = error.message || 'Une erreur s\'est produite';
            showMessage('error', 'Erreur', errorMessage);
        }
    }, [data, error, callType]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle authority selection
    const handleAuthorityChange = (e: any) => {
        setFormData(prev => ({
            ...prev,
            authorityIds: e.value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            authorityIds: [],
            active: true
        });
    };

    // Handle create role
    const handleCreate = () => {
        if (!formData.name.trim()) {
            showMessage('warn', 'Attention', 'Le nom du rôle est obligatoire');
            return;
        }

        if (!formData.description || !formData.description.trim()) {
            showMessage('warn', 'Attention', 'La description est obligatoire');
            return;
        }

        setBtnLoading(true);
        fetchData(formData, 'POST', `${baseUrl}/api/roles`, 'createRole');
    };

    // Handle edit role
    const handleEdit = (role: AppUserRoleResponse) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            authorityIds: role.authorities.map(auth => auth.id),
            active: role.active
        });
        setEditDialog(true);
    };

    // Handle update role
    const handleUpdate = () => {
        if (!formData.name.trim() || !selectedRole) {
            showMessage('warn', 'Attention', 'Le nom du rôle est obligatoire');
            return;
        }

        if (!formData.description || !formData.description.trim()) {
            showMessage('warn', 'Attention', 'La description est obligatoire');
            return;
        }

        setBtnLoading(true);
        fetchData(formData, 'PUT', `${baseUrl}/api/roles/${selectedRole.id}`, 'updateRole');
    };

    // Handle delete confirmation
    const confirmDelete = (role: AppUserRoleResponse) => {
        setSelectedRole(role);
        setDeleteDialog(true);
    };

    // Handle delete role
    const handleDelete = () => {
        if (!selectedRole) return;

        setBtnLoading(true);
        fetchData(null, 'DELETE', `${baseUrl}/api/roles/${selectedRole.id}`, 'deleteRole');
    };

    // Handle toggle active
    const handleToggleActive = (role: AppUserRoleResponse) => {
        fetchData(null, 'PATCH', `${baseUrl}/api/roles/${role.id}/toggle-active`, 'toggleActive');
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (!term) {
            setFilteredRoles(roles);
            return;
        }

        const filtered = roles.filter(role =>
            role.name.toLowerCase().includes(term.toLowerCase()) ||
            role.description?.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredRoles(filtered);
    };

    // Handle tab change
    const handleTabChange = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index);
        if (e.index === 1) {
            setSearchTerm('');
            loadRoles();
        } else {
            resetForm();
        }
    };

    // Column templates
    const actionBodyTemplate = (rowData: AppUserRoleResponse) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    severity="warning"
                    onClick={() => handleEdit(rowData)}
                />
                <Button
                    icon={rowData.active ? 'pi pi-ban' : 'pi pi-check'}
                    rounded
                    outlined
                    severity={rowData.active ? 'danger' : 'success'}
                    onClick={() => handleToggleActive(rowData)}
                    tooltip={rowData.active ? 'Désactiver' : 'Activer'}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: AppUserRoleResponse) => {
        return (
            <Tag
                value={rowData.active ? 'Actif' : 'Inactif'}
                severity={rowData.active ? 'success' : 'danger'}
            />
        );
    };

    const authoritiesBodyTemplate = (rowData: AppUserRoleResponse) => {
        // Ensure authorities is an array and not null/undefined
        const authorities = rowData.authorities || [];

        if (authorities.length === 0) {
            return <Tag value="Aucune autorité" severity="warning" />;
        }

        return (
            <div className="flex flex-wrap gap-1">
                {authorities.slice(0, 3).map(auth => (
                    <Tag key={auth.id} value={auth.code} rounded />
                ))}
                {authorities.length > 3 && (
                    <Tag value={`+${authorities.length - 3}`} severity="info" rounded />
                )}
            </div>
        );
    };

    // Render search header
    const renderSearchHeader = () => {
        return (
            <div className="flex justify-content-between">
                <Button
                    type="button"
                    icon="pi pi-refresh"
                    label="Actualiser"
                    outlined
                    onClick={loadRoles}
                />
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
                        <h5>Gestion des Rôles Utilisateurs</h5>

                        <TabView activeIndex={activeIndex} onTabChange={handleTabChange}>
                            {/* Create Tab */}
                            <TabPanel header="Nouveau Rôle">
                                <div className="p-fluid formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="name">
                                            Nom du Rôle <span className="text-red-500">*</span>
                                        </label>
                                        <InputText
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Ex: ACCOUNTANT, MANAGER"
                                        />
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="authorityIds">
                                            Autorisations
                                        </label>
                                        <MultiSelect
                                            id="authorityIds"
                                            value={formData.authorityIds}
                                            options={authorities}
                                            onChange={handleAuthorityChange}
                                            optionLabel="code"
                                            optionValue="id"
                                            placeholder="Sélectionner les autorisations"
                                            display="chip"
                                            filter
                                        />
                                    </div>

                                    <div className="field col-12">
                                        <label htmlFor="description">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <InputTextarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Description du rôle..."
                                        />
                                    </div>

                                    <div className="field col-12 md:col-6 md:col-offset-3">
                                        <div className="flex gap-2">
                                            <Button
                                                label="Réinitialiser"
                                                icon="pi pi-refresh"
                                                outlined
                                                onClick={resetForm}
                                                className="flex-1"
                                            />
                                            <Button
                                                label="Enregistrer"
                                                icon="pi pi-check"
                                                onClick={handleCreate}
                                                loading={btnLoading}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>

                            {/* List Tab */}
                            <TabPanel header="Liste des Rôles">
                                <DataTable
                                    value={filteredRoles}
                                    loading={loading}
                                    header={renderSearchHeader()}
                                    emptyMessage="Aucun rôle trouvé"
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30, 50]}
                                >
                                    <Column field="name" header="Nom" sortable />
                                    <Column field="description" header="Description" sortable />
                                    <Column
                                        header="Autorisations"
                                        body={authoritiesBodyTemplate}
                                    />
                                    <Column
                                        field="active"
                                        header="Statut"
                                        body={statusBodyTemplate}
                                        sortable
                                    />
                                    <Column
                                        header="Actions"
                                        body={actionBodyTemplate}
                                        exportable={false}
                                    />
                                </DataTable>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog
                header="Modifier le Rôle"
                visible={editDialog}
                style={{ width: '650px' }}
                modal
                onHide={() => {
                    setEditDialog(false);
                    setSelectedRole(null);
                    resetForm();
                }}
            >
                <div className="p-fluid formgrid grid">
                    <div className="field col-12">
                        <label htmlFor="edit-name">
                            Nom du Rôle <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="edit-name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="edit-authorityIds">
                            Autorisations
                        </label>
                        <MultiSelect
                            id="edit-authorityIds"
                            value={formData.authorityIds}
                            options={authorities}
                            onChange={handleAuthorityChange}
                            optionLabel="code"
                            optionValue="id"
                            placeholder="Sélectionner les autorisations"
                            display="chip"
                            filter
                        />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="edit-description">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <InputTextarea
                            id="edit-description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        outlined
                        onClick={() => {
                            setEditDialog(false);
                            setSelectedRole(null);
                            resetForm();
                        }}
                    />
                    <Button
                        label="Enregistrer"
                        icon="pi pi-check"
                        onClick={handleUpdate}
                        loading={btnLoading}
                    />
                </div>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                header="Confirmation"
                visible={deleteDialog}
                style={{ width: '450px' }}
                modal
                onHide={() => {
                    setDeleteDialog(false);
                    setSelectedRole(null);
                }}
            >
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedRole && (
                        <span>
                            Êtes-vous sûr de vouloir supprimer le rôle <b>{selectedRole.name}</b>?
                        </span>
                    )}
                </div>

                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Non"
                        icon="pi pi-times"
                        outlined
                        onClick={() => setDeleteDialog(false)}
                    />
                    <Button
                        label="Oui"
                        icon="pi pi-check"
                        severity="danger"
                        onClick={handleDelete}
                        loading={btnLoading}
                    />
                </div>
            </Dialog>
        </>
    );
};

export default AppUserRolesPage;
