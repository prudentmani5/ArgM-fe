'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { formatLocalDate } from '../../../../utils/dateUtils';
import Cookies from 'js-cookie';

export interface NewMemberFormData {
    // Personal
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    placeOfBirth: string;
    // ID Document
    idDocumentTypeId: number | null;
    idDocumentNumber: string;
    idDocumentIssueDate: string;
    idDocumentExpiryDate: string;
    // Contact
    phonePrimary: string;
    phoneSecondary: string;
    email: string;
    // Address
    provinceId: number | null;
    communeId: number | null;
    zoneId: number | null;
    streetAddress: string;
    // Group membership
    roleId: number | null;
    joinDate: string;
    shareContribution: number;
    branchId: number | null;
    // Member documents
    espaceHumaineDocumentPath: string;
    idCarteDocumentPath: string;
}

export const EMPTY_MEMBER_FORM: NewMemberFormData = {
    firstName: '', lastName: '', gender: '', dateOfBirth: '', placeOfBirth: '',
    idDocumentTypeId: null, idDocumentNumber: '', idDocumentIssueDate: '', idDocumentExpiryDate: '',
    phonePrimary: '', phoneSecondary: '', email: '',
    provinceId: null, communeId: null, zoneId: null, streetAddress: '',
    roleId: null, joinDate: new Date().toISOString().split('T')[0],
    shareContribution: 0, branchId: null,
    espaceHumaineDocumentPath: '', idCarteDocumentPath: ''
};

const GENDERS = [
    { label: 'Masculin', value: 'M' },
    { label: 'Féminin', value: 'F' }
];

interface Props {
    loading?: boolean;
    onAdd: (formData: NewMemberFormData) => void;
    onCancel: () => void;
    initialData?: Partial<NewMemberFormData>;
    editMode?: boolean;
}

export default function AddGroupMemberForm({ loading, onAdd, onCancel, initialData, editMode }: Props) {
    const [form, setForm] = useState<NewMemberFormData>(
        initialData ? { ...EMPTY_MEMBER_FORM, ...initialData } : { ...EMPTY_MEMBER_FORM }
    );

    // Reference data — separate hook per dataset to eliminate race conditions
    const [provinces, setProvinces] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [groupRoles, setGroupRoles] = useState<any[]>([]);
    const [idDocTypes, setIdDocTypes] = useState<any[]>([]);
    const [communes, setCommunes] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);

    const { data: provincesData, fetchData: fetchProvinces } = useConsumApi('');
    const { data: branchesData, fetchData: fetchBranches } = useConsumApi('');
    const { data: groupRolesData, fetchData: fetchGroupRoles } = useConsumApi('');
    const { data: idDocTypesData, fetchData: fetchIdDocTypes } = useConsumApi('');
    const { data: communesData, fetchData: fetchCommunesData } = useConsumApi('');
    const { data: zonesData, fetchData: fetchZonesData } = useConsumApi('');

    // File upload state
    const [uploadingEspaceHumaine, setUploadingEspaceHumaine] = useState(false);
    const [uploadingIdCarte, setUploadingIdCarte] = useState(false);
    const [espaceHumaineFileName, setEspaceHumaineFileName] = useState('');
    const [idCarteFileName, setIdCarteFileName] = useState('');
    const espaceHumaineRef = useRef<HTMLInputElement>(null);
    const idCarteRef = useRef<HTMLInputElement>(null);

    const REF_URL = buildApiUrl('/api/reference-data');

    // Reload form when initialData changes (edit dialog re-open)
    useEffect(() => {
        if (initialData) {
            setForm({ ...EMPTY_MEMBER_FORM, ...initialData });
            // Pre-load cascading dropdowns if province/commune already set
            if (initialData.provinceId) {
                fetchCommunesData(null, 'GET', `${REF_URL}/communes/findbyprovince/${initialData.provinceId}`);
            }
            if (initialData.communeId) {
                fetchZonesData(null, 'GET', `${REF_URL}/zones/findbycommune/${initialData.communeId}`);
            }
            // Show file name from existing path (extract last segment)
            if (initialData.espaceHumaineDocumentPath) {
                const name = initialData.espaceHumaineDocumentPath.split('/').pop() || 'Document existant';
                setEspaceHumaineFileName(name);
            } else {
                setEspaceHumaineFileName('');
            }
            if (initialData.idCarteDocumentPath) {
                const name = initialData.idCarteDocumentPath.split('/').pop() || 'Document existant';
                setIdCarteFileName(name);
            } else {
                setIdCarteFileName('');
            }
        } else {
            setForm({ ...EMPTY_MEMBER_FORM });
            setEspaceHumaineFileName('');
            setIdCarteFileName('');
        }
    }, [initialData]);

    // Load all static reference data on mount — each in its own hook, no race condition
    useEffect(() => {
        fetchProvinces(null, 'GET', `${REF_URL}/provinces/findactive`);
        fetchBranches(null, 'GET', `${REF_URL}/branches/findactive`);
        fetchGroupRoles(null, 'GET', `${REF_URL}/group-roles/findactive`);
        fetchIdDocTypes(null, 'GET', `${REF_URL}/id-document-types/findactive`);
    }, []);

    useEffect(() => { if (provincesData)  setProvinces(Array.isArray(provincesData)  ? provincesData  : []); }, [provincesData]);
    useEffect(() => { if (branchesData)   setBranches(Array.isArray(branchesData)    ? branchesData   : []); }, [branchesData]);
    useEffect(() => { if (groupRolesData) setGroupRoles(Array.isArray(groupRolesData) ? groupRolesData : []); }, [groupRolesData]);
    useEffect(() => { if (idDocTypesData) setIdDocTypes(Array.isArray(idDocTypesData) ? idDocTypesData : []); }, [idDocTypesData]);
    useEffect(() => { if (communesData)   setCommunes(Array.isArray(communesData)    ? communesData   : []); }, [communesData]);
    useEffect(() => { if (zonesData)      setZones(Array.isArray(zonesData)          ? zonesData      : []); }, [zonesData]);

    const set = (field: keyof NewMemberFormData, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleProvinceChange = (provinceId: number) => {
        set('provinceId', provinceId);
        set('communeId', null);
        set('zoneId', null);
        setCommunes([]);
        setZones([]);
        fetchCommunesData(null, 'GET', `${REF_URL}/communes/findbyprovince/${provinceId}`);
    };

    const handleCommuneChange = (communeId: number) => {
        set('communeId', communeId);
        set('zoneId', null);
        setZones([]);
        fetchZonesData(null, 'GET', `${REF_URL}/zones/findbycommune/${communeId}`);
    };

    const uploadDocument = async (file: File, docType: 'ESPACE_HUMAINE' | 'ID_CARTE') => {
        const setUploading = docType === 'ESPACE_HUMAINE' ? setUploadingEspaceHumaine : setUploadingIdCarte;
        const setFileName  = docType === 'ESPACE_HUMAINE' ? setEspaceHumaineFileName  : setIdCarteFileName;
        const field        = docType === 'ESPACE_HUMAINE' ? 'espaceHumaineDocumentPath' : 'idCarteDocumentPath';

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'solidarity-groups/member-documents');
            const response = await fetch(buildApiUrl('/api/files/upload'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${Cookies.get('token')}` },
                body: formData
            });
            if (!response.ok) throw new Error('Upload failed');
            const result = await response.json();
            set(field, result.filePath || result.path || result.url);
            setFileName(file.name);
        } catch {
            alert(`Erreur lors du téléchargement du document ${docType === 'ESPACE_HUMAINE' ? 'Espace Humaine' : "Carte d'identité"}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-fluid">

            {/* ── Section 1: Identification ── */}
            <div className="flex align-items-center gap-2 mb-3 mt-1">
                <i className="pi pi-user text-primary text-lg" />
                <span className="font-bold text-primary">Identification Personnelle</span>
            </div>
            <div className="formgrid grid">
                <div className="field col-6">
                    <label className="font-semibold block mb-1">Nom <span className="text-red-500">*</span></label>
                    <InputText value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Nom de famille" />
                </div>
                <div className="field col-6">
                    <label className="font-semibold block mb-1">Prénom <span className="text-red-500">*</span></label>
                    <InputText value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Prénom(s)" />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Genre <span className="text-red-500">*</span></label>
                    <Dropdown value={form.gender} options={GENDERS} onChange={e => set('gender', e.value)} placeholder="Sélectionner" />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Date de Naissance</label>
                    <Calendar
                        value={form.dateOfBirth ? new Date(form.dateOfBirth) : null}
                        onChange={e => set('dateOfBirth', e.value ? formatLocalDate(e.value as Date) : '')}
                        dateFormat="dd/mm/yy" showIcon placeholder="jj/mm/aaaa"
                    />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Lieu de Naissance</label>
                    <InputText value={form.placeOfBirth} onChange={e => set('placeOfBirth', e.target.value)} placeholder="Ville / Commune" />
                </div>
            </div>

            <Divider className="my-2" />

            {/* ── Section 2: Document d'Identité ── */}
            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-id-card text-primary text-lg" />
                <span className="font-bold text-primary">Document d'Identité</span>
            </div>
            <div className="formgrid grid">
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Type de Document <span className="text-red-500">*</span></label>
                    <Dropdown
                        value={form.idDocumentTypeId}
                        options={idDocTypes.map(t => ({ label: t.name || t.label, value: t.id }))}
                        onChange={e => set('idDocumentTypeId', e.value)}
                        placeholder="Sélectionner"
                    />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Numéro du Document <span className="text-red-500">*</span></label>
                    <InputText value={form.idDocumentNumber} onChange={e => set('idDocumentNumber', e.target.value)} placeholder="Numéro" />
                </div>
                <div className="field col-2">
                    <label className="font-semibold block mb-1">Date de Délivrance</label>
                    <Calendar
                        value={form.idDocumentIssueDate ? new Date(form.idDocumentIssueDate) : null}
                        onChange={e => set('idDocumentIssueDate', e.value ? formatLocalDate(e.value as Date) : '')}
                        dateFormat="dd/mm/yy" showIcon
                    />
                </div>
                <div className="field col-2">
                    <label className="font-semibold block mb-1">Date d'Expiration</label>
                    <Calendar
                        value={form.idDocumentExpiryDate ? new Date(form.idDocumentExpiryDate) : null}
                        onChange={e => set('idDocumentExpiryDate', e.value ? formatLocalDate(e.value as Date) : '')}
                        dateFormat="dd/mm/yy" showIcon
                    />
                </div>
            </div>

            <Divider className="my-2" />

            {/* ── Section 3: Contact ── */}
            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-phone text-primary text-lg" />
                <span className="font-bold text-primary">Contact</span>
            </div>
            <div className="formgrid grid">
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Téléphone Principal <span className="text-red-500">*</span></label>
                    <InputText value={form.phonePrimary} onChange={e => set('phonePrimary', e.target.value)} placeholder="+257 69 21 01 93 xx" />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Téléphone Secondaire</label>
                    <InputText value={form.phoneSecondary} onChange={e => set('phoneSecondary', e.target.value)} placeholder="+257 69 21 01 93 xx" />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Email</label>
                    <InputText type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemple.com" />
                </div>
            </div>

            <Divider className="my-2" />

            {/* ── Section 4: Adresse ── */}
            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-map-marker text-primary text-lg" />
                <span className="font-bold text-primary">Adresse</span>
            </div>
            <div className="formgrid grid">
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Province <span className="text-red-500">*</span></label>
                    <Dropdown
                        value={form.provinceId}
                        options={provinces.map(p => ({ label: p.name, value: p.id }))}
                        onChange={e => handleProvinceChange(e.value)}
                        placeholder="Sélectionner" filter
                    />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Commune <span className="text-red-500">*</span></label>
                    <Dropdown
                        value={form.communeId}
                        options={communes.map(c => ({ label: c.name, value: c.id }))}
                        onChange={e => handleCommuneChange(e.value)}
                        placeholder={form.provinceId ? 'Sélectionner' : "Choisir une province d'abord"}
                        disabled={!form.provinceId} filter
                    />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Zone</label>
                    <Dropdown
                        value={form.zoneId}
                        options={zones.map(z => ({ label: z.name, value: z.id }))}
                        onChange={e => set('zoneId', e.value)}
                        placeholder={form.communeId ? 'Sélectionner' : "Choisir une commune d'abord"}
                        disabled={!form.communeId} filter
                    />
                </div>
                <div className="field col-12">
                    <label className="font-semibold block mb-1">Adresse Détaillée</label>
                    <InputText value={form.streetAddress} onChange={e => set('streetAddress', e.target.value)} placeholder="Quartier, rue, N° maison..." />
                </div>
            </div>

            <Divider className="my-2" />

            {/* ── Section 5: Informations Groupe ── */}
            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-users text-primary text-lg" />
                <span className="font-bold text-primary">Informations dans le Groupe</span>
            </div>
            <div className="formgrid grid">
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Rôle dans le Groupe <span className="text-red-500">*</span></label>
                    <Dropdown
                        value={form.roleId}
                        options={groupRoles.map(r => ({ label: r.name, value: r.id }))}
                        onChange={e => set('roleId', e.value)}
                        placeholder="Sélectionner un rôle"
                    />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Date d'Adhésion</label>
                    <Calendar
                        value={form.joinDate ? new Date(form.joinDate) : new Date()}
                        onChange={e => set('joinDate', e.value ? formatLocalDate(e.value as Date) : '')}
                        dateFormat="dd/mm/yy" showIcon
                    />
                </div>
                <div className="field col-4">
                    <label className="font-semibold block mb-1">Contribution aux Parts (BIF)</label>
                    <InputNumber
                        value={form.shareContribution}
                        onValueChange={e => set('shareContribution', e.value ?? 0)}
                        mode="decimal" minFractionDigits={0}
                    />
                </div>
                <div className="field col-6">
                    <label className="font-semibold block mb-1">Agence <span className="text-red-500">*</span></label>
                    <Dropdown
                        value={form.branchId}
                        options={branches.map(b => ({ label: b.name, value: b.id }))}
                        onChange={e => set('branchId', e.value)}
                        placeholder="Sélectionner l'agence"
                    />
                </div>
            </div>

            <Divider className="my-2" />

            {/* ── Section 6: Documents ── */}
            <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-paperclip text-primary text-lg" />
                <span className="font-bold text-primary">Documents du Membre</span>
            </div>
            <div className="formgrid grid">
                {/* Espace Humaine */}
                <div className="field col-6">
                    <label className="font-semibold block mb-1">Espace Humaine</label>
                    <input
                        ref={espaceHumaineRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) uploadDocument(file, 'ESPACE_HUMAINE');
                            e.target.value = '';
                        }}
                    />
                    {form.espaceHumaineDocumentPath ? (
                        <div className="flex align-items-center gap-2 surface-100 border-round p-2">
                            <i className="pi pi-file text-primary" />
                            <span className="text-sm flex-1 white-space-nowrap overflow-hidden text-overflow-ellipsis">{espaceHumaineFileName}</span>
                            <Tag severity="success" value="Téléchargé" className="text-xs" />
                            <Button
                                icon="pi pi-times" size="small" text severity="danger" tooltip="Supprimer"
                                onClick={() => { set('espaceHumaineDocumentPath', ''); setEspaceHumaineFileName(''); }}
                            />
                        </div>
                    ) : (
                        <Button
                            label={uploadingEspaceHumaine ? 'Chargement...' : 'Choisir un fichier'}
                            icon={uploadingEspaceHumaine ? 'pi pi-spin pi-spinner' : 'pi pi-upload'}
                            outlined className="w-full"
                            disabled={uploadingEspaceHumaine}
                            onClick={() => espaceHumaineRef.current?.click()}
                        />
                    )}
                    <small className="text-400">PDF, JPG ou PNG</small>
                </div>

                {/* Carte d'Identité */}
                <div className="field col-6">
                    <label className="font-semibold block mb-1">Carte d'Identité (ID Carte)</label>
                    <input
                        ref={idCarteRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) uploadDocument(file, 'ID_CARTE');
                            e.target.value = '';
                        }}
                    />
                    {form.idCarteDocumentPath ? (
                        <div className="flex align-items-center gap-2 surface-100 border-round p-2">
                            <i className="pi pi-id-card text-primary" />
                            <span className="text-sm flex-1 white-space-nowrap overflow-hidden text-overflow-ellipsis">{idCarteFileName}</span>
                            <Tag severity="success" value="Téléchargé" className="text-xs" />
                            <Button
                                icon="pi pi-times" size="small" text severity="danger" tooltip="Supprimer"
                                onClick={() => { set('idCarteDocumentPath', ''); setIdCarteFileName(''); }}
                            />
                        </div>
                    ) : (
                        <Button
                            label={uploadingIdCarte ? 'Chargement...' : 'Choisir un fichier'}
                            icon={uploadingIdCarte ? 'pi pi-spin pi-spinner' : 'pi pi-upload'}
                            outlined className="w-full"
                            disabled={uploadingIdCarte}
                            onClick={() => idCarteRef.current?.click()}
                        />
                    )}
                    <small className="text-400">PDF, JPG ou PNG</small>
                </div>
            </div>

            <div className="flex justify-content-end gap-2 mt-3">
                <Button label="Annuler" icon="pi pi-times" className="p-button-text" onClick={onCancel} disabled={loading} />
                <Button
                    label={editMode ? 'Modifier le Membre' : 'Enregistrer le Membre'}
                    icon={editMode ? 'pi pi-save' : 'pi pi-check'}
                    severity={editMode ? 'warning' : undefined}
                    onClick={() => onAdd(form)}
                    loading={loading}
                    disabled={uploadingEspaceHumaine || uploadingIdCarte}
                />
            </div>
        </div>
    );
}
