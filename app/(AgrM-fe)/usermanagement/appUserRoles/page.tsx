'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProtectedPage } from '@/components/ProtectedPage';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
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
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    const [formData, setFormData] = useState<AppUserRoleRequest>({
        name: '',
        description: '',
        authorityIds: [],
        active: true
    });

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const toast = useRef<Toast>(null);

    // ── Authorities grouping ──
    const groupedAuthorities = useMemo(() => {
        const groups: Record<string, AuthorityResponse[]> = {};
        const filtered = categoryFilter
            ? authorities.filter(a => a.category === categoryFilter)
            : authorities;
        filtered.forEach(auth => {
            const cat = auth.category || 'Autres';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(auth);
        });
        return groups;
    }, [authorities, categoryFilter]);

    const categoryOptions = useMemo(() => {
        const cats = [...new Set(authorities.map(a => a.category || 'Autres'))].sort();
        return cats.map(c => ({ label: c, value: c }));
    }, [authorities]);

    // ── Toggle helpers ──
    const toggleAuthority = (authId: number) => {
        setFormData(prev => {
            const ids = prev.authorityIds || [];
            const newIds = ids.includes(authId)
                ? ids.filter(id => id !== authId)
                : [...ids, authId];
            return { ...prev, authorityIds: newIds };
        });
    };

    const toggleCategory = (categoryAuths: AuthorityResponse[]) => {
        setFormData(prev => {
            const ids = prev.authorityIds || [];
            const catIds = categoryAuths.map(a => a.id);
            const allSelected = catIds.every(id => ids.includes(id));
            const newIds = allSelected
                ? ids.filter(id => !catIds.includes(id))
                : [...new Set([...ids, ...catIds])];
            return { ...prev, authorityIds: newIds };
        });
    };

    const toggleSelectAll = () => {
        setFormData(prev => {
            const ids = prev.authorityIds || [];
            const allIds = authorities.map(a => a.id);
            const allSelected = allIds.length > 0 && allIds.every(id => ids.includes(id));
            return { ...prev, authorityIds: allSelected ? [] : allIds };
        });
    };

    const toggleCollapseCategory = (category: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) next.delete(category);
            else next.add(category);
            return next;
        });
    };

    // ── Authorities checkbox panel ──
    const renderAuthoritiesCheckboxes = () => {
        const selectedIds = formData.authorityIds || [];
        const allIds = authorities.map(a => a.id);
        const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));

        return (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Toolbar: category filter + select all + counter */}
                <div
                    className="flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2"
                    style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}
                >
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-filter" style={{ color: '#64748b', fontSize: '0.85rem' }} />
                        <Dropdown
                            value={categoryFilter}
                            options={categoryOptions}
                            onChange={(e) => setCategoryFilter(e.value)}
                            placeholder="Filtrer par catégorie..."
                            showClear
                            className="p-inputtext-sm"
                            style={{ minWidth: '250px' }}
                        />
                    </div>
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center gap-2 cursor-pointer">
                            <div onClick={(e) => e.stopPropagation()}>
                                <Checkbox checked={allSelected} onChange={() => toggleSelectAll()} />
                            </div>
                            <span className="text-sm font-medium" style={{ color: '#475569' }} onClick={() => toggleSelectAll()}>Tout sélectionner</span>
                        </div>
                        <Tag
                            value={`${selectedIds.length} / ${authorities.length}`}
                            style={{
                                background: selectedIds.length > 0 ? '#3b82f6' : '#94a3b8',
                                fontSize: '0.8rem',
                                padding: '0.2rem 0.6rem'
                            }}
                        />
                    </div>
                </div>

                {/* Scrollable authority list */}
                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                    {Object.entries(groupedAuthorities).map(([category, auths]) => {
                        const catIds = auths.map(a => a.id);
                        const selectedCount = catIds.filter(id => selectedIds.includes(id)).length;
                        const allCatSelected = catIds.length > 0 && selectedCount === catIds.length;
                        const isCollapsed = collapsedCategories.has(category);

                        return (
                            <div key={category}>
                                {/* Category header */}
                                <div
                                    className="flex align-items-center justify-content-between px-3 py-2 cursor-pointer"
                                    style={{
                                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                        borderBottom: '1px solid #93c5fd',
                                        borderTop: '1px solid #bfdbfe',
                                        userSelect: 'none'
                                    }}
                                >
                                    <div className="flex align-items-center gap-2">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={allCatSelected}
                                                onChange={() => toggleCategory(auths)}
                                            />
                                        </div>
                                        <span
                                            style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '0.9rem', cursor: 'pointer' }}
                                            onClick={() => toggleCategory(auths)}
                                        >
                                            {category}
                                        </span>
                                    </div>
                                    <div className="flex align-items-center gap-2">
                                        <Tag
                                            value={`${selectedCount}/${catIds.length}`}
                                            style={{
                                                background: selectedCount === catIds.length ? '#2563eb'
                                                    : selectedCount > 0 ? '#60a5fa' : '#94a3b8',
                                                fontSize: '0.75rem',
                                                padding: '0.15rem 0.5rem'
                                            }}
                                        />
                                        <Button
                                            icon={isCollapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'}
                                            text
                                            rounded
                                            severity="secondary"
                                            onClick={(e) => { e.stopPropagation(); toggleCollapseCategory(category); }}
                                            style={{ width: '1.8rem', height: '1.8rem', color: '#1e3a5f' }}
                                        />
                                    </div>
                                </div>

                                {/* Authority rows */}
                                {!isCollapsed && auths.map((auth, idx) => {
                                    const isChecked = selectedIds.includes(auth.id);
                                    return (
                                        <div
                                            key={auth.id}
                                            className="flex align-items-center justify-content-between px-4 py-2 cursor-pointer"
                                            style={{
                                                backgroundColor: isChecked
                                                    ? '#eff6ff'
                                                    : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'background-color 0.15s ease',
                                                borderLeft: isChecked ? '3px solid #3b82f6' : '3px solid transparent'
                                            }}
                                            onClick={() => toggleAuthority(auth.id)}
                                            onMouseEnter={(e) => {
                                                if (!isChecked) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f1f5f9';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLDivElement).style.backgroundColor = isChecked
                                                    ? '#eff6ff'
                                                    : idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                                            }}
                                        >
                                            <span style={{
                                                fontSize: '0.875rem',
                                                color: isChecked ? '#1e40af' : '#334155',
                                                fontWeight: isChecked ? 500 : 400
                                            }}>
                                                {auth.description || auth.code}
                                            </span>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={isChecked}
                                                    onChange={() => toggleAuthority(auth.id)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                    {Object.keys(groupedAuthorities).length === 0 && (
                        <div className="flex align-items-center justify-content-center py-4" style={{ color: '#94a3b8' }}>
                            <i className="pi pi-info-circle mr-2" />
                            Aucune autorisation disponible
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ── Toast ──
    const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 5000 });
    };

    // ── API calls ──
    const loadRoles = () => fetchData(null, 'GET', `${baseUrl}/api/roles`, 'loadRoles');
    const loadAuthorities = () => fetchData(null, 'GET', `${baseUrl}/api/authorities`, 'loadAuthorities');

    useEffect(() => { loadAuthorities(); }, []);

    useEffect(() => {
        if (data) {
            setBtnLoading(false);
            if (callType === 'loadRoles') {
                const rolesData = Array.isArray(data) ? data : [];
                setRoles(rolesData);
                setFilteredRoles(rolesData);
            } else if (callType === 'loadAuthorities') {
                setAuthorities(Array.isArray(data) ? data : []);
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
            showMessage('error', 'Erreur', error.message || 'Une erreur s\'est produite');
        }
    }, [data, error, callType]);

    // ── Form handlers ──
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', authorityIds: [], active: true });
        setCategoryFilter(null);
        setCollapsedCategories(new Set());
    };

    const handleCreate = () => {
        if (!formData.name.trim()) { showMessage('warn', 'Attention', 'Le nom du rôle est obligatoire'); return; }
        if (!formData.description?.trim()) { showMessage('warn', 'Attention', 'La description est obligatoire'); return; }
        setBtnLoading(true);
        fetchData(formData, 'POST', `${baseUrl}/api/roles`, 'createRole');
    };

    const handleEdit = (role: AppUserRoleResponse) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            authorityIds: role.authorities.map(auth => auth.id),
            active: role.active
        });
        setCategoryFilter(null);
        setCollapsedCategories(new Set());
        setEditDialog(true);
    };

    const handleUpdate = () => {
        if (!formData.name.trim() || !selectedRole) { showMessage('warn', 'Attention', 'Le nom du rôle est obligatoire'); return; }
        if (!formData.description?.trim()) { showMessage('warn', 'Attention', 'La description est obligatoire'); return; }
        setBtnLoading(true);
        fetchData(formData, 'PUT', `${baseUrl}/api/roles/${selectedRole.id}`, 'updateRole');
    };

    const confirmDelete = (role: AppUserRoleResponse) => { setSelectedRole(role); setDeleteDialog(true); };

    const handleDelete = () => {
        if (!selectedRole) return;
        setBtnLoading(true);
        fetchData(null, 'DELETE', `${baseUrl}/api/roles/${selectedRole.id}`, 'deleteRole');
    };

    const handleToggleActive = (role: AppUserRoleResponse) => {
        fetchData(null, 'PATCH', `${baseUrl}/api/roles/${role.id}/toggle-active`, 'toggleActive');
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (!term) { setFilteredRoles(roles); return; }
        setFilteredRoles(roles.filter(role =>
            role.name.toLowerCase().includes(term.toLowerCase()) ||
            role.description?.toLowerCase().includes(term.toLowerCase())
        ));
    };

    const handleTabChange = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index);
        if (e.index === 1) { setSearchTerm(''); loadRoles(); }
        else { resetForm(); }
    };

    // ── Table column templates ──
    const actionBodyTemplate = (rowData: AppUserRoleResponse) => (
        <div className="flex gap-2 justify-content-center">
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
            <Button
                icon={rowData.active ? 'pi pi-ban' : 'pi pi-check-circle'}
                rounded text
                severity={rowData.active ? 'danger' : 'success'}
                tooltip={rowData.active ? 'Désactiver' : 'Activer'}
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleToggleActive(rowData)}
            />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer" tooltipOptions={{ position: 'top' }} onClick={() => confirmDelete(rowData)} />
        </div>
    );

    const statusBodyTemplate = (rowData: AppUserRoleResponse) => (
        <Tag
            value={rowData.active ? 'Actif' : 'Inactif'}
            severity={rowData.active ? 'success' : 'danger'}
            style={{ fontSize: '0.8rem' }}
        />
    );

    const authoritiesBodyTemplate = (rowData: AppUserRoleResponse) => {
        const auths = rowData.authorities || [];
        if (auths.length === 0) return <Tag value="Aucune" severity="warning" style={{ fontSize: '0.75rem' }} />;
        return (
            <div className="flex flex-wrap gap-1">
                {auths.slice(0, 3).map(auth => (
                    <Tag key={auth.id} value={auth.code} rounded style={{ fontSize: '0.7rem', background: '#e0e7ff', color: '#3730a3' }} />
                ))}
                {auths.length > 3 && (
                    <Tag value={`+${auths.length - 3}`} rounded style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8' }} />
                )}
            </div>
        );
    };

    const renderSearchHeader = () => (
        <div className="flex justify-content-between align-items-center flex-wrap gap-2">
            <Button type="button" icon="pi pi-refresh" label="Actualiser" outlined size="small" onClick={loadRoles} />
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText placeholder="Rechercher un rôle..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="p-inputtext-sm" />
            </span>
        </div>
    );

    // ── Render ──
    return (
        <>
            <Toast ref={toast} />

            <div className="grid">
                <div className="col-12">
                    <div className="card" style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

                        {/* Page header */}
                        <div className="flex align-items-center gap-3 mb-4 pb-3" style={{ borderBottom: '2px solid #e2e8f0' }}>
                            <div
                                className="flex align-items-center justify-content-center"
                                style={{
                                    width: '42px', height: '42px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    color: '#fff', fontSize: '1.2rem'
                                }}
                            >
                                <i className="pi pi-shield" />
                            </div>
                            <div>
                                <h5 className="m-0" style={{ color: '#1e293b', fontWeight: 700 }}>Gestion des Rôles Utilisateurs</h5>
                                <p className="m-0 mt-1" style={{ color: '#64748b', fontSize: '0.85rem' }}>Créez et gérez les rôles et leurs autorisations</p>
                            </div>
                        </div>

                        <TabView activeIndex={activeIndex} onTabChange={handleTabChange}>

                            {/* ── Create Tab ── */}
                            <TabPanel
                                header={
                                    <span className="flex align-items-center gap-2">
                                        <i className="pi pi-plus-circle" />
                                        <span>Nouveau Rôle</span>
                                    </span>
                                }
                            >
                                <div className="p-fluid">
                                    {/* Role info section */}
                                    <div
                                        className="mb-4 p-3"
                                        style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <div className="flex align-items-center gap-2 mb-3">
                                            <i className="pi pi-id-card" style={{ color: '#3b82f6' }} />
                                            <span style={{ fontWeight: 600, color: '#334155' }}>Informations du rôle</span>
                                        </div>

                                        <div className="formgrid grid">
                                            <div className="field col-12 md:col-6">
                                                <label htmlFor="name" className="font-medium" style={{ color: '#475569', fontSize: '0.875rem' }}>
                                                    Nom du Rôle <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <InputText
                                                    id="name" name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: ACCOUNTANT, MANAGER"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="field col-12 md:col-6">
                                                <label htmlFor="description" className="font-medium" style={{ color: '#475569', fontSize: '0.875rem' }}>
                                                    Description <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <InputTextarea
                                                    id="description" name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    rows={2}
                                                    placeholder="Description du rôle..."
                                                    className="mt-1"
                                                    autoResize
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Authorities section */}
                                    <div className="mb-4">
                                        <div className="flex align-items-center gap-2 mb-3">
                                            <i className="pi pi-lock" style={{ color: '#3b82f6' }} />
                                            <span style={{ fontWeight: 600, color: '#334155' }}>Autorisations</span>
                                        </div>
                                        {renderAuthoritiesCheckboxes()}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex justify-content-center gap-3 pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <Button
                                            label="Réinitialiser"
                                            icon="pi pi-refresh"
                                            outlined
                                            severity="secondary"
                                            onClick={resetForm}
                                            style={{ minWidth: '180px' }}
                                        />
                                        <Button
                                            label="Enregistrer le rôle"
                                            icon="pi pi-check"
                                            onClick={handleCreate}
                                            loading={btnLoading}
                                            style={{ minWidth: '180px' }}
                                        />
                                    </div>
                                </div>
                            </TabPanel>

                            {/* ── List Tab ── */}
                            <TabPanel
                                header={
                                    <span className="flex align-items-center gap-2">
                                        <i className="pi pi-list" />
                                        <span>Liste des Rôles</span>
                                    </span>
                                }
                            >
                                <DataTable
                                    value={filteredRoles}
                                    loading={loading}
                                    header={renderSearchHeader()}
                                    emptyMessage="Aucun rôle trouvé"
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30, 50]}
                                    stripedRows
                                    size="small"
                                    rowHover
                                    style={{ borderRadius: '8px', overflow: 'hidden' }}
                                >
                                    <Column field="name" header="Nom" sortable style={{ fontWeight: 600 }} />
                                    <Column field="description" header="Description" sortable />
                                    <Column header="Autorisations" body={authoritiesBodyTemplate} />
                                    <Column field="active" header="Statut" body={statusBodyTemplate} sortable style={{ width: '100px', textAlign: 'center' }} />
                                    <Column header="Actions" body={actionBodyTemplate} exportable={false} style={{ width: '150px', textAlign: 'center' }} />
                                </DataTable>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>

            {/* ── Edit Dialog ── */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-pencil" style={{ color: '#f59e0b' }} />
                        <span>Modifier le Rôle</span>
                    </div>
                }
                visible={editDialog}
                style={{ width: '90vw', maxWidth: '900px' }}
                modal
                draggable={false}
                onHide={() => { setEditDialog(false); setSelectedRole(null); resetForm(); }}
            >
                <div className="p-fluid">
                    {/* Role info */}
                    <div className="mb-4 p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label htmlFor="edit-name" className="font-medium" style={{ color: '#475569', fontSize: '0.875rem' }}>
                                    Nom du Rôle <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <InputText id="edit-name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1" />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="edit-description" className="font-medium" style={{ color: '#475569', fontSize: '0.875rem' }}>
                                    Description <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <InputTextarea id="edit-description" name="description" value={formData.description} onChange={handleInputChange} rows={2} className="mt-1" autoResize />
                            </div>
                        </div>
                    </div>

                    {/* Authorities */}
                    <div className="mb-3">
                        <div className="flex align-items-center gap-2 mb-3">
                            <i className="pi pi-lock" style={{ color: '#3b82f6' }} />
                            <span style={{ fontWeight: 600, color: '#334155' }}>Autorisations</span>
                        </div>
                        {renderAuthoritiesCheckboxes()}
                    </div>
                </div>

                <div className="flex justify-content-end gap-2 pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        outlined
                        severity="secondary"
                        onClick={() => { setEditDialog(false); setSelectedRole(null); resetForm(); }}
                    />
                    <Button label="Enregistrer" icon="pi pi-check" onClick={handleUpdate} loading={btnLoading} />
                </div>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-exclamation-triangle" style={{ color: '#ef4444' }} />
                        <span>Confirmation de suppression</span>
                    </div>
                }
                visible={deleteDialog}
                style={{ width: '450px' }}
                modal
                draggable={false}
                onHide={() => { setDeleteDialog(false); setSelectedRole(null); }}
            >
                <div className="flex flex-column align-items-center py-3">
                    <div
                        className="flex align-items-center justify-content-center mb-3"
                        style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '1.5rem'
                        }}
                    >
                        <i className="pi pi-trash" />
                    </div>
                    {selectedRole && (
                        <p className="text-center m-0" style={{ color: '#475569', lineHeight: '1.6' }}>
                            Êtes-vous sûr de vouloir supprimer le rôle<br />
                            <strong style={{ color: '#1e293b' }}>{selectedRole.name}</strong> ?
                        </p>
                    )}
                </div>

                <div className="flex justify-content-center gap-3 pt-2">
                    <Button label="Annuler" icon="pi pi-times" outlined severity="secondary" onClick={() => setDeleteDialog(false)} style={{ minWidth: '120px' }} />
                    <Button label="Supprimer" icon="pi pi-trash" severity="danger" onClick={handleDelete} loading={btnLoading} style={{ minWidth: '120px' }} />
                </div>
            </Dialog>
        </>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['ROLE_MANAGE']}>
            <AppUserRolesPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
