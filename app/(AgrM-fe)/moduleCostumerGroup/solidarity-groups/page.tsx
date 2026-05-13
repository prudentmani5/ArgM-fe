'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { SolidarityGroup, GroupStatus, GroupMember, MemberStatus, MemberDocument, GroupType, GuaranteeType, Province, Commune, Zone, ActivitySector, Branch, GroupRole, MeetingFrequency } from './SolidarityGroup';
import SolidarityGroupForm from './SolidarityGroupForm';
import AddGroupMemberForm, { NewMemberFormData } from './AddGroupMemberForm';
import { FileUploadSelectEvent } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import Cookies from 'js-cookie';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Avatar } from 'primereact/avatar';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Image } from 'primereact/image';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { buildApiUrl } from '../../../../utils/apiConfig';

function SolidarityGroupComponent() {
    const [group, setGroup] = useState<SolidarityGroup>(new SolidarityGroup());
    const [groupEdit, setGroupEdit] = useState<SolidarityGroup>(new SolidarityGroup());
    const [editGroupDialog, setEditGroupDialog] = useState(false);
    const [viewGroupDialog, setViewGroupDialog] = useState(false);
    const [groups, setGroups] = useState<SolidarityGroup[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Member management
    const [memberDialog, setMemberDialog] = useState(false);
    const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<SolidarityGroup | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [addMemberDialog, setAddMemberDialog] = useState(false);
    const [viewMemberDialog, setViewMemberDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
    const [memberDocuments, setMemberDocuments] = useState<MemberDocument[]>([]);

    // Status change dialog
    const [changeStatusDialog, setChangeStatusDialog] = useState(false);
    const [memberForStatusChange, setMemberForStatusChange] = useState<GroupMember | null>(null);
    const [newMemberStatus, setNewMemberStatus] = useState<string>('');
    const [statusChangeReason, setStatusChangeReason] = useState('');

    // Edit member dialog
    const [editMemberDialog, setEditMemberDialog] = useState(false);
    const [memberEditInitialData, setMemberEditInitialData] = useState<Partial<NewMemberFormData> | undefined>(undefined);
    const [memberForEdit, setMemberForEdit] = useState<GroupMember | null>(null);

    // File upload states
    const [bylawsDocumentFile, setBylawsDocumentFile] = useState<File | null>(null);
    const [bylawsDocumentFileEdit, setBylawsDocumentFileEdit] = useState<File | null>(null);

    // Reference data states
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [guaranteeTypes, setGuaranteeTypes] = useState<GuaranteeType[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [activitySectors, setActivitySectors] = useState<ActivitySector[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [groupRoles, setGroupRoles] = useState<GroupRole[]>([]);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchLoading, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: refData, fetchData: fetchRefData, callType: refCallType } = useConsumApi('');
    const { data: memberData, loading: memberLoading, fetchData: fetchMemberData, callType: memberCallType } = useConsumApi('');
    const { data: docsData, loading: docsLoading, fetchData: fetchDocsData } = useConsumApi('');
    const { data: locationData, fetchData: fetchLocationData, callType: locationCallType } = useConsumApi('');
    const [memberLocationNames, setMemberLocationNames] = useState<{ province: string; commune: string; zone: string }>({ province: '', commune: '', zone: '' });
    const toast = useRef<Toast>(null);

    const BASE_URL = buildApiUrl('/api/solidarity-groups');
    const REF_URL = buildApiUrl('/api/reference-data');

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Get connected user from cookies
    const getConnectedUser = (): string => {
        try {
            const appUserCookie = Cookies.get('appUser');
            if (appUserCookie) {
                const appUser = JSON.parse(appUserCookie);
                return appUser.username || appUser.email || appUser.name || 'Unknown User';
            }
        } catch (e) {
            console.error('Error parsing appUser cookie:', e);
        }
        return 'Unknown User';
    };

    // Load reference data and groups on mount
    useEffect(() => {
        loadReferenceData();
        loadAllData(); // Load groups data on initial mount
    }, []);

    useEffect(() => {
        if (refData) {
            switch (refCallType) {
                case 'loadGroupTypes': setGroupTypes(Array.isArray(refData) ? refData : []); break;
                case 'loadGuaranteeTypes': setGuaranteeTypes(Array.isArray(refData) ? refData : []); break;
                case 'loadProvinces': setProvinces(Array.isArray(refData) ? refData : []); break;
                case 'loadActivitySectors': setActivitySectors(Array.isArray(refData) ? refData : []); break;
                case 'loadBranches': setBranches(Array.isArray(refData) ? refData : []); break;
                case 'loadGroupRoles': setGroupRoles(Array.isArray(refData) ? refData : []); break;
                case 'loadCommunes': setCommunes(Array.isArray(refData) ? refData : []); break;
                case 'loadZones': setZones(Array.isArray(refData) ? refData : []); break;
            }
        }
    }, [refData, refCallType]);

    useEffect(() => {
        if (error) {
            console.error('❌ API Error:', error, 'CallType:', callType);
            if (callType === 'createGroup') showToast('error', 'Erreur', 'L\'enregistrement a échoué');
            else if (callType === 'updateGroup') showToast('error', 'Erreur', 'La mise à jour a échoué');
            setBtnLoading(false);
        }
        if (data) {
            if (callType === 'loadGroups') {
                const groupsData = Array.isArray(data) ? data : data.content || [];
                setGroups(groupsData);
            } else if (callType === 'generateCode') {
                setGroup(prev => ({ ...prev, groupCode: data.groupCode }));
            } else if (callType === 'approveGroup') {
                showToast('success', 'Succès', 'Groupe approuvé avec succès');
                loadAllData();
            } else if (callType === 'deleteGroup') {
                showToast('success', 'Succès', 'Groupe supprimé avec succès');
                loadAllData();
            } else if (callType === 'createGroup') {
                setGroup(new SolidarityGroup());
                setBylawsDocumentFile(null);
                showToast('success', 'Succès', 'Groupe enregistré avec succès');
                generateGroupCode();
            } else if (callType === 'updateGroup') {
                showToast('success', 'Succès', 'Groupe mis à jour avec succès');
                setGroupEdit(new SolidarityGroup());
                setBylawsDocumentFileEdit(null);
                setEditGroupDialog(false);
                loadAllData();
            }
            setBtnLoading(false);
        }
    }, [data, error, callType]);

    useEffect(() => {
        if (searchData && searchCallType === 'searchGroups') {
            if (searchData.content) {
                setGroups(searchData.content);
            } else if (Array.isArray(searchData)) {
                setGroups(searchData);
            } else {
                setGroups([]);
            }
        }
    }, [searchData, searchCallType]);


    useEffect(() => {
        if (memberData) {
            if (memberCallType === 'loadMembers') {
                setMembers(Array.isArray(memberData) ? memberData : []);
            } else if (memberCallType === 'addMember') {
                showToast('success', 'Succès', 'Membre ajouté avec succès');
                setAddMemberDialog(false);
                if (selectedGroupForMembers) {
                    fetchMemberData(null, 'GET', `${BASE_URL}/${selectedGroupForMembers.id}/members`, 'loadMembers');
                }
            } else if (memberCallType === 'updateStatus') {
                showToast('success', 'Succès', 'Statut mis à jour avec succès');
                setChangeStatusDialog(false);
                setMemberForStatusChange(null);
                setNewMemberStatus('');
                setStatusChangeReason('');
                if (selectedGroupForMembers) {
                    fetchMemberData(null, 'GET', `${BASE_URL}/${selectedGroupForMembers.id}/members`, 'loadMembers');
                }
            } else if (memberCallType === 'updateProfile') {
                showToast('success', 'Succès', 'Membre modifié avec succès');
                setEditMemberDialog(false);
                setMemberForEdit(null);
                setMemberEditInitialData(undefined);
                if (selectedGroupForMembers) {
                    fetchMemberData(null, 'GET', `${BASE_URL}/${selectedGroupForMembers.id}/members`, 'loadMembers');
                }
            } else if (memberCallType === 'removeMember') {
                showToast('success', 'Succès', 'Membre retiré avec succès');
                if (selectedGroupForMembers) {
                    fetchMemberData(null, 'GET', `${BASE_URL}/${selectedGroupForMembers.id}/members`, 'loadMembers');
                }
            }
        }
    }, [memberData, memberCallType]);

    useEffect(() => {
        if (docsData) {
            setMemberDocuments(Array.isArray(docsData) ? docsData : []);
        }
    }, [docsData]);

    useEffect(() => {
        if (!locationData) return;
        const list: any[] = Array.isArray(locationData) ? locationData : [];
        if (locationCallType === 'loadViewCommunes') {
            const found = list.find((c: any) => c.id === selectedMember?.memberProfile?.communeId);
            setMemberLocationNames(prev => ({ ...prev, commune: found?.name || '' }));
            if (selectedMember?.memberProfile?.communeId) {
                fetchLocationData(null, 'GET', `${REF_URL}/zones/findbycommune/${selectedMember.memberProfile.communeId}`, 'loadViewZones');
            }
        } else if (locationCallType === 'loadViewZones') {
            const found = list.find((z: any) => z.id === selectedMember?.memberProfile?.zoneId);
            setMemberLocationNames(prev => ({ ...prev, zone: found?.name || '' }));
        }
    }, [locationData, locationCallType]);

    const loadReferenceData = () => {
        fetchRefData(null, 'GET', `${REF_URL}/group-types/findactive`, 'loadGroupTypes');
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/guarantee-types/findactive`, 'loadGuaranteeTypes'), 100);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/provinces/findactive`, 'loadProvinces'), 200);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/activity-sectors/findactive`, 'loadActivitySectors'), 300);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/branches/findactive`, 'loadBranches'), 400);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/group-roles/findactive`, 'loadGroupRoles'), 500);
    };

    const handleProvinceChange = (provinceId: number) => {
        setCommunes([]);
        setZones([]);
        if (provinceId) {
            fetchRefData(null, 'GET', `${REF_URL}/communes/findbyprovince/${provinceId}`, 'loadCommunes');
        }
    };

    const handleCommuneChange = (communeId: number) => {
        setZones([]);
        if (communeId) {
            fetchRefData(null, 'GET', `${REF_URL}/zones/findbycommune/${communeId}`, 'loadZones');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setGroup(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setGroup(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setGroup(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setGroup(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : ''
        }));
    };

    const handleTimeChange = (name: string, value: Date | null) => {
        setGroup(prev => ({
            ...prev,
            [name]: value ? value.toTimeString().split(' ')[0].substring(0, 5) : ''
        }));
    };

    // Edit handlers
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setGroupEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (name: string, value: any) => {
        setGroupEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setGroupEdit(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const handleDateChangeEdit = (name: string, value: Date | null) => {
        setGroupEdit(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : ''
        }));
    };

    const handleTimeChangeEdit = (name: string, value: Date | null) => {
        setGroupEdit(prev => ({
            ...prev,
            [name]: value ? value.toTimeString().split(' ')[0].substring(0, 5) : ''
        }));
    };

    // File upload handlers
    const handleFileUpload = (e: FileUploadSelectEvent) => {
        if (e.files && e.files.length > 0) {
            setBylawsDocumentFile(e.files[0]);
        }
    };

    const handleFileRemove = () => {
        setBylawsDocumentFile(null);
        setGroup(prev => ({ ...prev, bylawsDocumentPath: '' }));
    };

    const handleFileUploadEdit = (e: FileUploadSelectEvent) => {
        if (e.files && e.files.length > 0) {
            setBylawsDocumentFileEdit(e.files[0]);
        }
    };

    const handleFileRemoveEdit = () => {
        setBylawsDocumentFileEdit(null);
        setGroupEdit(prev => ({ ...prev, bylawsDocumentPath: '' }));
    };

    const uploadFile = async (file: File, folder: string): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch(buildApiUrl('/api/files/upload'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Cookies.get('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('File upload failed');
        }

        const data = await response.json();
        return data.filePath || data.path || data.url;
    };

    const handleSubmit = async () => {
        if (!validateGroup(group)) return;
        setBtnLoading(true);

        try {
            let groupToSave = { ...group };

            // Upload bylaws document if selected
            if (bylawsDocumentFile) {
                const filePath = await uploadFile(bylawsDocumentFile, 'solidarity-groups/bylaws');
                groupToSave.bylawsDocumentPath = filePath;
            }

            // Add connected user action
            groupToSave.userAction = getConnectedUser();

            fetchData(groupToSave, 'POST', `${BASE_URL}/new`, 'createGroup');
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast('error', 'Erreur', 'Erreur lors du téléchargement du fichier');
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = async () => {
        if (!validateGroup(groupEdit)) return;
        setBtnLoading(true);

        try {
            let groupToSave = { ...groupEdit };

            // Upload bylaws document if selected
            if (bylawsDocumentFileEdit) {
                const filePath = await uploadFile(bylawsDocumentFileEdit, 'solidarity-groups/bylaws');
                groupToSave.bylawsDocumentPath = filePath;
            }

            // Add connected user action
            groupToSave.userAction = getConnectedUser();

            fetchData(groupToSave, 'PUT', `${BASE_URL}/update/${groupToSave.id}`, 'updateGroup');
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast('error', 'Erreur', 'Erreur lors du téléchargement du fichier');
            setBtnLoading(false);
        }
    };

    const validateGroup = (g: SolidarityGroup): boolean => {
        if (!g.groupName?.trim()) {
            showToast('warn', 'Attention', 'Le nom du groupe est obligatoire');
            return false;
        }
        if (!g.groupTypeId) {
            showToast('warn', 'Attention', 'Le type de groupe est obligatoire');
            return false;
        }
        if (!g.branchId) {
            showToast('warn', 'Attention', 'L\'agence est obligatoire');
            return false;
        }
        return true;
    };


    const generateGroupCode = () => {
        fetchData(null, 'GET', `${BASE_URL}/generatecode`, 'generateCode');
    };

    const loadAllData = () => {
        console.log('🔄 Loading groups from:', `${BASE_URL}/findall`);
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadGroups');
    };

    const performSearch = (query: string) => {
        if (query.trim() === '') {
            loadAllData();
        } else {
            fetchSearchData(null, 'GET', `${BASE_URL}/search?searchTerm=${encodeURIComponent(query)}&page=0&size=100`, 'searchGroups');
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        const newTimeout = setTimeout(() => performSearch(value), 500);
        setSearchTimeout(newTimeout);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else if (e.index === 0) {
            generateGroupCode();
        }
        setActiveIndex(e.index);
    };

    const loadGroupToEdit = (data: SolidarityGroup) => {
        const d = data as any;
        const enriched: SolidarityGroup = {
            ...data,
            groupTypeId:     data.groupTypeId     || d.groupType?.id,
            branchId:        data.branchId        || d.branch?.id,
            primarySectorId: data.primarySectorId || d.primarySector?.id,
            guaranteeTypeId: data.guaranteeTypeId || d.guaranteeType?.id,
            provinceId:      data.provinceId      || d.province?.id,
            communeId:       data.communeId       || d.commune?.id,
            zoneId:          data.zoneId          || d.zone?.id,
        };
        setGroupEdit(enriched);
        if (enriched.provinceId) handleProvinceChange(enriched.provinceId);
        if (enriched.communeId) setTimeout(() => handleCommuneChange(enriched.communeId!), 500);
        setEditGroupDialog(true);
    };

    const viewGroupDetails = (data: SolidarityGroup) => {
        setGroupEdit(data);
        setViewGroupDialog(true);
    };

    const openMemberDialog = (group: SolidarityGroup) => {
        setSelectedGroupForMembers(group);
        fetchMemberData(null, 'GET', `${BASE_URL}/${group.id}/members`, 'loadMembers');
        setMemberDialog(true);
    };

    const openAddMemberDialog = () => {
        setAddMemberDialog(true);
    };

    const handleNewMemberSubmit = (formData: NewMemberFormData) => {
        if (!formData.lastName?.trim()) {
            showToast('warn', 'Attention', 'Le nom est obligatoire');
            return;
        }
        if (!formData.firstName?.trim()) {
            showToast('warn', 'Attention', 'Le prénom est obligatoire');
            return;
        }
        if (!formData.phonePrimary?.trim()) {
            showToast('warn', 'Attention', 'Le téléphone principal est obligatoire');
            return;
        }
        if (!formData.roleId) {
            showToast('warn', 'Attention', 'Le rôle dans le groupe est obligatoire');
            return;
        }
        if (!selectedGroupForMembers) return;

        const payload = {
            profileFirstName: formData.firstName,
            profileLastName: formData.lastName,
            profileGender: formData.gender,
            profileDateOfBirth: formData.dateOfBirth || null,
            profilePlaceOfBirth: formData.placeOfBirth,
            profileIdDocumentTypeId: formData.idDocumentTypeId,
            profileIdDocumentNumber: formData.idDocumentNumber,
            profileIdDocumentIssueDate: formData.idDocumentIssueDate || null,
            profileIdDocumentExpiryDate: formData.idDocumentExpiryDate || null,
            profilePhonePrimary: formData.phonePrimary,
            profilePhoneSecondary: formData.phoneSecondary,
            profileEmail: formData.email,
            profileProvinceId: formData.provinceId,
            profileCommuneId: formData.communeId,
            profileZoneId: formData.zoneId,
            profileStreetAddress: formData.streetAddress,
            roleId: formData.roleId,
            joinDate: formData.joinDate,
            shareContribution: formData.shareContribution,
            espaceHumaineDocumentPath: formData.espaceHumaineDocumentPath || null,
            idCarteDocumentPath: formData.idCarteDocumentPath || null,
            userAction: getConnectedUser()
        };

        fetchMemberData(payload, 'POST', `${BASE_URL}/${selectedGroupForMembers.id}/members/add-member-profile`, 'addMember');
    };

    const openChangeStatusDialog = (member: GroupMember) => {
        setMemberForStatusChange(member);
        setNewMemberStatus(member.status || '');
        setStatusChangeReason('');
        setChangeStatusDialog(true);
    };

    const openEditMemberDialog = async (member: GroupMember) => {
        const p = member.memberProfile;
        const cl = member.client as any;

        // Fetch existing documents so we can show them as pre-loaded
        let espaceHumainePath = '';
        let idCartePath = '';
        if (selectedGroupForMembers) {
            try {
                const token = Cookies.get('token');
                const res = await fetch(
                    buildApiUrl(`/api/solidarity-groups/${selectedGroupForMembers.id}/members/${member.id}/documents`),
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (res.ok) {
                    const docs: any[] = await res.json();
                    espaceHumainePath = docs.find(d => d.documentType === 'ESPACE_HUMAINE')?.filePath || '';
                    idCartePath = docs.find(d => d.documentType === 'ID_CARTE')?.filePath || '';
                }
            } catch { /* ignore */ }
        }

        const initialData: Partial<NewMemberFormData> = {
            // Identity
            firstName: p?.firstName || cl?.firstName || '',
            lastName: p?.lastName || cl?.lastName || '',
            gender: p?.gender || '',
            dateOfBirth: p?.dateOfBirth || '',
            placeOfBirth: p?.placeOfBirth || '',
            // ID Document
            idDocumentTypeId: p?.idDocumentTypeId || null,
            idDocumentNumber: p?.idDocumentNumber || '',
            idDocumentIssueDate: p?.idDocumentIssueDate || '',
            idDocumentExpiryDate: p?.idDocumentExpiryDate || '',
            // Contact
            phonePrimary: p?.phonePrimary || cl?.phonePrimary || '',
            phoneSecondary: p?.phoneSecondary || '',
            email: p?.email || cl?.email || '',
            // Address
            provinceId: p?.provinceId || null,
            communeId: p?.communeId || null,
            zoneId: p?.zoneId || null,
            streetAddress: p?.streetAddress || '',
            // Group membership
            roleId: member.role?.id || (member as any).roleId || null,
            joinDate: member.joinDate || '',
            shareContribution: member.shareContribution || 0,
            branchId: (selectedGroupForMembers as any)?.branch?.id || selectedGroupForMembers?.branchId || null,
            // Existing documents
            espaceHumaineDocumentPath: espaceHumainePath,
            idCarteDocumentPath: idCartePath,
        };
        setMemberEditInitialData(initialData);
        setMemberForEdit(member);
        setEditMemberDialog(true);
    };

    const handleStatusChange = () => {
        if (!memberForStatusChange || !selectedGroupForMembers || !newMemberStatus) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un nouveau statut');
            return;
        }
        const url = `${BASE_URL}/${selectedGroupForMembers.id}/members/${memberForStatusChange.id}/update-status?newStatus=${encodeURIComponent(newMemberStatus)}&reason=${encodeURIComponent(statusChangeReason)}&userAction=${encodeURIComponent(getConnectedUser())}`;
        fetchMemberData(null, 'PUT', url, 'updateStatus');
    };

    const handleMemberProfileUpdate = (formData: NewMemberFormData) => {
        if (!memberForEdit || !selectedGroupForMembers) return;
        const payload = {
            profileFirstName: formData.firstName,
            profileLastName: formData.lastName,
            profileGender: formData.gender,
            profileDateOfBirth: formData.dateOfBirth || null,
            profilePlaceOfBirth: formData.placeOfBirth,
            profileIdDocumentTypeId: formData.idDocumentTypeId,
            profileIdDocumentNumber: formData.idDocumentNumber,
            profileIdDocumentIssueDate: formData.idDocumentIssueDate || null,
            profileIdDocumentExpiryDate: formData.idDocumentExpiryDate || null,
            profilePhonePrimary: formData.phonePrimary,
            profilePhoneSecondary: formData.phoneSecondary,
            profileEmail: formData.email,
            profileProvinceId: formData.provinceId,
            profileCommuneId: formData.communeId,
            profileZoneId: formData.zoneId,
            profileStreetAddress: formData.streetAddress,
            roleId: formData.roleId,
            joinDate: formData.joinDate,
            shareContribution: formData.shareContribution,
            espaceHumaineDocumentPath: formData.espaceHumaineDocumentPath || null,
            idCarteDocumentPath: formData.idCarteDocumentPath || null,
            userAction: getConnectedUser()
        };
        fetchMemberData(payload, 'PUT', `${BASE_URL}/${selectedGroupForMembers.id}/members/${memberForEdit.id}/update-profile`, 'updateProfile');
    };

    const confirmRemoveMember = (member: GroupMember) => {
        const memberName = member.client
            ? `${member.client.firstName || ''} ${member.client.lastName || ''}`.trim()
            : member.memberProfile
                ? `${member.memberProfile.firstName || ''} ${member.memberProfile.lastName || ''}`.trim()
                : member.clientName || 'ce membre';
        confirmDialog({
            message: `Voulez-vous vraiment retirer "${memberName}" du groupe ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, Retirer',
            rejectLabel: 'Non',
            accept: () => {
                if (selectedGroupForMembers) {
                    fetchMemberData(null, 'DELETE', `${BASE_URL}/${selectedGroupForMembers.id}/members/${member.id}/remove?reason=Retrait manuel`, 'removeMember');
                }
            }
        });
    };

    const approveGroup = (group: SolidarityGroup) => {
        confirmDialog({
            message: `Voulez-vous approuver le groupe "${group.groupName}" ?`,
            header: 'Confirmation d\'Approbation',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, Approuver',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'PUT', `${BASE_URL}/approve/${group.id}`, 'approveGroup');
            }
        });
    };

    const confirmDelete = (group: SolidarityGroup) => {
        confirmDialog({
            message: `Voulez-vous vraiment supprimer le groupe "${group.groupName}" ?`,
            header: 'Confirmation de Suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, Supprimer',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${group.id}`, 'deleteGroup');
            }
        });
    };

    const getStatusSeverity = (status: GroupStatus): "success" | "info" | "warning" | "danger" | null => {
        switch (status) {
            case GroupStatus.ACTIVE: return 'success';
            case GroupStatus.PENDING_APPROVAL: return 'info';
            case GroupStatus.INACTIVE: return 'warning';
            case GroupStatus.SUSPENDED: return 'warning';
            case GroupStatus.DISSOLVED: return 'danger';
            default: return null;
        }
    };

    // Statistics calculation
    const getStats = () => {
        const total = groups.length;
        const active = groups.filter(g => g.status === GroupStatus.ACTIVE).length;
        const pending = groups.filter(g => g.status === GroupStatus.PENDING_APPROVAL).length;
        const inactive = groups.filter(g => g.status === GroupStatus.INACTIVE).length;
        const totalMembers = groups.reduce((sum, g) => sum + (g.currentMemberCount || 0), 0);
        return { total, active, pending, inactive, totalMembers };
    };

    const stats = getStats();

    const statusBodyTemplate = (rowData: SolidarityGroup) => {
        const statusLabels: Record<GroupStatus, string> = {
            [GroupStatus.PENDING_APPROVAL]: 'En Attente',
            [GroupStatus.ACTIVE]: 'Actif',
            [GroupStatus.INACTIVE]: 'Inactif',
            [GroupStatus.SUSPENDED]: 'Suspendu',
            [GroupStatus.DISSOLVED]: 'Dissous'
        };
        return <Tag value={statusLabels[rowData.status]} severity={getStatusSeverity(rowData.status)} />;
    };

    const memberCountTemplate = (rowData: SolidarityGroup) => {
        return (
            <span className="font-semibold">
                {rowData.currentMemberCount} / {rowData.maxMembers}
            </span>
        );
    };

    const frequencyTemplate = (rowData: SolidarityGroup) => {
        const labels: Record<MeetingFrequency, string> = {
            [MeetingFrequency.WEEKLY]: 'Hebdomadaire',
            [MeetingFrequency.BIWEEKLY]: 'Bimensuel',
            [MeetingFrequency.MONTHLY]: 'Mensuel',
            [MeetingFrequency.CUSTOM]: 'Personnalisé'
        };
        return labels[rowData.meetingFrequency] || rowData.meetingFrequency;
    };

    const groupNameTemplate = (rowData: SolidarityGroup) => {
        const getAvatarColor = (status: GroupStatus) => {
            switch (status) {
                case GroupStatus.ACTIVE: return '#22C55E';
                case GroupStatus.PENDING_APPROVAL: return '#F59E0B';
                case GroupStatus.INACTIVE: return '#3B82F6';
                case GroupStatus.SUSPENDED: return '#EF4444';
                case GroupStatus.DISSOLVED: return '#6B7280';
                default: return '#6366F1';
            }
        };

        return (
            <div className="flex align-items-center gap-2">
                <Avatar
                    icon="pi pi-users"
                    size="normal"
                    shape="circle"
                    style={{ backgroundColor: getAvatarColor(rowData.status), color: '#ffffff' }}
                />
                <div>
                    <div className="font-semibold">{rowData.groupName}</div>
                    <div className="text-sm text-500">{rowData.groupCode}</div>
                </div>
            </div>
        );
    };

    const optionButtons = (data: SolidarityGroup): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-1'>
                <Button
                    icon="pi pi-eye"
                    onClick={() => viewGroupDetails(data)}
                    rounded
                    text
                    severity='info'
                    tooltip="Voir les détails"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                />
                <Button
                    icon="pi pi-users"
                    onClick={() => openMemberDialog(data)}
                    rounded
                    text
                    severity='help'
                    tooltip="Gérer les membres"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                />
                {data.status === GroupStatus.PENDING_APPROVAL && (
                    <Button
                        icon="pi pi-check-circle"
                        onClick={() => approveGroup(data)}
                        rounded
                        text
                        severity='success'
                        tooltip="Approuver le groupe"
                        tooltipOptions={{ position: 'top' }}
                        size="small"
                    />
                )}
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadGroupToEdit(data)}
                    rounded
                    text
                    severity='warning'
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                />
                {data.status !== GroupStatus.ACTIVE && (
                    <Button
                        icon="pi pi-trash"
                        onClick={() => confirmDelete(data)}
                        rounded
                        text
                        severity='danger'
                        tooltip="Supprimer"
                        tooltipOptions={{ position: 'top' }}
                        size="small"
                    />
                )}
            </div>
        );
    };

    const memberStatusTemplate = (rowData: GroupMember) => {
        const statusLabels: Record<MemberStatus, string> = {
            [MemberStatus.PENDING]: 'En Attente',
            [MemberStatus.ACTIVE]: 'Actif',
            [MemberStatus.SUSPENDED]: 'Suspendu',
            [MemberStatus.WITHDRAWN]: 'Retiré',
            [MemberStatus.EXCLUDED]: 'Exclu'
        };
        const getSeverity = (status: MemberStatus): "success" | "info" | "warning" | "danger" | null => {
            switch (status) {
                case MemberStatus.ACTIVE: return 'success';
                case MemberStatus.PENDING: return 'info';
                case MemberStatus.SUSPENDED: return 'warning';
                case MemberStatus.WITHDRAWN: return 'warning';
                case MemberStatus.EXCLUDED: return 'danger';
                default: return null;
            }
        };
        return <Tag value={statusLabels[rowData.status]} severity={getSeverity(rowData.status)} />;
    };

    const memberDateTemplate = (rowData: GroupMember) => {
        return rowData.joinDate ? new Date(rowData.joinDate).toLocaleDateString('fr-FR') : 'N/A';
    };

    const memberAmountTemplate = (rowData: GroupMember, field: 'shareContribution' | 'totalContributions') => {
        const value = rowData[field];
        return value ? `${value.toLocaleString('fr-FR')} BIF` : '0 BIF';
    };

    const memberClientTemplate = (rowData: GroupMember) => {
        let displayName: string;
        let displaySub: string;
        if (rowData.client) {
            displayName = `${rowData.client.firstName || ''} ${rowData.client.lastName || ''} ${rowData.client.businessName || ''}`.trim() || 'N/A';
            displaySub = rowData.client.clientNumber || rowData.clientNumber || '';
        } else if (rowData.memberProfile) {
            displayName = `${rowData.memberProfile.firstName || ''} ${rowData.memberProfile.lastName || ''}`.trim() || 'N/A';
            displaySub = rowData.clientName || '';
        } else {
            displayName = rowData.clientName || 'N/A';
            displaySub = rowData.clientNumber || '';
        }
        return (
            <div className="flex flex-column">
                <span className="font-semibold">{displayName}</span>
                {displaySub && <small className="text-500">{displaySub}</small>}
            </div>
        );
    };

    const memberRoleTemplate = (rowData: GroupMember) => {
        const roleName = rowData.role?.name || rowData.roleName || 'N/A';
        const isExec = rowData.isExecutive || rowData.role?.isExecutive;
        return (
            <div className="flex align-items-center gap-2">
                <span>{roleName}</span>
                {isExec && <Tag value="Exécutif" severity="warning" className="text-xs" />}
            </div>
        );
    };

    const memberPhoneTemplate = (rowData: GroupMember) => {
        return rowData.client?.phonePrimary || rowData.memberProfile?.phonePrimary || rowData.clientPhone || 'N/A';
    };

    const memberActions = (rowData: GroupMember): React.ReactNode => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-eye"
                    onClick={() => {
                        setSelectedMember(rowData);
                        setMemberDocuments([]);
                        // Reset & resolve location names
                        const mp = rowData.memberProfile;
                        const provName = mp?.provinceId ? (provinces.find(p => p.id === mp.provinceId)?.name || '') : '';
                        setMemberLocationNames({ province: provName, commune: '', zone: '' });
                        if (mp?.provinceId) {
                            fetchLocationData(null, 'GET', `${REF_URL}/communes/findbyprovince/${mp.provinceId}`, 'loadViewCommunes');
                        }
                        if (selectedGroupForMembers) {
                            fetchDocsData(null, 'GET', `${BASE_URL}/${selectedGroupForMembers.id}/members/${rowData.id}/documents`, 'loadMemberDocs');
                        }
                        setViewMemberDialog(true);
                    }}
                    rounded
                    text
                    severity='info'
                    tooltip="Voir les détails"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                />
                <Button
                    icon="pi pi-sync"
                    onClick={() => openChangeStatusDialog(rowData)}
                    rounded
                    text
                    severity='warning'
                    tooltip="Changer le statut"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                />
                {rowData.status !== MemberStatus.ACTIVE && (
                    <Button
                        icon="pi pi-pencil"
                        onClick={() => openEditMemberDialog(rowData)}
                        rounded
                        text
                        severity='success'
                        tooltip="Modifier le membre"
                        tooltipOptions={{ position: 'top' }}
                        size="small"
                    />
                )}
                <Button
                    icon="pi pi-user-minus"
                    onClick={() => confirmRemoveMember(rowData)}
                    rounded
                    text
                    severity='danger'
                    tooltip="Retirer du groupe"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                />
            </div>
        );
    };

    const renderSearch = () => {
        return (
            <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3 mb-3">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        icon="pi pi-refresh"
                        label="Actualiser"
                        outlined
                        onClick={loadAllData}
                    />
                </div>
                <div className="flex gap-2 align-items-center">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{ width: '250px' }}
                        />
                    </span>
                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* View Group Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-users text-2xl text-primary"></i>
                        <span>Détails du Groupe</span>
                    </div>
                }
                visible={viewGroupDialog}
                style={{ width: '90vw', maxWidth: '1200px' }}
                modal
                onHide={() => setViewGroupDialog(false)}
            >
                <div className="grid">
                    {/* Left Column */}
                    <div className="col-12 md:col-4">
                        {/* Profile Card */}
                        <Card className="mb-3">
                            <div className="flex flex-column align-items-center text-center mb-3">
                                <Avatar
                                    icon="pi pi-users"
                                    size="xlarge"
                                    shape="circle"
                                    className="bg-blue-100 text-blue-600"
                                    style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                                />
                                <h4 className="m-0 mt-3">{groupEdit.groupName}</h4>
                                <p className="text-500 m-0">{groupEdit.groupCode}</p>
                                <div className="flex gap-2 mt-2 flex-wrap justify-content-center">
                                    <Tag value={(groupEdit as any).groupType?.name || 'N/A'} severity="info" />
                                    {statusBodyTemplate(groupEdit)}
                                </div>
                            </div>
                            <Divider />
                            <div className="flex flex-column gap-2">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-calendar text-primary"></i>
                                    <span className="font-semibold">Formé le {groupEdit.formationDate ? new Date(groupEdit.formationDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-building text-primary"></i>
                                    <span>{(groupEdit as any).branch?.name || 'Non assigné'}</span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-briefcase text-primary"></i>
                                    <span>{(groupEdit as any).primarySector?.name || 'N/A'}</span>
                                </div>
                                {groupEdit.groupDescription && (
                                    <>
                                        <Divider className="my-2" />
                                        <p className="m-0 text-600 text-sm line-height-3">{groupEdit.groupDescription}</p>
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* Localisation */}
                        <Card title="Localisation" className="mb-3">
                            <div className="flex flex-column gap-3">
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Province</span>
                                    <span className="font-semibold">{(groupEdit as any).province?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Commune</span>
                                    <span className="font-semibold">{(groupEdit as any).commune?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Zone</span>
                                    <span className="font-semibold">{(groupEdit as any).zone?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Lieu de Réunion</span>
                                    <span className="font-semibold text-right" style={{ maxWidth: '60%' }}>{groupEdit.meetingLocation || 'N/A'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Dissolution Info (if applicable) */}
                        {groupEdit.status === GroupStatus.DISSOLVED && (
                            <Card className="mb-3 bg-red-50">
                                <div className="flex align-items-center gap-2 mb-3">
                                    <i className="pi pi-exclamation-triangle text-red-500 text-xl"></i>
                                    <span className="font-bold text-red-600">Groupe Dissous</span>
                                </div>
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date</span>
                                        <span className="font-semibold text-red-600">{groupEdit.dissolutionDate ? new Date(groupEdit.dissolutionDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    {groupEdit.dissolutionReason && (
                                        <div className="mt-2">
                                            <span className="text-500">Raison:</span>
                                            <p className="m-0 mt-1 text-red-600 text-sm">{groupEdit.dissolutionReason}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Middle Column */}
                    <div className="col-12 md:col-4">
                        {/* Membres & Réunions */}
                        <Card title="Membres & Réunions" className="mb-3">
                            <div className="flex flex-column gap-3">
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Membres Actuels</span>
                                    <Tag
                                        value={`${groupEdit.currentMemberCount || 0} / ${groupEdit.maxMembers || 30}`}
                                        severity={groupEdit.currentMemberCount && groupEdit.currentMemberCount >= (groupEdit.minMembers || 5) ? 'success' : 'warning'}
                                    />
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Minimum Requis</span>
                                    <span className="font-semibold">{groupEdit.minMembers || 5}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Maximum Autorisé</span>
                                    <span className="font-semibold">{groupEdit.maxMembers || 30}</span>
                                </div>
                                <Divider className="my-1" />
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Fréquence</span>
                                    <span className="font-semibold">{frequencyTemplate(groupEdit)}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Jour</span>
                                    <span className="font-semibold">{groupEdit.meetingDay || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Heure</span>
                                    <span className="font-semibold">{groupEdit.meetingTime || 'N/A'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Informations Financières */}
                        <Card title="Informations Financières" className="mb-3">
                            <div className="flex flex-column gap-3">
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Frais d'Adhésion</span>
                                    <span className="font-semibold">{groupEdit.membershipFee ? `${groupEdit.membershipFee.toLocaleString('fr-FR')} BIF` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Objectif d'Épargne</span>
                                    <span className="font-semibold">{groupEdit.savingsTarget ? `${groupEdit.savingsTarget.toLocaleString('fr-FR')} BIF` : 'N/A'}</span>
                                </div>
                                <Divider className="my-1" />
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Solde Épargne Collective</span>
                                    <span className="font-bold text-lg text-green-600">{groupEdit.collectiveSavingsBalance ? `${groupEdit.collectiveSavingsBalance.toLocaleString('fr-FR')} BIF` : '0 BIF'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Garantie */}
                        <Card title="Garantie" className="mb-3">
                            <div className="flex flex-column gap-3">
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Type</span>
                                    <span className="font-semibold">{(groupEdit as any).guaranteeType?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Montant</span>
                                    <span className="font-semibold">{groupEdit.guaranteeAmount ? `${groupEdit.guaranteeAmount.toLocaleString('fr-FR')} BIF` : 'N/A'}</span>
                                </div>
                                {groupEdit.guaranteeDescription && (
                                    <div className="mt-1">
                                        <span className="text-500 text-sm">Description:</span>
                                        <p className="m-0 mt-1 text-600 text-sm">{groupEdit.guaranteeDescription}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="col-12 md:col-4">
                        {/* Performance */}
                        <Card title="Performance" className="mb-3">
                            <div className="flex flex-column gap-3">
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Cohésion du Groupe</span>
                                    <Tag
                                        value={
                                            groupEdit.cohesionRating === 'EXCELLENT' ? 'Excellent' :
                                            groupEdit.cohesionRating === 'GOOD' ? 'Bon' :
                                            groupEdit.cohesionRating === 'FAIR' ? 'Acceptable' :
                                            groupEdit.cohesionRating === 'POOR' ? 'Faible' : 'N/A'
                                        }
                                        severity={
                                            groupEdit.cohesionRating === 'EXCELLENT' ? 'success' :
                                            groupEdit.cohesionRating === 'GOOD' ? 'info' :
                                            groupEdit.cohesionRating === 'FAIR' ? 'warning' :
                                            groupEdit.cohesionRating === 'POOR' ? 'danger' : null
                                        }
                                    />
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Taux de Présence</span>
                                    <span className="font-semibold">{groupEdit.averageAttendanceRate ? `${groupEdit.averageAttendanceRate}%` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Taux de Remboursement</span>
                                    <span className="font-semibold">{groupEdit.repaymentRate ? `${groupEdit.repaymentRate}%` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between align-items-center">
                                    <span className="text-500">Dernière Évaluation</span>
                                    <span className="font-semibold">{groupEdit.lastPerformanceReview ? new Date(groupEdit.lastPerformanceReview).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Documents */}
                        <Card title="Documents" className="mb-3">
                            <div className="flex flex-column">
                                <span className="text-500 mb-2">Statuts / Règlement Intérieur</span>
                                {groupEdit.bylawsDocumentPath ? (
                                    <div className="surface-100 border-round p-3">
                                        {groupEdit.bylawsDocumentPath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                            <Image
                                                src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(groupEdit.bylawsDocumentPath)}`)}
                                                alt="Document"
                                                width="100%"
                                                preview
                                                imageClassName="border-round shadow-1 w-full"
                                            />
                                        ) : (
                                            <div className="flex flex-column gap-2">
                                                <Button
                                                    icon="pi pi-eye"
                                                    label="Voir le document"
                                                    className="p-button-outlined p-button-info w-full"
                                                    onClick={() => window.open(buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(groupEdit.bylawsDocumentPath)}`), '_blank')}
                                                />
                                                <div className="flex align-items-center gap-2 text-500">
                                                    <i className="pi pi-file"></i>
                                                    <small className="white-space-nowrap overflow-hidden text-overflow-ellipsis">{groupEdit.bylawsDocumentPath.split('/').pop()}</small>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="surface-100 border-round p-4 text-center">
                                        <i className="pi pi-file text-4xl text-300 mb-2" style={{ display: 'block' }}></i>
                                        <span className="text-500">Aucun document joint</span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Notes */}
                        {groupEdit.notes && (
                            <Card title="Notes" className="mb-3">
                                <p className="m-0 text-600 line-height-3">{groupEdit.notes}</p>
                            </Card>
                        )}

                        {/* Créé par */}
                        {groupEdit.userAction && (
                            <Card title="Informations de Création">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-user text-primary"></i>
                                    <span className="text-500">Créé par:</span>
                                    <span className="font-semibold text-primary">{groupEdit.userAction}</span>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
                <Divider className="mt-4 mb-3" />
                <div className="flex justify-content-between flex-wrap gap-2">
                    <Button
                        label="Gérer les Membres"
                        icon="pi pi-users"
                        severity="help"
                        onClick={() => {
                            setViewGroupDialog(false);
                            openMemberDialog(groupEdit);
                        }}
                    />
                    <div className="flex gap-2">
                        <Button
                            label="Modifier"
                            icon="pi pi-pencil"
                            severity="warning"
                            outlined
                            onClick={() => {
                                setViewGroupDialog(false);
                                loadGroupToEdit(groupEdit);
                            }}
                        />
                        <Button
                            label="Fermer"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setViewGroupDialog(false)}
                        />
                    </div>
                </div>
            </Dialog>

            {/* Edit Group Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-pencil text-xl text-warning"></i>
                        <span>Modifier le Groupe: {groupEdit.groupName}</span>
                    </div>
                }
                visible={editGroupDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditGroupDialog(false)}
            >
                <SolidarityGroupForm
                    group={groupEdit}
                    handleChange={handleChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleTimeChange={handleTimeChangeEdit}
                    groupTypes={groupTypes}
                    guaranteeTypes={guaranteeTypes}
                    provinces={provinces}
                    communes={communes}
                    zones={zones}
                    activitySectors={activitySectors}
                    branches={branches}
                    onProvinceChange={handleProvinceChange}
                    onCommuneChange={handleCommuneChange}
                    bylawsDocumentFile={bylawsDocumentFileEdit}
                    handleFileUpload={handleFileUploadEdit}
                    handleFileRemove={handleFileRemoveEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditGroupDialog(false)}
                        className="p-button-text"
                    />
                    <Button
                        label="Enregistrer"
                        icon="pi pi-check"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />
                </div>
            </Dialog>

            {/* Members Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-3">
                        <Avatar icon="pi pi-users" size="large" shape="circle" className="bg-purple-500 text-white" />
                        <div>
                            <div className="text-xl font-bold">Membres du Groupe</div>
                            <div className="text-sm text-500">{selectedGroupForMembers?.groupName || ''}</div>
                        </div>
                    </div>
                }
                visible={memberDialog}
                style={{ width: '90vw', maxWidth: '1400px' }}
                modal
                onHide={() => setMemberDialog(false)}
            >
                {/* Member Stats */}
                <div className="grid mb-3">
                    <div className="col-6 md:col-3">
                        <div className="surface-100 border-round p-3 text-center">
                            <div className="text-500 text-sm mb-1">Total Membres</div>
                            <div className="text-2xl font-bold text-primary">{members.length}</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-3">
                        <div className="surface-100 border-round p-3 text-center">
                            <div className="text-500 text-sm mb-1">Membres Actifs</div>
                            <div className="text-2xl font-bold text-green-500">
                                {members.filter(m => m.status === MemberStatus.ACTIVE).length}
                            </div>
                        </div>
                    </div>
                    <div className="col-6 md:col-3">
                        <div className="surface-100 border-round p-3 text-center">
                            <div className="text-500 text-sm mb-1">Capacité Max</div>
                            <div className="text-2xl font-bold text-blue-500">{selectedGroupForMembers?.maxMembers || 0}</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-3">
                        <div className="surface-100 border-round p-3 text-center">
                            <div className="text-500 text-sm mb-1">Places Disponibles</div>
                            <div className="text-2xl font-bold text-orange-500">
                                {(selectedGroupForMembers?.maxMembers || 0) - members.length}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-content-end mb-3">
                    <Button
                        label="Ajouter un Membre"
                        icon="pi pi-user-plus"
                        onClick={openAddMemberDialog}
                        disabled={members.length >= (selectedGroupForMembers?.maxMembers || 0)}
                    />
                </div>
                <DataTable
                    value={members}
                    loading={memberLoading}
                    emptyMessage={
                        <div className="text-center py-4">
                            <i className="pi pi-user-plus text-4xl text-300 mb-3" style={{ display: 'block' }}></i>
                            <p className="text-500 m-0">Aucun membre dans ce groupe</p>
                            <p className="text-400 text-sm mt-2">Cliquez sur "Ajouter un Membre" pour commencer</p>
                        </div>
                    }
                    paginator
                    rows={10}
                    stripedRows
                    scrollable
                    scrollHeight="400px"
                >
                    <Column header="Membre" body={memberClientTemplate} style={{ minWidth: '180px' }} />
                    <Column header="Rôle" body={memberRoleTemplate} style={{ minWidth: '150px' }} />
                    <Column header="Téléphone" body={memberPhoneTemplate} style={{ minWidth: '120px' }} />
                    <Column header="Date d'Adhésion" body={memberDateTemplate} style={{ minWidth: '120px' }} />
                    <Column field="membershipNumber" header="N° Membre" style={{ minWidth: '100px' }} />
                    <Column header="Contribution" body={(rowData) => memberAmountTemplate(rowData, 'shareContribution')} style={{ minWidth: '120px' }} />
                    <Column header="Total Contributions" body={(rowData) => memberAmountTemplate(rowData, 'totalContributions')} style={{ minWidth: '140px' }} />
                    <Column header="Statut" body={memberStatusTemplate} style={{ minWidth: '100px' }} />
                    <Column field="userAction" header="Ajouté par" style={{ minWidth: '120px' }} />
                    <Column header="Actions" body={memberActions} style={{ width: '100px' }} frozen alignFrozen="right" />
                </DataTable>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user-plus text-xl text-primary"></i>
                        <span>Ajouter un Nouveau Membre — {selectedGroupForMembers?.groupName}</span>
                    </div>
                }
                visible={addMemberDialog}
                style={{ width: '75vw', maxWidth: '950px' }}
                modal
                onHide={() => setAddMemberDialog(false)}
                maximizable
            >
                <AddGroupMemberForm
                    loading={memberLoading}
                    onAdd={handleNewMemberSubmit}
                    onCancel={() => setAddMemberDialog(false)}
                />
            </Dialog>

            {/* View Member Details Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user text-2xl text-primary"></i>
                        <span>Détails du Membre</span>
                    </div>
                }
                visible={viewMemberDialog}
                style={{ width: '90vw', maxWidth: '1200px' }}
                modal
                onHide={() => {
                    setViewMemberDialog(false);
                    setSelectedMember(null);
                    setMemberDocuments([]);
                    setMemberLocationNames({ province: '', commune: '', zone: '' });
                }}
                maximizable
            >
                {selectedMember && (() => {
                    const mp = selectedMember.memberProfile;
                    const cl = selectedMember.client;
                    const fullName = cl
                        ? (`${cl.firstName || ''} ${cl.lastName || ''}`.trim() || cl.businessName || 'N/A')
                        : mp
                            ? `${mp.firstName || ''} ${mp.lastName || ''}`.trim() || 'N/A'
                            : selectedMember.clientName || 'N/A';
                    const genderLabel = mp?.gender === 'M' ? 'Masculin'
                        : mp?.gender === 'F' ? 'Féminin' : null;
                    return (
                        <div className="grid">
                            {/* ─── Column 1: Identité ─── */}
                            <div className="col-12 md:col-4">
                                <Card className="mb-3">
                                    <div className="flex flex-column align-items-center text-center mb-3">
                                        <Avatar
                                            icon="pi pi-user"
                                            size="xlarge"
                                            shape="circle"
                                            className="bg-primary text-white"
                                            style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                                        />
                                        <h4 className="m-0 mt-3">{fullName}</h4>
                                        <p className="text-500 m-0 text-sm">{cl?.clientNumber || selectedMember.clientNumber || (mp ? 'Profil Groupe' : '')}</p>
                                        <div className="flex gap-2 mt-2 flex-wrap justify-content-center">
                                            <Tag value={selectedMember.role?.name || selectedMember.roleName || 'N/A'} severity="info" />
                                            {memberStatusTemplate(selectedMember)}
                                        </div>
                                        {(selectedMember.isExecutive || selectedMember.role?.isExecutive) && (
                                            <Tag value="Membre Exécutif" severity="warning" className="mt-2" />
                                        )}
                                    </div>
                                    <Divider />
                                    <div className="flex flex-column gap-2">
                                        {genderLabel && (
                                            <div className="flex justify-content-between align-items-center">
                                                <span className="text-500">Genre</span>
                                                <span className="font-semibold">{genderLabel}</span>
                                            </div>
                                        )}
                                        {mp?.dateOfBirth && (
                                            <div className="flex justify-content-between align-items-center">
                                                <span className="text-500">Date de naissance</span>
                                                <span className="font-semibold">{new Date(mp.dateOfBirth).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        )}
                                        {mp?.placeOfBirth && (
                                            <div className="flex justify-content-between align-items-center">
                                                <span className="text-500">Lieu de naissance</span>
                                                <span className="font-semibold">{mp.placeOfBirth}</span>
                                            </div>
                                        )}
                                        {selectedMember.membershipNumber && (
                                            <div className="flex justify-content-between align-items-center">
                                                <span className="text-500">N° Membre</span>
                                                <span className="font-semibold">{selectedMember.membershipNumber}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Membre depuis</span>
                                            <span className="font-semibold">{selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Document d'identité */}
                                <Card title="Document d'Identité" className="mb-3">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">N° Document</span>
                                            <span className="font-semibold">{mp?.idDocumentNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Date d'émission</span>
                                            <span className="font-semibold">
                                                {mp?.idDocumentIssueDate ? new Date(mp.idDocumentIssueDate).toLocaleDateString('fr-FR') : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Date d'expiration</span>
                                            <span className="font-semibold">
                                                {mp?.idDocumentExpiryDate ? new Date(mp.idDocumentExpiryDate).toLocaleDateString('fr-FR') : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* ─── Column 2: Contact, Adresse, Groupe ─── */}
                            <div className="col-12 md:col-4">
                                <Card title="Coordonnées" className="mb-3">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-phone text-primary"></i>
                                            <span className="text-500 w-8rem">Tél. Principal</span>
                                            <span className="font-semibold">{mp?.phonePrimary || cl?.phonePrimary || selectedMember.clientPhone || 'N/A'}</span>
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-phone text-500"></i>
                                            <span className="text-500 w-8rem">Tél. Secondaire</span>
                                            <span className="font-semibold">{mp?.phoneSecondary || 'N/A'}</span>
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-envelope text-primary"></i>
                                            <span className="text-500 w-8rem">Email</span>
                                            <span className="font-semibold" style={{ wordBreak: 'break-all' }}>{mp?.email || cl?.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Adresse" className="mb-3">
                                    <div className="flex flex-column gap-2">
                                        {mp?.streetAddress && (
                                            <div className="flex justify-content-between align-items-start">
                                                <span className="text-500">Rue / Quartier</span>
                                                <span className="font-semibold text-right" style={{ maxWidth: '60%' }}>{mp.streetAddress}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Province</span>
                                            <span className="font-semibold">{memberLocationNames.province || (mp?.provinceId ? '...' : 'N/A')}</span>
                                        </div>
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Commune</span>
                                            <span className="font-semibold">{memberLocationNames.commune || (mp?.communeId ? '...' : 'N/A')}</span>
                                        </div>
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Zone</span>
                                            <span className="font-semibold">{memberLocationNames.zone || (mp?.zoneId ? '...' : 'N/A')}</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Participation au Groupe" className="mb-3">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Rôle</span>
                                            <div className="flex align-items-center gap-1">
                                                <span className="font-semibold">{selectedMember.role?.name || selectedMember.roleName || 'N/A'}</span>
                                                {(selectedMember.isExecutive || selectedMember.role?.isExecutive) && (
                                                    <Tag value="Exécutif" severity="warning" className="text-xs" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Date d'Adhésion</span>
                                            <span className="font-semibold">{selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                        {selectedMember.approvedAt && (
                                            <div className="flex justify-content-between align-items-center">
                                                <span className="text-500">Approuvé le</span>
                                                <span className="font-semibold">{new Date(selectedMember.approvedAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* ─── Column 3: Finances, Statut, Historique ─── */}
                            <div className="col-12 md:col-4">
                                <Card title="Informations Financières" className="mb-3">
                                    <div className="flex flex-column gap-3">
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Contribution de Part</span>
                                            <span className="font-bold text-lg text-primary">
                                                {selectedMember.shareContribution ? `${selectedMember.shareContribution.toLocaleString('fr-FR')} BIF` : '0 BIF'}
                                            </span>
                                        </div>
                                        <Divider className="my-1" />
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">Total Contributions</span>
                                            <span className="font-bold text-lg text-green-600">
                                                {selectedMember.totalContributions ? `${selectedMember.totalContributions.toLocaleString('fr-FR')} BIF` : '0 BIF'}
                                            </span>
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Statut" className="mb-3">
                                    <div className="flex flex-column gap-3">
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-500">État Actuel</span>
                                            {memberStatusTemplate(selectedMember)}
                                        </div>
                                        {selectedMember.statusReason && (
                                            <div>
                                                <span className="text-500 text-sm">Raison:</span>
                                                <p className="m-0 mt-1 text-600 text-sm">{selectedMember.statusReason}</p>
                                            </div>
                                        )}
                                        {selectedMember.statusChangedAt && (
                                            <div className="flex justify-content-between align-items-center">
                                                <span className="text-500">Dernière modification</span>
                                                <span className="font-semibold">{new Date(selectedMember.statusChangedAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {(selectedMember.exitDate || selectedMember.exitType || selectedMember.exitReason) && (
                                    <Card className="mb-3 bg-red-50">
                                        <div className="flex align-items-center gap-2 mb-3">
                                            <i className="pi pi-sign-out text-red-500 text-xl"></i>
                                            <span className="font-bold text-red-600">Informations de Sortie</span>
                                        </div>
                                        <div className="flex flex-column gap-2">
                                            {selectedMember.exitDate && (
                                                <div className="flex justify-content-between">
                                                    <span className="text-500">Date de Sortie</span>
                                                    <span className="font-semibold text-red-600">{new Date(selectedMember.exitDate).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            )}
                                            {selectedMember.exitType && (
                                                <div className="flex justify-content-between">
                                                    <span className="text-500">Type</span>
                                                    <Tag
                                                        value={
                                                            selectedMember.exitType === 'VOLUNTARY_WITHDRAWAL' ? 'Retrait Volontaire' :
                                                            selectedMember.exitType === 'EXCLUSION' ? 'Exclusion' :
                                                            selectedMember.exitType === 'TRANSFER' ? 'Transfert' :
                                                            selectedMember.exitType === 'GROUP_DISSOLUTION' ? 'Dissolution Groupe' : selectedMember.exitType
                                                        }
                                                        severity="danger"
                                                    />
                                                </div>
                                            )}
                                            {selectedMember.exitReason && (
                                                <div className="mt-2">
                                                    <span className="text-500">Raison:</span>
                                                    <p className="m-0 mt-1 text-red-600 text-sm">{selectedMember.exitReason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )}

                                <Card title="Dates Clés" className="mb-3">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Adhésion</span>
                                            <span className="font-semibold">{selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                        {selectedMember.approvedAt && (
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Approbation</span>
                                                <span className="font-semibold">{new Date(selectedMember.approvedAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        )}
                                        {selectedMember.createdAt && (
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Créé le</span>
                                                <span className="font-semibold">{new Date(selectedMember.createdAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {selectedMember.notes && (
                                    <Card title="Notes" className="mb-3">
                                        <p className="m-0 text-600 line-height-3">{selectedMember.notes}</p>
                                    </Card>
                                )}

                                {selectedMember.userAction && (
                                    <Card title="Informations de Création">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-user text-primary"></i>
                                            <span className="text-500">Ajouté par:</span>
                                            <span className="font-semibold text-primary">{selectedMember.userAction}</span>
                                        </div>
                                    </Card>
                                )}
                            </div>

                            {/* ─── Documents Row (full width) ─── */}
                            <div className="col-12 mt-2">
                                <Card title="Documents Joints">
                                    {docsLoading ? (
                                        <div className="text-center py-3">
                                            <i className="pi pi-spin pi-spinner text-2xl text-primary"></i>
                                        </div>
                                    ) : memberDocuments.length === 0 ? (
                                        <div className="text-center py-3">
                                            <i className="pi pi-file text-3xl text-300 mb-2" style={{ display: 'block' }}></i>
                                            <span className="text-500">Aucun document joint</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-3">
                                            {memberDocuments.map((doc, idx) => {
                                                const isImage = doc.fileMimeType?.startsWith('image/') ||
                                                    !!doc.filePath?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
                                                const docLabel = doc.documentType === 'ESPACE_HUMAINE' ? 'Espace Humaine'
                                                    : doc.documentType === 'ID_CARTE' ? "Carte d'Identité"
                                                    : doc.documentType || 'Document';
                                                const fileUrl = doc.filePath
                                                    ? buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(doc.filePath)}`)
                                                    : '';
                                                return (
                                                    <div key={idx} className="surface-100 border-round p-3 flex flex-column align-items-center gap-2" style={{ minWidth: '180px', maxWidth: '220px' }}>
                                                        <Tag value={docLabel} severity="info" />
                                                        {isImage && fileUrl ? (
                                                            <Image
                                                                src={fileUrl}
                                                                alt={docLabel}
                                                                width="160"
                                                                preview
                                                                imageClassName="border-round shadow-1"
                                                            />
                                                        ) : fileUrl ? (
                                                            <Button
                                                                icon="pi pi-eye"
                                                                label="Voir"
                                                                className="p-button-outlined p-button-info w-full"
                                                                onClick={() => window.open(fileUrl, '_blank')}
                                                                size="small"
                                                            />
                                                        ) : null}
                                                        {doc.fileName && (
                                                            <small className="text-500 text-center text-xs" style={{ wordBreak: 'break-all' }}>
                                                                {doc.fileName}
                                                            </small>
                                                        )}
                                                        {doc.uploadedAt && (
                                                            <small className="text-400 text-xs">
                                                                {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                                                            </small>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    );
                })()}
                <Divider className="mt-3 mb-3" />
                <div className="flex justify-content-end gap-2">
                    <Button
                        label="Fermer"
                        icon="pi pi-times"
                        severity="secondary"
                        onClick={() => {
                            setViewMemberDialog(false);
                            setSelectedMember(null);
                        }}
                    />
                </div>
            </Dialog>

            {/* Change Member Status Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-sync text-xl text-orange-500"></i>
                        <span>Changer le Statut du Membre</span>
                    </div>
                }
                visible={changeStatusDialog}
                style={{ width: '450px' }}
                modal
                onHide={() => {
                    setChangeStatusDialog(false);
                    setMemberForStatusChange(null);
                    setNewMemberStatus('');
                    setStatusChangeReason('');
                }}
            >
                {memberForStatusChange && (
                    <div className="flex flex-column gap-3">
                        <div className="surface-100 border-round p-3">
                            <div className="font-semibold">
                                {memberForStatusChange.client
                                    ? `${(memberForStatusChange.client as any).firstName || ''} ${(memberForStatusChange.client as any).lastName || ''}`.trim()
                                    : memberForStatusChange.memberProfile
                                        ? `${memberForStatusChange.memberProfile.firstName || ''} ${memberForStatusChange.memberProfile.lastName || ''}`.trim()
                                        : memberForStatusChange.clientName || 'N/A'}
                            </div>
                            <div className="flex align-items-center gap-2 mt-1">
                                <span className="text-500 text-sm">Statut actuel:</span>
                                {memberStatusTemplate(memberForStatusChange)}
                            </div>
                        </div>
                        <div className="field">
                            <label className="font-semibold mb-2 block">Nouveau Statut *</label>
                            <Dropdown
                                value={newMemberStatus}
                                onChange={(e) => setNewMemberStatus(e.value)}
                                options={[
                                    { label: 'En Attente', value: 'PENDING' },
                                    { label: 'Actif', value: 'ACTIVE' },
                                    { label: 'Suspendu', value: 'SUSPENDED' },
                                    { label: 'Retiré', value: 'WITHDRAWN' },
                                    { label: 'Exclu', value: 'EXCLUDED' },
                                ]}
                                placeholder="Sélectionner un statut"
                                className="w-full"
                            />
                        </div>
                        <div className="field">
                            <label className="font-semibold mb-2 block">Raison</label>
                            <InputTextarea
                                value={statusChangeReason}
                                onChange={(e) => setStatusChangeReason(e.target.value)}
                                rows={3}
                                placeholder="Motif du changement de statut..."
                                className="w-full"
                            />
                        </div>
                        <div className="flex justify-content-end gap-2">
                            <Button
                                label="Annuler"
                                icon="pi pi-times"
                                severity="secondary"
                                onClick={() => {
                                    setChangeStatusDialog(false);
                                    setMemberForStatusChange(null);
                                    setNewMemberStatus('');
                                    setStatusChangeReason('');
                                }}
                            />
                            <Button
                                label="Confirmer"
                                icon="pi pi-check"
                                loading={memberLoading}
                                onClick={handleStatusChange}
                                disabled={!newMemberStatus}
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Edit Member Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user-edit text-xl text-primary"></i>
                        <span>Modifier le Membre</span>
                    </div>
                }
                visible={editMemberDialog}
                style={{ width: '75vw', maxWidth: '950px' }}
                modal
                onHide={() => {
                    setEditMemberDialog(false);
                    setMemberForEdit(null);
                    setMemberEditInitialData(undefined);
                }}
                maximizable
            >
                <AddGroupMemberForm
                    loading={memberLoading}
                    onAdd={handleMemberProfileUpdate}
                    onCancel={() => {
                        setEditMemberDialog(false);
                        setMemberForEdit(null);
                        setMemberEditInitialData(undefined);
                    }}
                    initialData={memberEditInitialData}
                    editMode
                />
            </Dialog>

            <div className="card">
                <div className="flex align-items-center justify-content-between mb-4">
                    <div className="flex align-items-center gap-3">
                        <Avatar icon="pi pi-users" size="xlarge" shape="circle" className="bg-purple-500 text-white" />
                        <div>
                            <h4 className="m-0 mb-1">Gestion des Groupes Solidaires</h4>
                            <p className="text-500 m-0 text-sm">Créez et gérez les groupes de solidarité et leurs membres</p>
                        </div>
                    </div>
                </div>
                <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                    <TabPanel header="Nouveau Groupe" leftIcon="pi pi-plus mr-2">
                        <SolidarityGroupForm
                            group={group}
                            handleChange={handleChange}
                            handleDropdownChange={handleDropdownChange}
                            handleNumberChange={handleNumberChange}
                            handleDateChange={handleDateChange}
                            handleTimeChange={handleTimeChange}
                            groupTypes={groupTypes}
                            guaranteeTypes={guaranteeTypes}
                            provinces={provinces}
                            communes={communes}
                            zones={zones}
                            activitySectors={activitySectors}
                            branches={branches}
                            onProvinceChange={handleProvinceChange}
                            onCommuneChange={handleCommuneChange}
                            bylawsDocumentFile={bylawsDocumentFile}
                            handleFileUpload={handleFileUpload}
                            handleFileRemove={handleFileRemove}
                        />
                        <div className="card p-fluid">
                            <div className="formgrid grid">
                                <div className="md:col-offset-3 md:field md:col-3">
                                    <Button
                                        icon="pi pi-refresh"
                                        outlined
                                        label="Réinitialiser"
                                        onClick={() => {
                                            setGroup(new SolidarityGroup());
                                            setBylawsDocumentFile(null);
                                            generateGroupCode();
                                        }}
                                    />
                                </div>
                                <div className="md:field md:col-3">
                                    <Button
                                        icon="pi pi-check"
                                        label="Enregistrer"
                                        loading={btnLoading}
                                        onClick={handleSubmit}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="Liste des Groupes" leftIcon="pi pi-list mr-2">
                        {/* Statistics Cards */}
                        <div className="grid mb-4">
                            <div className="col-6 md:col-3">
                                <div className="surface-card shadow-1 border-round p-3 text-center">
                                    <div className="text-500 font-medium mb-2">Total Groupes</div>
                                    <div className="text-3xl font-bold text-primary">{stats.total}</div>
                                </div>
                            </div>
                            <div className="col-6 md:col-3">
                                <div className="surface-card shadow-1 border-round p-3 text-center">
                                    <div className="text-500 font-medium mb-2">Groupes Actifs</div>
                                    <div className="text-3xl font-bold text-green-500">{stats.active}</div>
                                </div>
                            </div>
                            <div className="col-6 md:col-3">
                                <div className="surface-card shadow-1 border-round p-3 text-center">
                                    <div className="text-500 font-medium mb-2">En Attente</div>
                                    <div className="text-3xl font-bold text-blue-500">{stats.pending}</div>
                                </div>
                            </div>
                            <div className="col-6 md:col-3">
                                <div className="surface-card shadow-1 border-round p-3 text-center">
                                    <div className="text-500 font-medium mb-2">Total Membres</div>
                                    <div className="text-3xl font-bold text-purple-500">{stats.totalMembers}</div>
                                </div>
                            </div>
                        </div>

                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={groups}
                                        header={renderSearch}
                                        emptyMessage={
                                            <div className="text-center py-5">
                                                <i className="pi pi-users text-4xl text-300 mb-3" style={{ display: 'block' }}></i>
                                                <p className="text-500 m-0">
                                                    {searchTerm ? "Aucun groupe ne correspond à votre recherche" : "Aucun groupe solidaire enregistré"}
                                                </p>
                                                {!searchTerm && (
                                                    <p className="text-400 text-sm mt-2">Créez un nouveau groupe dans l'onglet "Nouveau Groupe"</p>
                                                )}
                                            </div>
                                        }
                                        loading={loading || searchLoading}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                        currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} groupes"
                                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                        sortField="id"
                                        sortOrder={-1}
                                        stripedRows
                                        showGridlines
                                    >
                                        <Column header="Groupe" body={groupNameTemplate} sortable sortField="groupName" style={{ minWidth: '220px' }} />
                                        <Column header="Membres" body={memberCountTemplate} style={{ minWidth: '100px' }} />
                                        <Column
                                            header="Agence"
                                            body={(row: SolidarityGroup) => (row as any).branch?.name || '-'}
                                            style={{ minWidth: '120px' }}
                                        />
                                        <Column
                                            header="Adresse"
                                            body={(row: SolidarityGroup) => {
                                                const parts = [
                                                    (row as any).province?.name,
                                                    (row as any).commune?.name,
                                                    (row as any).zone?.name
                                                ].filter(Boolean);
                                                return parts.length > 0
                                                    ? <div className="flex flex-column gap-1">
                                                        {(row as any).province?.name && <span className="text-sm"><i className="pi pi-map-marker text-xs mr-1 text-500" />{(row as any).province.name}</span>}
                                                        {(row as any).commune?.name && <span className="text-xs text-500">{(row as any).commune.name}{(row as any).zone?.name ? ` / ${(row as any).zone.name}` : ''}</span>}
                                                      </div>
                                                    : <span className="text-400">-</span>;
                                            }}
                                            style={{ minWidth: '160px' }}
                                        />
                                        <Column header="Statut" body={statusBodyTemplate} sortable style={{ minWidth: '110px' }} />
                                        <Column field="userAction" header="Créé par" style={{ minWidth: '120px' }} />
                                        <Column
                                            header="Actions"
                                            body={optionButtons}
                                            style={{ width: '220px' }}
                                            frozen
                                            alignFrozen="right"
                                        />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['CUSTOMER_GROUP_VIEW']}>
            <SolidarityGroupComponent />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
