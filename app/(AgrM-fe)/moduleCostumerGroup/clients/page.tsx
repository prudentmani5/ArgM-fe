'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { Client, ClientType, ClientStatus, Province, Commune, Zone, Colline, Nationality, IdDocumentType, ActivitySector, MaritalStatus, EducationLevel, ClientCategory, HousingType, Branch } from './Client';
import ClientForm from './ClientForm';
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
    const [nationalities, setNationalities] = useState<Nationality[]>([]);
    const [idDocumentTypes, setIdDocumentTypes] = useState<IdDocumentType[]>([]);
    const [activitySectors, setActivitySectors] = useState<ActivitySector[]>([]);
    const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
    const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
    const [clientCategories, setClientCategories] = useState<ClientCategory[]>([]);
    const [housingTypes, setHousingTypes] = useState<HousingType[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    // File upload states
    const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [idDocumentFileEdit, setIdDocumentFileEdit] = useState<File | null>(null);
    const [photoFileEdit, setPhotoFileEdit] = useState<File | null>(null);

    // Duplicate document validation states
    const [documentNumberError, setDocumentNumberError] = useState<string | null>(null);
    const [documentNumberErrorEdit, setDocumentNumberErrorEdit] = useState<string | null>(null);
    const [checkingDocument, setCheckingDocument] = useState<boolean>(false);
    const [checkingDocumentEdit, setCheckingDocumentEdit] = useState<boolean>(false);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: refData, fetchData: fetchRefData, callType: refCallType } = useConsumApi('');
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
        }
    };

    const handleFileRemove = (fieldName: string) => {
        if (fieldName === 'idDocumentScanPath') {
            setIdDocumentFile(null);
        } else if (fieldName === 'photoPath') {
            setPhotoFile(null);
        }
    };

    // File upload handlers for edit client
    const handleFileUploadEdit = (fieldName: string, file: File) => {
        if (fieldName === 'idDocumentScanPath') {
            setIdDocumentFileEdit(file);
        } else if (fieldName === 'photoPath') {
            setPhotoFileEdit(file);
        }
    };

    const handleFileRemoveEdit = (fieldName: string) => {
        if (fieldName === 'idDocumentScanPath') {
            setIdDocumentFileEdit(null);
        } else if (fieldName === 'photoPath') {
            setPhotoFileEdit(null);
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
            // Double-check for duplicate document number before saving
            if (client.idDocumentNumber) {
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
                assignedOfficer: assignedOfficerId ? { id: assignedOfficerId } : null
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
            // Double-check for duplicate document number before saving (exclude current client)
            if (clientEdit.idDocumentNumber) {
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
                assignedOfficer: assignedOfficerId ? { id: assignedOfficerId } : null
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
        } catch (error) {
            console.error('Error in handleSubmitEdit:', error);
            setBtnLoading(false);
            showToast('error', 'Erreur', 'Une erreur est survenue lors de la mise à jour du client');
        }
    };

    const validateClient = (c: Client): boolean => {
        if (c.clientType === ClientType.INDIVIDUAL) {
            if (!c.firstName?.trim() || !c.lastName?.trim()) {
                showToast('warn', 'Attention', 'Le nom et prenom sont obligatoires');
                return false;
            }
        } else {
            if (!c.businessName?.trim()) {
                showToast('warn', 'Attention', 'Le nom de l\'entreprise est obligatoire');
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
            }
        } else if (data && !error) {
            if (callType === 'createClient') {
                setClient(new Client());
                setDocumentNumberError(null);
                showToast('success', 'Succes', 'Client enregistre avec succes');
                generateClientNumber();
            } else if (callType === 'updateClient') {
                showToast('success', 'Succes', 'Client mis a jour avec succes');
                setClientEdit(new Client());
                setDocumentNumberErrorEdit(null);
                setEditClientDialog(false);
                loadAllData();
            } else if (callType === 'deleteClient') {
                showToast('success', 'Succes', 'Client supprime avec succes');
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

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else if (e.index === 0) {
            generateClientNumber();
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

        setEditClientDialog(true);
    };

    const viewClientDetails = (data: Client) => {
        setClientEdit(data);
        setViewClientDialog(true);
    };

    const confirmDelete = (client: Client) => {
        confirmDialog({
            message: `Voulez-vous vraiment supprimer le client "${client.clientType === ClientType.INDIVIDUAL ? `${client.firstName} ${client.lastName}` : client.businessName}" ?`,
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
        if (rowData.clientType === ClientType.INDIVIDUAL) {
            return (
                <div className="flex align-items-center gap-2">
                    <Avatar
                        icon="pi pi-user"
                        size="normal"
                        shape="circle"
                        className="bg-blue-100 text-blue-600"
                    />
                    <div>
                        <div className="font-semibold">{rowData.firstName} {rowData.lastName}</div>
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
                    icon="pi pi-trash"
                    onClick={() => confirmDelete(data)}
                    rounded
                    text
                    severity='danger'
                    tooltip="Supprimer"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    // Statistics
    const getStats = () => {
        const total = clients.length;
        const active = clients.filter(c => c.status === ClientStatus.ACTIVE).length;
        const individuals = clients.filter(c => c.clientType === ClientType.INDIVIDUAL).length;
        const businesses = clients.filter(c => c.clientType === ClientType.BUSINESS).length;
        return { total, active, individuals, businesses };
    };

    const stats = getStats();

    const renderHeader = () => {
        return (
            <div className="flex flex-column gap-3">
                {/* Statistics Cards */}
                <div className="grid">
                    <div className="col-6 md:col-3">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Total Clients</div>
                            <div className="text-3xl font-bold text-primary">{stats.total}</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-3">
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
                    <div className="col-6 md:col-3">
                        <div className="surface-card shadow-1 border-round p-3 text-center">
                            <div className="text-500 font-medium mb-2">Entreprises</div>
                            <div className="text-3xl font-bold text-orange-500">{stats.businesses}</div>
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
                                        icon={clientEdit.clientType === ClientType.INDIVIDUAL ? "pi pi-user" : "pi pi-building"}
                                        size="xlarge"
                                        shape="circle"
                                        className={clientEdit.clientType === ClientType.INDIVIDUAL ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}
                                        style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                                    />
                                )}
                                <h4 className="m-0 mt-3">
                                    {clientEdit.clientType === ClientType.INDIVIDUAL
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
                        {clientEdit.clientType === ClientType.INDIVIDUAL && (
                            <Card title="Informations Personnelles" className="mb-3">
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
                        <Card title="Adresse" className="mb-3">
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
                        <Card title="Informations Professionnelles" className="mb-3">
                            <div className="flex flex-column gap-2">
                                <div className="flex justify-content-between">
                                    <span className="text-500">Secteur d'activité</span>
                                    <span className="font-semibold">{(clientEdit as any).activitySector?.name || 'N/A'}</span>
                                </div>
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
                                <div className="flex justify-content-between">
                                    <span className="text-500">Personnes à charge</span>
                                    <span className="font-semibold">{clientEdit.dependentsCount ?? clientEdit.numberOfDependents ?? 0}</span>
                                </div>
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
                    onDocumentNumberBlur={handleDocumentNumberBlurEdit}
                    documentNumberError={documentNumberErrorEdit}
                    checkingDocument={checkingDocumentEdit}
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
                            onDocumentNumberBlur={handleDocumentNumberBlur}
                            documentNumberError={documentNumberError}
                            checkingDocument={checkingDocument}
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
                                style={{ width: '130px' }}
                                frozen
                                alignFrozen="right"
                            />
                        </DataTable>
                    </TabPanel>
                </TabView>
            </div>
        </>
    );
}

export default ClientComponent;
