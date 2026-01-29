'use client';

import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Avatar } from 'primereact/avatar';
import { Dropdown } from 'primereact/dropdown';
import { buildApiUrl } from '../../../../utils/apiConfig';

// Category groups for better organization
const categoryGroups = [
    {
        title: 'Géographie & Localisation',
        icon: 'pi-map-marker',
        color: '#3B82F6',
        categories: ['provinces', 'communes', 'zones', 'collines', 'nationalities']
    },
    {
        title: 'Documents & Identification',
        icon: 'pi-id-card',
        color: '#8B5CF6',
        categories: ['idDocumentTypes', 'kycDocumentTypes']
    },
    {
        title: 'Profil Client',
        icon: 'pi-user',
        color: '#22C55E',
        categories: ['maritalStatuses', 'educationLevels', 'housingTypes', 'clientCategories']
    },
    {
        title: 'Activités & Métiers',
        icon: 'pi-briefcase',
        color: '#F59E0B',
        categories: ['activitySectors']
    },
    {
        title: 'Groupes Solidaires',
        icon: 'pi-users',
        color: '#EC4899',
        categories: ['groupTypes', 'groupRoles', 'guaranteeTypes', 'relationshipTypes']
    },
    {
        title: 'Structure',
        icon: 'pi-building',
        color: '#06B6D4',
        categories: ['branches']
    }
];

// Generic Reference Data Interface
interface ReferenceItem {
    id?: number;
    code: string;
    name: string;
    description?: string;
    isActive: boolean;
    [key: string]: any;
}

// Reference Data Categories
const categories = [
    { key: 'provinces', label: 'Provinces', icon: 'pi-map', endpoint: '/provinces' },
    { key: 'communes', label: 'Communes', icon: 'pi-map-marker', endpoint: '/communes' },
    { key: 'zones', label: 'Zones', icon: 'pi-compass', endpoint: '/zones' },
    { key: 'collines', label: 'Collines', icon: 'pi-flag', endpoint: '/collines' },
    { key: 'nationalities', label: 'Nationalités', icon: 'pi-globe', endpoint: '/nationalities' },
    { key: 'idDocumentTypes', label: 'Types de Documents', icon: 'pi-id-card', endpoint: '/id-document-types' },
    { key: 'activitySectors', label: 'Secteurs d\'Activité', icon: 'pi-briefcase', endpoint: '/activity-sectors' },
    { key: 'maritalStatuses', label: 'États Civils', icon: 'pi-heart', endpoint: '/marital-statuses' },
    { key: 'educationLevels', label: 'Niveaux d\'Études', icon: 'pi-book', endpoint: '/education-levels' },
    { key: 'clientCategories', label: 'Catégories Client', icon: 'pi-users', endpoint: '/client-categories' },
    { key: 'housingTypes', label: 'Types d\'Habitation', icon: 'pi-home', endpoint: '/housing-types' },
    { key: 'groupTypes', label: 'Types de Groupes', icon: 'pi-sitemap', endpoint: '/group-types' },
    { key: 'groupRoles', label: 'Rôles de Groupe', icon: 'pi-user-edit', endpoint: '/group-roles' },
    { key: 'guaranteeTypes', label: 'Types de Garanties', icon: 'pi-shield', endpoint: '/guarantee-types' },
    { key: 'branches', label: 'Agences', icon: 'pi-building', endpoint: '/branches' },
    { key: 'kycDocumentTypes', label: 'Types Documents KYC', icon: 'pi-file', endpoint: '/kyc-document-types' },
    { key: 'relationshipTypes', label: 'Types de Relations', icon: 'pi-link', endpoint: '/relationship-types' }
];

function ReferenceDataComponent() {
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [items, setItems] = useState<ReferenceItem[]>([]);
    const [item, setItem] = useState<ReferenceItem>({ code: '', name: '', isActive: true });
    const [editItem, setEditItem] = useState<ReferenceItem>({ code: '', name: '', isActive: true });
    const [editDialog, setEditDialog] = useState(false);
    const [createDialog, setCreateDialog] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Parent entity lists for dropdowns
    const [provinces, setProvinces] = useState<ReferenceItem[]>([]);
    const [communes, setCommunes] = useState<ReferenceItem[]>([]);
    const [zones, setZones] = useState<ReferenceItem[]>([]);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    // Separate hooks for parent entities to avoid race conditions
    const { data: provincesData, fetchData: fetchProvinces } = useConsumApi('');
    const { data: communesData, fetchData: fetchCommunes } = useConsumApi('');
    const { data: zonesData, fetchData: fetchZones } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const BASE_URL = buildApiUrl('/api/reference-data');

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadData();
    }, [activeCategory]);

    useEffect(() => {
        if (data) {
            if (callType === 'loadItems') {
                setItems(Array.isArray(data) ? data : []);
            } else if (callType === 'createItem') {
                showToast('success', 'Succès', 'Élément créé avec succès');
                setCreateDialog(false);
                resetForm();
                loadData();
            } else if (callType === 'updateItem') {
                showToast('success', 'Succès', 'Élément mis à jour avec succès');
                setEditDialog(false);
                loadData();
            }
            // Removed loadProvinces, loadCommunes, loadZones - now handled by separate hooks
            setBtnLoading(false);
        }
        if (error) {
            console.error('❌ API Error:', error);
            showToast('error', 'Erreur', error?.message || 'Une erreur est survenue');
            setBtnLoading(false);
        }
    }, [data, error, callType]);

    // Load parent entity lists for dropdowns
    useEffect(() => {
        loadParentEntities();
    }, []);

    // Debug: Log provinces state changes
    useEffect(() => {
        console.log('🏛️ Provinces state updated:', {
            count: provinces.length,
            provinces: provinces
        });
    }, [provinces]);

    // Handle provinces data from separate hook
    useEffect(() => {
        if (provincesData) {
            console.log('📍 Provinces data received:', provincesData);
            const provincesArray = Array.isArray(provincesData) ? provincesData : [];
            console.log('📍 Provinces count:', provincesArray.length);
            setProvinces(provincesArray);
        }
    }, [provincesData]);

    // Handle communes data from separate hook
    useEffect(() => {
        if (communesData) {
            console.log('📍 Communes data received:', communesData);
            setCommunes(Array.isArray(communesData) ? communesData : []);
        }
    }, [communesData]);

    // Handle zones data from separate hook
    useEffect(() => {
        if (zonesData) {
            console.log('📍 Zones data received:', zonesData);
            setZones(Array.isArray(zonesData) ? zonesData : []);
        }
    }, [zonesData]);

    const loadParentEntities = () => {
        console.log('🔄 Loading parent entities...');
        console.log('🔄 BASE_URL:', BASE_URL);
        console.log('🔄 Provinces URL:', `${BASE_URL}/provinces/findall`);
        // Use separate hooks to avoid race conditions
        fetchProvinces(null, 'GET', `${BASE_URL}/provinces/findall`, 'loadProvinces');
        fetchCommunes(null, 'GET', `${BASE_URL}/communes/findall`, 'loadCommunes');
        fetchZones(null, 'GET', `${BASE_URL}/zones/findall`, 'loadZones');
    };

    const loadData = () => {
        fetchData(null, 'GET', `${BASE_URL}${activeCategory.endpoint}/findall`, 'loadItems');
    };

    const resetForm = () => {
        setItem({ code: '', name: '', description: '', isActive: true });
    };

    const handleCreate = () => {
        if (!item.code?.trim() || !item.name?.trim()) {
            showToast('warn', 'Attention', 'Le code et le nom sont obligatoires');
            return;
        }
        // Validate parent entity selection
        if (activeCategory.key === 'communes' && !item.province?.id) {
            showToast('warn', 'Attention', 'La province est obligatoire');
            return;
        }
        if (activeCategory.key === 'zones' && !item.commune?.id) {
            showToast('warn', 'Attention', 'La commune est obligatoire');
            return;
        }
        if (activeCategory.key === 'collines' && !item.zone?.id) {
            showToast('warn', 'Attention', 'La zone est obligatoire');
            return;
        }
        setBtnLoading(true);
        fetchData(item, 'POST', `${BASE_URL}${activeCategory.endpoint}/new`, 'createItem');
    };

    const handleUpdate = () => {
        if (!editItem.code?.trim() || !editItem.name?.trim()) {
            showToast('warn', 'Attention', 'Le code et le nom sont obligatoires');
            return;
        }
        if (!editItem.id) {
            showToast('error', 'Erreur', 'ID de l\'élément manquant');
            return;
        }
        // Validate parent entity selection
        if (activeCategory.key === 'communes' && !editItem.province?.id) {
            showToast('warn', 'Attention', 'La province est obligatoire');
            return;
        }
        if (activeCategory.key === 'zones' && !editItem.commune?.id) {
            showToast('warn', 'Attention', 'La commune est obligatoire');
            return;
        }
        if (activeCategory.key === 'collines' && !editItem.zone?.id) {
            showToast('warn', 'Attention', 'La zone est obligatoire');
            return;
        }
        setBtnLoading(true);
        fetchData(editItem, 'PUT', `${BASE_URL}${activeCategory.endpoint}/update/${editItem.id}`, 'updateItem');
    };

    const openEditDialog = (rowData: ReferenceItem) => {
        setEditItem({ ...rowData });
        setEditDialog(true);
    };

    const openCreateDialog = () => {
        resetForm();
        setCreateDialog(true);
    };

    const statusBodyTemplate = (rowData: ReferenceItem) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const actionsBodyTemplate = (rowData: ReferenceItem) => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-pencil"
                    onClick={() => openEditDialog(rowData)}
                    rounded
                    text
                    severity="warning"
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                />
            </div>
        );
    };

    const codeBodyTemplate = (rowData: ReferenceItem) => {
        return (
            <Tag value={rowData.code} severity="info" className="font-mono" />
        );
    };

    const nameBodyTemplate = (rowData: ReferenceItem) => {
        return (
            <div className="flex align-items-center gap-2">
                <span className="font-medium">{rowData.name}</span>
            </div>
        );
    };

    const filteredItems = items.filter(i =>
        i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderCategoryMenu = () => {
        return (
            <div className="mb-4">
                <div className="grid">
                    {categoryGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="col-12 md:col-6 lg:col-4">
                            <div className="surface-card border-round shadow-1 p-3 h-full">
                                {/* Group Header */}
                                <div className="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 surface-border">
                                    <Avatar
                                        icon={`pi ${group.icon}`}
                                        size="normal"
                                        shape="circle"
                                        style={{ backgroundColor: group.color, color: '#ffffff' }}
                                    />
                                    <span className="font-semibold text-800">{group.title}</span>
                                </div>
                                {/* Category Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {group.categories.map(catKey => {
                                        const cat = categories.find(c => c.key === catKey);
                                        if (!cat) return null;
                                        const isActive = activeCategory.key === cat.key;
                                        return (
                                            <Button
                                                key={cat.key}
                                                label={cat.label}
                                                icon={`pi ${cat.icon}`}
                                                onClick={() => setActiveCategory(cat)}
                                                size="small"
                                                className={isActive ? '' : 'p-button-outlined p-button-secondary'}
                                                style={isActive ? { backgroundColor: group.color, borderColor: group.color } : {}}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Get active category color
    const getActiveCategoryColor = () => {
        for (const group of categoryGroups) {
            if (group.categories.includes(activeCategory.key)) {
                return group.color;
            }
        }
        return '#6366F1';
    };

    const renderHeader = () => {
        const categoryColor = getActiveCategoryColor();
        return (
            <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3 p-2">
                <div className="flex gap-2 align-items-center">
                    <Button
                        icon="pi pi-plus"
                        label="Nouveau"
                        onClick={openCreateDialog}
                        style={{ backgroundColor: categoryColor, borderColor: categoryColor }}
                    />
                    <Button
                        icon="pi pi-refresh"
                        label="Actualiser"
                        outlined
                        onClick={loadData}
                        style={{ color: categoryColor, borderColor: categoryColor }}
                    />
                    <Tag
                        value={`${filteredItems.length} sur ${items.length}`}
                        severity="info"
                        className="ml-2"
                    />
                </div>
                <div className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Rechercher par code ou nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '280px' }}
                        className="p-inputtext-sm"
                    />
                </div>
            </div>
        );
    };

    const renderFormFields = (currentItem: ReferenceItem, setCurrentItem: (item: ReferenceItem) => void) => {
        return (
            <div className="p-fluid">
                {/* Province dropdown for Communes */}
                {activeCategory.key === 'communes' && (
                    <div className="field">
                        <label htmlFor="province" className="font-bold">Province <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="province"
                            value={currentItem.province?.id}
                            options={provinces}
                            onChange={(e) => setCurrentItem({ ...currentItem, province: { id: e.value } })}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner une province"
                            filter
                            showClear
                        />
                    </div>
                )}
                {/* Commune dropdown for Zones */}
                {activeCategory.key === 'zones' && (
                    <div className="field">
                        <label htmlFor="commune" className="font-bold">Commune <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="commune"
                            value={currentItem.commune?.id}
                            options={communes}
                            onChange={(e) => setCurrentItem({ ...currentItem, commune: { id: e.value } })}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner une commune"
                            filter
                            showClear
                        />
                    </div>
                )}
                {/* Zone dropdown for Collines */}
                {activeCategory.key === 'collines' && (
                    <div className="field">
                        <label htmlFor="zone" className="font-bold">Zone <span className="text-red-500">*</span></label>
                        <Dropdown
                            id="zone"
                            value={currentItem.zone?.id}
                            options={zones}
                            onChange={(e) => setCurrentItem({ ...currentItem, zone: { id: e.value } })}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner une zone"
                            filter
                            showClear
                        />
                    </div>
                )}
                <div className="field">
                    <label htmlFor="code" className="font-bold">Code <span className="text-red-500">*</span></label>
                    <InputText
                        id="code"
                        value={currentItem.code}
                        onChange={(e) => setCurrentItem({ ...currentItem, code: e.target.value })}
                        placeholder="Code unique"
                    />
                </div>
                <div className="field">
                    <label htmlFor="name" className="font-bold">Nom <span className="text-red-500">*</span></label>
                    <InputText
                        id="name"
                        value={currentItem.name}
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                        placeholder="Nom"
                    />
                </div>
                {(activeCategory.key === 'activitySectors' || activeCategory.key === 'clientCategories' ||
                  activeCategory.key === 'guaranteeTypes' || activeCategory.key === 'groupTypes') && (
                    <div className="field">
                        <label htmlFor="description">Description</label>
                        <InputTextarea
                            id="description"
                            value={currentItem.description || ''}
                            onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                            rows={3}
                            placeholder="Description"
                        />
                    </div>
                )}
                {activeCategory.key === 'groupTypes' && (
                    <>
                        <div className="field">
                            <label htmlFor="minMembers">Nombre Min. de Membres</label>
                            <InputNumber
                                id="minMembers"
                                value={currentItem.minMembers || 5}
                                onValueChange={(e) => setCurrentItem({ ...currentItem, minMembers: e.value })}
                                min={1}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="maxMembers">Nombre Max. de Membres</label>
                            <InputNumber
                                id="maxMembers"
                                value={currentItem.maxMembers || 30}
                                onValueChange={(e) => setCurrentItem({ ...currentItem, maxMembers: e.value })}
                                min={1}
                            />
                        </div>
                    </>
                )}
                {activeCategory.key === 'groupRoles' && (
                    <div className="field">
                        <label htmlFor="isExecutive">Rôle Exécutif</label>
                        <div className="flex align-items-center gap-2 mt-2">
                            <InputSwitch
                                id="isExecutive"
                                checked={currentItem.isExecutive || false}
                                onChange={(e) => setCurrentItem({ ...currentItem, isExecutive: e.value })}
                            />
                            <span>{currentItem.isExecutive ? 'Oui' : 'Non'}</span>
                        </div>
                    </div>
                )}
                {activeCategory.key === 'educationLevels' && (
                    <div className="field">
                        <label htmlFor="rank">Rang</label>
                        <InputNumber
                            id="rank"
                            value={currentItem.rank || 0}
                            onValueChange={(e) => setCurrentItem({ ...currentItem, rank: e.value })}
                            min={0}
                        />
                    </div>
                )}
                {activeCategory.key === 'kycDocumentTypes' && (
                    <div className="field">
                        <label htmlFor="isMandatory">Obligatoire</label>
                        <div className="flex align-items-center gap-2 mt-2">
                            <InputSwitch
                                id="isMandatory"
                                checked={currentItem.isMandatory || false}
                                onChange={(e) => setCurrentItem({ ...currentItem, isMandatory: e.value })}
                            />
                            <span>{currentItem.isMandatory ? 'Oui' : 'Non'}</span>
                        </div>
                    </div>
                )}
                {activeCategory.key === 'branches' && (
                    <>
                        <div className="field">
                            <label htmlFor="address">Adresse</label>
                            <InputText
                                id="address"
                                value={currentItem.address || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem, address: e.target.value })}
                                placeholder="Adresse"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="phone">Téléphone</label>
                            <InputText
                                id="phone"
                                value={currentItem.phone || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem, phone: e.target.value })}
                                placeholder="Téléphone"
                            />
                        </div>
                    </>
                )}
                <div className="field">
                    <label htmlFor="isActive">Statut</label>
                    <div className="flex align-items-center gap-2 mt-2">
                        <InputSwitch
                            id="isActive"
                            checked={currentItem.isActive}
                            onChange={(e) => setCurrentItem({ ...currentItem, isActive: e.value ?? false })}
                        />
                        <span>{currentItem.isActive ? 'Actif' : 'Inactif'}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />

            {/* Create Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className={`pi ${activeCategory.icon} text-xl text-primary`}></i>
                        <span>Nouveau - {activeCategory.label}</span>
                    </div>
                }
                visible={createDialog}
                style={{ width: '40vw' }}
                modal
                onHide={() => setCreateDialog(false)}
            >
                {renderFormFields(item, setItem)}
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setCreateDialog(false)}
                        className="p-button-text"
                    />
                    <Button
                        label="Enregistrer"
                        icon="pi pi-check"
                        loading={btnLoading}
                        onClick={handleCreate}
                    />
                </div>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-pencil text-xl text-warning"></i>
                        <span>Modifier - {activeCategory.label}</span>
                    </div>
                }
                visible={editDialog}
                style={{ width: '40vw' }}
                modal
                onHide={() => setEditDialog(false)}
            >
                {renderFormFields(editItem, setEditItem)}
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditDialog(false)}
                        className="p-button-text"
                    />
                    <Button
                        label="Enregistrer"
                        icon="pi pi-check"
                        loading={btnLoading}
                        onClick={handleUpdate}
                    />
                </div>
            </Dialog>

            <div className="card">
                <div className="flex align-items-center justify-content-between mb-4">
                    <div className="flex align-items-center gap-3">
                        <Avatar icon="pi pi-database" size="xlarge" shape="circle" className="bg-indigo-500 text-white" />
                        <div>
                            <h4 className="m-0 mb-1">Gestion des Données de Référence</h4>
                            <p className="text-500 m-0 text-sm">Configurez les données de base du système de microfinance</p>
                        </div>
                    </div>
                    <div className="hidden md:flex align-items-center gap-2">
                        <Tag value={`${categories.length} catégories`} severity="info" />
                        <Tag value={`${items.length} éléments`} severity="success" />
                    </div>
                </div>

                {renderCategoryMenu()}

                <div
                    className="surface-card border-round shadow-2 p-3 border-left-3"
                    style={{ borderLeftColor: getActiveCategoryColor() }}
                >
                    <div className="flex align-items-center justify-content-between mb-3 pb-3 border-bottom-1 surface-border">
                        <div className="flex align-items-center gap-3">
                            <Avatar
                                icon={`pi ${activeCategory.icon}`}
                                size="large"
                                shape="circle"
                                style={{ backgroundColor: getActiveCategoryColor(), color: '#ffffff' }}
                            />
                            <div>
                                <h5 className="m-0 mb-1">{activeCategory.label}</h5>
                                <div className="flex align-items-center gap-2">
                                    <Tag value={`${filteredItems.length} élément(s)`} className="text-xs" />
                                    {filteredItems.filter(i => i.isActive).length > 0 && (
                                        <Tag
                                            value={`${filteredItems.filter(i => i.isActive).length} actif(s)`}
                                            severity="success"
                                            className="text-xs"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex">
                            <Button
                                icon="pi pi-download"
                                tooltip="Exporter"
                                tooltipOptions={{ position: 'top' }}
                                rounded
                                text
                                severity="secondary"
                            />
                        </div>
                    </div>
                    <DataTable
                        value={filteredItems}
                        header={renderHeader}
                        emptyMessage={
                            <div className="text-center py-5">
                                <i className={`pi ${activeCategory.icon} text-4xl text-300 mb-3`} style={{ display: 'block' }}></i>
                                <p className="text-500 m-0">Aucun élément trouvé pour {activeCategory.label}</p>
                                <p className="text-400 text-sm mt-2">Cliquez sur "Nouveau" pour ajouter un élément</p>
                            </div>
                        }
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} éléments"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        sortField="code"
                        sortOrder={1}
                        stripedRows
                        showGridlines
                    >
                        <Column field="code" header="Code" body={codeBodyTemplate} sortable style={{ minWidth: '120px' }} />
                        <Column field="name" header="Nom" body={nameBodyTemplate} sortable style={{ minWidth: '200px' }} />
                        {activeCategory.key === 'communes' && (
                            <Column
                                field="province.name"
                                header="Province"
                                body={(rowData) => rowData.province?.name || '-'}
                                sortable
                                style={{ minWidth: '150px' }}
                            />
                        )}
                        {activeCategory.key === 'zones' && (
                            <Column
                                field="commune.name"
                                header="Commune"
                                body={(rowData) => rowData.commune?.name || '-'}
                                sortable
                                style={{ minWidth: '150px' }}
                            />
                        )}
                        {activeCategory.key === 'collines' && (
                            <Column
                                field="zone.name"
                                header="Zone"
                                body={(rowData) => rowData.zone?.name || '-'}
                                sortable
                                style={{ minWidth: '150px' }}
                            />
                        )}
                        {(activeCategory.key === 'activitySectors' || activeCategory.key === 'clientCategories' ||
                          activeCategory.key === 'guaranteeTypes' || activeCategory.key === 'groupTypes') && (
                            <Column field="description" header="Description" style={{ minWidth: '200px' }} />
                        )}
                        {activeCategory.key === 'groupTypes' && (
                            <>
                                <Column field="minMembers" header="Min. Membres" style={{ minWidth: '100px' }} />
                                <Column field="maxMembers" header="Max. Membres" style={{ minWidth: '100px' }} />
                            </>
                        )}
                        {activeCategory.key === 'groupRoles' && (
                            <Column
                                field="isExecutive"
                                header="Exécutif"
                                body={(rowData) => <Tag value={rowData.isExecutive ? 'Oui' : 'Non'} severity={rowData.isExecutive ? 'info' : null} />}
                                style={{ minWidth: '80px' }}
                            />
                        )}
                        {activeCategory.key === 'branches' && (
                            <>
                                <Column field="address" header="Adresse" style={{ minWidth: '150px' }} />
                                <Column field="phone" header="Téléphone" style={{ minWidth: '120px' }} />
                            </>
                        )}
                        <Column header="Statut" body={statusBodyTemplate} style={{ minWidth: '80px' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '80px' }} />
                    </DataTable>
                </div>
            </div>
        </>
    );
}

export default ReferenceDataComponent;
