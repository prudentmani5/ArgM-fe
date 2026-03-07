'use client';

import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { Client, ClientType, ClientStatus, Province, Commune, Zone, Colline, Nationality, IdDocumentType, ActivitySector, MaritalStatus, EducationLevel, ClientCategory, HousingType, Branch, RelationshipType, EmergencyContact } from './Client';
import ClientForm from './ClientForm';
import { SignatoryMember } from './SignatoryMember';
import SignatoryMemberForm from './SignatoryMemberForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Avatar } from 'primereact/avatar';
import { Image } from 'primereact/image';
import { buildApiUrl } from '../../../../utils/apiConfig';

function ClientComponent() {
    const [client, setClient] = useState<Client>(new Client());
    const [clientEdit, setClientEdit] = useState<Client>(new Client());
    const [editClientDialog, setEditClientDialog] = useState(false);
    const [viewClientDialog, setViewClientDialog] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [statusFilter, setStatusFilter] = useState<ClientStatus | null>(null);
    const [typeFilter, setTypeFilter] = useState<ClientType | null>(null);

    // Reference data states
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [collines, setCollines] = useState<Colline[]>([]);
    // Co-titulaire address cascading lists
    const [secondCommunes, setSecondCommunes] = useState<Commune[]>([]);
    const [secondZones, setSecondZones] = useState<Zone[]>([]);
    const [secondCollines, setSecondCollines] = useState<Colline[]>([]);
    const [nationalities, setNationalities] = useState<Nationality[]>([]);
    const [idDocumentTypes, setIdDocumentTypes] = useState<IdDocumentType[]>([]);
    const [activitySectors, setActivitySectors] = useState<ActivitySector[]>([]);
    const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
    const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
    const [clientCategories, setClientCategories] = useState<ClientCategory[]>([]);
    const [housingTypes, setHousingTypes] = useState<HousingType[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);

    // File upload states
    const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [idDocumentFileEdit, setIdDocumentFileEdit] = useState<File | null>(null);
    const [photoFileEdit, setPhotoFileEdit] = useState<File | null>(null);
    const [signatureFileEdit, setSignatureFileEdit] = useState<File | null>(null);
    // Co-titulaire file states
    const [secondPhotoFile, setSecondPhotoFile] = useState<File | null>(null);
    const [secondSignatureFile, setSecondSignatureFile] = useState<File | null>(null);
    const [secondIdDocumentFile, setSecondIdDocumentFile] = useState<File | null>(null);
    const [secondPhotoFileEdit, setSecondPhotoFileEdit] = useState<File | null>(null);
    const [secondSignatureFileEdit, setSecondSignatureFileEdit] = useState<File | null>(null);
    const [secondIdDocumentFileEdit, setSecondIdDocumentFileEdit] = useState<File | null>(null);

    // Signatory Members states
    const [signatoryMembers, setSignatoryMembers] = useState<SignatoryMember[]>([]);
    const [signatoryMember, setSignatoryMember] = useState<SignatoryMember>(new SignatoryMember());
    const [signatoryMemberEdit, setSignatoryMemberEdit] = useState<SignatoryMember>(new SignatoryMember());
    const [editMemberDialog, setEditMemberDialog] = useState(false);
    const [viewMemberDialog, setViewMemberDialog] = useState(false);
    const [selectedBusinessClient, setSelectedBusinessClient] = useState<Client | null>(null);
    const [memberBtnLoading, setMemberBtnLoading] = useState(false);
    const [memberSignatureFile, setMemberSignatureFile] = useState<File | null>(null);
    const [memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);
    const [memberDocumentFile, setMemberDocumentFile] = useState<File | null>(null);
    const [memberSignatureFileEdit, setMemberSignatureFileEdit] = useState<File | null>(null);
    const [memberPhotoFileEdit, setMemberPhotoFileEdit] = useState<File | null>(null);
    const [memberDocumentFileEdit, setMemberDocumentFileEdit] = useState<File | null>(null);
    const printMembersRef = useRef<HTMLDivElement>(null);

    // Duplicate document validation states
    const [documentNumberError, setDocumentNumberError] = useState<string | null>(null);
    const [documentNumberErrorEdit, setDocumentNumberErrorEdit] = useState<string | null>(null);
    const [checkingDocument, setCheckingDocument] = useState<boolean>(false);
    const [checkingDocumentEdit, setCheckingDocumentEdit] = useState<boolean>(false);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: refData, fetchData: fetchRefData, callType: refCallType } = useConsumApi('');
    const { data: memberData, loading: memberLoading, error: memberError, fetchData: fetchMemberData, callType: memberCallType } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const BASE_URL = buildApiUrl('/api/clients');
    const REF_URL = buildApiUrl('/api/reference-data');

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Load reference data and clients on mount
    useEffect(() => {
        loadReferenceData();
        loadAllData(); // Load clients data on initial mount
        generateClientNumber(); // Generate client number for new client form
    }, []);

    useEffect(() => {
        if (refData) {
            const dataArray = Array.isArray(refData) ? refData : [];
            switch (refCallType) {
                case 'loadProvinces':
                    console.log('🗺️ Provinces loaded:', dataArray.length);
                    setProvinces(dataArray);
                    break;
                case 'loadNationalities':
                    console.log('🌍 Nationalities loaded:', dataArray.length);
                    setNationalities(dataArray);
                    break;
                case 'loadIdDocumentTypes':
                    console.log('🪪 ID Document Types loaded:', dataArray.length);
                    setIdDocumentTypes(dataArray);
                    break;
                case 'loadActivitySectors':
                    console.log('🏭 Activity Sectors loaded:', dataArray.length);
                    setActivitySectors(dataArray);
                    break;
                case 'loadMaritalStatuses':
                    console.log('💑 Marital Statuses loaded:', dataArray.length);
                    setMaritalStatuses(dataArray);
                    break;
                case 'loadEducationLevels':
                    console.log('🎓 Education Levels loaded:', dataArray.length);
                    setEducationLevels(dataArray);
                    break;
                case 'loadClientCategories':
                    console.log('📦 Client Categories loaded:', dataArray.length, dataArray);
                    setClientCategories(dataArray);
                    break;
                case 'loadHousingTypes':
                    console.log('🏠 Housing Types loaded:', dataArray.length);
                    setHousingTypes(dataArray);
                    break;
                case 'loadBranches':
                    console.log('🏢 Branches loaded:', dataArray.length, dataArray);
                    setBranches(dataArray);
                    break;
                case 'loadCommunes':
                    console.log('🏘️ Communes loaded:', dataArray.length);
                    setCommunes(dataArray);
                    break;
                case 'loadZones':
                    console.log('📍 Zones loaded:', dataArray.length);
                    setZones(dataArray);
                    break;
                case 'loadCollines':
                    console.log('⛰️ Collines loaded:', dataArray.length);
                    setCollines(dataArray);
                    break;
                case 'loadRelationshipTypes':
                    setRelationshipTypes(dataArray);
                    break;
                case 'loadSecondCommunes':
                    setSecondCommunes(dataArray);
                    break;
                case 'loadSecondZones':
                    setSecondZones(dataArray);
                    break;
                case 'loadSecondCollines':
                    setSecondCollines(dataArray);
                    break;
            }
        }
    }, [refData, refCallType]);

    useEffect(() => {
        if (error) {
            console.error('❌ API Error:', error, 'CallType:', callType);
        }
        if (data) {
            if (callType === 'loadClients') {
                const clientsData = Array.isArray(data) ? data : data.content || [];
                console.log('📋 Clients loaded:', clientsData.length, clientsData);
                setClients(clientsData);
            } else if (callType === 'generateNumber') {
                setClient(prev => ({ ...prev, clientNumber: data.clientNumber }));
            } else if (callType === 'viewClientById') {
                const clientData = data as any;
                setClientEdit({
                    ...data,
                    emergencyContacts: (clientData.emergencyContacts || []).map((c: any) => ({
                        ...c,
                        relationshipTypeId: c.relationshipType?.id || c.relationshipTypeId,
                        contactFor: c.contactFor || 'PRINCIPAL',
                    })),
                });
                setViewClientDialog(true);
            }
            handleAfterApiCall();
        }
    }, [data, error, callType]);

    useEffect(() => {
        if (searchData && searchCallType === 'searchClients') {
            if (searchData.content) {
                setClients(searchData.content);
            } else if (Array.isArray(searchData)) {
                setClients(searchData);
            } else {
                setClients([]);
            }
        }
    }, [searchData, searchCallType]);

    // Handle member API responses
    useEffect(() => {
        if (memberData) {
            switch (memberCallType) {
                case 'loadMembers':
                    setSignatoryMembers(Array.isArray(memberData) ? memberData : []);
                    break;
                case 'createMember':
                    showToast('success', 'Succes', 'Membre signataire enregistre avec succes');
                    setSignatoryMember(new SignatoryMember());
                    setMemberSignatureFile(null);
                    setMemberPhotoFile(null);
                    setMemberDocumentFile(null);
                    if (selectedBusinessClient?.id) loadSignatoryMembers(selectedBusinessClient.id);
                    setMemberBtnLoading(false);
                    break;
                case 'updateMember':
                    showToast('success', 'Succes', 'Membre signataire mis a jour avec succes');
                    setEditMemberDialog(false);
                    setMemberSignatureFileEdit(null);
                    setMemberPhotoFileEdit(null);
                    setMemberDocumentFileEdit(null);
                    if (selectedBusinessClient?.id) loadSignatoryMembers(selectedBusinessClient.id);
                    setMemberBtnLoading(false);
                    break;
                case 'deleteMember':
                    showToast('success', 'Succes', 'Membre signataire supprime avec succes');
                    if (selectedBusinessClient?.id) loadSignatoryMembers(selectedBusinessClient.id);
                    break;
            }
        }
        if (memberError) {
            showToast('error', 'Erreur', (memberError as any)?.message || 'Erreur lors de l\'operation sur le membre');
            setMemberBtnLoading(false);
        }
    }, [memberData, memberError, memberCallType]);

    const loadReferenceData = () => {
        fetchRefData(null, 'GET', `${REF_URL}/provinces/findactive`, 'loadProvinces');
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/nationalities/findactive`, 'loadNationalities'), 100);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/id-document-types/findactive`, 'loadIdDocumentTypes'), 200);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/activity-sectors/findactive`, 'loadActivitySectors'), 300);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/marital-statuses/findactive`, 'loadMaritalStatuses'), 400);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/education-levels/findactive`, 'loadEducationLevels'), 500);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/client-categories/findactive`, 'loadClientCategories'), 600);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/housing-types/findactive`, 'loadHousingTypes'), 700);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/branches/findactive`, 'loadBranches'), 800);
        setTimeout(() => fetchRefData(null, 'GET', `${REF_URL}/relationship-types/findactive`, 'loadRelationshipTypes'), 900);
    };

    const handleProvinceChange = (provinceId: number) => {
        setCommunes([]);
        setZones([]);
        setCollines([]);
        if (provinceId) {
            fetchRefData(null, 'GET', `${REF_URL}/communes/findbyprovince/${provinceId}`, 'loadCommunes');
        }
    };

    const handleCommuneChange = (communeId: number) => {
        setZones([]);
        setCollines([]);
        if (communeId) {
            fetchRefData(null, 'GET', `${REF_URL}/zones/findbycommune/${communeId}`, 'loadZones');
        }
    };

    const handleZoneChange = (zoneId: number) => {
        setCollines([]);
        if (zoneId) {
            fetchRefData(null, 'GET', `${REF_URL}/collines/findbyzone/${zoneId}`, 'loadCollines');
        }
    };

    // Co-titulaire address cascade handlers
    const handleSecondProvinceChange = (provinceId: number) => {
        setSecondCommunes([]);
        setSecondZones([]);
        setSecondCollines([]);
        if (provinceId) {
            fetchRefData(null, 'GET', `${REF_URL}/communes/findbyprovince/${provinceId}`, 'loadSecondCommunes');
        }
    };

    const handleSecondCommuneChange = (communeId: number) => {
        setSecondZones([]);
        setSecondCollines([]);
        if (communeId) {
            fetchRefData(null, 'GET', `${REF_URL}/zones/findbycommune/${communeId}`, 'loadSecondZones');
        }
    };

    const handleSecondZoneChange = (zoneId: number) => {
        setSecondCollines([]);
        if (zoneId) {
            fetchRefData(null, 'GET', `${REF_URL}/collines/findbyzone/${zoneId}`, 'loadSecondCollines');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setClient(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setClient(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setClient(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setClient(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : ''
        }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setClientEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (name: string, value: any) => {
        setClientEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setClientEdit(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const handleDateChangeEdit = (name: string, value: Date | null) => {
        setClientEdit(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : ''
        }));
    };

    // File upload handlers for new client
    const handleFileUpload = (fieldName: string, file: File) => {
        if (fieldName === 'idDocumentScanPath') {
            setIdDocumentFile(file);
        } else if (fieldName === 'photoPath') {
            setPhotoFile(file);
        } else if (fieldName === 'signatureImagePath') {
            setSignatureFile(file);
        } else if (fieldName === 'secondPhotoPath') {
            setSecondPhotoFile(file);
        } else if (fieldName === 'secondSignatureImagePath') {
            setSecondSignatureFile(file);
        } else if (fieldName === 'secondIdDocumentScanPath') {
            setSecondIdDocumentFile(file);
        }
    };

    const handleFileRemove = (fieldName: string) => {
        if (fieldName === 'idDocumentScanPath') {
            setIdDocumentFile(null);
        } else if (fieldName === 'photoPath') {
            setPhotoFile(null);
        } else if (fieldName === 'signatureImagePath') {
            setSignatureFile(null);
        } else if (fieldName === 'secondPhotoPath') {
            setSecondPhotoFile(null);
        } else if (fieldName === 'secondSignatureImagePath') {
            setSecondSignatureFile(null);
        } else if (fieldName === 'secondIdDocumentScanPath') {
            setSecondIdDocumentFile(null);
        }
    };

    // File upload handlers for edit client
    const handleFileUploadEdit = (fieldName: string, file: File) => {
        if (fieldName === 'idDocumentScanPath') {
            setIdDocumentFileEdit(file);
        } else if (fieldName === 'photoPath') {
            setPhotoFileEdit(file);
        } else if (fieldName === 'signatureImagePath') {
            setSignatureFileEdit(file);
        } else if (fieldName === 'secondPhotoPath') {
            setSecondPhotoFileEdit(file);
        } else if (fieldName === 'secondSignatureImagePath') {
            setSecondSignatureFileEdit(file);
        } else if (fieldName === 'secondIdDocumentScanPath') {
            setSecondIdDocumentFileEdit(file);
        }
    };

    const handleFileRemoveEdit = (fieldName: string) => {
        if (fieldName === 'idDocumentScanPath') {
            setIdDocumentFileEdit(null);
        } else if (fieldName === 'photoPath') {
            setPhotoFileEdit(null);
        } else if (fieldName === 'signatureImagePath') {
            setSignatureFileEdit(null);
        } else if (fieldName === 'secondPhotoPath') {
            setSecondPhotoFileEdit(null);
        } else if (fieldName === 'secondSignatureImagePath') {
            setSecondSignatureFileEdit(null);
        } else if (fieldName === 'secondIdDocumentScanPath') {
            setSecondIdDocumentFileEdit(null);
        }
    };

    // Check if a client with the same document number already exists
    const checkDuplicateDocumentNumber = async (documentNumber: string, excludeClientId?: number): Promise<boolean> => {
        if (!documentNumber || documentNumber.trim() === '') {
            return false; // No document number to check
        }

        try {
            const response = await fetch(buildApiUrl(`/api/clients/exists/bydocument/${encodeURIComponent(documentNumber)}`), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Error checking duplicate document number');
                return false; // Don't block save if check fails
            }

            const data = await response.json();

            // If we're editing and the document belongs to the same client, it's not a duplicate
            if (excludeClientId && data.exists) {
                // We need to check if the existing document belongs to the same client
                // For now, we'll fetch the client by document number and compare IDs
                const clientResponse = await fetch(buildApiUrl(`/api/clients/findbydocument/${encodeURIComponent(documentNumber)}`), {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (clientResponse.ok) {
                    const existingClient = await clientResponse.json();
                    if (existingClient && existingClient.id === excludeClientId) {
                        return false; // Same client, not a duplicate
                    }
                }
            }

            return data.exists;
        } catch (error) {
            console.error('Error checking duplicate document number:', error);
            return false; // Don't block save if check fails
        }
    };

    // Handler to check document number on blur (for new client)
    const handleDocumentNumberBlur = async () => {
        // Only check duplicate for INDIVIDUAL clients
        if (client.clientType !== ClientType.INDIVIDUAL) {
            setDocumentNumberError(null);
            return;
        }
        const documentNumber = client.idDocumentNumber;
        if (!documentNumber || documentNumber.trim() === '') {
            setDocumentNumberError(null);
            return;
        }

        setCheckingDocument(true);
        try {
            const isDuplicate = await checkDuplicateDocumentNumber(documentNumber);
            if (isDuplicate) {
                setDocumentNumberError('Un client avec ce numéro de document existe déjà');
                showToast('error', 'Erreur', 'Un client avec ce numéro de document existe déjà');
            } else {
                setDocumentNumberError(null);
            }
        } finally {
            setCheckingDocument(false);
        }
    };

    // Handler to check document number on blur (for edit client)
    const handleDocumentNumberBlurEdit = async () => {
        // Only check duplicate for INDIVIDUAL clients
        if (clientEdit.clientType !== ClientType.INDIVIDUAL) {
            setDocumentNumberErrorEdit(null);
            return;
        }
        const documentNumber = clientEdit.idDocumentNumber;
        if (!documentNumber || documentNumber.trim() === '') {
            setDocumentNumberErrorEdit(null);
            return;
        }

        setCheckingDocumentEdit(true);
        try {
            const isDuplicate = await checkDuplicateDocumentNumber(documentNumber, clientEdit.id);
            if (isDuplicate) {
                setDocumentNumberErrorEdit('Un autre client avec ce numéro de document existe déjà');
                showToast('error', 'Erreur', 'Un autre client avec ce numéro de document existe déjà');
            } else {
                setDocumentNumberErrorEdit(null);
            }
        } finally {
            setCheckingDocumentEdit(false);
        }
    };

    // Upload files to server
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
            throw new Error('Failed to upload file');
        }

        const data = await response.json();
        return data.filePath || data.path || data.url;
    };

    const handleSubmit = async () => {
        console.log('🔵 Submitting client:', client);
        console.log('🔵 Branch ID:', client.branchId);
        console.log('🔵 Category ID:', client.clientCategoryId);

        // Check for existing document number error
        if (documentNumberError) {
            showToast('error', 'Erreur', documentNumberError);
            return;
        }

        if (!validateClient(client)) return;

        setBtnLoading(true);

        try {
            // Double-check for duplicate document number before saving (only for INDIVIDUAL)
            if (client.clientType === ClientType.INDIVIDUAL && client.idDocumentNumber) {
                const isDuplicate = await checkDuplicateDocumentNumber(client.idDocumentNumber);
                if (isDuplicate) {
                    showToast('error', 'Erreur', 'Un client avec ce numéro de document existe déjà');
                    setDocumentNumberError('Un client avec ce numéro de document existe déjà');
                    setBtnLoading(false);
                    return;
                }
            }
            // Upload files if present
            let idDocumentPath = client.idDocumentScanPath;
            let clientPhotoPath = client.photoPath;
            let clientSignaturePath = client.signatureImagePath;

            if (idDocumentFile) {
                try {
                    idDocumentPath = await uploadFile(idDocumentFile, 'clients/documents');
                    console.log('📎 Document uploaded:', idDocumentPath);
                } catch (error) {
                    console.error('Error uploading document:', error);
                    showToast('warn', 'Attention', 'Erreur lors du téléchargement du document, mais le client sera créé sans document');
                }
            }

            if (photoFile) {
                try {
                    clientPhotoPath = await uploadFile(photoFile, 'clients/photos');
                    console.log('📷 Photo uploaded:', clientPhotoPath);
                } catch (error) {
                    console.error('Error uploading photo:', error);
                    showToast('warn', 'Attention', 'Erreur lors du téléchargement de la photo, mais le client sera créé sans photo');
                }
            }

            if (signatureFile) {
                try {
                    clientSignaturePath = await uploadFile(signatureFile, 'clients/signatures');
                    console.log('✍️ Signature uploaded:', clientSignaturePath);
                } catch (error) {
                    console.error('Error uploading signature:', error);
                    showToast('warn', 'Attention', 'Erreur lors du téléchargement de la signature');
                }
            }

            // Upload co-titulaire files if JOINT_ACCOUNT
            let secondPhotoPathUpload = client.secondPhotoPath;
            let secondSignaturePathUpload = client.secondSignatureImagePath;
            let secondIdDocumentPathUpload = client.secondIdDocumentScanPath;

            if (client.clientType === ClientType.JOINT_ACCOUNT) {
                if (secondPhotoFile) {
                    try {
                        secondPhotoPathUpload = await uploadFile(secondPhotoFile, 'clients/photos');
                    } catch (error) {
                        console.error('Error uploading co-titulaire photo:', error);
                    }
                }
                if (secondSignatureFile) {
                    try {
                        secondSignaturePathUpload = await uploadFile(secondSignatureFile, 'clients/signatures');
                    } catch (error) {
                        console.error('Error uploading co-titulaire signature:', error);
                    }
                }
                if (secondIdDocumentFile) {
                    try {
                        secondIdDocumentPathUpload = await uploadFile(secondIdDocumentFile, 'clients/documents');
                    } catch (error) {
                        console.error('Error uploading co-titulaire document:', error);
                    }
                }
            }

            // Transform all ID fields to objects for backend (JPA @ManyToOne relationships)
            // Also rename fields to match backend field names
            const {
                branchId,
                clientCategoryId,
                provinceId,
                communeId,
                zoneId,
                collineId,
                nationalityId,
                idDocumentTypeId,
                activitySectorId,
                maritalStatusId,
                educationLevelId,
                housingTypeId,
                assignedOfficerId,
                occupation,           // Frontend name → Backend: profession
                employer,             // Frontend name → Backend: employerName
                numberOfDependents,   // Frontend name → Backend: dependentsCount
                idDocumentIssuedBy,   // Frontend name → Backend: idIssuePlace
                idDocumentIssueDate,  // Frontend name → Backend: idIssueDate
                idDocumentExpiryDate, // Frontend name → Backend: idExpiryDate
                idDocumentScanPath,   // Will be replaced with uploaded path
                photoPath,            // Will be replaced with uploaded path
                // Co-titulaire IDs and paths (will be transformed)
                secondNationalityId,
                secondIdDocumentTypeId,
                secondProvinceId,
                secondCommuneId,
                secondZoneId,
                secondCollineId,
                secondIdDocumentScanPath,
                secondPhotoPath,
                secondSignatureImagePath,
                ...clientWithoutIds
            } = client;

            const clientData = {
                ...clientWithoutIds,
                // Rename fields to match backend
                profession: occupation,
                employerName: employer,
                dependentsCount: numberOfDependents,
                idIssuePlace: idDocumentIssuedBy,
                idIssueDate: idDocumentIssueDate || null,
                idExpiryDate: idDocumentExpiryDate || null,
                // File paths
                idDocumentScanPath: idDocumentPath || null,
                photoPath: clientPhotoPath || null,
                signatureImagePath: clientSignaturePath || null,
                // Co-titulaire file paths
                secondPhotoPath: secondPhotoPathUpload || null,
                secondSignatureImagePath: secondSignaturePathUpload || null,
                secondIdDocumentScanPath: secondIdDocumentPathUpload || null,
                // Transform IDs to objects for JPA @ManyToOne relationships
                branch: branchId ? { id: branchId } : null,
                category: clientCategoryId ? { id: clientCategoryId } : null,
                province: provinceId ? { id: provinceId } : null,
                commune: communeId ? { id: communeId } : null,
                zone: zoneId ? { id: zoneId } : null,
                colline: collineId ? { id: collineId } : null,
                nationality: nationalityId ? { id: nationalityId } : null,
                idDocumentType: idDocumentTypeId ? { id: idDocumentTypeId } : null,
                activitySector: activitySectorId ? { id: activitySectorId } : null,
                maritalStatus: maritalStatusId ? { id: maritalStatusId } : null,
                educationLevel: educationLevelId ? { id: educationLevelId } : null,
                housingType: housingTypeId ? { id: housingTypeId } : null,
                assignedOfficer: assignedOfficerId ? { id: assignedOfficerId } : null,
                // Co-titulaire @ManyToOne relationships
                secondNationality: secondNationalityId ? { id: secondNationalityId } : null,
                secondIdDocumentType: secondIdDocumentTypeId ? { id: secondIdDocumentTypeId } : null,
                secondProvince: secondProvinceId ? { id: secondProvinceId } : null,
                secondCommune: secondCommuneId ? { id: secondCommuneId } : null,
                secondZone: secondZoneId ? { id: secondZoneId } : null,
                secondColline: secondCollineId ? { id: secondCollineId } : null,
                // Transform emergency contacts relationshipTypeId → relationshipType: { id }
                emergencyContacts: (client.emergencyContacts || []).map(({ relationshipTypeId, ...rest }) => ({
                    ...rest,
                    relationshipType: relationshipTypeId ? { id: relationshipTypeId } : (rest.relationshipType || null)
                }))
            };

            // Get the connected user's username for tracking
            const appUserCookie = Cookies.get('appUser');
            const appUser = appUserCookie ? JSON.parse(appUserCookie) : null;
            clientData.userAction = appUser ? (appUser.username || appUser.email || 'system') : 'system';

            console.log('🟢 Transformed client data:', clientData);
            fetchData(clientData, 'POST', `${BASE_URL}/new`, 'createClient');

            // Reset file states after submission
            setIdDocumentFile(null);
            setPhotoFile(null);
            setSignatureFile(null);
            setSecondPhotoFile(null);
            setSecondSignatureFile(null);
            setSecondIdDocumentFile(null);
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setBtnLoading(false);
            showToast('error', 'Erreur', 'Une erreur est survenue lors de la création du client');
        }
    };

    const handleSubmitEdit = async () => {
        // Check for existing document number error
        if (documentNumberErrorEdit) {
            showToast('error', 'Erreur', documentNumberErrorEdit);
            return;
        }

        if (!validateClient(clientEdit)) return;

        setBtnLoading(true);

        try {
            // Double-check for duplicate document number before saving (only for INDIVIDUAL, exclude current client)
            if (clientEdit.clientType === ClientType.INDIVIDUAL && clientEdit.idDocumentNumber) {
                const isDuplicate = await checkDuplicateDocumentNumber(clientEdit.idDocumentNumber, clientEdit.id);
                if (isDuplicate) {
                    showToast('error', 'Erreur', 'Un autre client avec ce numéro de document existe déjà');
                    setDocumentNumberErrorEdit('Un autre client avec ce numéro de document existe déjà');
                    setBtnLoading(false);
                    return;
                }
            }

            // Upload files if present
            let idDocumentPath = clientEdit.idDocumentScanPath;
            let clientPhotoPath = clientEdit.photoPath;
            let clientSignaturePath = clientEdit.signatureImagePath;

            if (idDocumentFileEdit) {
                try {
                    idDocumentPath = await uploadFile(idDocumentFileEdit, 'clients/documents');
                    console.log('📎 Document uploaded:', idDocumentPath);
                } catch (error) {
                    console.error('Error uploading document:', error);
                    showToast('warn', 'Attention', 'Erreur lors du téléchargement du document');
                }
            }

            if (photoFileEdit) {
                try {
                    clientPhotoPath = await uploadFile(photoFileEdit, 'clients/photos');
                    console.log('📷 Photo uploaded:', clientPhotoPath);
                } catch (error) {
                    console.error('Error uploading photo:', error);
                    showToast('warn', 'Attention', 'Erreur lors du téléchargement de la photo');
                }
            }

            if (signatureFileEdit) {
                try {
                    clientSignaturePath = await uploadFile(signatureFileEdit, 'clients/signatures');
                    console.log('✍️ Signature uploaded:', clientSignaturePath);
                } catch (error) {
                    console.error('Error uploading signature:', error);
                    showToast('warn', 'Attention', 'Erreur lors du téléchargement de la signature');
                }
            }

            // Upload co-titulaire files if JOINT_ACCOUNT
            let secondPhotoPathUpload = clientEdit.secondPhotoPath;
            let secondSignaturePathUpload = clientEdit.secondSignatureImagePath;
            let secondIdDocumentPathUpload = clientEdit.secondIdDocumentScanPath;

            if (clientEdit.clientType === ClientType.JOINT_ACCOUNT) {
                if (secondPhotoFileEdit) {
                    try {
                        secondPhotoPathUpload = await uploadFile(secondPhotoFileEdit, 'clients/photos');
                    } catch (error) {
                        console.error('Error uploading co-titulaire photo:', error);
                    }
                }
                if (secondSignatureFileEdit) {
                    try {
                        secondSignaturePathUpload = await uploadFile(secondSignatureFileEdit, 'clients/signatures');
                    } catch (error) {
                        console.error('Error uploading co-titulaire signature:', error);
                    }
                }
                if (secondIdDocumentFileEdit) {
                    try {
                        secondIdDocumentPathUpload = await uploadFile(secondIdDocumentFileEdit, 'clients/documents');
                    } catch (error) {
                        console.error('Error uploading co-titulaire document:', error);
                    }
                }
            }

            // Transform all ID fields to objects for backend (JPA @ManyToOne relationships)
            // Also rename fields to match backend field names
            const {
                branchId,
                clientCategoryId,
                provinceId,
                communeId,
                zoneId,
                collineId,
                nationalityId,
                idDocumentTypeId,
                activitySectorId,
                maritalStatusId,
                educationLevelId,
                housingTypeId,
                assignedOfficerId,
                occupation,           // Frontend name → Backend: profession
                employer,             // Frontend name → Backend: employerName
                numberOfDependents,   // Frontend name → Backend: dependentsCount
                idDocumentIssuedBy,   // Frontend name → Backend: idIssuePlace
                idDocumentIssueDate,  // Frontend name → Backend: idIssueDate
                idDocumentExpiryDate, // Frontend name → Backend: idExpiryDate
                idDocumentScanPath,   // Will be replaced with uploaded path
                photoPath,            // Will be replaced with uploaded path
                // Co-titulaire IDs and paths (will be transformed)
                secondNationalityId,
                secondIdDocumentTypeId,
                secondProvinceId,
                secondCommuneId,
                secondZoneId,
                secondCollineId,
                secondIdDocumentScanPath,
                secondPhotoPath,
                secondSignatureImagePath,
                ...clientWithoutIds
            } = clientEdit;

            const clientData = {
                ...clientWithoutIds,
                // Rename fields to match backend
                profession: occupation,
                employerName: employer,
                dependentsCount: numberOfDependents,
                idIssuePlace: idDocumentIssuedBy,
                idIssueDate: idDocumentIssueDate || null,
                idExpiryDate: idDocumentExpiryDate || null,
                // File paths
                idDocumentScanPath: idDocumentPath || null,
                photoPath: clientPhotoPath || null,
                signatureImagePath: clientSignaturePath || null,
                // Co-titulaire file paths
                secondPhotoPath: secondPhotoPathUpload || null,
                secondSignatureImagePath: secondSignaturePathUpload || null,
                secondIdDocumentScanPath: secondIdDocumentPathUpload || null,
                // Transform IDs to objects for JPA @ManyToOne relationships
                branch: branchId ? { id: branchId } : null,
                category: clientCategoryId ? { id: clientCategoryId } : null,
                province: provinceId ? { id: provinceId } : null,
                commune: communeId ? { id: communeId } : null,
                zone: zoneId ? { id: zoneId } : null,
                colline: collineId ? { id: collineId } : null,
                nationality: nationalityId ? { id: nationalityId } : null,
                idDocumentType: idDocumentTypeId ? { id: idDocumentTypeId } : null,
                activitySector: activitySectorId ? { id: activitySectorId } : null,
                maritalStatus: maritalStatusId ? { id: maritalStatusId } : null,
                educationLevel: educationLevelId ? { id: educationLevelId } : null,
                housingType: housingTypeId ? { id: housingTypeId } : null,
                assignedOfficer: assignedOfficerId ? { id: assignedOfficerId } : null,
                // Co-titulaire @ManyToOne relationships
                secondNationality: secondNationalityId ? { id: secondNationalityId } : null,
                secondIdDocumentType: secondIdDocumentTypeId ? { id: secondIdDocumentTypeId } : null,
                secondProvince: secondProvinceId ? { id: secondProvinceId } : null,
                secondCommune: secondCommuneId ? { id: secondCommuneId } : null,
                secondZone: secondZoneId ? { id: secondZoneId } : null,
                secondColline: secondCollineId ? { id: secondCollineId } : null,
                // Transform emergency contacts relationshipTypeId → relationshipType: { id }
                emergencyContacts: (clientEdit.emergencyContacts || []).map(({ relationshipTypeId, ...rest }) => ({
                    ...rest,
                    relationshipType: relationshipTypeId ? { id: relationshipTypeId } : (rest.relationshipType || null)
                }))
            };

            // Get the connected user's username for tracking
            const appUserCookie = Cookies.get('appUser');
            const appUser = appUserCookie ? JSON.parse(appUserCookie) : null;
            clientData.userAction = appUser ? (appUser.username || appUser.email || 'system') : 'system';

            console.log('🟢 Transformed edit data:', clientData);
            fetchData(clientData, 'PUT', `${BASE_URL}/update/${clientEdit.id}`, 'updateClient');

            // Reset file states after submission
            setIdDocumentFileEdit(null);
            setPhotoFileEdit(null);
            setSignatureFileEdit(null);
            setSecondPhotoFileEdit(null);
            setSecondSignatureFileEdit(null);
            setSecondIdDocumentFileEdit(null);
        } catch (error) {
            console.error('Error in handleSubmitEdit:', error);
            setBtnLoading(false);
            showToast('error', 'Erreur', 'Une erreur est survenue lors de la mise à jour du client');
        }
    };

    const validateClient = (c: Client): boolean => {
        if (c.clientType === ClientType.INDIVIDUAL || c.clientType === ClientType.JOINT_ACCOUNT) {
            if (!c.firstName?.trim() || !c.lastName?.trim()) {
                showToast('warn', 'Attention', 'Le nom et prenom sont obligatoires');
                return false;
            }
        } else if (c.clientType === ClientType.BUSINESS) {
            if (!c.businessName?.trim()) {
                showToast('warn', 'Attention', 'Le nom de l\'entreprise est obligatoire');
                return false;
            }
        }
        // Co-titulaire validation for JOINT_ACCOUNT
        if (c.clientType === ClientType.JOINT_ACCOUNT) {
            if (!c.secondFirstName?.trim() || !c.secondLastName?.trim()) {
                showToast('warn', 'Attention', 'Le nom et prénom du co-titulaire sont obligatoires');
                return false;
            }
        }
        if (!c.phonePrimary?.trim()) {
            showToast('warn', 'Attention', 'Le telephone principal est obligatoire');
            return false;
        }
        if (!c.branchId) {
            showToast('warn', 'Attention', 'L\'agence est obligatoire');
            return false;
        }
        if (!c.clientCategoryId) {
            showToast('warn', 'Attention', 'La catégorie client est obligatoire');
            return false;
        }
        return true;
    };

    const handleAfterApiCall = () => {
        if (error) {
            if (callType === 'createClient') {
                showToast('error', 'Erreur', 'L\'enregistrement a echoue');
            } else if (callType === 'updateClient') {
                showToast('error', 'Erreur', 'La mise a jour a echoue');
            } else if (callType === 'updateStatus') {
                showToast('error', 'Erreur', 'Le changement de statut a échoué');
            }
        } else if (data && !error) {
            if (callType === 'createClient') {
                setClient(new Client());
                setDocumentNumberError(null);
                setSecondPhotoFile(null);
                setSecondSignatureFile(null);
                setSecondIdDocumentFile(null);
                showToast('success', 'Succes', 'Client enregistre avec succes');
                generateClientNumber();
            } else if (callType === 'updateClient') {
                showToast('success', 'Succes', 'Client mis a jour avec succes');
                setClientEdit(new Client());
                setDocumentNumberErrorEdit(null);
                setSecondPhotoFileEdit(null);
                setSecondSignatureFileEdit(null);
                setSecondIdDocumentFileEdit(null);
                setEditClientDialog(false);
                loadAllData();
            } else if (callType === 'deleteClient') {
                showToast('success', 'Succes', 'Client supprime avec succes');
                loadAllData();
            } else if (callType === 'updateStatus') {
                showToast('success', 'Succès', 'Statut du client mis à jour avec succès');
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const generateClientNumber = () => {
        fetchData(null, 'GET', `${BASE_URL}/generatenumber`, 'generateNumber');
    };

    const loadAllData = () => {
        console.log('🔄 Loading clients from:', `${BASE_URL}/findall`);
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadClients');
    };

    const performSearch = (query: string) => {
        if (query.trim() === '') {
            loadAllData();
        } else {
            fetchSearchData(null, 'GET', `${BASE_URL}/search?searchTerm=${encodeURIComponent(query)}&page=0&size=100`, 'searchClients');
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        const newTimeout = setTimeout(() => performSearch(value), 500);
        setSearchTimeout(newTimeout);
    };

    // ========== Signatory Members Functions ==========
    const MEMBER_URL = (clientId: number) => buildApiUrl(`/api/clients/${clientId}/signatory-members`);

    const loadSignatoryMembers = (clientId: number) => {
        fetchMemberData(null, 'GET', `${MEMBER_URL(clientId)}/findall`, 'loadMembers');
    };

    const getUserAction = (): string => {
        try {
            const appUserCookie = Cookies.get('appUser');
            if (appUserCookie) {
                const appUser = JSON.parse(appUserCookie);
                return appUser ? (appUser.username || appUser.email || 'system') : 'system';
            }
        } catch (e) { /* ignore */ }
        return 'system';
    };

    const handleMemberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSignatoryMember(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberDropdownChange = (name: string, value: any) => {
        setSignatoryMember(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberDateChange = (name: string, value: Date | null) => {
        setSignatoryMember(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : ''
        }));
    };

    const handleMemberFileUpload = (fieldName: string, file: File) => {
        if (fieldName === 'signatureImagePath') setMemberSignatureFile(file);
        else if (fieldName === 'photoPath') setMemberPhotoFile(file);
        else if (fieldName === 'idDocumentScanPath') setMemberDocumentFile(file);
    };

    const handleMemberFileRemove = (fieldName: string) => {
        if (fieldName === 'signatureImagePath') setMemberSignatureFile(null);
        else if (fieldName === 'photoPath') setMemberPhotoFile(null);
        else if (fieldName === 'idDocumentScanPath') setMemberDocumentFile(null);
    };

    // Edit handlers
    const handleMemberChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSignatoryMemberEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberDropdownChangeEdit = (name: string, value: any) => {
        setSignatoryMemberEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberDateChangeEdit = (name: string, value: Date | null) => {
        setSignatoryMemberEdit(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : ''
        }));
    };

    const handleMemberFileUploadEdit = (fieldName: string, file: File) => {
        if (fieldName === 'signatureImagePath') setMemberSignatureFileEdit(file);
        else if (fieldName === 'photoPath') setMemberPhotoFileEdit(file);
        else if (fieldName === 'idDocumentScanPath') setMemberDocumentFileEdit(file);
    };

    const handleMemberFileRemoveEdit = (fieldName: string) => {
        if (fieldName === 'signatureImagePath') setMemberSignatureFileEdit(null);
        else if (fieldName === 'photoPath') setMemberPhotoFileEdit(null);
        else if (fieldName === 'idDocumentScanPath') setMemberDocumentFileEdit(null);
    };

    const handleMemberSubmit = async () => {
        if (!selectedBusinessClient?.id) return;
        if (!signatoryMember.firstName?.trim() || !signatoryMember.lastName?.trim()) {
            showToast('warn', 'Attention', 'Le nom et prenom sont obligatoires');
            return;
        }
        if (!signatoryMember.functionRole?.trim()) {
            showToast('warn', 'Attention', 'La fonction est obligatoire');
            return;
        }

        setMemberBtnLoading(true);
        try {
            let signaturePath = signatoryMember.signatureImagePath || null;
            let photoPath = signatoryMember.photoPath || null;
            let documentScanPath = signatoryMember.idDocumentScanPath || null;

            if (memberSignatureFile) {
                signaturePath = await uploadFile(memberSignatureFile, 'clients/signatures');
            }
            if (memberPhotoFile) {
                photoPath = await uploadFile(memberPhotoFile, 'clients/member-photos');
            }
            if (memberDocumentFile) {
                documentScanPath = await uploadFile(memberDocumentFile, 'clients/member-documents');
            }

            const memberPayload: any = {
                firstName: signatoryMember.firstName,
                lastName: signatoryMember.lastName,
                functionRole: signatoryMember.functionRole,
                phonePrimary: signatoryMember.phonePrimary || null,
                phoneSecondary: signatoryMember.phoneSecondary || null,
                email: signatoryMember.email || null,
                idDocumentType: signatoryMember.idDocumentTypeId ? { id: signatoryMember.idDocumentTypeId } : null,
                idDocumentNumber: signatoryMember.idDocumentNumber || null,
                idIssueDate: signatoryMember.idIssueDate || null,
                idExpiryDate: signatoryMember.idExpiryDate || null,
                idDocumentScanPath: documentScanPath,
                signatureImagePath: signaturePath,
                photoPath: photoPath,
                address: signatoryMember.address || null,
                isActive: signatoryMember.isActive,
                notes: signatoryMember.notes || null,
                contactPersonName: signatoryMember.contactPersonName || null,
                contactPersonRelationshipType: signatoryMember.contactPersonRelationshipTypeId ? { id: signatoryMember.contactPersonRelationshipTypeId } : null,
                contactPersonRelationshipOther: signatoryMember.contactPersonRelationshipOther || null,
                contactPersonPhone: signatoryMember.contactPersonPhone || null,
                contactPersonPhoneSecondary: signatoryMember.contactPersonPhoneSecondary || null,
                contactPersonAddress: signatoryMember.contactPersonAddress || null,
                userAction: getUserAction()
            };

            fetchMemberData(memberPayload, 'POST',
                `${MEMBER_URL(selectedBusinessClient.id)}/new`, 'createMember');
        } catch (error) {
            setMemberBtnLoading(false);
            showToast('error', 'Erreur', 'Erreur lors de l\'enregistrement du membre');
        }
    };

    const handleMemberSubmitEdit = async () => {
        if (!selectedBusinessClient?.id || !signatoryMemberEdit.id) return;
        if (!signatoryMemberEdit.firstName?.trim() || !signatoryMemberEdit.lastName?.trim()) {
            showToast('warn', 'Attention', 'Le nom et prenom sont obligatoires');
            return;
        }

        setMemberBtnLoading(true);
        try {
            let signaturePath = signatoryMemberEdit.signatureImagePath || null;
            let photoPath = signatoryMemberEdit.photoPath || null;
            let documentScanPath = signatoryMemberEdit.idDocumentScanPath || null;

            if (memberSignatureFileEdit) {
                signaturePath = await uploadFile(memberSignatureFileEdit, 'clients/signatures');
            }
            if (memberPhotoFileEdit) {
                photoPath = await uploadFile(memberPhotoFileEdit, 'clients/member-photos');
            }
            if (memberDocumentFileEdit) {
                documentScanPath = await uploadFile(memberDocumentFileEdit, 'clients/member-documents');
            }

            const memberPayload: any = {
                firstName: signatoryMemberEdit.firstName,
                lastName: signatoryMemberEdit.lastName,
                functionRole: signatoryMemberEdit.functionRole,
                phonePrimary: signatoryMemberEdit.phonePrimary || null,
                phoneSecondary: signatoryMemberEdit.phoneSecondary || null,
                email: signatoryMemberEdit.email || null,
                idDocumentType: signatoryMemberEdit.idDocumentTypeId ? { id: signatoryMemberEdit.idDocumentTypeId } : null,
                idDocumentNumber: signatoryMemberEdit.idDocumentNumber || null,
                idIssueDate: signatoryMemberEdit.idIssueDate || null,
                idExpiryDate: signatoryMemberEdit.idExpiryDate || null,
                idDocumentScanPath: documentScanPath,
                signatureImagePath: signaturePath,
                photoPath: photoPath,
                address: signatoryMemberEdit.address || null,
                isActive: signatoryMemberEdit.isActive,
                notes: signatoryMemberEdit.notes || null,
                contactPersonName: signatoryMemberEdit.contactPersonName || null,
                contactPersonRelationshipType: signatoryMemberEdit.contactPersonRelationshipTypeId ? { id: signatoryMemberEdit.contactPersonRelationshipTypeId } : null,
                contactPersonRelationshipOther: signatoryMemberEdit.contactPersonRelationshipOther || null,
                contactPersonPhone: signatoryMemberEdit.contactPersonPhone || null,
                contactPersonPhoneSecondary: signatoryMemberEdit.contactPersonPhoneSecondary || null,
                contactPersonAddress: signatoryMemberEdit.contactPersonAddress || null,
                userAction: getUserAction()
            };

            fetchMemberData(memberPayload, 'PUT',
                `${MEMBER_URL(selectedBusinessClient.id)}/update/${signatoryMemberEdit.id}`, 'updateMember');
        } catch (error) {
            setMemberBtnLoading(false);
            showToast('error', 'Erreur', 'Erreur lors de la mise a jour du membre');
        }
    };

    const viewMemberDetails = (member: any) => {
        setSignatoryMemberEdit({
            ...member,
            idDocumentTypeId: member.idDocumentType?.id || member.idDocumentTypeId,
            idDocumentScanPath: member.idDocumentScanPath || '',
            contactPersonRelationshipTypeId: member.contactPersonRelationshipType?.id || member.contactPersonRelationshipTypeId,
        });
        setViewMemberDialog(true);
    };

    const loadMemberToEdit = (member: any) => {
        setSignatoryMemberEdit({
            ...member,
            idDocumentTypeId: member.idDocumentType?.id || member.idDocumentTypeId,
            idDocumentScanPath: member.idDocumentScanPath || '',
            contactPersonRelationshipTypeId: member.contactPersonRelationshipType?.id || member.contactPersonRelationshipTypeId,
        });
        setMemberSignatureFileEdit(null);
        setMemberPhotoFileEdit(null);
        setMemberDocumentFileEdit(null);
        setEditMemberDialog(true);
    };

    const confirmDeleteMember = (member: any) => {
        if (!selectedBusinessClient?.id) return;
        confirmDialog({
            message: `Supprimer le membre ${member.firstName} ${member.lastName} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchMemberData(null, 'DELETE',
                    `${MEMBER_URL(selectedBusinessClient.id!)}/delete/${member.id}`, 'deleteMember');
            }
        });
    };

    const handlePrintMembers = () => {
        if (!selectedBusinessClient || signatoryMembers.length === 0) return;
        const rows = signatoryMembers.map((m, i) => `
            <tr>
                <td style="padding:6px;border:1px solid #ddd;">${i + 1}</td>
                <td style="padding:6px;border:1px solid #ddd;">${m.lastName} ${m.firstName}</td>
                <td style="padding:6px;border:1px solid #ddd;">${(m as any).functionRole || ''}</td>
                <td style="padding:6px;border:1px solid #ddd;">${(m as any).phonePrimary || ''}</td>
                <td style="padding:6px;border:1px solid #ddd;">${(m as any).idDocumentNumber || ''}</td>
                <td style="padding:6px;border:1px solid #ddd;text-align:center;">
                    ${(m as any).signatureImagePath ? `<img src="${buildApiUrl('/api/files/download?filePath=' + encodeURIComponent((m as any).signatureImagePath))}" width="60" />` : '-'}
                </td>
            </tr>`).join('');

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html><html><head><title>Membres Signataires - ${(selectedBusinessClient as any).businessName}</title>
                <style>
                    * { margin:0; padding:0; box-sizing:border-box; }
                    body { font-family:Arial,sans-serif; padding:15mm 20mm; }
                    table { width:100%; border-collapse:collapse; }
                    th { background:#1e3a8a; color:#fff; padding:8px; border:1px solid #ddd; font-size:12px; }
                    td { font-size:11px; }
                    @media print { @page { margin:10mm 15mm; size:A4 landscape; } body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
                </style></head><body>
                <div style="text-align:center;margin-bottom:20px;">
                    <h2 style="color:#1e3a8a;">AGRINOVA MICROFINANCE</h2>
                    <h3>Liste des Membres Signataires</h3>
                    <p style="font-size:14px;font-weight:bold;margin-top:10px;">${(selectedBusinessClient as any).businessName || ''}</p>
                    <p style="font-size:12px;color:#666;">N. Client: ${(selectedBusinessClient as any).clientNumber || ''}</p>
                    <p style="font-size:11px;color:#999;">Imprime le ${new Date().toLocaleDateString('fr-FR')}</p>
                </div>
                <table>
                    <thead><tr><th>N.</th><th>Nom & Prenom</th><th>Fonction</th><th>Telephone</th><th>N. Document</th><th>Signature</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                </body></html>`);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
        }
    };

    // Member DataTable templates
    const memberPhotoTemplate = (rowData: any) => {
        if (rowData.photoPath) {
            return <Image src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(rowData.photoPath)}`)} alt="Photo" width="40" preview />;
        }
        return <Avatar icon="pi pi-user" shape="circle" />;
    };

    const memberSignatureTemplate = (rowData: any) => {
        if (rowData.signatureImagePath) {
            return <Image src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(rowData.signatureImagePath)}`)} alt="Signature" width="50" preview />;
        }
        return <span className="text-500 text-sm">-</span>;
    };

    const memberStatusTemplate = (rowData: any) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const memberActionButtons = (rowData: any) => {
        return (
            <div className="flex gap-1">
                <Button icon="pi pi-eye" rounded text severity="info" tooltip="Visualiser"
                    tooltipOptions={{ position: 'top' }} onClick={() => viewMemberDetails(rowData)} />
                <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }} onClick={() => loadMemberToEdit(rowData)} />
                <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer"
                    tooltipOptions={{ position: 'top' }} onClick={() => confirmDeleteMember(rowData)} />
            </div>
        );
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else if (e.index === 0) {
            generateClientNumber();
        } else if (e.index === 2 && selectedBusinessClient?.id) {
            loadSignatoryMembers(selectedBusinessClient.id);
        }
        setActiveIndex(e.index);
    };

    const loadClientToEdit = (data: Client) => {
        // Extract IDs from nested objects returned by backend
        const clientData = data as any;
        const editData: Client = {
            ...data,
            // Extract IDs from nested objects
            branchId: clientData.branch?.id || data.branchId,
            clientCategoryId: clientData.category?.id || data.clientCategoryId,
            provinceId: clientData.province?.id || data.provinceId,
            communeId: clientData.commune?.id || data.communeId,
            zoneId: clientData.zone?.id || data.zoneId,
            collineId: clientData.colline?.id || data.collineId,
            nationalityId: clientData.nationality?.id || data.nationalityId,
            idDocumentTypeId: clientData.idDocumentType?.id || data.idDocumentTypeId,
            activitySectorId: clientData.activitySector?.id || data.activitySectorId,
            maritalStatusId: clientData.maritalStatus?.id || data.maritalStatusId,
            educationLevelId: clientData.educationLevel?.id || data.educationLevelId,
            housingTypeId: clientData.housingType?.id || data.housingTypeId,
            assignedOfficerId: clientData.assignedOfficer?.id || data.assignedOfficerId,
            // Map backend field names to frontend field names
            occupation: clientData.profession || data.occupation,
            employer: clientData.employerName || data.employer,
            numberOfDependents: clientData.dependentsCount ?? data.numberOfDependents,
            idDocumentIssuedBy: clientData.idIssuePlace || data.idDocumentIssuedBy,
            idDocumentIssueDate: clientData.idIssueDate || data.idDocumentIssueDate,
            idDocumentExpiryDate: clientData.idExpiryDate || data.idDocumentExpiryDate,
            // Co-titulaire address IDs
            secondProvinceId: clientData.secondProvince?.id || data.secondProvinceId,
            secondCommuneId: clientData.secondCommune?.id || data.secondCommuneId,
            secondZoneId: clientData.secondZone?.id || data.secondZoneId,
            secondCollineId: clientData.secondColline?.id || data.secondCollineId,
            secondStreetAddress: clientData.secondStreetAddress || data.secondStreetAddress || '',
            // Co-titulaire other IDs
            secondNationalityId: clientData.secondNationality?.id || data.secondNationalityId,
            secondIdDocumentTypeId: clientData.secondIdDocumentType?.id || data.secondIdDocumentTypeId,
            // Emergency contacts
            emergencyContacts: (clientData.emergencyContacts || []).map((c: any) => ({
                ...c,
                relationshipTypeId: c.relationshipType?.id || c.relationshipTypeId,
                contactFor: c.contactFor || 'PRINCIPAL',
            })),
        };

        console.log('📝 Loading client for edit:', editData);
        setClientEdit(editData);

        // Load dependent dropdowns (communes, zones, collines)
        const provinceId = clientData.province?.id || data.provinceId;
        const communeId = clientData.commune?.id || data.communeId;
        const zoneId = clientData.zone?.id || data.zoneId;

        if (provinceId) handleProvinceChange(provinceId);
        if (communeId) setTimeout(() => handleCommuneChange(communeId), 500);
        if (zoneId) setTimeout(() => handleZoneChange(zoneId), 1000);

        // Load co-titulaire address cascading dropdowns
        const secondProvinceIdVal = clientData.secondProvince?.id || data.secondProvinceId;
        const secondCommuneIdVal = clientData.secondCommune?.id || data.secondCommuneId;
        const secondZoneIdVal = clientData.secondZone?.id || data.secondZoneId;

        if (secondProvinceIdVal) handleSecondProvinceChange(secondProvinceIdVal);
        if (secondCommuneIdVal) setTimeout(() => handleSecondCommuneChange(secondCommuneIdVal), 500);
        if (secondZoneIdVal) setTimeout(() => handleSecondZoneChange(secondZoneIdVal), 1000);

        setEditClientDialog(true);
    };

    const viewClientDetails = (data: Client) => {
        // Fetch full client by ID to get lazy-loaded collections (emergency contacts)
        if (data.id) {
            fetchData(null, 'GET', `${BASE_URL}/findbyid/${data.id}`, 'viewClientById');
        }
    };

    // Status change
    const [statusDialog, setStatusDialog] = useState(false);
    const [statusClient, setStatusClient] = useState<Client | null>(null);
    const [newStatus, setNewStatus] = useState<ClientStatus | null>(null);
    const [statusReason, setStatusReason] = useState('');

    const statusOptions = [
        { label: 'Actif', value: ClientStatus.ACTIVE },
        { label: 'En attente', value: ClientStatus.PENDING },
        { label: 'Inactif', value: ClientStatus.INACTIVE },
        { label: 'Suspendu', value: ClientStatus.SUSPENDED },
        { label: 'Fermé', value: ClientStatus.CLOSED }
    ];

    const openStatusDialog = (client: Client) => {
        setStatusClient(client);
        setNewStatus(null);
        setStatusReason('');
        setStatusDialog(true);
    };

    const handleStatusChange = () => {
        if (!statusClient || !newStatus) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un statut');
            return;
        }
        if (newStatus === statusClient.status) {
            showToast('warn', 'Attention', 'Le client a déjà ce statut');
            return;
        }
        const appUserCookie = Cookies.get('appUser');
        const appUser = appUserCookie ? JSON.parse(appUserCookie) : null;
        const userId = appUser?.id || null;
        const reasonParam = statusReason ? `&reason=${encodeURIComponent(statusReason)}` : '';
        const userParam = userId ? `&changedByUserId=${userId}` : '';
        fetchData(null, 'PUT', `${BASE_URL}/updatestatus/${statusClient.id}?newStatus=${newStatus}${reasonParam}${userParam}`, 'updateStatus');
        setStatusDialog(false);
    };

    const confirmDelete = (client: Client) => {
        confirmDialog({
            message: `Voulez-vous vraiment supprimer le client "${(client.clientType === ClientType.INDIVIDUAL || client.clientType === ClientType.JOINT_ACCOUNT) ? `${client.firstName} ${client.lastName}` : client.businessName}" ?`,
            header: 'Confirmation de Suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, Supprimer',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/softdelete/${client.id}`, 'deleteClient');
            }
        });
    };

    const getStatusSeverity = (status: ClientStatus): "success" | "info" | "warning" | "danger" | null => {
        switch (status) {
            case ClientStatus.ACTIVE: return 'success';
            case ClientStatus.PENDING: return 'info';
            case ClientStatus.SUSPENDED: return 'warning';
            case ClientStatus.INACTIVE: return null;
            case ClientStatus.BLACKLISTED: return 'danger';
            case ClientStatus.CLOSED: return null;
            default: return null;
        }
    };

    const statusBodyTemplate = (rowData: Client) => {
        const statusLabels: Record<ClientStatus, string> = {
            [ClientStatus.PENDING]: 'En attente',
            [ClientStatus.ACTIVE]: 'Actif',
            [ClientStatus.INACTIVE]: 'Inactif',
            [ClientStatus.SUSPENDED]: 'Suspendu',
            [ClientStatus.CLOSED]: 'Fermé',
            [ClientStatus.BLACKLISTED]: 'Liste noire'
        };
        return <Tag value={statusLabels[rowData.status]} severity={getStatusSeverity(rowData.status)} />;
    };

    const clientNameTemplate = (rowData: Client) => {
        if (rowData.clientType === ClientType.INDIVIDUAL || rowData.clientType === ClientType.JOINT_ACCOUNT) {
            const mainName = `${rowData.firstName || ''} ${rowData.lastName || ''}`.trim();
            const secondName = rowData.clientType === ClientType.JOINT_ACCOUNT && (rowData.secondFirstName || rowData.secondLastName)
                ? ` & ${rowData.secondFirstName || ''} ${rowData.secondLastName || ''}`.trim()
                : '';
            return (
                <div className="flex align-items-center gap-2">
                    <Avatar
                        icon={rowData.clientType === ClientType.JOINT_ACCOUNT ? "pi pi-users" : "pi pi-user"}
                        size="normal"
                        shape="circle"
                        className={rowData.clientType === ClientType.JOINT_ACCOUNT ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}
                    />
                    <div>
                        <div className="font-semibold">{mainName}{secondName}</div>
                        <div className="text-sm text-500">{rowData.clientNumber}</div>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex align-items-center gap-2">
                <Avatar
                    icon="pi pi-building"
                    size="normal"
                    shape="circle"
                    className="bg-green-100 text-green-600"
                />
                <div>
                    <div className="font-semibold">{rowData.businessName}</div>
                    <div className="text-sm text-500">{rowData.clientNumber}</div>
                </div>
            </div>
        );
    };

    const clientTypeTemplate = (rowData: Client) => {
        if (rowData.clientType === ClientType.INDIVIDUAL) {
            return <Tag value="Individuel" severity="info" icon="pi pi-user" />;
        }
        if (rowData.clientType === ClientType.JOINT_ACCOUNT) {
            return <Tag value="Compte Conjoint" severity="warning" icon="pi pi-users" />;
        }
        return <Tag value="Entreprise" severity="success" icon="pi pi-building" />;
    };

    const optionButtons = (data: Client): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-1'>
                <Button
                    icon="pi pi-eye"
                    onClick={() => viewClientDetails(data)}
                    rounded
                    text
                    severity='info'
                    tooltip="Voir details"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadClientToEdit(data)}
                    rounded
                    text
                    severity='warning'
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-check-circle"
                    onClick={() => openStatusDialog(data)}
                    rounded
                    text
                    severity={data.status === ClientStatus.ACTIVE ? 'success' : 'secondary'}
                    tooltip="Changer Statut"
                    tooltipOptions={{ position: 'top' }}
                />
                {data.status !== ClientStatus.ACTIVE && (
                    <Button
                        icon="pi pi-trash"
                        onClick={() => confirmDelete(data)}
                        rounded
                        text
                        severity='danger'
                        tooltip="Supprimer"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}
                {(data.clientType === ClientType.BUSINESS || data.clientType === ClientType.JOINT_ACCOUNT) && (
                    <Button
                        icon="pi pi-users"
                        onClick={() => {
                            setSelectedBusinessClient(data);
                            loadSignatoryMembers(data.id!);
                            setActiveIndex(2);
                        }}
                        rounded
                        text
                        severity='success'
                        tooltip="Membres Signataires"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}
            </div>
        );
    };

    // Statistics
    const getStats = () => {
        const total = clients.length;
        const active = clients.filter(c => c.status === ClientStatus.ACTIVE).length;
        const individuals = clients.filter(c => c.clientType === ClientType.INDIVIDUAL).length;
        const businesses = clients.filter(c => c.clientType === ClientType.BUSINESS).length;
        const jointAccounts = clients.filter(c => c.clientType === ClientType.JOINT_ACCOUNT).length;
        return { total, active, individuals, businesses, jointAccounts };
    };

    const stats = getStats();

    const renderHeader = () => {
        return (
            <div className="flex flex-column gap-3">
                {/* Statistics Cards */}
                <div className="grid">
                    <div className="col-6 md:col-2">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Total Clients</div>
                            <div className="text-3xl font-bold text-primary">{stats.total}</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-2">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Clients Actifs</div>
                            <div className="text-3xl font-bold text-green-500">{stats.active}</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-3">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Individuels</div>
                            <div className="text-3xl font-bold text-blue-500">{stats.individuals}</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-2">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Entreprises</div>
                            <div className="text-3xl font-bold text-orange-500">{stats.businesses}</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-2">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Comptes Conjoints</div>
                            <div className="text-3xl font-bold text-purple-500">{stats.jointAccounts}</div>
                        </div>
                    </div>
                </div>

                {/* Search and Actions */}
                <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            icon="pi pi-refresh"
                            label="Actualiser"
                            outlined
                            onClick={loadAllData}
                            size="small"
                        />
                    </div>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            placeholder="Rechercher par nom, numero, telephone..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{ width: '300px' }}
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

            {/* Status Change Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-check-circle text-2xl text-primary"></i>
                        <span>Changer le Statut du Client</span>
                    </div>
                }
                visible={statusDialog}
                style={{ width: '450px' }}
                modal
                onHide={() => setStatusDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setStatusDialog(false)} outlined severity="secondary" />
                        <Button label="Confirmer" icon="pi pi-check" onClick={handleStatusChange} />
                    </div>
                }
            >
                {statusClient && (
                    <div className="flex flex-column gap-4">
                        <div className="surface-100 p-3 border-round">
                            <div className="flex align-items-center gap-2 mb-2">
                                <Avatar
                                    icon={statusClient.clientType === ClientType.BUSINESS ? "pi pi-building" : statusClient.clientType === ClientType.JOINT_ACCOUNT ? "pi pi-users" : "pi pi-user"}
                                    shape="circle"
                                    className="bg-blue-100 text-blue-600"
                                />
                                <div>
                                    <div className="font-semibold">
                                        {(statusClient.clientType === ClientType.INDIVIDUAL || statusClient.clientType === ClientType.JOINT_ACCOUNT)
                                            ? `${statusClient.firstName} ${statusClient.lastName}`
                                            : statusClient.businessName}
                                    </div>
                                    <div className="text-sm text-500">{statusClient.clientNumber}</div>
                                </div>
                            </div>
                            <div className="flex align-items-center gap-2">
                                <span className="text-500">Statut actuel:</span>
                                {statusBodyTemplate(statusClient)}
                            </div>
                        </div>
                        <div className="flex flex-column gap-2">
                            <label className="font-semibold">Nouveau Statut *</label>
                            <Dropdown
                                value={newStatus}
                                options={statusOptions.filter(s => s.value !== statusClient.status)}
                                onChange={(e) => setNewStatus(e.value)}
                                placeholder="Sélectionner un statut"
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-column gap-2">
                            <label className="font-semibold">Motif (optionnel)</label>
                            <InputText
                                value={statusReason}
                                onChange={(e) => setStatusReason(e.target.value)}
                                placeholder="Raison du changement de statut"
                                className="w-full"
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* View Client Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user text-2xl text-primary"></i>
                        <span>Details du Client</span>
                    </div>
                }
                visible={viewClientDialog}
                style={{ width: '90vw', maxWidth: '1200px' }}
                modal
                onHide={() => setViewClientDialog(false)}
            >
                <div className="grid">
                    {/* Left Column */}
                    <div className="col-12 md:col-4">
                        {/* Photo and Basic Info */}
                        <Card className="mb-3">
                            <div className="flex flex-column align-items-center text-center mb-3">
                                {clientEdit.photoPath ? (
                                    <Image
                                        src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientEdit.photoPath)}`)}
                                        alt="Photo du client"
                                        width="150"
                                        height="150"
                                        preview
                                        imageClassName="border-round-xl shadow-2"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Avatar
                                        icon={clientEdit.clientType === ClientType.BUSINESS ? "pi pi-building" : clientEdit.clientType === ClientType.JOINT_ACCOUNT ? "pi pi-users" : "pi pi-user"}
                                        size="xlarge"
                                        shape="circle"
                                        className={clientEdit.clientType === ClientType.BUSINESS ? "bg-green-100 text-green-600" : clientEdit.clientType === ClientType.JOINT_ACCOUNT ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}
                                        style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                                    />
                                )}
                                <h4 className="m-0 mt-3">
                                    {clientEdit.clientType === ClientType.JOINT_ACCOUNT
                                        ? `${clientEdit.firstName || ''} ${clientEdit.lastName || ''} & ${clientEdit.secondFirstName || ''} ${clientEdit.secondLastName || ''}`.trim()
                                        : (clientEdit.clientType === ClientType.INDIVIDUAL)
                                            ? `${clientEdit.firstName} ${clientEdit.lastName}`
                                            : clientEdit.businessName}
                                </h4>
                                <p className="text-500 m-0">{clientEdit.clientNumber}</p>
                                <div className="flex gap-2 mt-2">
                                    {clientTypeTemplate(clientEdit)}
                                    {statusBodyTemplate(clientEdit)}
                                </div>
                            </div>
                            <Divider />
                            {/* Contact Info */}
                            <div className="flex flex-column gap-2">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-phone text-primary"></i>
                                    <span className="font-semibold">{clientEdit.phonePrimary || 'N/A'}</span>
                                </div>
                                {clientEdit.phoneSecondary && (
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-phone text-500"></i>
                                        <span>{clientEdit.phoneSecondary}</span>
                                    </div>
                                )}
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-envelope text-primary"></i>
                                    <span>{clientEdit.email || 'N/A'}</span>
                                </div>
                            </div>
                            {clientEdit.clientType !== ClientType.BUSINESS && clientEdit.signatureImagePath && (
                                <>
                                    <Divider />
                                    <div>
                                        <p className="text-500 mb-2">Signature</p>
                                        <Image
                                            src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientEdit.signatureImagePath)}`)}
                                            alt="Signature du client"
                                            width="150"
                                            preview
                                        />
                                    </div>
                                </>
                            )}
                        </Card>

                        {/* Classification & Risk */}
                        <Card title="Classification" className="mb-3">
                            <div className="flex flex-column gap-3">
                                <div className="flex align-items-center justify-content-between">
                                    <span className="text-500">Niveau de Risque</span>
                                    <Tag
                                        value={clientEdit.riskRating === 'LOW' ? 'Faible' : clientEdit.riskRating === 'MEDIUM' ? 'Moyen' : clientEdit.riskRating === 'HIGH' ? 'Elevé' : 'Très Elevé'}
                                        severity={
                                            clientEdit.riskRating === 'LOW' ? 'success' :
                                            clientEdit.riskRating === 'MEDIUM' ? 'warning' :
                                            clientEdit.riskRating === 'HIGH' ? 'danger' : 'danger'
                                        }
                                    />
                                </div>
                                <div className="flex align-items-center justify-content-between">
                                    <span className="text-500">Catégorie</span>
                                    <span className="font-semibold">{(clientEdit as any).category?.name || 'N/A'}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Middle Column */}
                    <div className="col-12 md:col-4">
                        {/* Personal Information */}
                        {(clientEdit.clientType === ClientType.INDIVIDUAL || clientEdit.clientType === ClientType.JOINT_ACCOUNT) && (
                            <Card title={clientEdit.clientType === ClientType.JOINT_ACCOUNT ? "Titulaire Principal (1ère Personne)" : "Informations Personnelles"} className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Nom complet</span>
                                        <span className="font-semibold">{`${clientEdit.lastName || ''} ${clientEdit.firstName || ''} ${clientEdit.middleName || ''}`.trim() || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Genre</span>
                                        <span className="font-semibold">{clientEdit.gender === 'M' ? 'Masculin' : clientEdit.gender === 'F' ? 'Féminin' : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date de naissance</span>
                                        <span className="font-semibold">{clientEdit.dateOfBirth ? new Date(clientEdit.dateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Lieu de naissance</span>
                                        <span className="font-semibold">{clientEdit.placeOfBirth || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Nationalité</span>
                                        <span className="font-semibold">{(clientEdit as any).nationality?.name || 'N/A'}</span>
                                    </div>
                                    {clientEdit.clientType === ClientType.INDIVIDUAL && (
                                        <>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Etat civil</span>
                                                <span className="font-semibold">{(clientEdit as any).maritalStatus?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Niveau d'étude</span>
                                                <span className="font-semibold">{(clientEdit as any).educationLevel?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Type d'habitation</span>
                                                <span className="font-semibold">{(clientEdit as any).housingType?.name || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Co-titulaire Information (JOINT_ACCOUNT) */}
                        {clientEdit.clientType === ClientType.JOINT_ACCOUNT && (
                            <Card title="Co-titulaire (2ème Personne)" className="mb-3" style={{ borderLeft: '4px solid #f97316' }}>
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Nom complet</span>
                                        <span className="font-semibold">{`${clientEdit.secondLastName || ''} ${clientEdit.secondFirstName || ''}`.trim() || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Genre</span>
                                        <span className="font-semibold">{clientEdit.secondGender === 'M' ? 'Masculin' : clientEdit.secondGender === 'F' ? 'Féminin' : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date de naissance</span>
                                        <span className="font-semibold">{clientEdit.secondDateOfBirth ? new Date(clientEdit.secondDateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Lieu de naissance</span>
                                        <span className="font-semibold">{clientEdit.secondPlaceOfBirth || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Nationalité</span>
                                        <span className="font-semibold">{(clientEdit as any).secondNationality?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Téléphone</span>
                                        <span className="font-semibold">{clientEdit.secondPhonePrimary || 'N/A'}</span>
                                    </div>
                                    <Divider />
                                    <h6 className="m-0 text-primary">Document d'identité</h6>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Type</span>
                                        <span className="font-semibold">{(clientEdit as any).secondIdDocumentType?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Numéro</span>
                                        <span className="font-semibold">{clientEdit.secondIdDocumentNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date de délivrance</span>
                                        <span className="font-semibold">{clientEdit.secondIdIssueDate ? new Date(clientEdit.secondIdIssueDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date d'expiration</span>
                                        <span className="font-semibold">{clientEdit.secondIdExpiryDate ? new Date(clientEdit.secondIdExpiryDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    {clientEdit.secondIdDocumentScanPath && (
                                        <div className="mt-2">
                                            <p className="text-500 mb-2">Document scanné</p>
                                            {clientEdit.secondIdDocumentScanPath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientEdit.secondIdDocumentScanPath)}`)}
                                                    alt="Document co-titulaire"
                                                    width="150"
                                                    preview
                                                    imageClassName="border-round shadow-1"
                                                />
                                            ) : (
                                                <Button
                                                    icon="pi pi-eye"
                                                    label="Voir le document"
                                                    className="p-button-outlined p-button-info p-button-sm"
                                                    onClick={() => window.open(buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientEdit.secondIdDocumentScanPath)}`), '_blank')}
                                                />
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-3 mt-2">
                                        {clientEdit.secondPhotoPath && (
                                            <div>
                                                <p className="text-500 mb-2">Photo</p>
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientEdit.secondPhotoPath)}`)}
                                                    alt="Photo co-titulaire"
                                                    width="100"
                                                    preview
                                                    imageClassName="border-round shadow-1"
                                                />
                                            </div>
                                        )}
                                        {clientEdit.secondSignatureImagePath && (
                                            <div>
                                                <p className="text-500 mb-2">Signature</p>
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientEdit.secondSignatureImagePath)}`)}
                                                    alt="Signature co-titulaire"
                                                    width="120"
                                                    preview
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <Divider />
                                    <h6 className="m-0 text-primary">Adresse du Co-titulaire</h6>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Province</span>
                                        <span className="font-semibold">{(clientEdit as any).secondProvince?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Commune</span>
                                        <span className="font-semibold">{(clientEdit as any).secondCommune?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Zone</span>
                                        <span className="font-semibold">{(clientEdit as any).secondZone?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Colline</span>
                                        <span className="font-semibold">{(clientEdit as any).secondColline?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Adresse Détaillée</span>
                                        <span className="font-semibold">{clientEdit.secondStreetAddress || 'N/A'}</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Business Information */}
                        {clientEdit.clientType === ClientType.BUSINESS && (
                            <Card title="Informations Entreprise" className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Nom entreprise</span>
                                        <span className="font-semibold">{clientEdit.businessName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Numéro RCCM</span>
                                        <span className="font-semibold">{clientEdit.businessRegistrationNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Type entreprise</span>
                                        <span className="font-semibold">{clientEdit.businessType || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date de création</span>
                                        <span className="font-semibold">{clientEdit.dateOfIncorporation ? new Date(clientEdit.dateOfIncorporation).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* ID Document Info */}
                        <Card title="Document d'Identité" className="mb-3">
                            <div className="flex flex-column gap-2">
                                <div className="flex justify-content-between">
                                    <span className="text-500">Type de document</span>
                                    <span className="font-semibold">{(clientEdit as any).idDocumentType?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-500">Numéro</span>
                                    <span className="font-semibold">{clientEdit.idDocumentNumber || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-500">Date de délivrance</span>
                                    <span className="font-semibold">{(clientEdit.idDocumentIssueDate || clientEdit.idIssueDate) ? new Date(clientEdit.idDocumentIssueDate || clientEdit.idIssueDate!).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-500">Date d'expiration</span>
                                    <span className="font-semibold">{(clientEdit.idDocumentExpiryDate || clientEdit.idExpiryDate) ? new Date(clientEdit.idDocumentExpiryDate || clientEdit.idExpiryDate!).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-500">Délivré par</span>
                                    <span className="font-semibold">{clientEdit.idDocumentIssuedBy || (clientEdit as any).idIssuePlace || 'N/A'}</span>
                                </div>
                                {clientEdit.idDocumentScanPath && (
                                    <div className="mt-2">
                                        <p className="text-500 mb-2">Document scanné</p>
                                        {/* Check if it's an image or a document */}
                                        {clientEdit.idDocumentScanPath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                            <Image
                                                src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientEdit.idDocumentScanPath)}`)}
                                                alt="Document d'identité"
                                                width="200"
                                                preview
                                                imageClassName="border-round shadow-1"
                                            />
                                        ) : (
                                            <div className="flex flex-column gap-2">
                                                <Button
                                                    icon="pi pi-eye"
                                                    label="Voir le document"
                                                    className="p-button-outlined p-button-info"
                                                    onClick={() => window.open(buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientEdit.idDocumentScanPath)}`), '_blank')}
                                                />
                                                <small className="text-500">
                                                    <i className="pi pi-file mr-1"></i>
                                                    {clientEdit.idDocumentScanPath.split('/').pop()}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="col-12 md:col-4">
                        {/* Address */}
                        <Card title={clientEdit.clientType === ClientType.JOINT_ACCOUNT ? "Adresse (Titulaire Principal)" : "Adresse"} className="mb-3">
                            <div className="flex flex-column gap-2">
                                <div className="flex justify-content-between">
                                    <span className="text-500">Province</span>
                                    <span className="font-semibold">{(clientEdit as any).province?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-500">Commune</span>
                                    <span className="font-semibold">{(clientEdit as any).commune?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-500">Zone</span>
                                    <span className="font-semibold">{(clientEdit as any).zone?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-500">Colline</span>
                                    <span className="font-semibold">{(clientEdit as any).colline?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-500">Adresse détaillée</span>
                                    <span className="font-semibold text-right" style={{ maxWidth: '60%' }}>{clientEdit.streetAddress || 'N/A'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Professional Info */}
                        <Card title={clientEdit.clientType === ClientType.BUSINESS ? "Secteur d'Activité" : "Informations Professionnelles"} className="mb-3">
                            <div className="flex flex-column gap-2">
                                <div className="flex justify-content-between">
                                    <span className="text-500">Secteur d'activité</span>
                                    <span className="font-semibold">{(clientEdit as any).activitySector?.name || 'N/A'}</span>
                                </div>
                                {clientEdit.clientType !== ClientType.BUSINESS && (
                                    <>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Profession</span>
                                            <span className="font-semibold">{clientEdit.profession || clientEdit.occupation || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Employeur</span>
                                            <span className="font-semibold">{clientEdit.employerName || clientEdit.employer || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Revenu mensuel</span>
                                            <span className="font-semibold text-green-600">
                                                {clientEdit.monthlyIncome?.toLocaleString('fr-BI') || '0'} BIF
                                            </span>
                                        </div>
                                    </>
                                )}
                                {clientEdit.clientType === ClientType.INDIVIDUAL && (
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Personnes à charge</span>
                                        <span className="font-semibold">{clientEdit.dependentsCount ?? clientEdit.numberOfDependents ?? 0}</span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Assignment & Branch */}
                        <Card title="Affectation" className="mb-3">
                            <div className="flex flex-column gap-2">
                                <div className="flex justify-content-between">
                                    <span className="text-500">Agence</span>
                                    <span className="font-semibold">{(clientEdit as any).branch?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-500">Agent assigné</span>
                                    <span className="font-semibold">{(clientEdit as any).assignedOfficer?.firstName ? `${(clientEdit as any).assignedOfficer.firstName} ${(clientEdit as any).assignedOfficer.lastName}` : 'N/A'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Personne de Contact */}
                        {clientEdit.clientType !== ClientType.BUSINESS && (
                            (() => {
                                const contacts = (clientEdit as any).emergencyContacts || [];
                                const hasContacts = contacts.length > 0;

                                if (clientEdit.clientType === ClientType.JOINT_ACCOUNT) {
                                    const principalContacts = contacts.filter((c: any) => c.contactFor === 'PRINCIPAL');
                                    const coContacts = contacts.filter((c: any) => c.contactFor === 'CO_TITULAIRE');
                                    return (
                                        <>
                                            <Card title="Personne de Contact — Titulaire Principal" className="mb-3">
                                                {principalContacts.length > 0 ? (
                                                    <div className="flex flex-column gap-3">
                                                        {principalContacts.map((contact: any, idx: number) => (
                                                            <div key={idx} className={idx > 0 ? 'border-top-1 border-300 pt-3' : ''}>
                                                                <div className="flex justify-content-between"><span className="text-500">Nom</span><span className="font-semibold">{contact.contactName || 'N/A'}</span></div>
                                                                <div className="flex justify-content-between"><span className="text-500">Lien de Parenté</span><span className="font-semibold">{contact.relationshipType?.nameFr || contact.relationshipType?.name || contact.relationshipOther || 'N/A'}</span></div>
                                                                <div className="flex justify-content-between"><span className="text-500">Téléphone</span><span className="font-semibold">{contact.phonePrimary || 'N/A'}</span></div>
                                                                {contact.phoneSecondary && (<div className="flex justify-content-between"><span className="text-500">Tél. Secondaire</span><span className="font-semibold">{contact.phoneSecondary}</span></div>)}
                                                                {contact.address && (<div className="flex justify-content-between"><span className="text-500">Adresse</span><span className="font-semibold">{contact.address}</span></div>)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-500 text-center m-0">Aucune personne de contact ajoutée.</p>
                                                )}
                                            </Card>
                                            <Card title="Personne de Contact — Co-titulaire" className="mb-3">
                                                {coContacts.length > 0 ? (
                                                    <div className="flex flex-column gap-3">
                                                        {coContacts.map((contact: any, idx: number) => (
                                                            <div key={idx} className={idx > 0 ? 'border-top-1 border-300 pt-3' : ''}>
                                                                <div className="flex justify-content-between"><span className="text-500">Nom</span><span className="font-semibold">{contact.contactName || 'N/A'}</span></div>
                                                                <div className="flex justify-content-between"><span className="text-500">Lien de Parenté</span><span className="font-semibold">{contact.relationshipType?.nameFr || contact.relationshipType?.name || contact.relationshipOther || 'N/A'}</span></div>
                                                                <div className="flex justify-content-between"><span className="text-500">Téléphone</span><span className="font-semibold">{contact.phonePrimary || 'N/A'}</span></div>
                                                                {contact.phoneSecondary && (<div className="flex justify-content-between"><span className="text-500">Tél. Secondaire</span><span className="font-semibold">{contact.phoneSecondary}</span></div>)}
                                                                {contact.address && (<div className="flex justify-content-between"><span className="text-500">Adresse</span><span className="font-semibold">{contact.address}</span></div>)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-500 text-center m-0">Aucune personne de contact ajoutée.</p>
                                                )}
                                            </Card>
                                        </>
                                    );
                                }

                                // INDIVIDUAL or default
                                return (
                                    <Card title="Personne de Contact" className="mb-3">
                                        {hasContacts ? (
                                            <div className="flex flex-column gap-3">
                                                {contacts.map((contact: any, idx: number) => (
                                                    <div key={idx} className={idx > 0 ? 'border-top-1 border-300 pt-3' : ''}>
                                                        <div className="flex justify-content-between"><span className="text-500">Nom</span><span className="font-semibold">{contact.contactName || 'N/A'}</span></div>
                                                        <div className="flex justify-content-between"><span className="text-500">Lien de Parenté</span><span className="font-semibold">{contact.relationshipType?.nameFr || contact.relationshipType?.name || contact.relationshipOther || 'N/A'}</span></div>
                                                        <div className="flex justify-content-between"><span className="text-500">Téléphone</span><span className="font-semibold">{contact.phonePrimary || 'N/A'}</span></div>
                                                        {contact.phoneSecondary && (<div className="flex justify-content-between"><span className="text-500">Tél. Secondaire</span><span className="font-semibold">{contact.phoneSecondary}</span></div>)}
                                                        {contact.address && (<div className="flex justify-content-between"><span className="text-500">Adresse</span><span className="font-semibold">{contact.address}</span></div>)}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-500 text-center m-0">Aucune personne de contact ajoutée.</p>
                                        )}
                                    </Card>
                                );
                            })()
                        )}

                        {/* Notes */}
                        {clientEdit.notes && (
                            <Card title="Notes">
                                <p className="m-0 text-600">{clientEdit.notes}</p>
                            </Card>
                        )}
                    </div>
                </div>
            </Dialog>

            {/* Edit Client Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-pencil text-2xl text-warning"></i>
                        <span>Modifier Client</span>
                    </div>
                }
                visible={editClientDialog}
                style={{ width: '85vw' }}
                modal
                onHide={() => {
                    setEditClientDialog(false);
                    setDocumentNumberErrorEdit(null);
                }}
            >
                <ClientForm
                    client={clientEdit}
                    handleChange={handleChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleFileUpload={handleFileUploadEdit}
                    handleFileRemove={handleFileRemoveEdit}
                    idDocumentFile={idDocumentFileEdit}
                    photoFile={photoFileEdit}
                    signatureFile={signatureFileEdit}
                    provinces={provinces}
                    communes={communes}
                    zones={zones}
                    collines={collines}
                    nationalities={nationalities}
                    idDocumentTypes={idDocumentTypes}
                    activitySectors={activitySectors}
                    maritalStatuses={maritalStatuses}
                    educationLevels={educationLevels}
                    clientCategories={clientCategories}
                    housingTypes={housingTypes}
                    branches={branches}
                    onProvinceChange={handleProvinceChange}
                    onCommuneChange={handleCommuneChange}
                    onZoneChange={handleZoneChange}
                    secondCommunes={secondCommunes}
                    secondZones={secondZones}
                    secondCollines={secondCollines}
                    onSecondProvinceChange={handleSecondProvinceChange}
                    onSecondCommuneChange={handleSecondCommuneChange}
                    onSecondZoneChange={handleSecondZoneChange}
                    onDocumentNumberBlur={handleDocumentNumberBlurEdit}
                    documentNumberError={documentNumberErrorEdit}
                    checkingDocument={checkingDocumentEdit}
                    secondPhotoFile={secondPhotoFileEdit}
                    secondSignatureFile={secondSignatureFileEdit}
                    secondIdDocumentFile={secondIdDocumentFileEdit}
                    relationshipTypes={relationshipTypes}
                    onEmergencyContactsChange={(contacts) => setClientEdit(prev => ({ ...prev, emergencyContacts: contacts }))}
                />
                <Divider />
                <div className="flex justify-content-end gap-2">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => {
                            setEditClientDialog(false);
                            setDocumentNumberErrorEdit(null);
                        }}
                        outlined
                        severity="secondary"
                    />
                    <Button
                        label="Enregistrer les modifications"
                        icon="pi pi-check"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />
                </div>
            </Dialog>

            {/* Main Content */}
            <div className="card">
                {/* Page Header */}
                <div className="flex align-items-center justify-content-between mb-4">
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center justify-content-center bg-primary border-round" style={{ width: '48px', height: '48px' }}>
                            <i className="pi pi-users text-2xl text-white"></i>
                        </div>
                        <div>
                            <h4 className="m-0">Gestion des Clients</h4>
                            <p className="text-500 m-0">Gerer les clients individuels et entreprises</p>
                        </div>
                    </div>
                </div>

                <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                    <TabPanel
                        header={
                            <span className="flex align-items-center gap-2">
                                <i className="pi pi-user-plus"></i>
                                <span>Nouveau Client</span>
                            </span>
                        }
                    >
                        <ClientForm
                            client={client}
                            handleChange={handleChange}
                            handleDropdownChange={handleDropdownChange}
                            handleNumberChange={handleNumberChange}
                            handleDateChange={handleDateChange}
                            handleFileUpload={handleFileUpload}
                            handleFileRemove={handleFileRemove}
                            idDocumentFile={idDocumentFile}
                            photoFile={photoFile}
                            signatureFile={signatureFile}
                            provinces={provinces}
                            communes={communes}
                            zones={zones}
                            collines={collines}
                            nationalities={nationalities}
                            idDocumentTypes={idDocumentTypes}
                            activitySectors={activitySectors}
                            maritalStatuses={maritalStatuses}
                            educationLevels={educationLevels}
                            clientCategories={clientCategories}
                            housingTypes={housingTypes}
                            branches={branches}
                            onProvinceChange={handleProvinceChange}
                            onCommuneChange={handleCommuneChange}
                            onZoneChange={handleZoneChange}
                            secondCommunes={secondCommunes}
                            secondZones={secondZones}
                            secondCollines={secondCollines}
                            onSecondProvinceChange={handleSecondProvinceChange}
                            onSecondCommuneChange={handleSecondCommuneChange}
                            onSecondZoneChange={handleSecondZoneChange}
                            onDocumentNumberBlur={handleDocumentNumberBlur}
                            documentNumberError={documentNumberError}
                            checkingDocument={checkingDocument}
                            secondPhotoFile={secondPhotoFile}
                            secondSignatureFile={secondSignatureFile}
                            secondIdDocumentFile={secondIdDocumentFile}
                            relationshipTypes={relationshipTypes}
                            onEmergencyContactsChange={(contacts) => setClient(prev => ({ ...prev, emergencyContacts: contacts }))}
                        />
                        <Divider />
                        <div className="flex justify-content-center gap-3">
                            <Button
                                icon="pi pi-refresh"
                                outlined
                                label="Reinitialiser"
                                severity="secondary"
                                onClick={() => {
                                    setClient(new Client());
                                    setIdDocumentFile(null);
                                    setPhotoFile(null);
                                    setSignatureFile(null);
                                    setSecondPhotoFile(null);
                                    setSecondSignatureFile(null);
                                    setSecondIdDocumentFile(null);
                                    setDocumentNumberError(null);
                                    generateClientNumber();
                                }}
                            />
                            <Button
                                icon="pi pi-check"
                                label="Enregistrer le Client"
                                loading={btnLoading}
                                onClick={handleSubmit}
                            />
                        </div>
                    </TabPanel>
                    <TabPanel
                        header={
                            <span className="flex align-items-center gap-2">
                                <i className="pi pi-list"></i>
                                <span>Liste des Clients</span>
                                <Tag value={clients.length} severity="info" className="ml-2" />
                            </span>
                        }
                    >
                        <DataTable
                            value={clients}
                            header={renderHeader}
                            emptyMessage={
                                <div className="text-center py-5">
                                    <i className="pi pi-inbox text-5xl text-300 mb-3"></i>
                                    <p className="text-500">{searchTerm ? "Aucun client trouve pour cette recherche" : "Pas de client a afficher"}</p>
                                </div>
                            }
                            loading={loading || searchLoading}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            currentPageReportTemplate="Affichage de {first} a {last} sur {totalRecords} clients"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            sortField="id"
                            sortOrder={-1}
                            stripedRows
                            rowHover
                            dataKey="id"
                        >
                            <Column header="Client" body={clientNameTemplate} sortable style={{ minWidth: '250px' }} />
                            <Column header="Type" body={clientTypeTemplate} sortable style={{ minWidth: '120px' }} />
                            <Column field="phonePrimary" header="Telephone" style={{ minWidth: '130px' }} />
                            <Column field="email" header="Email" style={{ minWidth: '180px' }} />
                            <Column header="Statut" body={statusBodyTemplate} sortable style={{ minWidth: '120px' }} />
                            <Column field="userAction" header="Creé par" style={{ minWidth: '130px' }} />
                            <Column
                                header="Actions"
                                body={optionButtons}
                                style={{ width: '180px' }}
                                frozen
                                alignFrozen="right"
                            />
                        </DataTable>
                    </TabPanel>

                    {/* Tab 2: Membres Signataires (only for selected BUSINESS client) */}
                    {selectedBusinessClient && (selectedBusinessClient.clientType === ClientType.BUSINESS || selectedBusinessClient.clientType === ClientType.JOINT_ACCOUNT) && (
                        <TabPanel
                            header={
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-users"></i>
                                    <span>Membres Signataires</span>
                                    <Tag value={signatoryMembers.length} severity="info" className="ml-2" />
                                </span>
                            }
                        >
                            {/* Client Info Header */}
                            <div className="surface-100 p-3 border-round mb-4">
                                <div className="flex align-items-center justify-content-between">
                                    <div className="flex align-items-center gap-3">
                                        <Avatar icon="pi pi-building" size="large" className="bg-green-100 text-green-600" />
                                        <div>
                                            <h5 className="m-0">{(selectedBusinessClient as any).businessName}</h5>
                                            <p className="text-500 m-0">N. Client: {(selectedBusinessClient as any).clientNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            label="Imprimer la liste"
                                            icon="pi pi-print"
                                            outlined
                                            severity="secondary"
                                            onClick={handlePrintMembers}
                                            disabled={signatoryMembers.length === 0}
                                        />
                                        <Button
                                            label="Retour a la liste"
                                            icon="pi pi-arrow-left"
                                            outlined
                                            onClick={() => {
                                                setSelectedBusinessClient(null);
                                                setSignatoryMembers([]);
                                                setActiveIndex(1);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Add Member Form */}
                            <div className="mb-4">
                                <h5 className="text-primary">
                                    <i className="pi pi-user-plus mr-2"></i>
                                    Ajouter un Membre Signataire
                                </h5>
                                <SignatoryMemberForm
                                    member={signatoryMember}
                                    handleChange={handleMemberChange}
                                    handleDropdownChange={handleMemberDropdownChange}
                                    handleDateChange={handleMemberDateChange}
                                    handleFileUpload={handleMemberFileUpload}
                                    handleFileRemove={handleMemberFileRemove}
                                    signatureFile={memberSignatureFile}
                                    photoFile={memberPhotoFile}
                                    idDocumentFile={memberDocumentFile}
                                    idDocumentTypes={idDocumentTypes}
                                    relationshipTypes={relationshipTypes}
                                />
                                <Divider />
                                <div className="flex justify-content-center gap-3">
                                    <Button
                                        icon="pi pi-refresh"
                                        outlined
                                        label="Reinitialiser"
                                        severity="secondary"
                                        onClick={() => {
                                            setSignatoryMember(new SignatoryMember());
                                            setMemberSignatureFile(null);
                                            setMemberPhotoFile(null);
                                            setMemberDocumentFile(null);
                                        }}
                                    />
                                    <Button
                                        icon="pi pi-check"
                                        label="Ajouter le Membre"
                                        loading={memberBtnLoading}
                                        onClick={handleMemberSubmit}
                                    />
                                </div>
                            </div>

                            <Divider />

                            {/* Members DataTable */}
                            <h5 className="text-primary">
                                <i className="pi pi-list mr-2"></i>
                                Liste des Membres Signataires ({signatoryMembers.length})
                            </h5>
                            <DataTable
                                value={signatoryMembers}
                                loading={memberLoading}
                                paginator
                                rows={5}
                                rowsPerPageOptions={[5, 10, 25]}
                                stripedRows
                                rowHover
                                dataKey="id"
                                emptyMessage={
                                    <div className="text-center py-5">
                                        <i className="pi pi-users text-5xl text-300 mb-3"></i>
                                        <p className="text-500">Aucun membre signataire enregistre</p>
                                    </div>
                                }
                            >
                                <Column body={memberPhotoTemplate} header="" style={{ width: '60px' }} />
                                <Column field="lastName" header="Nom" sortable />
                                <Column field="firstName" header="Prenom" sortable />
                                <Column field="functionRole" header="Fonction" sortable />
                                <Column field="phonePrimary" header="Telephone" />
                                <Column field="idDocumentNumber" header="N. Document" />
                                <Column body={memberSignatureTemplate} header="Signature" style={{ width: '80px' }} />
                                <Column body={memberStatusTemplate} header="Statut" style={{ width: '80px' }} />
                                <Column body={memberActionButtons} header="Actions" style={{ width: '130px' }} />
                            </DataTable>
                        </TabPanel>
                    )}
                </TabView>

                {/* Dialog: Edit Member */}
                <Dialog
                    header="Modifier le Membre Signataire"
                    visible={editMemberDialog}
                    style={{ width: '900px' }}
                    onHide={() => setEditMemberDialog(false)}
                    footer={
                        <div className="flex justify-content-end gap-2">
                            <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setEditMemberDialog(false)} />
                            <Button label="Enregistrer" icon="pi pi-check" loading={memberBtnLoading} onClick={handleMemberSubmitEdit} />
                        </div>
                    }
                >
                    <SignatoryMemberForm
                        member={signatoryMemberEdit}
                        handleChange={handleMemberChangeEdit}
                        handleDropdownChange={handleMemberDropdownChangeEdit}
                        handleDateChange={handleMemberDateChangeEdit}
                        handleFileUpload={handleMemberFileUploadEdit}
                        handleFileRemove={handleMemberFileRemoveEdit}
                        signatureFile={memberSignatureFileEdit}
                        photoFile={memberPhotoFileEdit}
                        idDocumentFile={memberDocumentFileEdit}
                        idDocumentTypes={idDocumentTypes}
                        relationshipTypes={relationshipTypes}
                    />
                </Dialog>

                {/* Dialog: View Member */}
                <Dialog
                    header="Details du Membre Signataire"
                    visible={viewMemberDialog}
                    style={{ width: '900px' }}
                    onHide={() => setViewMemberDialog(false)}
                    footer={
                        <div className="flex justify-content-end">
                            <Button label="Fermer" icon="pi pi-times" outlined onClick={() => setViewMemberDialog(false)} />
                        </div>
                    }
                >
                    <SignatoryMemberForm
                        member={signatoryMemberEdit}
                        handleChange={() => {}}
                        handleDropdownChange={() => {}}
                        handleDateChange={() => {}}
                        handleFileUpload={() => {}}
                        handleFileRemove={() => {}}
                        signatureFile={null}
                        photoFile={null}
                        idDocumentFile={null}
                        idDocumentTypes={idDocumentTypes}
                        relationshipTypes={relationshipTypes}
                        isViewMode={true}
                    />
                </Dialog>
            </div>
        </>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['CUSTOMER_GROUP_VIEW']}>
            <ClientComponent />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
