'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import { Image } from 'primereact/image';
import { Skeleton } from 'primereact/skeleton';
import { ProgressSpinner } from 'primereact/progressspinner';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { getUserAction } from '@/hooks/fetchData/useConsumApi';

// ============================================================
// INTERFACES
// ============================================================

interface ShareholderCard {
    id: number;
    cardNumber: string;
    isActive: boolean;
    generatedAt: string;
    expiryDate: string | null;
    invalidationReason: string | null;
    invalidatedAt: string | null;
    invalidatedBy: string | null;
    snapshotLastName: string;
    snapshotFirstName: string;
    snapshotFullName: string;
    snapshotDateOfBirth: string;
    snapshotPlaceOfBirth: string;
    snapshotProvince: string;
    snapshotCommune: string;
    snapshotPhonePrimary: string;
    snapshotIdDocumentNumber: string;
    snapshotShareholderNumber: string;
    snapshotTotalShares: number;
    snapshotAccountNumber: string;
    photoPath: string;
    qrCodeData: string;
    pdfPath: string;
    createdAt: string;
    updatedAt: string;
    userAction: string;
    shareholder?: {
        id: number;
        shareholderNumber: string;
        client: {
            id: number;
            fullName: string;
            phonePrimary: string;
        };
    };
}

interface Shareholder {
    id: number;
    shareholderNumber: string;
    client: {
        id: number;
        fullName: string;
        lastName: string;
        firstName: string;
        phonePrimary: string;
        email: string;
        photoPath: string;
        dateOfBirth: string;
        placeOfBirth: string;
        province?: { id: number; name: string };
        commune?: { id: number; name: string };
        idDocumentNumber: string;
    };
    savingsAccount?: {
        id: number;
        accountNumber: string;
    };
    totalShares: number;
    status: string;
    isValidated: boolean;
    validatedAt: string;
    validatedBy: string;
}

// ============================================================
// CONFIGURATION DES URLS
// ============================================================

const BASE_URL = buildApiUrl('/api/shareholder-cards');
// 🔥 UTILISEZ /all au lieu de /api/shareholders
const SHAREHOLDERS_URL = buildApiUrl('/api/shareholders/all');

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function ShareholderCardManagement() {
    // ---- États pour les actionnaires ----
    const [shareholderId, setShareholderId] = useState<number | null>(null);
    const [shareholder, setShareholder] = useState<Shareholder | null>(null);
    const [shareholders, setShareholders] = useState<Shareholder[]>([]);
    const [loadingShareholders, setLoadingShareholders] = useState(true);
    const [shareholderError, setShareholderError] = useState<string | null>(null);

    // ---- États pour les cartes ----
    const [cards, setCards] = useState<ShareholderCard[]>([]);
    const [allCards, setAllCards] = useState<ShareholderCard[]>([]);
    const [activeCard, setActiveCard] = useState<ShareholderCard | null>(null);
    const [loadingCards, setLoadingCards] = useState(false);
    const [loadingActiveCard, setLoadingActiveCard] = useState(false);
    const [loadingAllCards, setLoadingAllCards] = useState(false);

    // ---- États pour les dialogues ----
    const [cardDialog, setCardDialog] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ShareholderCard | null>(null);
    const [actionDialog, setActionDialog] = useState(false);
    const [actionType, setActionType] = useState<'INVALIDATE' | 'REVOKE' | 'LOST'>('INVALIDATE');
    const [motif, setMotif] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);

    // ---- Références ----
    const toast = useRef<Toast>(null);

    // ---- Hooks API ----
    const allCardsApi = useConsumApi('');
    const cardsApi = useConsumApi('');
    const activeCardApi = useConsumApi('');
    const crudApi = useConsumApi('');

    // ============================================================
    // FONCTIONS DE MAPPING
    // ============================================================

    const mapCardData = (item: any): ShareholderCard => ({
        id: item?.id || 0,
        cardNumber: item?.cardNumber || item?.numeroCarte || '',
        isActive: item?.isActive !== undefined ? item.isActive : item?.actif !== undefined ? item.actif : true,
        generatedAt: item?.generatedAt || item?.dateEmission || item?.createdAt || '',
        expiryDate: item?.expiryDate || null,
        invalidationReason: item?.invalidationReason || item?.motifInactivation || null,
        invalidatedAt: item?.invalidatedAt || item?.dateInactivation || null,
        invalidatedBy: item?.invalidatedBy || null,
        snapshotLastName: item?.snapshotLastName || item?.snapshotNom?.split(' ')[0] || '',
        snapshotFirstName: item?.snapshotFirstName || '',
        snapshotFullName: item?.snapshotFullName || item?.snapshotNom || item?.shareholder?.client?.fullName || '',
        snapshotDateOfBirth: item?.snapshotDateOfBirth || item?.snapshotDateNaissance || '',
        snapshotPlaceOfBirth: item?.snapshotPlaceOfBirth || item?.snapshotLieuNaissance || '',
        snapshotProvince: item?.snapshotProvince || '',
        snapshotCommune: item?.snapshotCommune || '',
        snapshotPhonePrimary: item?.snapshotPhonePrimary || item?.snapshotTelephone || '',
        snapshotIdDocumentNumber: item?.snapshotIdDocumentNumber || item?.snapshotIdDocument || '',
        snapshotShareholderNumber: item?.snapshotShareholderNumber || item?.snapshotNumeroActionnaire || '',
        snapshotTotalShares: item?.snapshotTotalShares || item?.snapshotNombreParts || 0,
        snapshotAccountNumber: item?.snapshotAccountNumber || item?.snapshotNumeroCompte || '',
        photoPath: item?.photoPath || item?.photoScannee || '',
        qrCodeData: item?.qrCodeData || item?.qrCodeImage || '',
        pdfPath: item?.pdfPath || '',
        createdAt: item?.createdAt || '',
        updatedAt: item?.updatedAt || '',
        userAction: item?.userAction || '',
        shareholder: item?.shareholder || undefined
    });

    const mapShareholderData = (item: any): Shareholder => ({
        id: item?.id || 0,
        shareholderNumber: item?.shareholderNumber || '',
        client: {
            id: item?.client?.id || 0,
            fullName: item?.client?.fullName || '',
            lastName: item?.client?.lastName || '',
            firstName: item?.client?.firstName || '',
            phonePrimary: item?.client?.phonePrimary || '',
            email: item?.client?.email || '',
            photoPath: item?.client?.photoPath || '',
            dateOfBirth: item?.client?.dateOfBirth || '',
            placeOfBirth: item?.client?.placeOfBirth || '',
            idDocumentNumber: item?.client?.idDocumentNumber || ''
        },
        savingsAccount: item?.savingsAccount ? {
            id: item.savingsAccount.id,
            accountNumber: item.savingsAccount.accountNumber
        } : undefined,
        totalShares: item?.totalShares || 0,
        status: item?.status || '',
        isValidated: item?.isValidated || false,
        validatedAt: item?.validatedAt || '',
        validatedBy: item?.validatedBy || ''
    });

    // ============================================================
    // CHARGEMENT DES ACTIONNAIRES
    // ============================================================

    const loadShareholders = async () => {
        console.log('🔄 Chargement des actionnaires...');
        setLoadingShareholders(true);
        setShareholderError(null);

        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            console.log('📡 Appel API:', SHAREHOLDERS_URL);
            
            const response = await fetch(SHAREHOLDERS_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('📥 Statut réponse:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                if (response.status === 404) {
                    throw new Error('Endpoint des actionnaires introuvable. Vérifiez l\'URL.');
                }
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            let shareholdersList: Shareholder[] = [];
            if (Array.isArray(data)) {
                shareholdersList = data.map(mapShareholderData);
            } else if (data && typeof data === 'object') {
                if (Array.isArray(data.content)) {
                    shareholdersList = data.content.map(mapShareholderData);
                } else if (Array.isArray(data.data)) {
                    shareholdersList = data.data.map(mapShareholderData);
                } else if (Array.isArray(data.items)) {
                    shareholdersList = data.items.map(mapShareholderData);
                } else if (data.id) {
                    shareholdersList = [mapShareholderData(data)];
                }
            }
            
            setShareholders(shareholdersList);
            setLoadingShareholders(false);
            setShareholderError(null);
            console.log(`✅ ${shareholdersList.length} actionnaire(s) chargé(s)`);

        } catch (error) {
            console.error('❌ Erreur chargement actionnaires:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            setShareholderError(errorMessage);
            setLoadingShareholders(false);
            showToast('error', 'Erreur', `Impossible de charger les actionnaires: ${errorMessage}`);
        }
    };

    // ============================================================
    // CHARGEMENT DES CARTES
    // ============================================================

    const loadAllCards = async () => {
        console.log('🔄 Chargement de toutes les cartes...');
        setLoadingAllCards(true);
        
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const url = `${BASE_URL}/all`;
            console.log('📡 Appel API:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Endpoint des cartes introuvable. Vérifiez l\'URL.');
                }
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            let rawData: any[] = [];
            if (Array.isArray(data)) {
                rawData = data;
            } else if (data?.content && Array.isArray(data.content)) {
                rawData = data.content;
            } else if (data?.data && Array.isArray(data.data)) {
                rawData = data.data;
            }
            
            const mappedData = rawData.map((item: any) => mapCardData(item));
            setAllCards(mappedData);
            if (!shareholderId) {
                setCards(mappedData);
            }
            setLoadingAllCards(false);

        } catch (error) {
            console.error('❌ Erreur chargement toutes les cartes:', error);
            setAllCards([]);
            if (!shareholderId) {
                setCards([]);
            }
            setLoadingAllCards(false);
            if (!(error instanceof Error && error.message.includes('404'))) {
                showToast('error', 'Erreur', 'Impossible de charger les cartes');
            }
        }
    };

    const loadCardsByShareholder = async () => {
        if (!shareholderId || shareholderId <= 0) {
            setCards([]);
            setLoadingCards(false);
            return;
        }
        console.log(`🔄 Chargement des cartes pour l'actionnaire ${shareholderId}...`);
        setLoadingCards(true);
        
        if (allCards.length > 0) {
            const filtered = allCards.filter((card: ShareholderCard) => 
                card.shareholder?.id === shareholderId ||
                card.snapshotShareholderNumber === shareholder?.shareholderNumber
            );
            setCards(filtered);
            setLoadingCards(false);
        } else {
            try {
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('token='))
                    ?.split('=')[1];

                if (!token) {
                    throw new Error('Token d\'authentification manquant');
                }

                const url = `${BASE_URL}/shareholder/${shareholderId}`;
                console.log('📡 Appel API:', url);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setCards([]);
                        setLoadingCards(false);
                        return;
                    }
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                let rawData: any[] = [];
                if (Array.isArray(data)) {
                    rawData = data;
                } else if (data?.content && Array.isArray(data.content)) {
                    rawData = data.content;
                } else if (data?.data && Array.isArray(data.data)) {
                    rawData = data.data;
                } else if (data?.id) {
                    rawData = [data];
                }
                
                const mappedData = rawData.map((item: any) => mapCardData(item));
                const filtered = mappedData.filter((card: ShareholderCard) => {
                    const matchesById = card.shareholder?.id === shareholderId;
                    const matchesByNumber = card.snapshotShareholderNumber === shareholder?.shareholderNumber;
                    return matchesById || matchesByNumber;
                });
                
                setCards(filtered);
                setLoadingCards(false);
                
            } catch (error) {
                console.error('❌ Erreur chargement cartes:', error);
                setCards([]);
                setLoadingCards(false);
            }
        }
    };

    const loadActiveCard = async () => {
        if (!shareholderId || shareholderId <= 0) {
            setActiveCard(null);
            setLoadingActiveCard(false);
            return;
        }
        console.log(`🔄 Chargement de la carte active pour l'actionnaire ${shareholderId}...`);
        setLoadingActiveCard(true);
        
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const url = `${BASE_URL}/active/${shareholderId}`;
            console.log('📡 Appel API:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setActiveCard(null);
                    setLoadingActiveCard(false);
                    return;
                }
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            let cardData = data;
            if (Array.isArray(cardData) && cardData.length > 0) {
                cardData = cardData[0];
            } else if (cardData?.content && Array.isArray(cardData.content) && cardData.content.length > 0) {
                cardData = cardData.content[0];
            } else if (cardData?.data && Array.isArray(cardData.data) && cardData.data.length > 0) {
                cardData = cardData.data[0];
            }
            
            if (cardData && typeof cardData === 'object' && cardData.id) {
                const mappedCard = mapCardData(cardData);
                setActiveCard(mappedCard);
            } else {
                setActiveCard(null);
            }
            setLoadingActiveCard(false);
            
        } catch (error) {
            console.error('❌ Erreur chargement carte active:', error);
            setActiveCard(null);
            setLoadingActiveCard(false);
        }
    };

    // ============================================================
    // INITIALISATION
    // ============================================================

    useEffect(() => {
        loadShareholders();
    }, []);

    useEffect(() => {
        loadAllCards();
    }, []);

    useEffect(() => {
        if (shareholderId && shareholderId > 0) {
            setCards([]);
            setActiveCard(null);
            loadCardsByShareholder();
            loadActiveCard();
        } else {
            setCards(allCards);
            setActiveCard(null);
            setLoadingCards(false);
            setLoadingActiveCard(false);
        }
    }, [shareholderId]);

    // ============================================================
    // GESTION DES RÉPONSES API (via useConsumApi)
    // ============================================================

    useEffect(() => {
        if (crudApi.data) {
            switch (crudApi.callType) {
                case 'generate':
                    showToast('success', 'Succès', 'Carte générée avec succès');
                    refreshData();
                    setCardDialog(false);
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setIsGenerating(false);
                    setErrorDetail(null);
                    break;
                case 'invalidate':
                case 'revoke':
                case 'lost':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    refreshData();
                    setActionDialog(false);
                    setMotif('');
                    break;
                case 'regenerate':
                    showToast('success', 'Succès', 'Nouvelle carte générée avec succès');
                    refreshData();
                    break;
                case 'checkUpdate':
                    showToast('success', 'Succès', 'Vérification effectuée, mise à jour si nécessaire');
                    refreshData();
                    break;
                default:
                    break;
            }
        }
        if (crudApi.error) {
            console.error('❌ Erreur API:', crudApi.error);
            setIsGenerating(false);
            const errorMessage = crudApi.error.message || 'Une erreur est survenue';
            setErrorDetail(errorMessage);
            showToast('error', 'Erreur', errorMessage);
        }
    }, [crudApi.data, crudApi.error, crudApi.callType]);

    // ============================================================
    // FONCTIONS UTILITAIRES
    // ============================================================

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    const getStatusColor = (isActive: boolean, reason?: string | null) => {
        if (isActive) return '#22c55e';
        if (reason?.toLowerCase().includes('perdu')) return '#ef4444';
        if (reason?.toLowerCase().includes('révoqué')) return '#6b7280';
        return '#f97316';
    };

    const getStatusLabel = (isActive: boolean, reason?: string | null) => {
        if (isActive) return 'Active';
        if (reason?.toLowerCase().includes('perdu')) return 'Perdue';
        if (reason?.toLowerCase().includes('révoqué')) return 'Révoquée';
        return 'Inactive';
    };

    const hasActiveCard = (): boolean => {
        return activeCard !== null && activeCard !== undefined && activeCard.id !== undefined && activeCard.id > 0 && activeCard.isActive === true;
    };

    const refreshData = () => {
        loadAllCards();
        if (shareholderId) {
            loadCardsByShareholder();
            loadActiveCard();
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
                console.error('❌ Erreur lecture fichier:', error);
                reject(error);
            };
        });
    };

    // ============================================================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ============================================================

    const handleSelectShareholder = (e: DropdownChangeEvent) => {
        const id = e.value as number | null;
        setCards([]);
        setActiveCard(null);
        setShareholderId(id);
        if (id) {
            const selected = shareholders.find(s => s.id === id);
            setShareholder(selected || null);
        } else {
            setShareholder(null);
            setCards(allCards);
        }
    };

    const handleGenerateCard = async () => {
        if (!shareholderId || shareholderId <= 0) {
            showToast('error', 'Erreur', 'Veuillez sélectionner un actionnaire');
            return;
        }

        if (hasActiveCard()) {
            showToast('warn', 'Attention', 'Cet actionnaire a déjà une carte active');
            return;
        }

        if (!photoFile) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une photo');
            return;
        }

        if (photoFile.size > 5 * 1024 * 1024) {
            showToast('error', 'Erreur', 'L\'image est trop volumineuse (max 5MB)');
            return;
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(photoFile.type)) {
            showToast('error', 'Erreur', `Format non supporté. Utilisez: ${allowedTypes.join(', ')}`);
            return;
        }

        setIsGenerating(true);
        setErrorDetail(null);

        try {
            const base64Image = await convertFileToBase64(photoFile);
            if (!base64Image || base64Image.length < 100) {
                throw new Error('La conversion de l\'image a échoué');
            }

            const payload = {
                photoBase64: base64Image,
                userAction: getUserAction()
            };

            const url = `${BASE_URL}/generate/${shareholderId}`;
            console.log('📡 Génération carte:', url);
            crudApi.fetchData(payload, 'POST', url, 'generate');

        } catch (error) {
            console.error('❌ Erreur génération:', error);
            setIsGenerating(false);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            setErrorDetail(errorMessage);
            showToast('error', 'Erreur', errorMessage);
        }
    };

    const handleDownloadPDF = async (cardId: number) => {
        if (!cardId || cardId <= 0) {
            showToast('error', 'Erreur', 'ID de carte invalide');
            return;
        }

        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                showToast('error', 'Erreur', 'Vous devez être connecté');
                return;
            }

            const url = `${BASE_URL}/download/${cardId}`;
            console.log('📡 Téléchargement PDF:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `carte_actionnaire_${cardId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            showToast('success', 'Succès', 'PDF téléchargé avec succès');

        } catch (error) {
            console.error('❌ Erreur téléchargement PDF:', error);
            showToast('error', 'Erreur', 'Impossible de télécharger le PDF');
        }
    };

    const handleAction = () => {
        if (!selectedCard || !selectedCard.id) {
            showToast('error', 'Erreur', 'Aucune carte sélectionnée');
            return;
        }

        if (!motif && actionType !== 'LOST') {
            showToast('warn', 'Attention', 'Veuillez indiquer un motif');
            return;
        }

        const data = {
            reason: motif,
            userAction: getUserAction()
        };

        const actionMap = {
            'INVALIDATE': 'invalidate',
            'REVOKE': 'revoke',
            'LOST': 'lost'
        };

        const endpoint = `${BASE_URL}/${actionMap[actionType]}/${selectedCard.id}`;
        console.log('📡 Action carte:', endpoint);
        crudApi.fetchData(data, 'PUT', endpoint, actionType.toLowerCase());
    };

    const handleRegenerate = (cardId: number) => {
        if (!cardId || cardId <= 0) {
            showToast('error', 'Erreur', 'ID de carte invalide');
            return;
        }

        confirmDialog({
            message: 'Générer une nouvelle carte pour remplacer celle-ci ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const endpoint = `${BASE_URL}/regenerate/${cardId}`;
                console.log('📡 Régénération carte:', endpoint);
                crudApi.fetchData(
                    { userAction: getUserAction() },
                    'POST',
                    endpoint,
                    'regenerate'
                );
            }
        });
    };

    const handleCheckUpdate = () => {
        if (!shareholderId || shareholderId <= 0) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un actionnaire');
            return;
        }
        const endpoint = `${BASE_URL}/check-update/${shareholderId}`;
        console.log('📡 Vérification mise à jour:', endpoint);
        crudApi.fetchData(
            { userAction: getUserAction() },
            'POST',
            endpoint,
            'checkUpdate'
        );
    };

    // ============================================================
    // TEMPLATES DATATABLE
    // ============================================================

    const statusBodyTemplate = (row: ShareholderCard) => {
        return (
            <Tag 
                value={getStatusLabel(row.isActive, row.invalidationReason)} 
                style={{ backgroundColor: getStatusColor(row.isActive, row.invalidationReason) }}
                icon={row.isActive ? 'pi pi-check-circle' : 'pi pi-times-circle'}
            />
        );
    };

    const shareholderBodyTemplate = (row: ShareholderCard) => {
        return <span>{row.shareholder?.client?.fullName || row.snapshotFullName || 'N/A'}</span>;
    };

    const actionsBodyTemplate = (row: ShareholderCard) => (
        <div className="flex gap-1 flex-wrap">
            <Button 
                icon="pi pi-file-pdf" 
                rounded 
                text 
                severity="info" 
                onClick={() => handleDownloadPDF(row.id)} 
                tooltip="Télécharger PDF" 
                size="small"
            />
            <Button 
                icon="pi pi-eye" 
                rounded 
                text 
                severity="secondary" 
                onClick={() => setSelectedCard(row)} 
                tooltip="Voir détails" 
                size="small"
            />
            {row.isActive && (
                <>
                    <Button 
                        icon="pi pi-refresh" 
                        rounded 
                        text 
                        severity="warning" 
                        onClick={() => handleRegenerate(row.id)} 
                        tooltip="Régénérer" 
                        size="small"
                    />
                    <Button 
                        icon="pi pi-times" 
                        rounded 
                        text 
                        severity="danger" 
                        onClick={() => { 
                            setSelectedCard(row); 
                            setActionType('INVALIDATE'); 
                            setActionDialog(true); 
                        }} 
                        tooltip="Invalider" 
                        size="small"
                    />
                </>
            )}
        </div>
    );

    const renderCardPreview = () => {
        if (!selectedCard) return null;
        return (
            <div className="p-3 border-round" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="flex flex-wrap gap-4">
                    {selectedCard.photoPath && (
                        <div>
                            <h6 className="m-0 mb-2">Photo</h6>
                            <Image 
                                src={selectedCard.photoPath.startsWith('data:') ? selectedCard.photoPath : `data:image/png;base64,${selectedCard.photoPath}`} 
                                alt="Photo" 
                                width="120" 
                                height="140" 
                                preview
                            />
                        </div>
                    )}
                    {selectedCard.qrCodeData && (
                        <div>
                            <h6 className="m-0 mb-2">QR Code</h6>
                            <Image 
                                src={selectedCard.qrCodeData.startsWith('data:') ? selectedCard.qrCodeData : `data:image/png;base64,${selectedCard.qrCodeData}`} 
                                alt="QR Code" 
                                width="120" 
                                height="120" 
                                preview
                            />
                        </div>
                    )}
                </div>
                <div className="grid mt-3">
                    <div className="col-12 md:col-6"><strong>N° Carte:</strong> {selectedCard.cardNumber}</div>
                    <div className="col-12 md:col-6">
                        <strong>Statut:</strong> 
                        <Tag 
                            value={getStatusLabel(selectedCard.isActive, selectedCard.invalidationReason)} 
                            style={{ backgroundColor: getStatusColor(selectedCard.isActive, selectedCard.invalidationReason), marginLeft: '8px' }}
                            icon={selectedCard.isActive ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                        />
                    </div>
                    <div className="col-12 md:col-6"><strong>Nom complet:</strong> {selectedCard.snapshotFullName}</div>
                    <div className="col-12 md:col-6"><strong>N° Actionnaire:</strong> {selectedCard.snapshotShareholderNumber}</div>
                    <div className="col-12 md:col-6"><strong>N° CNI:</strong> {selectedCard.snapshotIdDocumentNumber}</div>
                    <div className="col-12 md:col-6"><strong>Nombre d'actions:</strong> {selectedCard.snapshotTotalShares}</div>
                    <div className="col-12 md:col-6"><strong>Téléphone:</strong> {selectedCard.snapshotPhonePrimary}</div>
                    <div className="col-12 md:col-6"><strong>N° Compte:</strong> {selectedCard.snapshotAccountNumber}</div>
                    <div className="col-12 md:col-6"><strong>Lieu de naissance:</strong> {selectedCard.snapshotPlaceOfBirth}</div>
                    <div className="col-12 md:col-6"><strong>Date de naissance:</strong> {selectedCard.snapshotDateOfBirth}</div>
                    <div className="col-12 md:col-6"><strong>Commune:</strong> {selectedCard.snapshotCommune}</div>
                    <div className="col-12 md:col-6"><strong>Province:</strong> {selectedCard.snapshotProvince}</div>
                    <div className="col-12"><strong>Date génération:</strong> {new Date(selectedCard.generatedAt).toLocaleString()}</div>
                    {selectedCard.invalidationReason && (
                        <div className="col-12"><strong>Motif d'inactivation:</strong> {selectedCard.invalidationReason}</div>
                    )}
                    {selectedCard.invalidatedAt && (
                        <div className="col-12"><strong>Date d'inactivation:</strong> {new Date(selectedCard.invalidatedAt).toLocaleString()}</div>
                    )}
                    {selectedCard.invalidatedBy && (
                        <div className="col-12"><strong>Invalidé par:</strong> {selectedCard.invalidatedBy}</div>
                    )}
                </div>
                {selectedCard.pdfPath && (
                    <div className="mt-3">
                        <Button 
                            icon="pi pi-file-pdf" 
                            label="Télécharger le PDF" 
                            severity="info" 
                            onClick={() => handleDownloadPDF(selectedCard.id)} 
                        />
                    </div>
                )}
            </div>
        );
    };

    // ============================================================
    // RENDU PRINCIPAL
    // ============================================================

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="text-2xl font-bold mb-4">Gestion des Cartes d'Actionnaires</h2>

            {/* ===== SELECTEUR D'ACTIONNAIRE ===== */}
            <div className="p-3 mb-4 surface-ground border-round">
                <div className="flex flex-wrap align-items-center gap-3">
                    <div className="field flex-1">
                        <label className="font-bold block mb-2">
                            Sélectionner un actionnaire
                            {loadingShareholders && <Skeleton className="ml-2" width="20px" height="20px" />}
                        </label>

                        {loadingShareholders && (
                            <div className="text-sm text-600 mb-1">
                                <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="4" />
                                Chargement des actionnaires...
                            </div>
                        )}

                        {shareholderError && (
                            <div className="text-red-500 text-sm mb-1">
                                ❌ {shareholderError}
                            </div>
                        )}

                        {!loadingShareholders && !shareholderError && (
                            <div className="text-sm text-600 mb-1">
                                {shareholders.length > 0 ? `${shareholders.length} actionnaire(s) disponible(s)` : 'Aucun actionnaire trouvé'}
                            </div>
                        )}

                        <Dropdown
                            value={shareholderId}
                            options={shareholders}
                            optionLabel="client.fullName"
                            optionValue="id"
                            onChange={handleSelectShareholder}
                            placeholder={loadingShareholders ? "Chargement..." : "Tous les actionnaires..."}
                            filter
                            filterBy="client.fullName,shareholderNumber,client.phonePrimary"
                            className="w-full"
                            showClear
                            disabled={loadingShareholders}
                            emptyMessage={loadingShareholders ? "Chargement des actionnaires..." : shareholderError || "Aucun actionnaire trouvé"}
                            itemTemplate={(option: Shareholder) => (
                                <div className="flex flex-column">
                                    <span className="font-bold">{option.client?.fullName || 'Nom inconnu'}</span>
                                    <small className="text-600">
                                        {option.shareholderNumber} - {option.client?.phonePrimary || 'Pas de téléphone'}
                                    </small>
                                </div>
                            )}
                        />

                        {shareholderError && (
                            <div className="text-red-500 text-sm mt-1">
                                <i className="pi pi-exclamation-triangle mr-1" />
                                {shareholderError}
                                <Button 
                                    icon="pi pi-refresh" 
                                    className="p-button-text p-button-sm ml-2" 
                                    onClick={loadShareholders}
                                    label="Réessayer"
                                />
                            </div>
                        )}

                        <small className="text-600">
                            {shareholderId ? 'Affichage des cartes pour l\'actionnaire sélectionné' : 'Affichage de toutes les cartes'}
                        </small>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <div className="p-2 surface-100 border-round">
                            <small className="text-600">Total cartes</small>
                            <div className="font-bold text-lg">
                                {shareholderId ? cards.length : allCards.length}
                            </div>
                        </div>
                        <div className="p-2 surface-100 border-round">
                            <small className="text-600">Cartes actives</small>
                            <div className="font-bold text-lg text-green-500">
                                {shareholderId 
                                    ? cards.filter(c => c.isActive).length 
                                    : allCards.filter(c => c.isActive).length
                                }
                            </div>
                        </div>
                        {shareholder && (
                            <div className="p-2 surface-100 border-round">
                                <small className="text-600">Cartes de {shareholder.client?.fullName}</small>
                                <div className="font-bold text-lg">{cards.length}</div>
                            </div>
                        )}
                    </div>
                </div>

                {shareholder && (
                    <div className="p-2 surface-100 border-round mt-2">
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <small className="text-600">
                                    <i className="pi pi-user mr-1" />
                                    <strong>{shareholder.client?.fullName}</strong>
                                </small>
                            </div>
                            <div className="col-12 md:col-4">
                                <small className="text-600">
                                    <i className="pi pi-id-card mr-1" />
                                    N° {shareholder.shareholderNumber}
                                </small>
                            </div>
                            <div className="col-12 md:col-4">
                                <small className="text-600">
                                    <i className="pi pi-phone mr-1" />
                                    {shareholder.client?.phonePrimary || 'Téléphone non renseigné'}
                                </small>
                            </div>
                            <div className="col-12 md:col-4">
                                <small className="text-600">
                                    <i className="pi pi-book mr-1" />
                                    Actions: {shareholder.totalShares || 0}
                                </small>
                            </div>
                            <div className="col-12 md:col-4">
                                <small className="text-600">
                                    <i className="pi pi-credit-card mr-1" />
                                    Compte: {shareholder.savingsAccount?.accountNumber || 'Non défini'}
                                </small>
                            </div>
                            <div className="col-12 md:col-4">
                                <small className="text-600">
                                    <i className="pi pi-tag mr-1" />
                                    Statut: <Tag value={shareholder.status} severity={shareholder.status === 'ACTIF' ? 'success' : 'danger'} />
                                </small>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== CONTENU PRINCIPAL ===== */}
            <div>
                <div className="flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h5 className="m-0">
                        {shareholder ? (
                            <>Gestion des cartes - {shareholder.client?.fullName}</>
                        ) : (
                            <>Toutes les cartes d'actionnaires</>
                        )}
                        <small className="text-600 ml-2">({cards.length} carte(s))</small>
                    </h5>
                    <div className="flex gap-2 align-items-center flex-wrap">
                        {shareholderId && !loadingActiveCard && (
                            <>
                                {!hasActiveCard() ? (
                                    <Button 
                                        label="Générer une carte" 
                                        icon="pi pi-plus" 
                                        onClick={() => {
                                            setErrorDetail(null);
                                            setCardDialog(true);
                                        }} 
                                        className="p-button-sm"
                                        disabled={isGenerating}
                                        severity="success"
                                    />
                                ) : (
                                    <Tag value="✓ Carte active" severity="success" icon="pi pi-check-circle" />
                                )}
                            </>
                        )}

                        {shareholderId && !loadingActiveCard && !hasActiveCard() && (
                            <Tag value="⚠️ Aucune carte active" severity="warning" icon="pi pi-exclamation-triangle" />
                        )}

                        {loadingActiveCard && (
                            <Skeleton width="120px" height="38px" borderRadius="4px" />
                        )}

                        {shareholderId && (
                            <Button 
                                icon="pi pi-refresh" 
                                rounded 
                                text 
                                onClick={handleCheckUpdate}
                                tooltip="Vérifier les modifications et mettre à jour la carte"
                                severity="info"
                                size="small"
                            />
                        )}
                    </div>
                </div>

                {errorDetail && (
                    <div className="p-3 mb-3 surface-100 border-round border-1 border-red-300">
                        <div className="flex align-items-center">
                            <i className="pi pi-times-circle text-red-500 mr-2" style={{ fontSize: '1.2rem' }} />
                            <span className="text-red-600 font-bold">Erreur: </span>
                            <span className="ml-2 text-600">{errorDetail}</span>
                            <Button 
                                icon="pi pi-times" 
                                className="p-button-text p-button-sm ml-auto" 
                                onClick={() => setErrorDetail(null)}
                            />
                        </div>
                    </div>
                )}

                <DataTable
                    value={cards}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage={shareholderId ? "Aucune carte pour cet actionnaire" : "Aucune carte générée"}
                    className="p-datatable-sm"
                    loading={loadingCards || loadingAllCards}
                    tableStyle={{ minWidth: '50rem' }}
                    sortField="id"
                    sortOrder={-1}
                    responsiveLayout="scroll"
                >
                    <Column field="cardNumber" header="N° Carte" sortable style={{ minWidth: '140px' }} />
                    <Column field="snapshotFullName" header="Actionnaire" body={shareholderBodyTemplate} sortable style={{ minWidth: '180px' }} />
                    <Column field="snapshotShareholderNumber" header="N° Actionnaire" sortable style={{ minWidth: '120px' }} />
                    <Column field="snapshotTotalShares" header="Actions" sortable style={{ minWidth: '80px' }} />
                    <Column field="generatedAt" header="Date émission" sortable style={{ minWidth: '150px' }} body={(row) => new Date(row.generatedAt).toLocaleDateString()} />
                    <Column header="Statut" body={statusBodyTemplate} sortable field="isActive" style={{ minWidth: '120px' }} />
                    <Column header="Actions" body={actionsBodyTemplate} style={{ minWidth: '200px' }} />
                </DataTable>
            </div>

            {/* ===== DIALOGUE GÉNÉRATION ===== */}
            <Dialog
                header="Générer une nouvelle carte"
                visible={cardDialog}
                style={{ width: '550px', maxWidth: '95vw' }}
                onHide={() => {
                    setCardDialog(false);
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setIsGenerating(false);
                    setErrorDetail(null);
                }}
                closable={!isGenerating}
            >
                <div className="p-fluid">
                    <div className="field">
                        <label className="font-bold">Actionnaire</label>
                        <p className="text-600">{shareholder?.client?.fullName} - {shareholder?.shareholderNumber}</p>
                    </div>

                    <div className="field">
                        <label>Photo scannée de l'actionnaire <span className="text-danger">*</span></label>
                        <FileUpload
                            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                            maxFileSize={5000000}
                            onSelect={(e: FileUploadSelectEvent) => {
                                const files = e.files;
                                if (files && files.length > 0) {
                                    const file = files[0] as File;
                                    setPhotoFile(file);
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        setPhotoPreview(event.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                    showToast('info', 'Fichier sélectionné', `${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
                                }
                            }}
                            onRemove={() => {
                                setPhotoFile(null);
                                setPhotoPreview(null);
                            }}
                            chooseLabel="Choisir une photo"
                            className="mb-3"
                            disabled={isGenerating}
                        />
                        {photoPreview && (
                            <div className="mt-2 p-2 surface-100 border-round">
                                <div className="flex align-items-center justify-content-between">
                                    <div>
                                        <i className="pi pi-file-image text-primary mr-2" />
                                        <strong>{photoFile?.name}</strong>
                                        <span className="text-600 ml-2">({photoFile ? (photoFile.size / 1024).toFixed(2) : 0} KB)</span>
                                    </div>
                                    <Button 
                                        icon="pi pi-times" 
                                        className="p-button-rounded p-button-text p-button-sm" 
                                        onClick={() => {
                                            setPhotoFile(null);
                                            setPhotoPreview(null);
                                        }}
                                        disabled={isGenerating}
                                    />
                                </div>
                                <div className="mt-2 flex justify-content-center">
                                    <img 
                                        src={photoPreview} 
                                        alt="Aperçu" 
                                        className="border-round"
                                        style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {errorDetail && (
                        <div className="p-2 surface-100 border-round border-1 border-red-300">
                            <small className="text-red-600 flex align-items-center">
                                <i className="pi pi-exclamation-circle mr-1" />
                                {errorDetail}
                            </small>
                        </div>
                    )}

                    <div className="flex gap-2 justify-content-end mt-3">
                        <Button 
                            label="Annuler" 
                            icon="pi pi-times" 
                            severity="secondary" 
                            onClick={() => {
                                setCardDialog(false);
                                setPhotoFile(null);
                                setPhotoPreview(null);
                                setIsGenerating(false);
                                setErrorDetail(null);
                            }} 
                            disabled={isGenerating}
                        />
                        <Button 
                            label="Générer" 
                            icon="pi pi-check" 
                            onClick={handleGenerateCard} 
                            loading={isGenerating}
                            disabled={!photoFile || isGenerating}
                            severity="success"
                        />
                    </div>

                    {!photoFile && !isGenerating && (
                        <small className="text-warning mt-2">
                            <i className="pi pi-exclamation-triangle mr-1" />
                            Une photo est requise pour générer la carte
                        </small>
                    )}
                </div>
            </Dialog>

            {/* ===== DIALOGUE ACTION ===== */}
            <Dialog
                header={`${actionType === 'INVALIDATE' ? 'Invalider' : actionType === 'REVOKE' ? 'Révoquer' : 'Déclarer perdue'} la carte`}
                visible={actionDialog}
                style={{ width: '500px', maxWidth: '95vw' }}
                onHide={() => { 
                    setActionDialog(false); 
                    setMotif(''); 
                }}
            >
                <div className="p-fluid">
                    {selectedCard && (
                        <div className="field">
                            <label className="font-bold">Carte concernée</label>
                            <p className="text-600">N° {selectedCard.cardNumber} - {selectedCard.snapshotFullName}</p>
                        </div>
                    )}

                    {actionType !== 'LOST' && (
                        <div className="field">
                            <label>Motif <span className="text-danger">*</span></label>
                            <InputTextarea
                                value={motif}
                                onChange={(e) => setMotif(e.target.value)}
                                rows={3}
                                placeholder="Indiquez le motif de l'inactivation..."
                                required
                            />
                        </div>
                    )}

                    {actionType === 'LOST' && (
                        <div className="field">
                            <div className="p-3 surface-yellow-50 border-round">
                                <i className="pi pi-exclamation-triangle text-yellow-500 mr-2" />
                                <span>Confirmer la déclaration de perte de la carte ?</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 justify-content-end mt-3">
                        <Button 
                            label="Annuler" 
                            icon="pi pi-times" 
                            severity="secondary" 
                            onClick={() => { 
                                setActionDialog(false); 
                                setMotif(''); 
                            }} 
                        />
                        <Button 
                            label="Confirmer" 
                            icon="pi pi-check" 
                            severity="danger"
                            onClick={handleAction} 
                            loading={crudApi.loading} 
                        />
                    </div>
                </div>
            </Dialog>

            {/* ===== DIALOGUE DÉTAILS ===== */}
            <Dialog
                header="Détails de la carte"
                visible={!!selectedCard && !actionDialog}
                style={{ width: '750px', maxWidth: '95vw' }}
                onHide={() => setSelectedCard(null)}
                maximizable
            >
                {renderCardPreview()}
            </Dialog>
        </div>
    );
}