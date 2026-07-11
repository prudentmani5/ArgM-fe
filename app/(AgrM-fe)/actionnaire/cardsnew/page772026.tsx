'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import { Image } from 'primereact/image';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import { Card } from 'primereact/card';
import Cookies from 'js-cookie';
import { buildApiUrl } from '@/utils/apiConfig';

// ============ INTERFACES ============

interface Province {
    id: number;
    code: string;
    name: string;
    nameEn: string;
    isActive?: boolean;
}

interface Commune {
    id: number;
    code: string;
    name: string;
    provinceId: number;
    isActive?: boolean;
}

interface Colline {
    id: number;
    code: string;
    name: string;
    zoneId: number;
    isActive?: boolean;
}

interface MaritalStatus {
    id: number;
    code: string;
    name: string;
    nameFr: string;
    isActive?: boolean;
}

interface ActionnaireCard {
    id: number;
    numeroCarte: string;
    actionnaireId: number;
    actionnaireNom: string;
    actionnairePrenom: string;
    actionnaireMatricule: string;
    isActive: boolean;
    snapshotNom: string;
    snapshotPrenom: string;
    snapshotMatricule: string;
    snapshotTelephone: string;
    snapshotNombreActions: number;
    qrCodeImagePath?: string;
    pdfContentPath?: string;
    snapshotPhotoPath?: string;
    qrCodeImage?: string;
    pdfContent?: string;
    invalidationReason: string;
    generatedAt: string;
    validUntil: string;
    expired: boolean;
}

interface Actionnaire {
    id: number;
    matricule1: string;
    matricule2: string;
    nom: string;
    prenom: string;
    nomPere: string;
    nomMere: string;
    provinceId: number;
    provinceName: string;
    communeId: number;
    communeName: string;
    collineId: number | null;
    collineName: string | null;
    dateNaissance: string;
    lieuNaissance: string;
    etatCivilId: number;
    etatCivilName: string;
    profession: string;
    numeroCNI: string;
    telephone: string;
    adresseResidence: string;
    lieuDelivranceIdentite: string;
    dateDelivranceIdentite: string;
    nombreActions: number;
    compteBancaire: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    activeCard: ActionnaireCard | null;
    photoPassport?: string;
    photoPassportPath?: string;
    // ✅ Ajouter le champ snake_case
    photo_passport_path?: string;
    // ✅ Autres champs possibles
    photo?: string;
    photoPath?: string;
}

interface CardHistory {
    id: number;
    actionnaireId: number;
    oldCardId: number | null;
    newCardId: number | null;
    actionType: string;
    reason: string;
    changedFields: string;
    performedBy: string;
    performedAt: string;
}

interface ActionnaireRequest {
    matricule2?: string;
    nom: string;
    prenom: string;
    nomPere?: string;
    nomMere?: string;
    provinceId: number;
    communeId: number;
    collineId?: number | null;
    dateNaissance: string;
    lieuNaissance?: string;
    etatCivilId: number;
    profession?: string;
    numeroCNI: string;
    telephone: string;
    adresseResidence?: string;
    lieuDelivranceIdentite?: string;
    dateDelivranceIdentite?: string;
    nombreActions?: number;
    compteBancaire?: string;
    photoPassport?: string;
}

// ============ URLS ============
const BASE_URL = buildApiUrl('/api/umunyamitahe');
const REF_URL = buildApiUrl('/api/reference-data');
const FILES_BASE_URL = buildApiUrl('/api/umunyamitahe/files');

// ============ COMPOSANT PRINCIPAL ============
export default function ActionnaireManagement() {
    const toast = useRef<Toast>(null);

    // ===== ÉTATS ACTIONNAIRES =====
    const [actionnaires, setActionnaires] = useState<Actionnaire[]>([]);
    const [selectedActionnaire, setSelectedActionnaire] = useState<Actionnaire | null>(null);
    const [loadingActionnaires, setLoadingActionnaires] = useState(false);

    // ===== ÉTATS FILTRES =====
    const [filters, setFilters] = useState({
        global: '',
        nom: '',
        prenom: '',
        matricule1: '',
        telephone: '',
        compteBancaire: ''
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // ===== ÉTATS FORMULAIRE =====
    const [formData, setFormData] = useState<Partial<ActionnaireRequest>>({});
    const [formDialog, setFormDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [formPhotoFile, setFormPhotoFile] = useState<File | null>(null);
    const [formPhotoPreview, setFormPhotoPreview] = useState<string | null>(null);

    // ===== ÉTATS LISTES DÉROULANTES =====
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [collines, setCollines] = useState<Colline[]>([]);
    const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [loadingCommunes, setLoadingCommunes] = useState(false);
    const [loadingCollines, setLoadingCollines] = useState(false);

    // ===== ÉTATS CARTES =====
    const [cards, setCards] = useState<ActionnaireCard[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ActionnaireCard | null>(null);
    const [cardDialog, setCardDialog] = useState(false);
    const [cardHistory, setCardHistory] = useState<CardHistory[]>([]);
    const [historyDialog, setHistoryDialog] = useState(false);

    // ===== ÉTATS GÉNÉRATION CARTE =====
    const [generateDialog, setGenerateDialog] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);

    // ===== ÉTATS INVALIDATION =====
    const [invalidateDialog, setInvalidateDialog] = useState(false);
    const [invalidationReason, setInvalidationReason] = useState('');
    const [cardToInvalidate, setCardToInvalidate] = useState<ActionnaireCard | null>(null);

    // ========== DONNÉES FILTRÉES ==========
    const actionnairesFiltered = useMemo(() => {
        if (!actionnaires || actionnaires.length === 0) return [];
        
        let filtered = [...actionnaires];
        
        if (filters.global) {
            const searchTerm = filters.global.toLowerCase().trim();
            filtered = filtered.filter(a => 
                a.nom?.toLowerCase().includes(searchTerm) ||
                a.prenom?.toLowerCase().includes(searchTerm) ||
                a.matricule1?.toLowerCase().includes(searchTerm) ||
                a.matricule2?.toLowerCase().includes(searchTerm) ||
                a.telephone?.toLowerCase().includes(searchTerm) ||
                a.compteBancaire?.toLowerCase().includes(searchTerm) ||
                a.numeroCNI?.toLowerCase().includes(searchTerm) ||
                a.profession?.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.nom) {
            const searchTerm = filters.nom.toLowerCase().trim();
            filtered = filtered.filter(a => a.nom?.toLowerCase().includes(searchTerm));
        }
        
        if (filters.prenom) {
            const searchTerm = filters.prenom.toLowerCase().trim();
            filtered = filtered.filter(a => a.prenom?.toLowerCase().includes(searchTerm));
        }
        
        if (filters.matricule1) {
            const searchTerm = filters.matricule1.toLowerCase().trim();
            filtered = filtered.filter(a => a.matricule1?.toLowerCase().includes(searchTerm));
        }
        
        if (filters.telephone) {
            const searchTerm = filters.telephone.toLowerCase().trim();
            filtered = filtered.filter(a => a.telephone?.toLowerCase().includes(searchTerm));
        }
        
        if (filters.compteBancaire) {
            const searchTerm = filters.compteBancaire.toLowerCase().trim();
            filtered = filtered.filter(a => a.compteBancaire?.toLowerCase().includes(searchTerm));
        }
        
        return filtered;
    }, [actionnaires, filters]);

    // ========== FONCTIONS UTILITAIRES ==========

    const getToken = (): string | null => {
        return Cookies.get('token') || null;
    };

    const getUserAction = (): string => {
        try {
            const appUserCookie = Cookies.get('appUser');
            if (appUserCookie) {
                const appUser = JSON.parse(appUserCookie);
                return appUser?.username || appUser?.email || 'SYSTEM';
            }
        } catch (e) {
            console.warn('Impossible de récupérer l\'utilisateur connecté');
        }
        return 'SYSTEM';
    };

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1] || result;
                resolve(base64);
            };
            reader.onerror = (error) => {
                console.error('Erreur lecture fichier:', error);
                reject(error);
            };
        });
    };

    const getFileViewUrl = (path: string | null | undefined): string | null => {
        if (!path) return null;
        return `${FILES_BASE_URL}/view?path=${encodeURIComponent(path)}`;
    };

    const getFileDownloadUrl = (path: string | null | undefined): string | null => {
        if (!path) return null;
        return `${FILES_BASE_URL}/download?path=${encodeURIComponent(path)}`;
    };

    // ========== CHARGEMENT DES DONNÉES ==========

const loadActionnaires = useCallback(async () => {
    setLoadingActionnaires(true);
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        const url = `${BASE_URL}/actionnaires`;
        console.log('🔄 Chargement des actionnaires depuis:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Actionnaires chargés (brut):', data);
        
        // ✅ Afficher les propriétés du premier actionnaire
        if (Array.isArray(data) && data.length > 0) {
            console.log('📸 Propriétés du premier actionnaire:', Object.keys(data[0]));
            console.log('📸 Contenu du premier actionnaire:', data[0]);
            
            // Vérifier si une photo existe sous un autre nom
            const first = data[0];
            ['photoPassport', 'photoPassportPath', 'photo', 'photoPath', 'photoUrl', 'image', 'imagePath', 'picture', 'picturePath']
                .forEach(prop => {
                    if (first[prop]) {
                        console.log(`📸 ${prop}:`, first[prop]);
                    }
                });
        }
        
        setActionnaires(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error('Erreur chargement actionnaires:', error);
        showToast('error', 'Erreur', 'Impossible de charger les actionnaires');
    } finally {
        setLoadingActionnaires(false);
    }
}, []);

    const loadProvinces = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) return;

            const url = `${REF_URL}/provinces/findactive`;
            console.log('🔄 Chargement des provinces depuis:', url);
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProvinces(Array.isArray(data) ? data : []);
                console.log('✅ Provinces chargées:', data.length);
            } else {
                console.error('❌ Erreur chargement provinces:', response.status);
            }
        } catch (error) {
            console.error('Erreur chargement provinces:', error);
        }
    }, []);

    const loadCommunesByProvince = useCallback(async (provinceId: number) => {
        if (!provinceId) {
            setCommunes([]);
            return;
        }

        setLoadingCommunes(true);
        try {
            const token = getToken();
            if (!token) return;

            const url = `${REF_URL}/communes/findbyprovince/${provinceId}`;
            console.log('🔄 Chargement des communes pour la province', provinceId, 'depuis:', url);
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCommunes(Array.isArray(data) ? data : []);
                console.log('✅ Communes chargées:', data.length);
            } else {
                console.error('❌ Erreur chargement communes:', response.status);
                setCommunes([]);
            }
        } catch (error) {
            console.error('Erreur chargement communes:', error);
            setCommunes([]);
        } finally {
            setLoadingCommunes(false);
        }
    }, []);

    const loadCollinesByCommune = useCallback(async (communeId: number) => {
        if (!communeId) {
            setCollines([]);
            return;
        }

        setLoadingCollines(true);
        try {
            const token = getToken();
            if (!token) return;

            const zonesUrl = `${REF_URL}/zones/findbycommune/${communeId}`;
            console.log('🔄 Chargement des zones pour la commune', communeId, 'depuis:', zonesUrl);
            const zonesResponse = await fetch(zonesUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!zonesResponse.ok) {
                console.error('❌ Erreur chargement zones:', zonesResponse.status);
                setCollines([]);
                return;
            }

            const zones = await zonesResponse.json();
            console.log('✅ Zones chargées:', zones.length);

            if (!Array.isArray(zones) || zones.length === 0) {
                setCollines([]);
                return;
            }

            const allCollines: Colline[] = [];
            for (const zone of zones) {
                const collinesUrl = `${REF_URL}/collines/findbyzone/${zone.id}`;
                console.log('🔄 Chargement des collines pour la zone', zone.id);
                const collinesResponse = await fetch(collinesUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (collinesResponse.ok) {
                    const collinesData = await collinesResponse.json();
                    if (Array.isArray(collinesData)) {
                        allCollines.push(...collinesData);
                    }
                }
            }

            setCollines(allCollines);
            console.log('✅ Collines chargées:', allCollines.length);
        } catch (error) {
            console.error('Erreur chargement collines:', error);
            setCollines([]);
        } finally {
            setLoadingCollines(false);
        }
    }, []);

    const loadMaritalStatuses = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) return;

            const url = `${REF_URL}/marital-statuses/findactive`;
            console.log('🔄 Chargement des statuts matrimoniaux depuis:', url);
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMaritalStatuses(Array.isArray(data) ? data : []);
                console.log('✅ Statuts matrimoniaux chargés:', data.length);
            } else {
                console.error('❌ Erreur chargement statuts matrimoniaux:', response.status);
            }
        } catch (error) {
            console.error('Erreur chargement statuts matrimoniaux:', error);
        }
    }, []);

    const loadOptions = useCallback(async () => {
        setLoadingOptions(true);
        try {
            await Promise.all([
                loadProvinces(),
                loadMaritalStatuses()
            ]);
        } catch (error) {
            console.error('Erreur chargement options:', error);
            showToast('error', 'Erreur', 'Impossible de charger les options');
        } finally {
            setLoadingOptions(false);
        }
    }, [loadProvinces, loadMaritalStatuses]);

    const loadCards = useCallback(async (actionnaireId: number) => {
        setLoadingCards(true);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const url = `${BASE_URL}/actionnaires/${actionnaireId}/cards`;
            console.log('🔄 Chargement des cartes depuis:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const sortedCards = Array.isArray(data) 
                ? data.sort((a, b) => (b.id || 0) - (a.id || 0))
                : [];
            setCards(sortedCards);
            console.log('✅ Cartes chargées et triées:', sortedCards.length);
        } catch (error) {
            console.error('Erreur chargement cartes:', error);
            showToast('error', 'Erreur', 'Impossible de charger les cartes');
        } finally {
            setLoadingCards(false);
        }
    }, []);

    const loadHistory = useCallback(async (actionnaireId: number) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const url = `${BASE_URL}/actionnaires/${actionnaireId}/history`;
            console.log('🔄 Chargement de l\'historique depuis:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setCardHistory(Array.isArray(data) ? data : []);
            console.log('✅ Historique chargé:', data.length);
        } catch (error) {
            console.error('Erreur chargement historique:', error);
            showToast('error', 'Erreur', 'Impossible de charger l\'historique');
        }
    }, []);

    // ========== GESTION DU FORMULAIRE ==========

    const resetForm = () => {
        setFormData({});
        setFormErrors({});
        setIsEditing(false);
        setEditingId(null);
        setCommunes([]);
        setCollines([]);
        setFormPhotoFile(null);
        setFormPhotoPreview(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setFormDialog(true);
    };

    const openEditDialog = async (actionnaire: Actionnaire) => {
        setFormData({
            matricule2: actionnaire.matricule2,
            nom: actionnaire.nom,
            prenom: actionnaire.prenom,
            nomPere: actionnaire.nomPere,
            nomMere: actionnaire.nomMere,
            provinceId: actionnaire.provinceId,
            communeId: actionnaire.communeId,
            collineId: actionnaire.collineId,
            dateNaissance: actionnaire.dateNaissance,
            lieuNaissance: actionnaire.lieuNaissance,
            etatCivilId: actionnaire.etatCivilId,
            profession: actionnaire.profession,
            numeroCNI: actionnaire.numeroCNI,
            telephone: actionnaire.telephone,
            adresseResidence: actionnaire.adresseResidence,
            lieuDelivranceIdentite: actionnaire.lieuDelivranceIdentite,
            dateDelivranceIdentite: actionnaire.dateDelivranceIdentite,
            nombreActions: actionnaire.nombreActions,
            compteBancaire: actionnaire.compteBancaire,
        });
        setIsEditing(true);
        setEditingId(actionnaire.id);

        // ✅ Gestion correcte de la photo
        try {
            if (actionnaire.photoPassport) {
                setFormPhotoPreview(`data:image/png;base64,${actionnaire.photoPassport}`);
                setFormPhotoFile(null);
            } else if (actionnaire.photoPassportPath) {
                const url = getFileViewUrl(actionnaire.photoPassportPath);
                setFormPhotoPreview(url || null);
                setFormPhotoFile(null);
            } else {
                setFormPhotoPreview(null);
                setFormPhotoFile(null);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la photo:', error);
            setFormPhotoPreview(null);
            setFormPhotoFile(null);
        }

        if (actionnaire.provinceId) {
            await loadCommunesByProvince(actionnaire.provinceId);
            if (actionnaire.communeId) {
                await loadCollinesByCommune(actionnaire.communeId);
            }
        }

        setFormDialog(true);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        
        // Champs obligatoires
        if (!formData.nom?.trim()) errors.nom = 'Le nom est obligatoire';
        if (!formData.prenom?.trim()) errors.prenom = 'Le prénom est obligatoire';
        if (!formData.provinceId) errors.provinceId = 'La province est obligatoire';
        if (!formData.communeId) errors.communeId = 'La commune est obligatoire';
        if (!formData.dateNaissance) errors.dateNaissance = 'La date de naissance est obligatoire';
        if (!formData.etatCivilId) errors.etatCivilId = 'L\'état civil est obligatoire';
        if (!formData.numeroCNI?.trim()) errors.numeroCNI = 'Le numéro CNI est obligatoire';
        if (!formData.telephone?.trim()) errors.telephone = 'Le téléphone est obligatoire';
        
        // ✅ Vérifier la photo UNIQUEMENT en création
        if (!isEditing && !formPhotoFile && !formData.photoPassport) {
            errors.photo = 'La photo est obligatoire pour la création';
        }
        
        if (formData.nombreActions !== undefined && formData.nombreActions < 0) {
            errors.nombreActions = 'Le nombre d\'actions doit être positif';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ========== SAUVEGARDE ==========

    const handleSave = async () => {
        if (!validateForm()) {
            showToast('warn', 'Attention', 'Veuillez corriger les erreurs du formulaire');
            return;
        }

        setSaving(true);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Performed-By': getUserAction()
            };

            const url = isEditing
                ? `${BASE_URL}/actionnaires/${editingId}`
                : `${BASE_URL}/actionnaires`;

            const method = isEditing ? 'PUT' : 'POST';

            // ✅ Construire le payload
            const payload: any = { ...formData };

            // ✅ Gérer la photo
            if (formPhotoFile) {
                const photoBase64 = await convertFileToBase64(formPhotoFile);
                payload.photoPassport = photoBase64;
            } else if (!isEditing) {
                // En création, la photo est obligatoire
                showToast('warn', 'Attention', 'La photo est obligatoire pour la création');
                setSaving(false);
                return;
            }
            // En modification, on ne met PAS photoPassport dans le payload

            // ✅ Nettoyer le payload (supprimer les champs vides)
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined || payload[key] === null) {
                    delete payload[key];
                }
            });

            console.log(`📤 ${method} ${url}`);
            console.log('📦 Données:', payload);

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur ${response.status}`);
            }

            const data = await response.json();
            showToast('success', 'Succès', isEditing ? 'Actionnaire modifié avec succès' : 'Actionnaire créé avec succès');
            setFormDialog(false);
            resetForm();
            await loadActionnaires();

        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            showToast('error', 'Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
        } finally {
            setSaving(false);
        }
    };

    const openGenerateCardDialog = (actionnaire: Actionnaire) => {
    // ✅ Vérifier les deux formats (camelCase et snake_case)
    const photoPath = actionnaire.photoPassportPath || actionnaire.photo_passport_path;
    
    console.log('📸 Ouverture du dialogue de génération pour:', actionnaire.nom, actionnaire.prenom);
    console.log('📸 photoPassportPath (camelCase):', actionnaire.photoPassportPath || '❌ Absent');
    console.log('📸 photo_passport_path (snake_case):', actionnaire.photo_passport_path || '❌ Absent');
    console.log('📸 Photo trouvée:', photoPath || '❌ Absent');
    
    setSelectedActionnaire(actionnaire);
    setPhotoFile(null);
    setGenerateError(null);
    setIsGenerating(false);
    
    if (photoPath) {
        showToast('info', 'Photo existante', 'La photo actuelle de l\'actionnaire sera utilisée');
    } else {
        showToast('info', 'Photo requise', 'Veuillez sélectionner une photo pour la carte');
    }
    
    setGenerateDialog(true);
};
    
    




const handleGenerateCard = async () => {
    if (!selectedActionnaire) {
        showToast('error', 'Erreur', 'Actionnaire non sélectionné');
        return;
    }

    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        let photoBase64 = null;

        // ✅ 1. Vérifier si un nouveau fichier a été sélectionné
        if (photoFile) {
            if (photoFile.size > 5 * 1024 * 1024) {
                showToast('error', 'Erreur', 'L\'image est trop volumineuse (max 5MB)');
                return;
            }

            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(photoFile.type)) {
                showToast('error', 'Erreur', `Format non supporté. Utilisez: ${allowedTypes.join(', ')}`);
                return;
            }

            photoBase64 = await convertFileToBase64(photoFile);
            console.log('📸 Utilisation de la nouvelle photo');
        } 
        // ✅ 2. Vérifier la photo existante (camelCase)
        else if (selectedActionnaire.photoPassport) {
            photoBase64 = selectedActionnaire.photoPassport;
            console.log('📸 Utilisation de la photo existante (photoPassport)');
        } 
        // ✅ 3. Vérifier le chemin en camelCase
        else if (selectedActionnaire.photoPassportPath) {
            console.log('📸 Tentative de chargement depuis photoPassportPath:', selectedActionnaire.photoPassportPath);
            try {
                const url = getFileViewUrl(selectedActionnaire.photoPassportPath);
                if (url) {
                    const response = await fetch(url);
                    if (response.ok) {
                        const blob = await response.blob();
                        photoBase64 = await convertFileToBase64(new File([blob], 'photo.jpg'));
                        console.log('📸 Photo récupérée depuis photoPassportPath');
                    }
                }
            } catch (error) {
                console.error('Erreur récupération photo:', error);
            }
        }
        // ✅ 4. Vérifier le chemin en snake_case
        else if (selectedActionnaire.photo_passport_path) {
            console.log('📸 Tentative de chargement depuis photo_passport_path:', selectedActionnaire.photo_passport_path);
            try {
                const url = getFileViewUrl(selectedActionnaire.photo_passport_path);
                if (url) {
                    const response = await fetch(url);
                    if (response.ok) {
                        const blob = await response.blob();
                        photoBase64 = await convertFileToBase64(new File([blob], 'photo.jpg'));
                        console.log('📸 Photo récupérée depuis photo_passport_path');
                    }
                }
            } catch (error) {
                console.error('Erreur récupération photo:', error);
            }
        }

        // ✅ 5. Si toujours pas de photo, demander à l'utilisateur
        if (!photoBase64) {
            setGenerateError('Veuillez sélectionner une photo pour la carte');
            showToast('warn', 'Attention', 'Veuillez sélectionner une photo pour la carte');
            return;
        }

        setIsGenerating(true);
        setGenerateError(null);

        const response = await fetch(
            `${BASE_URL}/actionnaires/${selectedActionnaire.id}/cards/generate`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Performed-By': getUserAction()
                },
                body: JSON.stringify({
                    photoPassport: photoBase64
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur ${response.status}`);
        }

        const data = await response.json();
        showToast('success', 'Succès', 'Carte générée avec succès');
        setGenerateDialog(false);
        setPhotoFile(null);
        setIsGenerating(false);
        setGenerateError(null);

        await loadActionnaires();
        if (selectedActionnaire.id) {
            await loadCards(selectedActionnaire.id);
        }

    } catch (error) {
        console.error('Erreur génération carte:', error);
        setGenerateError(error instanceof Error ? error.message : 'Erreur inconnue');
        showToast('error', 'Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
        setIsGenerating(false);
    }
};
























    const handleInvalidateCard = async () => {
        if (!cardToInvalidate) {
            showToast('error', 'Erreur', 'Carte non sélectionnée');
            return;
        }

        if (!invalidationReason.trim()) {
            showToast('warn', 'Attention', 'Veuillez indiquer un motif');
            return;
        }

        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const response = await fetch(
                `${BASE_URL}/cards/${cardToInvalidate.numeroCarte}/invalidate`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'X-Performed-By': getUserAction()
                    },
                    body: JSON.stringify({
                        reason: invalidationReason,
                        performedBy: getUserAction()
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur ${response.status}`);
            }

            showToast('success', 'Succès', 'Carte invalidée avec succès');
            setInvalidateDialog(false);
            setInvalidationReason('');
            setCardToInvalidate(null);

            await loadActionnaires();
            if (selectedActionnaire?.id) {
                await loadCards(selectedActionnaire.id);
            }

        } catch (error) {
            console.error('Erreur invalidation:', error);
            showToast('error', 'Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
        }
    };

    const handleDownloadPDF = async (card: ActionnaireCard) => {
        try {
            let pdfUrl;
            if (card.pdfContentPath) {
                pdfUrl = getFileDownloadUrl(card.pdfContentPath);
            } else if (card.pdfContent) {
                const blob = new Blob([Uint8Array.from(atob(card.pdfContent), c => c.charCodeAt(0))], { type: 'application/pdf' });
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `carte_${card.numeroCarte}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
                showToast('success', 'Succès', 'PDF téléchargé avec succès');
                return;
            } else {
                const token = getToken();
                if (!token) throw new Error('Token manquant');
                
                const response = await fetch(`${BASE_URL}/cards/${card.numeroCarte}/pdf`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/pdf'
                    }
                });
                
                if (!response.ok) throw new Error(`Erreur ${response.status}`);
                const blob = await response.blob();
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `carte_${card.numeroCarte}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
                showToast('success', 'Succès', 'PDF téléchargé avec succès');
                return;
            }

            if (pdfUrl) {
                window.open(pdfUrl, '_blank');
                showToast('success', 'Succès', 'PDF téléchargé avec succès');
            } else {
                showToast('error', 'Erreur', 'PDF non disponible');
            }

        } catch (error) {
            console.error('Erreur téléchargement PDF:', error);
            showToast('error', 'Erreur', 'Impossible de télécharger le PDF');
        }
    };

    const viewCardDetails = (card: ActionnaireCard) => {
        setSelectedCard(card);
        setCardDialog(true);
    };

    const viewHistory = (actionnaire: Actionnaire) => {
        if (actionnaire.id) {
            loadHistory(actionnaire.id);
            setHistoryDialog(true);
        }
    };

    const getStatusTag = (card: ActionnaireCard) => {
        if (!card.isActive) {
            return <Tag value="Inactive" severity="danger" />;
        }
        if (card.expired) {
            return <Tag value="Expirée" severity="warning" />;
        }
        return <Tag value="Active" severity="success" />;
    };

    // ========== FONCTIONS D'EXPORT ==========
    
    const exportToCSV = () => {
        const data = actionnairesFiltered.map(a => ({
            Matricule: a.matricule1,
            Nom: a.nom,
            Prénom: a.prenom,
            Téléphone: a.telephone,
            'Nb Actions': a.nombreActions,
            'Compte Bancaire': a.compteBancaire,
            Province: a.provinceName,
            Commune: a.communeName,
            Statut: a.isActive ? 'Actif' : 'Inactif'
        }));

        if (data.length === 0) {
            showToast('warn', 'Attention', 'Aucune donnée à exporter');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${(row as any)[h] || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `actionnaires_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('success', 'Succès', `${data.length} actionnaires exportés`);
    };

    const clearFilters = () => {
        setFilters({
            global: '',
            nom: '',
            prenom: '',
            matricule1: '',
            telephone: '',
            compteBancaire: ''
        });
        setGlobalFilterValue('');
    };

    // ========== TEMPLATES DATATABLE ==========

    const actionColumnTemplate = (row: Actionnaire) => (
        <div className="flex gap-1 flex-wrap">
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                onClick={() => {
                    setSelectedActionnaire(row);
                    loadCards(row.id);
                }}
                tooltip="Voir les cartes"
                size="small"
            />
            <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="warning"
                onClick={() => openEditDialog(row)}
                tooltip="Modifier"
                size="small"
            />
            <Button
                icon="pi pi-id-card"
                rounded
                text
                severity="success"
                onClick={() => openGenerateCardDialog(row)}
                tooltip="Générer une carte"
                disabled={row.activeCard !== null}
                size="small"
            />
            <Button
                icon="pi pi-history"
                rounded
                text
                severity="secondary"
                onClick={() => viewHistory(row)}
                tooltip="Historique"
                size="small"
            />
        </div>
    );

    const statusColumnTemplate = (row: Actionnaire) => (
        row.isActive
            ? <Tag value="Actif" severity="success" />
            : <Tag value="Inactif" severity="danger" />
    );

    const cardsStatusTemplate = (row: ActionnaireCard) => getStatusTag(row);

    const cardsActionsTemplate = (row: ActionnaireCard) => (
        <div className="flex gap-1 flex-wrap">
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                onClick={() => viewCardDetails(row)}
                tooltip="Détails"
                size="small"
            />
            <Button
                icon="pi pi-file-pdf"
                rounded
                text
                severity="secondary"
                onClick={() => handleDownloadPDF(row)}
                tooltip="Télécharger PDF"
                size="small"
            />
            {row.isActive && !row.expired && (
                <Button
                    icon="pi pi-times"
                    rounded
                    text
                    severity="danger"
                    onClick={() => {
                        setCardToInvalidate(row);
                        setInvalidationReason('');
                        setInvalidateDialog(true);
                    }}
                    tooltip="Invalider"
                    size="small"
                />
            )}
        </div>
    );

    const cardInfoTemplate = (row: ActionnaireCard) => (
        <div>
            <div>{row.snapshotNom} {row.snapshotPrenom}</div>
            <small className="text-600">{row.snapshotMatricule}</small>
        </div>
    );

    // ========== EFFETS ==========

    useEffect(() => {
        loadActionnaires();
        loadOptions();
    }, [loadActionnaires, loadOptions]);

    // ========== RENDU ==========

    return (
        <div>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="card">
                <div className="flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h3 className="m-0">
                        <i className="pi pi-users mr-2" />
                        Gestion des Actionnaires (Umunyamitahe)
                        <Badge value={actionnairesFiltered.length} className="ml-2" />
                    </h3>
                    <div className="flex gap-2 align-items-center flex-wrap">
                        <Button
                            icon="pi pi-sliders-h"
                            label={showAdvancedFilters ? "Masquer filtres" : "Filtres avancés"}
                            severity="secondary"
                            size="small"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="p-button-sm"
                        />
                        <Button
                            icon="pi pi-file-excel"
                            label="Exporter"
                            severity="success"
                            size="small"
                            onClick={exportToCSV}
                            className="p-button-sm"
                        />
                        <Button
                            label="Nouvel Actionnaire"
                            icon="pi pi-plus"
                            onClick={openCreateDialog}
                            className="p-button-sm"
                        />
                    </div>
                </div>

                {/* Filtres avancés */}
                {showAdvancedFilters && (
                    <div className="grid p-3 surface-100 border-round mb-3">
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label htmlFor="filterNom" className="text-sm">Nom</label>
                                <InputText
                                    id="filterNom"
                                    value={filters.nom}
                                    onChange={(e) => setFilters({ ...filters, nom: e.target.value })}
                                    className="w-full"
                                    placeholder="Filtrer par nom"
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label htmlFor="filterPrenom" className="text-sm">Prénom</label>
                                <InputText
                                    id="filterPrenom"
                                    value={filters.prenom}
                                    onChange={(e) => setFilters({ ...filters, prenom: e.target.value })}
                                    className="w-full"
                                    placeholder="Filtrer par prénom"
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label htmlFor="filterMatricule" className="text-sm">Matricule</label>
                                <InputText
                                    id="filterMatricule"
                                    value={filters.matricule1}
                                    onChange={(e) => setFilters({ ...filters, matricule1: e.target.value })}
                                    className="w-full"
                                    placeholder="Filtrer par matricule"
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label htmlFor="filterTelephone" className="text-sm">Téléphone</label>
                                <InputText
                                    id="filterTelephone"
                                    value={filters.telephone}
                                    onChange={(e) => setFilters({ ...filters, telephone: e.target.value })}
                                    className="w-full"
                                    placeholder="Filtrer par téléphone"
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="field">
                                <label htmlFor="filterCompte" className="text-sm">Compte bancaire</label>
                                <InputText
                                    id="filterCompte"
                                    value={filters.compteBancaire}
                                    onChange={(e) => setFilters({ ...filters, compteBancaire: e.target.value })}
                                    className="w-full"
                                    placeholder="Filtrer par compte"
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="flex justify-content-end gap-2 mt-2">
                                <Button
                                    label="Effacer les filtres"
                                    icon="pi pi-times"
                                    severity="secondary"
                                    size="small"
                                    onClick={clearFilters}
                                    className="p-button-sm"
                                />
                                <Badge 
                                    value={`${actionnairesFiltered.length} résultat${actionnairesFiltered.length > 1 ? 's' : ''}`} 
                                    severity="info"
                                    className="p-2"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <DataTable
                    value={actionnairesFiltered}
                    loading={loadingActionnaires}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    emptyMessage="Aucun actionnaire enregistré"
                    sortField="nom"
                    sortOrder={1}
                    tableStyle={{ minWidth: '50rem' }}
                    scrollable
                    scrollHeight="600px"
                    className="p-datatable-sm"
                >
                    <Column 
                        field="matricule1" 
                        header="Matricule" 
                        sortable 
                        style={{ width: '150px', minWidth: '150px' }} 
                    />
                    <Column 
                        field="nom" 
                        header="Nom" 
                        sortable 
                        filter 
                        filterPlaceholder="Nom"
                        style={{ minWidth: '120px' }}
                    />
                    <Column 
                        field="prenom" 
                        header="Prénom" 
                        sortable 
                        filter 
                        filterPlaceholder="Prénom"
                        style={{ minWidth: '120px' }}
                    />
                    <Column 
                        field="compteBancaire" 
                        header="Compte" 
                        style={{ minWidth: '120px' }}
                    />
                    <Column 
                        field="telephone" 
                        header="Téléphone" 
                        style={{ minWidth: '120px' }}
                    />
                    <Column 
                        field="nombreActions" 
                        header="Actions" 
                        sortable 
                        style={{ width: '100px' }}
                    />
                    <Column 
                        header="Statut" 
                        body={statusColumnTemplate} 
                        style={{ width: '100px' }} 
                    />
                    <Column 
                        header="Actions" 
                        body={actionColumnTemplate} 
                        style={{ width: '220px', minWidth: '220px' }} 
                    />
                </DataTable>

                {selectedActionnaire && (
                    <>
                        <Divider align="left">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-id-card" />
                                <span>Cartes de {selectedActionnaire.nom} {selectedActionnaire.prenom}</span>
                                <Badge value={cards.length} />
                            </div>
                        </Divider>

                        <DataTable
                            value={cards}
                            loading={loadingCards}
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10]}
                            emptyMessage="Aucune carte pour cet actionnaire"
                            tableStyle={{ minWidth: '40rem' }}
                            className="p-datatable-sm"
                        >
                            <Column field="numeroCarte" header="N° Carte" sortable style={{ width: '150px' }} />
                            <Column header="Actionnaire" body={cardInfoTemplate} />
                            <Column field="snapshotNombreActions" header="Actions" />
                            <Column field="generatedAt" header="Générée le" body={(row) => formatDate(row.generatedAt)} />
                            <Column header="Statut" body={cardsStatusTemplate} style={{ width: '120px' }} />
                            <Column header="Actions" body={cardsActionsTemplate} style={{ width: '180px' }} />
                        </DataTable>
                    </>
                )}
            </div>

            {/* ===== DIALOGUE FORMULAIRE ACTIONNAIRE ===== */}
            <Dialog
                header={isEditing ? 'Modifier un actionnaire' : 'Nouvel actionnaire'}
                visible={formDialog}
                style={{ width: '800px', maxWidth: '95vw' }}
                onHide={() => {
                    setFormDialog(false);
                    resetForm();
                }}
                maximizable
            >
                <div className="p-fluid">
                    <div className="grid">
                        {/* Identité */}
                        <div className="col-12">
                            <h5>Identité</h5>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="nom">Nom <span className="text-danger">*</span></label>
                                <InputText
                                    id="nom"
                                    value={formData.nom || ''}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    className={formErrors.nom ? 'p-invalid' : ''}
                                />
                                {formErrors.nom && <small className="text-danger">{formErrors.nom}</small>}
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="prenom">Prénom <span className="text-danger">*</span></label>
                                <InputText
                                    id="prenom"
                                    value={formData.prenom || ''}
                                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                    className={formErrors.prenom ? 'p-invalid' : ''}
                                />
                                {formErrors.prenom && <small className="text-danger">{formErrors.prenom}</small>}
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="nomPere">Nom du père</label>
                                <InputText
                                    id="nomPere"
                                    value={formData.nomPere || ''}
                                    onChange={(e) => setFormData({ ...formData, nomPere: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="nomMere">Nom de la mère</label>
                                <InputText
                                    id="nomMere"
                                    value={formData.nomMere || ''}
                                    onChange={(e) => setFormData({ ...formData, nomMere: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Localisation */}
                        <div className="col-12">
                            <h5>Localisation</h5>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="province">Province <span className="text-danger">*</span></label>
                                {loadingOptions ? (
                                    <Skeleton width="100%" height="38px" borderRadius="4px" />
                                ) : (
                                    <Dropdown
                                        id="province"
                                        value={formData.provinceId}
                                        options={provinces}
                                        optionLabel="name"
                                        optionValue="id"
                                        onChange={async (e) => {
                                            const provinceId = e.value;
                                            setFormData({
                                                ...formData,
                                                provinceId: provinceId,
                                                communeId: undefined,
                                                collineId: undefined
                                            });
                                            setCommunes([]);
                                            setCollines([]);
                                            if (provinceId) {
                                                await loadCommunesByProvince(provinceId);
                                            }
                                        }}
                                        placeholder="Sélectionner une province"
                                        filter
                                        className={formErrors.provinceId ? 'p-invalid' : ''}
                                    />
                                )}
                                {formErrors.provinceId && <small className="text-danger">{formErrors.provinceId}</small>}
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="commune">Commune <span className="text-danger">*</span></label>
                                {loadingCommunes ? (
                                    <Skeleton width="100%" height="38px" borderRadius="4px" />
                                ) : (
                                    <Dropdown
                                        id="commune"
                                        value={formData.communeId}
                                        options={communes}
                                        optionLabel="name"
                                        optionValue="id"
                                        onChange={async (e) => {
                                            const communeId = e.value;
                                            setFormData({
                                                ...formData,
                                                communeId: communeId,
                                                collineId: undefined
                                            });
                                            setCollines([]);
                                            if (communeId) {
                                                await loadCollinesByCommune(communeId);
                                            }
                                        }}
                                        placeholder="Sélectionner une commune"
                                        filter
                                        className={formErrors.communeId ? 'p-invalid' : ''}
                                        disabled={!formData.provinceId || communes.length === 0}
                                    />
                                )}
                                {formErrors.communeId && <small className="text-danger">{formErrors.communeId}</small>}
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="colline">Colline</label>
                                {loadingCollines ? (
                                    <Skeleton width="100%" height="38px" borderRadius="4px" />
                                ) : (
                                    <Dropdown
                                        id="colline"
                                        value={formData.collineId}
                                        options={collines}
                                        optionLabel="name"
                                        optionValue="id"
                                        onChange={(e) => setFormData({ ...formData, collineId: e.value })}
                                        placeholder="Sélectionner une colline"
                                        filter
                                        disabled={!formData.communeId || collines.length === 0}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Naissance et état civil */}
                        <div className="col-12">
                            <h5>Naissance & État Civil</h5>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="dateNaissance">Date de naissance <span className="text-danger">*</span></label>
                                <Calendar
                                    id="dateNaissance"
                                    value={formData.dateNaissance ? new Date(formData.dateNaissance) : null}
                                    onChange={(e) => {
                                        let formattedDate = undefined;
                                        if (e.value) {
                                            if (e.value instanceof Date) {
                                                formattedDate = e.value.toISOString().split('T')[0];
                                            } else if (typeof e.value === 'string') {
                                                const dateObj = new Date(e.value);
                                                if (!isNaN(dateObj.getTime())) {
                                                    formattedDate = dateObj.toISOString().split('T')[0];
                                                }
                                            }
                                        }
                                        setFormData({
                                            ...formData,
                                            dateNaissance: formattedDate
                                        });
                                    }}
                                    dateFormat="dd/mm/yy"
                                    className={formErrors.dateNaissance ? 'p-invalid' : ''}
                                    showIcon
                                />
                                {formErrors.dateNaissance && <small className="text-danger">{formErrors.dateNaissance}</small>}
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="lieuNaissance">Lieu de naissance</label>
                                <InputText
                                    id="lieuNaissance"
                                    value={formData.lieuNaissance || ''}
                                    onChange={(e) => setFormData({ ...formData, lieuNaissance: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="etatCivil">État civil <span className="text-danger">*</span></label>
                                {loadingOptions ? (
                                    <Skeleton width="100%" height="38px" borderRadius="4px" />
                                ) : (
                                    <Dropdown
                                        id="etatCivil"
                                        value={formData.etatCivilId}
                                        options={maritalStatuses}
                                        optionLabel="nameFr"
                                        optionValue="id"
                                        onChange={(e) => setFormData({ ...formData, etatCivilId: e.value })}
                                        placeholder="Sélectionner un état civil"
                                        className={formErrors.etatCivilId ? 'p-invalid' : ''}
                                    />
                                )}
                                {formErrors.etatCivilId && <small className="text-danger">{formErrors.etatCivilId}</small>}
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="profession">Profession</label>
                                <InputText
                                    id="profession"
                                    value={formData.profession || ''}
                                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Documents et contact */}
                        <div className="col-12">
                            <h5>Documents & Contact</h5>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="numeroCNI">Numéro CNI <span className="text-danger">*</span></label>
                                <InputText
                                    id="numeroCNI"
                                    value={formData.numeroCNI || ''}
                                    onChange={(e) => setFormData({ ...formData, numeroCNI: e.target.value })}
                                    className={formErrors.numeroCNI ? 'p-invalid' : ''}
                                />
                                {formErrors.numeroCNI && <small className="text-danger">{formErrors.numeroCNI}</small>}
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="telephone">Téléphone <span className="text-danger">*</span></label>
                                <InputText
                                    id="telephone"
                                    value={formData.telephone || ''}
                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    className={formErrors.telephone ? 'p-invalid' : ''}
                                />
                                {formErrors.telephone && <small className="text-danger">{formErrors.telephone}</small>}
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="field">
                                <label htmlFor="adresseResidence">Adresse de résidence</label>
                                <InputText
                                    id="adresseResidence"
                                    value={formData.adresseResidence || ''}
                                    onChange={(e) => setFormData({ ...formData, adresseResidence: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Délivrance identité */}
                        <div className="col-12">
                            <h5>Délivrance de l'identité</h5>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="lieuDelivrance">Lieu de délivrance</label>
                                <InputText
                                    id="lieuDelivrance"
                                    value={formData.lieuDelivranceIdentite || ''}
                                    onChange={(e) => setFormData({ ...formData, lieuDelivranceIdentite: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="dateDelivrance">Date de délivrance</label>
                                <Calendar
                                    id="dateDelivrance"
                                    value={formData.dateDelivranceIdentite ? new Date(formData.dateDelivranceIdentite) : null}
                                    onChange={(e) => {
                                        let formattedDate = undefined;
                                        if (e.value) {
                                            const dateObj = e.value instanceof Date ? e.value : new Date(e.value as string);
                                            if (!isNaN(dateObj.getTime())) {
                                                formattedDate = dateObj.toISOString().split('T')[0];
                                            }
                                        }
                                        setFormData({
                                            ...formData,
                                            dateDelivranceIdentite: formattedDate
                                        });
                                    }}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                />
                            </div>
                        </div>

                        {/* Actions et compte */}
                        <div className="col-12">
                            <h5>Actions & Compte</h5>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="nombreActions">Nombre d'actions</label>
                                <InputText
                                    id="nombreActions"
                                    type="number"
                                    min="0"
                                    value={formData.nombreActions?.toString() || '0'}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        nombreActions: parseInt(e.target.value) || 0
                                    })}
                                    className={formErrors.nombreActions ? 'p-invalid' : ''}
                                />
                                {formErrors.nombreActions && <small className="text-danger">{formErrors.nombreActions}</small>}
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="compteBancaire">Compte bancaire</label>
                                <InputText
                                    id="compteBancaire"
                                    value={formData.compteBancaire || ''}
                                    onChange={(e) => setFormData({ ...formData, compteBancaire: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="matricule2">Matricule 2</label>
                                <InputText
                                    id="matricule2"
                                    value={formData.matricule2 || ''}
                                    onChange={(e) => setFormData({ ...formData, matricule2: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Photo passport - MODIFIÉ POUR NE PAS FORCER LA PHOTO */}
                        <div className="col-12">
                            <h5>Photo</h5>
                        </div>
                        <div className="col-12">
                            <div className="field">
                                <label>
                                    Photo passport 
                                    {!isEditing && <span className="text-danger">*</span>}
                                </label>
                                
                                {/* Afficher l'erreur si présente */}
                                {formErrors.photo && (
                                    <div className="mb-2">
                                        <small className="text-danger">{formErrors.photo}</small>
                                    </div>
                                )}
                                
                                {/* Afficher la photo existante si en mode édition */}
                                {isEditing && formPhotoPreview && !formPhotoFile && (
                                    <div className="p-2 surface-100 border-round mb-2">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-check-circle text-success" />
                                            <span className="text-600">Photo existante conservée</span>
                                            <Button
                                                label="Changer"
                                                icon="pi pi-refresh"
                                                className="p-button-sm p-button-text ml-2"
                                                onClick={() => {
                                                    setFormPhotoFile(null);
                                                    setFormPhotoPreview(null);
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="p-2 border-round border-1 surface-border">
                                    <FileUpload
                                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                                        maxFileSize={5000000}
                                        onSelect={(e: FileUploadSelectEvent) => {
                                            const files = e.files;
                                            if (files && files.length > 0) {
                                                const file = files[0] as File;
                                                setFormPhotoFile(file);
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setFormPhotoPreview(event.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                                showToast('info', 'Fichier sélectionné', `${file.name}`);
                                                // ✅ Effacer l'erreur de photo si présente
                                                if (formErrors.photo) {
                                                    setFormErrors({ ...formErrors, photo: '' });
                                                }
                                            }
                                        }}
                                        onRemove={() => {
                                            setFormPhotoFile(null);
                                            setFormPhotoPreview(null);
                                            // ✅ Si en création et qu'on retire la photo, afficher l'erreur
                                            if (!isEditing) {
                                                setFormErrors({ ...formErrors, photo: 'La photo est obligatoire' });
                                            }
                                        }}
                                        chooseLabel={isEditing && formPhotoPreview ? "Changer la photo" : "Choisir une photo"}
                                        className="mb-3 w-full"
                                        emptyTemplate={
                                            <div className="flex flex-column align-items-center p-4">
                                                <i className="pi pi-image text-4xl text-400 mb-2" />
                                                {isEditing && formPhotoPreview ? (
                                                    <span className="text-500">Cliquez pour changer la photo (optionnel)</span>
                                                ) : (
                                                    <span className="text-500">Glissez-déposez une photo ou cliquez pour sélectionner</span>
                                                )}
                                                <span className="text-400 text-sm">PNG, JPG, JPEG, GIF, WEBP (max 5MB)</span>
                                            </div>
                                        }
                                    />
                                </div>
                                
                                {formPhotoPreview && (
                                    <div className="mt-3 p-2 surface-100 border-round">
                                        <div className="flex align-items-center justify-content-between">
                                            <div className="flex align-items-center gap-2">
                                                <i className="pi pi-image text-primary" />
                                                <strong>{formPhotoFile?.name || 'Photo existante'}</strong>
                                                {formPhotoFile && (
                                                    <span className="text-600">({(formPhotoFile.size / 1024).toFixed(2)} KB)</span>
                                                )}
                                            </div>
                                            <Button
                                                icon="pi pi-times"
                                                className="p-button-rounded p-button-text p-button-sm"
                                                onClick={() => {
                                                    setFormPhotoFile(null);
                                                    setFormPhotoPreview(null);
                                                    if (!isEditing) {
                                                        setFormErrors({ ...formErrors, photo: 'La photo est obligatoire' });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="mt-2 flex justify-content-center">
                                            <img
                                                src={formPhotoPreview}
                                                alt="Aperçu"
                                                className="border-round shadow-1"
                                                style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }}
                                                onError={() => {
                                                    console.warn('Erreur de chargement de l\'image');
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => {
                                setFormDialog(false);
                                resetForm();
                            }}
                        />
                        <Button
                            label={isEditing ? 'Modifier' : 'Créer'}
                            icon="pi pi-check"
                            onClick={handleSave}
                            loading={saving}
                        />
                    </div>
                </div>
            </Dialog>

           {/* ===== DIALOGUE GÉNÉRATION CARTE ===== */}
<Dialog
    header="Générer une carte d'actionnaire"
    visible={generateDialog}
    style={{ width: '500px' }}
    onHide={() => {
        setGenerateDialog(false);
        setPhotoFile(null);
        setIsGenerating(false);
        setGenerateError(null);
    }}
    closable={!isGenerating}
>
    <div className="p-fluid">
        <div className="field">
            <label className="font-bold">Actionnaire</label>
            <p className="text-600">
                {selectedActionnaire?.nom} {selectedActionnaire?.prenom}
                <br />
                <small>Matricule: {selectedActionnaire?.matricule1}</small>
            </p>
        </div>

        {/* ✅ Récupérer le chemin de la photo (camelCase ou snake_case) */}
        {(() => {
            const photoPath = selectedActionnaire?.photoPassportPath || selectedActionnaire?.photo_passport_path;
            const hasPhoto = !!(selectedActionnaire?.photoPassport || photoPath);
            
            if (hasPhoto && !photoFile) {
                return (
                    <div className="field">
                        <label>Photo existante</label>
                        <div className="p-2 surface-100 border-round flex align-items-center gap-3">
                            {selectedActionnaire?.photoPassport ? (
                                <img
                                    src={`data:image/png;base64,${selectedActionnaire.photoPassport}`}
                                    alt="Photo existante"
                                    className="border-round"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                />
                            ) : photoPath ? (
                                <img
                                    src={getFileViewUrl(photoPath) || ''}
                                    alt="Photo existante"
                                    className="border-round"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        console.warn('Erreur chargement photo:', photoPath);
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : null}
                            <div>
                                <div className="text-600">Photo actuelle de l'actionnaire</div>
                                <small className="text-400">La carte sera générée avec cette photo</small>
                            </div>
                        </div>
                    </div>
                );
            }
            return null;
        })()}

        {/* ✅ Message si aucune photo n'existe */}
        {!selectedActionnaire?.photoPassport && 
         !selectedActionnaire?.photoPassportPath && 
         !selectedActionnaire?.photo_passport_path && 
         !photoFile && (
            <div className="field">
                <div className="p-2 surface-100 border-round border-1 border-warning">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-info-circle text-warning" />
                        <span className="text-600">Aucune photo trouvée pour cet actionnaire</span>
                    </div>
                    <small className="text-400">Veuillez sélectionner une photo ci-dessous</small>
                </div>
            </div>
        )}

        <div className="field">
            <label>
                Photo passport 
                {!selectedActionnaire?.photoPassport && 
                 !selectedActionnaire?.photoPassportPath && 
                 !selectedActionnaire?.photo_passport_path && 
                 <span className="text-danger">*</span>
                }
            </label>
            <div className="p-2 border-round border-1 surface-border">
                <FileUpload
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    maxFileSize={5000000}
                    onSelect={(e: FileUploadSelectEvent) => {
                        const files = e.files;
                        if (files && files.length > 0) {
                            setPhotoFile(files[0] as File);
                            showToast('info', 'Fichier sélectionné', `${files[0].name}`);
                            if (generateError) {
                                setGenerateError(null);
                            }
                        }
                    }}
                    onRemove={() => {
                        setPhotoFile(null);
                    }}
                    chooseLabel={
                        selectedActionnaire?.photoPassport || 
                        selectedActionnaire?.photoPassportPath || 
                        selectedActionnaire?.photo_passport_path
                            ? "Changer la photo" 
                            : "Choisir une photo"
                    }
                    className="mb-3"
                    disabled={isGenerating}
                    emptyTemplate={
                        <div className="flex flex-column align-items-center p-3">
                            <i className="pi pi-image text-3xl text-400 mb-1" />
                            {selectedActionnaire?.photoPassport || 
                             selectedActionnaire?.photoPassportPath || 
                             selectedActionnaire?.photo_passport_path ? (
                                <span className="text-500 text-sm">Cliquez pour changer la photo (optionnel)</span>
                            ) : (
                                <>
                                    <span className="text-500 text-sm">Glissez-déposez ou cliquez pour sélectionner</span>
                                    <span className="text-400 text-xs">PNG, JPG, JPEG, GIF, WEBP (max 5MB)</span>
                                </>
                            )}
                        </div>
                    }
                />
            </div>
            
            {photoFile && (
                <div className="mt-2 p-2 surface-100 border-round">
                    <div className="flex align-items-center justify-content-between">
                        <div>
                            <i className="pi pi-file-image text-primary mr-2" />
                            <strong>{photoFile.name}</strong>
                            <span className="text-600 ml-2">({(photoFile.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <Button
                            icon="pi pi-times"
                            className="p-button-rounded p-button-text p-button-sm"
                            onClick={() => setPhotoFile(null)}
                            disabled={isGenerating}
                        />
                    </div>
                    <div className="mt-2">
                        <img
                            src={URL.createObjectURL(photoFile)}
                            alt="Aperçu"
                            className="w-full max-h-40 object-contain border-round"
                            style={{ maxHeight: '160px' }}
                        />
                    </div>
                </div>
            )}
        </div>

        {generateError && (
            <div className="p-2 surface-100 border-round border-1 border-red-300">
                <small className="text-red-600 flex align-items-center">
                    <i className="pi pi-exclamation-circle mr-1" />
                    {generateError}
                </small>
            </div>
        )}

        <div className="flex gap-2 justify-content-end mt-3">
            <Button
                label="Annuler"
                icon="pi pi-times"
                severity="secondary"
                onClick={() => {
                    setGenerateDialog(false);
                    setPhotoFile(null);
                    setGenerateError(null);
                }}
                disabled={isGenerating}
            />
            <Button
                label="Générer"
                icon="pi pi-check"
                onClick={handleGenerateCard}
                loading={isGenerating}
                disabled={isGenerating}
            />
        </div>
    </div>
</Dialog>
            {/* ===== DIALOGUE INVALIDATION CARTE ===== */}
            <Dialog
                header="Invalider la carte"
                visible={invalidateDialog}
                style={{ width: '450px' }}
                onHide={() => {
                    setInvalidateDialog(false);
                    setInvalidationReason('');
                    setCardToInvalidate(null);
                }}
            >
                <div className="p-fluid">
                    {cardToInvalidate && (
                        <div className="field">
                            <label className="font-bold">Carte</label>
                            <p className="text-600">
                                N° {cardToInvalidate.numeroCarte}
                                <br />
                                <small>{cardToInvalidate.snapshotNom} {cardToInvalidate.snapshotPrenom}</small>
                            </p>
                        </div>
                    )}

                    <div className="field">
                        <label htmlFor="motif">Motif de l'invalidation <span className="text-danger">*</span></label>
                        <InputTextarea
                            id="motif"
                            value={invalidationReason}
                            onChange={(e) => setInvalidationReason(e.target.value)}
                            rows={3}
                            placeholder="Indiquez le motif de l'invalidation..."
                            required
                        />
                    </div>

                    <div className="flex gap-2 justify-content-end mt-3">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => {
                                setInvalidateDialog(false);
                                setInvalidationReason('');
                                setCardToInvalidate(null);
                            }}
                        />
                        <Button
                            label="Confirmer"
                            icon="pi pi-check"
                            severity="danger"
                            onClick={handleInvalidateCard}
                            disabled={!invalidationReason.trim()}
                        />
                    </div>
                </div>
            </Dialog>

            {/* ===== DIALOGUE DÉTAILS CARTE ===== */}
            <Dialog
                header="Détails de la carte"
                visible={cardDialog}
                style={{ width: '700px' }}
                onHide={() => setCardDialog(false)}
                maximizable
            >
                {selectedCard && (
                    <div className="p-3">
                        <div className="grid">
                            <div className="col-12 text-center mb-3">
                                <h4>Carte N° {selectedCard.numeroCarte}</h4>
                                {getStatusTag(selectedCard)}
                            </div>

                            <div className="col-12 md:col-6">
                                <Card title="Informations générales">
                                    <div><strong>Matricule:</strong> {selectedCard.snapshotMatricule}</div>
                                    <div><strong>Nom:</strong> {selectedCard.snapshotNom}</div>
                                    <div><strong>Prénom:</strong> {selectedCard.snapshotPrenom}</div>
                                    <div><strong>Téléphone:</strong> {selectedCard.snapshotTelephone}</div>
                                    <div><strong>Nombre d'actions:</strong> {selectedCard.snapshotNombreActions}</div>
                                </Card>
                            </div>

                            <div className="col-12 md:col-6">
                                <Card title="Dates">
                                    <div><strong>Générée le:</strong> {formatDate(selectedCard.generatedAt)}</div>
                                    <div><strong>Valide jusqu'au:</strong> {formatDate(selectedCard.validUntil)}</div>
                                    {selectedCard.invalidationReason && (
                                        <div>
                                            <strong>Motif invalidation:</strong>
                                            <p className="text-600">{selectedCard.invalidationReason}</p>
                                        </div>
                                    )}
                                </Card>
                            </div>

                            <div className="col-12">
                                <Divider align="left">Images</Divider>
                                <div className="flex gap-3 justify-content-center flex-wrap">
                                    {/* QR Code */}
                                    <div className="text-center">
                                        <h6>QR Code</h6>
                                        {(() => {
                                            let qrImageSrc = null;
                                            
                                            if (selectedCard.qrCodeImage) {
                                                qrImageSrc = `data:image/png;base64,${selectedCard.qrCodeImage}`;
                                            } else if (selectedCard.qrCodeImagePath) {
                                                qrImageSrc = getFileViewUrl(selectedCard.qrCodeImagePath);
                                            } else if ((selectedCard as any).qrCodePath) {
                                                qrImageSrc = getFileViewUrl((selectedCard as any).qrCodePath);
                                            }
                                            
                                            if (qrImageSrc) {
                                                return (
                                                    <Image
                                                        src={qrImageSrc}
                                                        alt="QR Code"
                                                        width="150"
                                                        height="150"
                                                        preview
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <div className="p-3 surface-100 border-round">
                                                        <i className="pi pi-qrcode text-3xl text-400" />
                                                        <p className="text-600 text-sm mt-2">QR Code non disponible</p>
                                                        <small className="text-400">ID: {selectedCard.id}</small>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>

                                    {/* Photo */}
                                    <div className="text-center">
                                        <h6>Photo</h6>
                                        {(() => {
                                            let photoSrc = null;
                                            
                                            if (selectedCard.snapshotPhotoPath) {
                                                photoSrc = getFileViewUrl(selectedCard.snapshotPhotoPath);
                                            } else if ((selectedCard as any).photoPath) {
                                                photoSrc = getFileViewUrl((selectedCard as any).photoPath);
                                            }
                                            
                                            if (photoSrc) {
                                                return (
                                                    <img
                                                        src={photoSrc}
                                                        alt="Photo de l'actionnaire"
                                                        className="border-round shadow-1"
                                                        style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            const parent = (e.target as HTMLImageElement).parentElement;
                                                            if (parent) {
                                                                const placeholder = document.createElement('div');
                                                                placeholder.className = 'flex align-items-center justify-content-center surface-100 border-round';
                                                                placeholder.style.width = '150px';
                                                                placeholder.style.height = '150px';
                                                                placeholder.innerHTML = `
                                                                    <div class="text-center">
                                                                        <i class="pi pi-user text-4xl text-400"></i>
                                                                        <p class="text-600 text-sm">Photo non disponible</p>
                                                                    </div>
                                                                `;
                                                                parent.appendChild(placeholder);
                                                            }
                                                        }}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <div className="flex align-items-center justify-content-center surface-100 border-round" 
                                                         style={{ width: '150px', height: '150px' }}>
                                                        <div className="text-center">
                                                            <i className="pi pi-user text-4xl text-400" />
                                                            <p className="text-600 text-sm">Photo non disponible</p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 text-center mt-3">
                                <Button
                                    icon="pi pi-file-pdf"
                                    label="Télécharger le PDF"
                                    onClick={() => handleDownloadPDF(selectedCard)}
                                    className="p-button-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* ===== DIALOGUE HISTORIQUE ===== */}
            <Dialog
                header="Historique des cartes"
                visible={historyDialog}
                style={{ width: '800px' }}
                onHide={() => setHistoryDialog(false)}
                maximizable
            >
                <DataTable
                    value={cardHistory}
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25]}
                    emptyMessage="Aucun historique disponible"
                >
                    <Column 
                        field="actionType" 
                        header="Action" 
                        body={(row: CardHistory) => {
                            let severity: 'success' | 'info' | 'warning' | 'danger' | null | undefined = 'info';
                            switch (row.actionType) {
                                case 'CREATION':
                                    severity = 'success';
                                    break;
                                case 'MODIFICATION':
                                    severity = 'warning';
                                    break;
                                case 'INVALIDATION':
                                    severity = 'danger';
                                    break;
                                case 'REACTIVATION':
                                    severity = 'info';
                                    break;
                                default:
                                    severity = 'info';
                            }
                            return <Tag value={row.actionType} severity={severity} />;
                        }} 
                    />
                    <Column field="reason" header="Motif" />
                    <Column field="performedBy" header="Effectué par" />
                    <Column field="performedAt" header="Date" body={(row: CardHistory) => formatDate(row.performedAt)} />
                </DataTable>
            </Dialog>
        </div>
    );
}