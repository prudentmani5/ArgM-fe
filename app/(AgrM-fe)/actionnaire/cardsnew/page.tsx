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
    cardStatus?: 'GENERATED' | 'PAYMENT_VERIFIED' | 'DELIVERED' | 'INVALIDATED';
    paymentVerified?: boolean;
    paymentVerifiedAt?: string;
    cardDeliveredAt?: string;
    paymentVerifiedBy?: string;  // ✅ Ajout
    cardDeliveredBy?: string;    // ✅ Ajout
    notes?: string;              // ✅ Ajout
    paymentAmount?: number;      // ✅ Déjà présent
    payment_amount?: number;     // Version snake_case du backend
    montant?: number;  // ✅ Ajouter le champ montant
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
    photo_passport_path?: string;
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

interface CardStatusDTO {
    numeroCarte: string;
    status: 'GENERATED' | 'PAYMENT_VERIFIED' | 'DELIVERED' | 'INVALIDATED';
    isActive: boolean;
    paymentVerified: boolean;
    paymentVerifiedAt: string | null;
    cardDeliveredAt: string | null;
    canBeDelivered: boolean;
    currentStep?: string;
    availableActions?: string[];
}

interface PaymentVerificationRequest {
    numeroCarte: string;
    amount: number; // ✅ Ajout du montant
    documentPaths?: string[];
    notes?: string;
}

interface CardDeliveryRequest {
    numeroCarte: string;
    notes?: string;
}


// Dans les interfaces
interface IncreaseActionsRequest {
    additionalActions: number;
    reason?: string;
    notes?: string;
}

interface IncreaseActionsResponse extends Actionnaire {
    // Même structure que Actionnaire
}

// ✅ Interface pour la sélection des actionnaires
interface SelectedActionnaire {
    id: number;
    nom: string;
    prenom: string;
    matricule1: string;
    nombreActions: number;
    photoPassportPath?: string;
    isSelected?: boolean;
}

// ✅ Interface pour la réponse de génération groupée
interface BulkCardGenerationResponse {
    generatedCards: ActionnaireCard[];
    cardNumbers: string[];
    mergedPdf: string; // Base64
    mergedPdfPath: string;
    totalGenerated: number;
    errors: string[];
    generatedAt: string;
    generatedBy: string;
    hasErrors: boolean;
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

    // ===== ÉTATS POUR LA GESTION DU PAIEMENT =====
    const [paymentDialog, setPaymentDialog] = useState(false);
    const [deliveryDialog, setDeliveryDialog] = useState(false);
    const [cardStatus, setCardStatus] = useState<CardStatusDTO | null>(null);
    const [paymentDocuments, setPaymentDocuments] = useState<File[]>([]);
    const [paymentNotes, setPaymentNotes] = useState('');
    const [paymentAmount, setPaymentAmount] = useState<number | null>(null); // ✅ Ajout du montant
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [processingDelivery, setProcessingDelivery] = useState(false);

    // ===== ÉTATS POUR L'AUGMENTATION DES ACTIONS =====
const [increaseActionsDialog, setIncreaseActionsDialog] = useState(false);
const [additionalActions, setAdditionalActions] = useState<number | null>(null);
const [increaseReason, setIncreaseReason] = useState('');
const [increaseNotes, setIncreaseNotes] = useState('');
const [processingIncrease, setProcessingIncrease] = useState(false);
const [selectedActionnaireForIncrease, setSelectedActionnaireForIncrease] = useState<Actionnaire | null>(null);

// ===== ÉTATS POUR LA GÉNÉRATION GROUPÉE =====
const [bulkGenerationDialog, setBulkGenerationDialog] = useState(false);
const [selectedActionnaires, setSelectedActionnaires] = useState<Actionnaire[]>([]);
const [bulkGenerationLoading, setBulkGenerationLoading] = useState(false);
const [bulkGenerationResult, setBulkGenerationResult] = useState<BulkCardGenerationResponse | null>(null);
const [selectionMode, setSelectionMode] = useState(false);
const [maxSelection, setMaxSelection] = useState(8);

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



    // ========== GESTION DE LA GÉNÉRATION GROUPÉE ==========

const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
        // Désélectionner tous les actionnaires
        setSelectedActionnaires([]);
    }
};

const toggleActionnaireSelection = (actionnaire: Actionnaire) => {
    setSelectedActionnaires(prev => {
        const isSelected = prev.some(a => a.id === actionnaire.id);
        if (isSelected) {
            return prev.filter(a => a.id !== actionnaire.id);
        } else {
            if (prev.length >= maxSelection) {
                showToast('warn', 'Attention', `Vous ne pouvez pas sélectionner plus de ${maxSelection} actionnaires`);
                return prev;
            }
            return [...prev, actionnaire];
        }
    });
};

const openBulkGenerationDialog = () => {
    if (selectedActionnaires.length === 0) {
        showToast('warn', 'Attention', 'Veuillez sélectionner au moins un actionnaire');
        return;
    }
    setBulkGenerationDialog(true);
};

const handleBulkGenerate = async () => {
    if (selectedActionnaires.length === 0) {
        showToast('warn', 'Attention', 'Aucun actionnaire sélectionné');
        return;
    }

    setBulkGenerationLoading(true);
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        const payload = {
            actionnaireIds: selectedActionnaires.map(a => a.id),
            notes: `Génération groupée de ${selectedActionnaires.length} cartes`
        };

        const response = await fetch(`${BASE_URL}/cards/bulk/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Performed-By': getUserAction()
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur ${response.status}`);
        }

        const result: BulkCardGenerationResponse = await response.json();
        setBulkGenerationResult(result);
        
        // ✅ Télécharger automatiquement le PDF groupé
        if (result.mergedPdf) {
            downloadBulkPDF(result.mergedPdf, result.cardNumbers);
        }
        
        showToast('success', '✅ Succès', 
            `${result.totalGenerated} cartes générées avec succès`
        );
        
        // ✅ Rafraîchir les données
        await loadActionnaires();
        if (selectedActionnaire?.id) {
            await loadCards(selectedActionnaire.id);
        }

    } catch (error) {
        console.error('Erreur génération groupée:', error);
        showToast('error', 'Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
        setBulkGenerationLoading(false);
    }
};

const downloadBulkPDF = (base64Data: string, cardNumbers: string[]) => {
    try {
        // Convertir le Base64 en blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Créer le lien de téléchargement
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cartes_${cardNumbers.length}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('success', '📄 PDF téléchargé', 'Le fichier a été téléchargé avec succès');
    } catch (error) {
        console.error('Erreur téléchargement PDF:', error);
        showToast('error', 'Erreur', 'Impossible de télécharger le PDF');
    }
};

// ✅ Vérifier si un actionnaire est sélectionné
const isActionnaireSelected = (actionnaire: Actionnaire) => {
    return selectedActionnaires.some(a => a.id === actionnaire.id);
};







    // ========== FONCTIONS DE GESTION PAIEMENT ==========






const verifyPayment = async (numeroCarte: string) => {
    if (!numeroCarte) {
        showToast('error', 'Erreur', 'Numéro de carte invalide');
        return;
    }

    if (!paymentAmount || paymentAmount <= 0) {
        showToast('warn', 'Attention', 'Veuillez indiquer le montant payé');
        return;
    }

    setProcessingPayment(true);
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        let documentPaths: string[] = [];
        if (paymentDocuments.length > 0) {
            for (const file of paymentDocuments) {
                try {
                    const base64 = await convertFileToBase64(file);
                    const uploadResponse = await fetch(`${BASE_URL}/files/upload`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            file: base64,
                            filename: file.name,
                            folder: 'payment_justifications'
                        })
                    });
                    if (uploadResponse.ok) {
                        const data = await uploadResponse.json();
                        documentPaths.push(data.path || data.filePath || data.url);
                    }
                } catch (uploadError) {
                    console.error('Erreur upload:', uploadError);
                }
            }
        }

        const response = await fetch(`${BASE_URL}/cards/payment/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Performed-By': getUserAction()
            },
            body: JSON.stringify({
                numeroCarte: numeroCarte,
                amount: paymentAmount || 0,
                documentPaths: documentPaths,
                notes: paymentNotes
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur ${response.status}`);
        }

        showToast('success', 'Succès', `Paiement de ${paymentAmount} BIF vérifié avec succès`);
        setPaymentDialog(false);
        setPaymentDocuments([]);
        setPaymentNotes('');
        setPaymentAmount(null);
        
        // ✅ 1. METTRE À JOUR LE STATE LOCAL IMMÉDIATEMENT
        setCards(prevCards => 
            prevCards.map(card => 
                card.numeroCarte === numeroCarte 
                    ? { 
                        ...card, 
                        cardStatus: 'PAYMENT_VERIFIED',
                        paymentVerified: true,
                        paymentVerifiedAt: new Date().toISOString(),
                        paymentVerifiedBy: getUserAction(),
                        paymentAmount: paymentAmount || 0 ,// ✅ Ajouter le montant
                        montant: paymentAmount || 0 // ✅ Ajouter aussi montant
                    } 
                    : card
            )
        );
        
        // ✅ 2. Recharger les données en arrière-plan
        await loadActionnaires();
        if (selectedActionnaire?.id) {
            await loadCards(selectedActionnaire.id);
        }
        await checkCardStatus(numeroCarte);

    } catch (error) {
        console.error('Erreur vérification paiement:', error);
        showToast('error', 'Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
        setProcessingPayment(false);
    }
};












/*const verifyPayment = async (numeroCarte: string) => {
    if (!numeroCarte) {
        showToast('error', 'Erreur', 'Numéro de carte invalide');
        return;
    }

    // ✅ Vérifier que le montant est renseigné
    if (!paymentAmount || paymentAmount <= 0) {
        showToast('warn', 'Attention', 'Veuillez indiquer le montant payé');
        return;
    }

    setProcessingPayment(true);
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        let documentPaths: string[] = [];
        if (paymentDocuments.length > 0) {
            for (const file of paymentDocuments) {
                const base64 = await convertFileToBase64(file);
                const uploadResponse = await fetch(`${BASE_URL}/files/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        file: base64,
                        filename: file.name,
                        folder: 'payment_justifications'
                    })
                });
                if (uploadResponse.ok) {
                    const data = await uploadResponse.json();
                    documentPaths.push(data.path);
                }
            }
        }

        const response = await fetch(`${BASE_URL}/cards/payment/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Performed-By': getUserAction()
            },
            body: JSON.stringify({
                numeroCarte: numeroCarte,
                amount: paymentAmount || 0,  // ✅ Envoyer le montant, même si 0
                documentPaths: documentPaths,
                notes: paymentNotes
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur ${response.status}`);
        }

        showToast('success', 'Succès', `Paiement de ${paymentAmount} BIF vérifié avec succès`);
        setPaymentDialog(false);
        setPaymentDocuments([]);
        setPaymentNotes('');
        setPaymentAmount(null);
        
        await loadActionnaires();
        if (selectedActionnaire?.id) {
            await loadCards(selectedActionnaire.id);
        }
        await checkCardStatus(numeroCarte);

    } catch (error) {
        console.error('Erreur vérification paiement:', error);
        showToast('error', 'Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
        setProcessingPayment(false);
    }
};*/

    const deliverCard = async (numeroCarte: string) => {
    if (!numeroCarte) {
        showToast('error', 'Erreur', 'Numéro de carte invalide');
        return;
    }

    setProcessingDelivery(true);
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        // ✅ Vérifier le statut avant de délivrer
        const statusResponse = await fetch(`${BASE_URL}/cards/${numeroCarte}/status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            
            // ✅ Si déjà délivrée
            if (statusData.status === 'DELIVERED') {
                const date = statusData.cardDeliveredAt ? formatDate(statusData.cardDeliveredAt) : 'date inconnue';
                const by = statusData.cardDeliveredBy || 'inconnu';
                showToast('info', 'ℹ️ Information', `Cette carte a déjà été délivrée le ${date} par ${by}`);
                setDeliveryDialog(false);
                setDeliveryNotes('');
                setProcessingDelivery(false);
                await loadCards(selectedActionnaire?.id || 0);
                return;
            }
            
            // ✅ Si paiement non vérifié
            if (!statusData.paymentVerified || statusData.status !== 'PAYMENT_VERIFIED') {
                showToast('warn', '⚠️ Attention', 'Le paiement doit être vérifié avant de délivrer la carte');
                setDeliveryDialog(false);
                setDeliveryNotes('');
                setProcessingDelivery(false);
                return;
            }
        }

        // ✅ Procéder à la délivrance
        const response = await fetch(`${BASE_URL}/cards/deliver`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Performed-By': getUserAction()
            },
            body: JSON.stringify({
                numeroCarte: numeroCarte,
                notes: deliveryNotes
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur ${response.status}`);
        }

        showToast('success', '✅ Succès', 'Carte délivrée avec succès');
        setDeliveryDialog(false);
        setDeliveryNotes('');
        
        await loadActionnaires();
        if (selectedActionnaire?.id) {
            await loadCards(selectedActionnaire.id);
        }
        await checkCardStatus(numeroCarte);

    } catch (error) {
        console.error('Erreur délivrance carte:', error);
        if (error instanceof Error) {
            if (error.message.includes('déjà été délivrée')) {
                showToast('info', 'ℹ️ Information', 'Cette carte a déjà été délivrée');
            } else if (error.message.includes('paiement')) {
                showToast('warn', '⚠️ Attention', 'Le paiement doit être vérifié avant la délivrance');
            } else {
                showToast('error', '❌ Erreur', error.message);
            }
        } else {
            showToast('error', '❌ Erreur', 'Erreur inconnue');
        }
    } finally {
        setProcessingDelivery(false);
    }
};

    const checkCardStatus = async (numeroCarte: string) => {
        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch(`${BASE_URL}/cards/${numeroCarte}/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCardStatus(data);
            }
            
        } catch (error) {
            console.error('Erreur récupération statut:', error);
        }
    };

    const openPaymentDialog = (card: ActionnaireCard) => {
        setSelectedCard(card);
        setPaymentDocuments([]);
        setPaymentNotes('');
        setPaymentAmount(null); // ✅ Réinitialiser le montant
        setPaymentDialog(true);
        checkCardStatus(card.numeroCarte);
    };

    const openDeliveryDialog = (card: ActionnaireCard) => {
        setSelectedCard(card);
        setDeliveryNotes('');
        setDeliveryDialog(true);
        checkCardStatus(card.numeroCarte);
    };


    // ========== GESTION DE L'AUGMENTATION DES ACTIONS ==========

const openIncreaseActionsDialog = (actionnaire: Actionnaire) => {
    setSelectedActionnaireForIncrease(actionnaire);
    setAdditionalActions(null);
    setIncreaseReason('');
    setIncreaseNotes('');
    setIncreaseActionsDialog(true);
};

const handleIncreaseActions = async () => {
    if (!selectedActionnaireForIncrease) {
        showToast('error', 'Erreur', 'Actionnaire non sélectionné');
        return;
    }

    if (!additionalActions || additionalActions <= 0) {
        showToast('warn', 'Attention', 'Veuillez indiquer un nombre d\'actions valide');
        return;
    }

    setProcessingIncrease(true);
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        const response = await fetch(
            `${BASE_URL}/actionnaires/${selectedActionnaireForIncrease.id}/increase-actions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Performed-By': getUserAction()
                },
                body: JSON.stringify({
                    additionalActions: additionalActions,
                    reason: increaseReason || 'Augmentation des actions',
                    notes: increaseNotes
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erreur ${response.status}`);
        }

        const data = await response.json();
        showToast('success', '✅ Succès', 
            `Actions augmentées de ${additionalActions} pour ${selectedActionnaireForIncrease.nom} ${selectedActionnaireForIncrease.prenom}`
        );
        
        setIncreaseActionsDialog(false);
        setAdditionalActions(null);
        setIncreaseReason('');
        setIncreaseNotes('');
        setSelectedActionnaireForIncrease(null);
        
        // ✅ Recharger les données
        await loadActionnaires();
        if (selectedActionnaire?.id) {
            await loadCards(selectedActionnaire.id);
        }

    } catch (error) {
        console.error('Erreur augmentation actions:', error);
        showToast('error', 'Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
        setProcessingIncrease(false);
    }
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
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProvinces(Array.isArray(data) ? data : []);
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
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCommunes(Array.isArray(data) ? data : []);
            } else {
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
            const zonesResponse = await fetch(zonesUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!zonesResponse.ok) {
                setCollines([]);
                return;
            }

            const zones = await zonesResponse.json();
            const allCollines: Colline[] = [];
            for (const zone of zones) {
                const collinesUrl = `${REF_URL}/collines/findbyzone/${zone.id}`;
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
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMaritalStatuses(Array.isArray(data) ? data : []);
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
        console.log('📋 DONNÉES BRUTES DU BACKEND:', JSON.stringify(data, null, 2));
        
        let transformedData = [];
        
        if (Array.isArray(data)) {
            transformedData = data.map((card: any) => {
                // ✅ Récupérer le montant
                const paymentAmount = card.montant || card.paymentAmount || card.payment_amount || 0;
                
                // ✅ Récupérer le statut
                let status = card.cardStatus || 'GENERATED';
                
                // ✅ Correction de la logique : priorité au statut du backend
                // Si le backend dit PAYMENT_VERIFIED, on le garde même si paymentVerified est false
                // (c'est une incohérence du backend à corriger)
                
                // ✅ Si la carte est délivrée
                if (card.cardDeliveredAt) {
                    status = 'DELIVERED';
                }
                
                // ✅ Si la carte est inactive
                if (card.isActive === false) {
                    status = 'INACTIVE';
                }
                
                // ✅ Correction : Si le backend dit PAYMENT_VERIFIED mais paymentVerified est false
                // On force paymentVerified à true pour refléter le statut
                const paymentVerified = card.paymentVerified === true || status === 'PAYMENT_VERIFIED';
                
                return {
                    ...card,
                    cardStatus: status,
                    status: status,
                    isActive: card.isActive === true,
                    paymentVerified: paymentVerified,
                    paymentAmount: paymentAmount,
                    montant: paymentAmount,  // Garder le champ original
                    // ✅ Si le montant est 0 mais que le paiement est vérifié, on met 0
                    // mais on pourrait aussi garder la valeur réelle
                };
            });
            
            console.log('📋 DONNÉES TRANSFORMÉES:', transformedData);
        }
        
        const sortedCards = transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));
        setCards(sortedCards);
        
    } catch (error) {
        console.error('❌ Erreur chargement cartes:', error);
        showToast('error', 'Erreur', 'Impossible de charger les cartes');
        setCards([]);
    } finally {
        setLoadingCards(false);
    }
}, []);





/*const loadCards = useCallback(async (actionnaireId: number) => {
    setLoadingCards(true);
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Token d\'authentification manquant');
        }

        const url = `${BASE_URL}/actionnaires/${actionnaireId}/cards`;
        
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
        console.log('📋 DONNÉES BRUTES DU BACKEND:', JSON.stringify(data, null, 2));
        
        // ✅ Vérifier chaque carte
        if (Array.isArray(data)) {
            data.forEach((card, index) => {
                console.log(`📇 Carte ${index + 1} (${card.numeroCarte}):`, {
                    cardStatus: card.cardStatus,
                    card_status: card.card_status,
                    paymentVerified: card.paymentVerified,
                    payment_verified: card.payment_verified,
                    isActive: card.isActive,
                    cardDeliveredAt: card.cardDeliveredAt
                });
            });
        }
        
        // ✅ Transformer les données en gardant le statut du backend
        let transformedData = [];
        
        if (Array.isArray(data)) {
            transformedData = data.map((card: any) => {

                 // ✅ Récupérer le montant (le backend utilise "montant")
                const paymentAmount = card.montant || card.paymentAmount || card.payment_amount || 0;


                // ✅ PRIORITÉ AU STATUT DU BACKEND
                let status = card.cardStatus || card.card_status || 'GENERATED';
                
                // ✅ Si le paiement est vérifié, forcer le statut
                if (card.paymentVerified === true || card.payment_verified === true) {
                    status = 'PAYMENT_VERIFIED';
                }
                
                // ✅ Si la carte est délivrée
                if (card.cardDeliveredAt) {
                    status = 'DELIVERED';
                }
                
                // ✅ Si la carte est inactive
                if (card.isActive === false) {
                    status = 'INACTIVE';
                }
                
                return {
                    ...card,
                    cardStatus: status,
                    status: status,
                    isActive: card.isActive === true,
                    paymentVerified: card.paymentVerified === true || card.payment_verified === true,
                     paymentAmount: paymentAmount, // ✅ Utiliser "montant"
                    montant: paymentAmount, // ✅ Garder aussi le champ original
                };
            });
            
            console.log('📋 DONNÉES TRANSFORMÉES:', transformedData);
        }
        
        const sortedCards = transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));
        setCards(sortedCards);
        
    } catch (error) {
        console.error('❌ Erreur chargement cartes:', error);
        showToast('error', 'Erreur', 'Impossible de charger les cartes');
        setCards([]);
    } finally {
        setLoadingCards(false);
    }
}, []);*/



   /* const loadCards = useCallback(async (actionnaireId: number) => {
        setLoadingCards(true);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const url = `${BASE_URL}/actionnaires/${actionnaireId}/cards`;
            
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
        } catch (error) {
            console.error('Erreur chargement cartes:', error);
            showToast('error', 'Erreur', 'Impossible de charger les cartes');
        } finally {
            setLoadingCards(false);
        }
    }, []);*/

    const loadHistory = useCallback(async (actionnaireId: number) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const url = `${BASE_URL}/actionnaires/${actionnaireId}/history`;
            
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
        
        if (!formData.nom?.trim()) errors.nom = 'Le nom est obligatoire';
        if (!formData.prenom?.trim()) errors.prenom = 'Le prénom est obligatoire';
        if (!formData.provinceId) errors.provinceId = 'La province est obligatoire';
        if (!formData.communeId) errors.communeId = 'La commune est obligatoire';
        if (!formData.dateNaissance) errors.dateNaissance = 'La date de naissance est obligatoire';
        if (!formData.etatCivilId) errors.etatCivilId = 'L\'état civil est obligatoire';
        if (!formData.numeroCNI?.trim()) errors.numeroCNI = 'Le numéro CNI est obligatoire';
        if (!formData.telephone?.trim()) errors.telephone = 'Le téléphone est obligatoire';
        
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


/*
    const handleSaveOLD = async () => {
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

        const payload: any = { ...formData };

        if (formPhotoFile) {
            const photoBase64 = await convertFileToBase64(formPhotoFile);
            payload.photoPassport = photoBase64;
        }

        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === null) {
                delete payload[key];
            }
        });

        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(payload)
        });

        // ✅ Lire la réponse même en cas d'erreur
        let errorData = null;
        try {
            errorData = await response.json();
        } catch (e) {
            // Si la réponse n'est pas du JSON
        }

        if (!response.ok) {
            // ✅ Gestion spécifique selon le code HTTP
            switch (response.status) {
                case 409: // Conflict - Doublon
                    const message = errorData?.message || 'Un actionnaire avec ces informations existe déjà';
                    showToast('error', '❌ Erreur de duplication', message);
                    // ✅ Mettre en évidence les champs en conflit
                    if (message.includes('CNI')) {
                        setFormErrors({ ...formErrors, numeroCNI: 'Ce numéro CNI existe déjà' });
                    }
                    if (message.includes('téléphone')) {
                        setFormErrors({ ...formErrors, telephone: 'Ce numéro de téléphone existe déjà' });
                    }
                    return;
                    
                case 400: // Bad Request - Validation
                    const validationMsg = errorData?.message || 'Données invalides';
                    showToast('error', '❌ Erreur de validation', validationMsg);
                    // ✅ Afficher les erreurs de validation
                    if (errorData?.errors) {
                        Object.entries(errorData.errors).forEach(([field, msg]) => {
                            setFormErrors(prev => ({ ...prev, [field]: msg as string }));
                        });
                    }
                    return;
                    
                case 401: // Unauthorized
                    showToast('error', '❌ Non authentifié', 'Veuillez vous reconnecter');
                    // Rediriger vers login
                    window.location.href = '/login';
                    return;
                    
                case 403: // Forbidden
                    showToast('error', '❌ Accès refusé', 'Vous n\'avez pas les droits nécessaires');
                    return;
                    
                default:
                    throw new Error(errorData?.message || `Erreur ${response.status}`);
            }
        }

        showToast('success', '✅ Succès', isEditing ? 'Actionnaire modifié avec succès' : 'Actionnaire créé avec succès');
        setFormDialog(false);
        resetForm();
        await loadActionnaires();

    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        showToast('error', '❌ Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
        setSaving(false);
    }
};
*/
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

            const payload: any = { ...formData };

            if (formPhotoFile) {
                const photoBase64 = await convertFileToBase64(formPhotoFile);
                payload.photoPassport = photoBase64;
            } else if (!isEditing) {
                showToast('warn', 'Attention', 'La photo est obligatoire pour la création');
                setSaving(false);
                return;
            }

            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined || payload[key] === null) {
                    delete payload[key];
                }
            });

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur ${response.status}`);
            }

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






















    // ========== GESTION DES CARTES ==========

    const openGenerateCardDialog = (actionnaire: Actionnaire) => {
        const photoPath = actionnaire.photoPassportPath || actionnaire.photo_passport_path;
        
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
            } else if (selectedActionnaire.photoPassport) {
                photoBase64 = selectedActionnaire.photoPassport;
            } else if (selectedActionnaire.photoPassportPath) {
                try {
                    const url = getFileViewUrl(selectedActionnaire.photoPassportPath);
                    if (url) {
                        const response = await fetch(url);
                        if (response.ok) {
                            const blob = await response.blob();
                            photoBase64 = await convertFileToBase64(new File([blob], 'photo.jpg'));
                        }
                    }
                } catch (error) {
                    console.error('Erreur récupération photo:', error);
                }
            } else if (selectedActionnaire.photo_passport_path) {
                try {
                    const url = getFileViewUrl(selectedActionnaire.photo_passport_path);
                    if (url) {
                        const response = await fetch(url);
                        if (response.ok) {
                            const blob = await response.blob();
                            photoBase64 = await convertFileToBase64(new File([blob], 'photo.jpg'));
                        }
                    }
                } catch (error) {
                    console.error('Erreur récupération photo:', error);
                }
            }

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


const getFormattedStatus = (card: ActionnaireCard): { label: string; severity: 'success' | 'info' | 'warning' | 'danger' } => {
    // ✅ Si la carte est inactive
    if (!card.isActive) {
        return { label: '❌ Inactive', severity: 'danger' };
    }
    
    // ✅ Si la carte est expirée
    if (card.expired) {
        return { label: '⏰ Expirée', severity: 'warning' };
    }
    
    // ✅ Utiliser le statut ou fallback
    const status = card.cardStatus || 'GENERATED';
    
    const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
        'GENERATED': { label: '📄 Générée', severity: 'warning' },
        'PAYMENT_VERIFIED': { label: '💰 Paiement vérifié', severity: 'info' },
        'DELIVERED': { label: '✅ Délivrée', severity: 'success' },
        'INVALIDATED': { label: '🚫 Invalidée', severity: 'danger' },
        'INACTIVE': { label: '❌ Inactive', severity: 'danger' },
    };
    
    return statusMap[status] || { label: '📄 Générée', severity: 'warning' };
};




const getStatusTag = (card: ActionnaireCard) => {
    const { label, severity } = getFormattedStatus(card);
    return <Tag value={label} severity={severity} />;
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

             {/* ✅ Nouveau bouton : Augmenter les actions */}
        <Button
            icon="pi pi-plus-circle"
            rounded
            text
            severity="success"
            onClick={() => openIncreaseActionsDialog(row)}
            tooltip="Augmenter les actions"
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

   
    


const cardsActionsTemplate = (row: ActionnaireCard) => {
    const { label, severity } = getFormattedStatus(row);
    const isOperational = row.isActive && !row.expired;
    const status = row.cardStatus || row.cardStatus || 'GENERATED';
    
    return (
        <div className="flex gap-1 flex-wrap">
            {/* 🔍 Détails - Toujours visible */}
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                onClick={() => viewCardDetails(row)}
                tooltip="Détails"
                size="small"
            />
            
            {/* 📄 Télécharger PDF - Visible si active et non délivrée */}
            {isOperational && status !== 'DELIVERED' && status !== 'INVALIDATED' && (
                <Button
                    icon="pi pi-file-pdf"
                    rounded
                    text
                    severity="secondary"
                    onClick={() => handleDownloadPDF(row)}
                    tooltip="Télécharger PDF"
                    size="small"
                />
            )}
            
            {/* 💰 Vérifier paiement - UNIQUEMENT si GENERATED */}
            {isOperational && status === 'GENERATED' && (
                <Button
                    icon="pi pi-money-bill"
                    rounded
                    text
                    severity="warning"
                    onClick={() => openPaymentDialog(row)}
                    tooltip="Vérifier paiement"
                    size="small"
                />
            )}
            
            {/* ✅ Délivrer - UNIQUEMENT si PAYMENT_VERIFIED */}
            {isOperational && status === 'PAYMENT_VERIFIED' && (
                <Button
                    icon="pi pi-check-circle"
                    rounded
                    text
                    severity="success"
                    onClick={() => openDeliveryDialog(row)}
                    tooltip="Délivrer la carte"
                    size="small"
                />
            )}
            
            {/* ❌ Invalider - Visible si ACTIVE et non délivrée */}
            {isOperational &&  status !== 'INVALIDATED' && (
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
            
            {/* ✅ Afficher le statut en tag si la carte est délivrée ou invalidée */}
            {(status === 'DELIVERED' || status === 'INVALIDATED' ) && (
                <Tag value={label} severity={severity} />
            )}
        </div>
    );
};








const cardsActionsTemplateold = (row: ActionnaireCard) => {
    // ✅ Déduire le statut
    let status = row.cardStatus || 'GENERATED';
    
     if (row.cardDeliveredAt) {
        status = 'DELIVERED';
    } else if (row.paymentVerified === true) {
        status = 'PAYMENT_VERIFIED';
    }
    
    const isOperational = row.isActive && !row.expired;
    
    return (
        <div className="flex gap-1 flex-wrap">
            {/* 🔍 Détails - Toujours visible */}
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                onClick={() => viewCardDetails(row)}
                tooltip="Détails"
                size="small"
            />
            
            {/* 📄 Télécharger PDF - Visible si active et non délivrée */}
            {isOperational && status !== 'DELIVERED' && status !== 'INVALIDATED'  && (
                <Button
                    icon="pi pi-file-pdf"
                    rounded
                    text
                    severity="secondary"
                    onClick={() => handleDownloadPDF(row)}
                    tooltip="Télécharger PDF"
                    size="small"
                />
            )}
            
            {/* 💰 Vérifier paiement - UNIQUEMENT si GENERATED */}
            {isOperational && status === 'GENERATED' && (
                <Button
                    icon="pi pi-money-bill"
                    rounded
                    text
                    severity="warning"
                    onClick={() => openPaymentDialog(row)}
                    tooltip="Vérifier paiement"
                    size="small"
                />
            )}
            
            {/* ✅ Délivrer - UNIQUEMENT si PAYMENT_VERIFIED */}
            {isOperational && status === 'PAYMENT_VERIFIED' && (
                <Button
                    icon="pi pi-check-circle"
                    rounded
                    text
                    severity="success"
                    onClick={() => openDeliveryDialog(row)}
                    tooltip="Délivrer la carte"
                    size="small"
                />
            )}
            
            {/* ❌ Invalider - Visible si ACTIVE et non délivrée */}
            {isOperational && status !== 'DELIVERED' && status !== 'INVALIDATED' && (
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
};





























    const cardInfoTemplate = (row: ActionnaireCard) => (
        <div>
            <div>{row.snapshotNom} {row.snapshotPrenom}</div>
            <small className="text-600">{row.snapshotMatricule}</small>
        </div>
    );



    // ✅ Surveiller les changements de cartes pour déboguer
useEffect(() => {
    if (cards.length > 0) {
        console.log('📊 Cartes actuelles avec statuts déduits:');
        cards.forEach((card, index) => {
            console.log(`📇 Carte ${index + 1}:`, {
                numeroCarte: card.numeroCarte,
                cardStatus: card.cardStatus,
                isActive: card.isActive,
                paymentVerified: card.paymentVerified,
                cardDeliveredAt: card.cardDeliveredAt || 'NON'
            });
        });
    }
}, [cards]);

// ✅ Surveiller les changements de cartes pour forcer le re-render
useEffect(() => {
    // Ce useEffect s'exécute à chaque changement de cards
    // Il permet de maintenir l'UI à jour
}, [cards]);








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
                        {/* ✅ Bouton de sélection multiple */}
    <Button
        icon={selectionMode ? "pi pi-times" : "pi pi-check-square"}
        label={selectionMode ? "Annuler la sélection" : "Sélection multiple"}
        severity={selectionMode ? "danger" : "info"}
        size="small"
        onClick={toggleSelectionMode}
        className="p-button-sm"
    />
    {/* ✅ Bouton de génération groupée */}
    {selectionMode && (
        <Button
            icon="pi pi-file-pdf"
            label={`Générer ${selectedActionnaires.length}/${maxSelection} cartes`}
            severity="success"
            size="small"
            onClick={openBulkGenerationDialog}
            disabled={selectedActionnaires.length === 0}
            className="p-button-sm"
        />
    )}
                        <Button
                            label="Nouvel Actionnaire"
                            icon="pi pi-plus"
                            onClick={openCreateDialog}
                            className="p-button-sm"
                        />
                    </div>
                </div>

                {/* ✅ Afficher le nombre d'actionnaires sélectionnés */}
{selectionMode && (
    <div className="mt-2 p-2 surface-100 border-round">
        <div className="flex align-items-center justify-content-between">
            <span>
                <i className="pi pi-check-square mr-2" />
                {selectedActionnaires.length} actionnaire(s) sélectionné(s) sur {maxSelection} maximum
            </span>
            <span className="text-400">
                Cliquez sur une ligne pour sélectionner/désélectionner
            </span>
        </div>
    </div>
)}

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

<DataTable value={actionnairesFiltered}
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
    // ✅ Ajouter cellSelection avec une valeur par défaut
    cellSelection={false}
    {...(selectionMode ? {
        selectionMode: 'multiple',
        selection: selectedActionnaires,
        onSelectionChange: (e) => {
            if (e.value.length <= maxSelection) {
                setSelectedActionnaires(e.value);
            } else {
                showToast('warn', 'Attention', `Vous ne pouvez pas sélectionner plus de ${maxSelection} actionnaires`);
            }
        },
        dataKey: 'id'
    } : {})}
>
    {selectionMode && (
        <Column 
            selectionMode="multiple" 
            headerStyle={{ width: '3rem' }} 
            style={{ width: '3rem' }}
        />
    )}
    
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
        field="numeroCNI" 
        header="CNI" 
        style={{ minWidth: '120px' }}
    />
    <Column 
        field="telephone" 
        header="Téléphone" 
        style={{ minWidth: '120px' }}
    />
    <Column 
        field="compteBancaire" 
        header="Compte" 
        style={{ minWidth: '120px' }}
    />
    <Column 
        field="nombreActions" 
        header="Actions" 
        sortable 
        style={{ width: '100px' }}
        body={(row: Actionnaire) => (
            <div>
                <span className="font-bold">{row.nombreActions || 0}</span>
            </div>
        )}
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
            tableStyle={{ minWidth: '50rem' }}
            className="p-datatable-sm"
        >
            <Column field="numeroCarte" header="N° Carte" sortable style={{ width: '150px' }} />
            <Column header="Actionnaire" body={cardInfoTemplate} style={{ minWidth: '150px' }} />
            <Column field="snapshotNombreActions" header="Actions" style={{ width: '80px' }} />
            
        {/* ✅ Colonne Statut Workflow (card_status) */}
<Column 
    header="Statut workflow" 
    body={(row: ActionnaireCard) => {
        // ✅ Récupérer le statut depuis row.cardStatus
        const status = row.cardStatus || 'GENERATED';
        
        // ✅ Si la carte est inactive, forcer le statut INACTIVE
        if (!row.isActive) {
            return <Tag value="❌ Inactive" severity="danger" />;
        }
        
        // ✅ Si la carte est délivrée
        if (row.cardDeliveredAt) {
            return <Tag value="✅ Délivrée" severity="success" />;
        }
        
        // ✅ Si le paiement est vérifié
        if (row.paymentVerified === true) {
            return <Tag value="💰 Paiement vérifié" severity="info" />;
        }
        
        const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
            'GENERATED': { label: '📄 Générée', severity: 'warning' },
            'PAYMENT_VERIFIED': { label: '💰 Paiement vérifié', severity: 'info' },
            'DELIVERED': { label: '✅ Délivrée', severity: 'success' },
            'INVALIDATED': { label: '🚫 Invalidée', severity: 'danger' },
            'INACTIVE': { label: '❌ Inactive', severity: 'danger' },
        };
        
        const config = statusMap[status] || { label: '📄 Générée', severity: 'warning' };
        return <Tag value={config.label} severity={config.severity} />;
    }}
    style={{ width: '150px' }}
/>
            
            {/* ✅ Colonne Statut Opérationnel (is_active) */}
            <Column 
                header="Statut opérationnel" 
                body={(row: ActionnaireCard) => {
                    if (!row.isActive) {
                        return <Tag value="Inactive" severity="danger" icon="pi pi-times-circle" />;
                    }
                    if (row.expired) {
                        return <Tag value="⏰ Expirée" severity="warning" icon="pi pi-clock" />;
                    }
                    return <Tag value="✅ Active" severity="success" icon="pi pi-check-circle" />;
                }}
                style={{ width: '120px' }}
            />
            
            <Column field="generatedAt" header="Générée le" body={(row) => formatDate(row.generatedAt)} style={{ width: '120px' }} />
            
            {/* ✅ Colonne Actions */}
            <Column 
                header="Actions" 
                body={cardsActionsTemplate} 
                style={{ width: '250px', minWidth: '250px' }} 
            />
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
                            <h5>Documents, Contact & Adresse </h5>
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
                       

                        {/* Délivrance identité */}
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

                        {/* Photo */}
                        <div className="col-12">
                            <h5>Photo</h5>
                        </div>
                        <div className="col-12">
                            <div className="field">
                                <label>
                                    Photo passport 
                                    {!isEditing && <span className="text-danger">*</span>}
                                </label>
                                
                                {formErrors.photo && (
                                    <div className="mb-2">
                                        <small className="text-danger">{formErrors.photo}</small>
                                    </div>
                                )}
                                
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
                                                if (formErrors.photo) {
                                                    setFormErrors({ ...formErrors, photo: '' });
                                                }
                                            }
                                        }}
                                        onRemove={() => {
                                            setFormPhotoFile(null);
                                            setFormPhotoPreview(null);
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

{/* ===== DIALOGUE VÉRIFICATION PAIEMENT ===== */}
<Dialog
    header="Vérification du paiement"
    visible={paymentDialog}
    style={{ width: '500px' }}
    onHide={() => {
        setPaymentDialog(false);
        setPaymentDocuments([]);
        setPaymentNotes('');
        setPaymentAmount(null);
    }}
>
    <div className="p-fluid">
        {selectedCard && (
            <div className="field">
                <label className="font-bold">Carte</label>
                <p className="text-600">
                    N° {selectedCard.numeroCarte}
                    <br />
                    <small>{selectedCard.snapshotNom} {selectedCard.snapshotPrenom}</small>
                </p>
                
                {cardStatus && (
                    <div className="mt-2 p-2 surface-100 border-round">
                        <div><strong>Statut actuel:</strong> {cardStatus.status}</div>
                        <div><strong>Paiement vérifié:</strong> {cardStatus.paymentVerified ? '✅ Oui' : '❌ Non'}</div>
                    </div>
                )}
            </div>
        )}

        {/* ✅ Champ Montant payé */}
        <div className="field">
            <label htmlFor="paymentAmount">Montant payé (BIF) <span className="text-danger">*</span></label>
            <InputText
                id="paymentAmount"
                type="number"
                min="0"
                step="100"
                value={paymentAmount?.toString() || ''}
                onChange={(e) => {
                    const value = e.target.value;
                    setPaymentAmount(value ? parseFloat(value) : null);
                }}
                placeholder="Ex: 5000"
                className="w-full"
                disabled={processingPayment}
            />
            <small className="text-400">Indiquez le montant payé par l'actionnaire</small>
        </div>

         <div className="field">
            <label htmlFor="paymentNotes">Reference de payement</label>
            <InputTextarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
                placeholder="Référence de la pièce sur la vérification..."
                disabled={processingPayment}
            />
        </div>

        <div className="field">
            <label>Justificatifs de paiement</label>
            <FileUpload
                accept="image/*,application/pdf"
                maxFileSize={10000000}
                multiple
                onSelect={(e: FileUploadSelectEvent) => {
                    const files = e.files;
                    if (files && files.length > 0) {
                        const fileList = Array.from(files as File[]);
                        setPaymentDocuments(fileList);
                        showToast('info', 'Documents sélectionnés', `${fileList.length} fichier(s)`);
                    }
                }}
                onRemove={() => setPaymentDocuments([])}
                chooseLabel="Choisir les justificatifs"
                className="mb-3"
                disabled={processingPayment}
            />
            {paymentDocuments.length > 0 && (
                <div className="mt-2">
                    {paymentDocuments.map((file, index) => (
                        <div key={index} className="flex align-items-center gap-2 p-1 surface-100 border-round">
                            <i className="pi pi-file" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-400 text-xs">({(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

       

        <div className="flex gap-2 justify-content-end mt-3">
            <Button
                label="Annuler"
                icon="pi pi-times"
                severity="secondary"
                onClick={() => {
                    setPaymentDialog(false);
                    setPaymentDocuments([]);
                    setPaymentNotes('');
                    setPaymentAmount(null);
                }}
                disabled={processingPayment}
            />
            <Button
                label="Vérifier le paiement"
                icon="pi pi-check"
                onClick={() => verifyPayment(selectedCard?.numeroCarte || '')}
                loading={processingPayment}
                disabled={processingPayment || !paymentAmount || paymentAmount <= 0}
            />
        </div>
    </div>
</Dialog>

            {/* ===== DIALOGUE DÉLIVRANCE CARTE ===== */}
            <Dialog
                header="Délivrance de la carte"
                visible={deliveryDialog}
                style={{ width: '450px' }}
                onHide={() => {
                    setDeliveryDialog(false);
                    setDeliveryNotes('');
                }}
            >
                <div className="p-fluid">
                    {selectedCard && (
                        <div className="field">
                            <label className="font-bold">Carte</label>
                            <p className="text-600">
                                N° {selectedCard.numeroCarte}
                                <br />
                                <small>{selectedCard.snapshotNom} {selectedCard.snapshotPrenom}</small>
                            </p>
                            
                            {cardStatus && (
                                <div className="mt-2 p-2 surface-100 border-round">
                                    <div><strong>Statut actuel:</strong> {cardStatus.status}</div>
                                    <div><strong>Paiement vérifié:</strong> {cardStatus.paymentVerified ? '✅ Oui' : '❌ Non'}</div>
                                    {cardStatus.paymentVerifiedAt && (
                                        <div><strong>Vérifié le:</strong> {formatDate(cardStatus.paymentVerifiedAt)}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="field">
                        <label htmlFor="deliveryNotes">Notes de délivrance</label>
                        <InputTextarea
                            id="deliveryNotes"
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                            rows={3}
                            placeholder="Notes sur la délivrance..."
                            disabled={processingDelivery}
                        />
                    </div>

                    <div className="flex gap-2 justify-content-end mt-3">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => {
                                setDeliveryDialog(false);
                                setDeliveryNotes('');
                            }}
                            disabled={processingDelivery}
                        />
                        <Button
                            label="Délivrer la carte"
                            icon="pi pi-check"
                            severity="success"
                            onClick={() => deliverCard(selectedCard?.numeroCarte || '')}
                            loading={processingDelivery}
                            disabled={processingDelivery}
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
            {/* ===== DIALOGUE DÉTAILS CARTE AMÉLIORÉ ===== */}
<Dialog
    header="Détails de la carte"
    visible={cardDialog}
    style={{ width: '800px', maxWidth: '95vw' }}
    onHide={() => {
        setCardDialog(false);
        setSelectedCard(null);
    }}
    maximizable
    className="p-dialog-card-details"
>
    {selectedCard && (
        <div className="p-3">
            {/* ✅ En-tête avec statut */}
            <div className="flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div>
                    <h4 className="m-0">Carte N° {selectedCard.numeroCarte}</h4>
                    <small className="text-400">ID: {selectedCard.id}</small>
                </div>
                <div className="flex align-items-center gap-2">
                    {getStatusTag(selectedCard)}
                    {selectedCard.paymentVerified && (
                        <Tag value="💰 Payé" severity="success" icon="pi pi-money-bill" />
                    )}
                </div>
            </div>

            <Divider />

            <div className="grid">
                {/* ✅ Colonne gauche - Informations générales */}
                <div className="col-12 md:col-6">
                    <Card title="👤 Informations générales" className="h-full">
                        <div className="field-grid">
                            <div className="field-row">
                                <span className="field-label">Matricule:</span>
                                <span className="field-value font-semibold">{selectedCard.snapshotMatricule}</span>
                            </div>
                            <div className="field-row">
                                <span className="field-label">Nom:</span>
                                <span className="field-value">{selectedCard.snapshotNom}</span>
                            </div>
                            <div className="field-row">
                                <span className="field-label">Prénom:</span>
                                <span className="field-value">{selectedCard.snapshotPrenom}</span>
                            </div>
                            <div className="field-row">
                                <span className="field-label">Téléphone:</span>
                                <span className="field-value">{selectedCard.snapshotTelephone || 'Non renseigné'}</span>
                            </div>
                            <div className="field-row">
                                <span className="field-label">Nombre d'actions:</span>
                                <span className="field-value font-bold text-primary">{selectedCard.snapshotNombreActions}</span>
                            </div>
                            {selectedCard.cardStatus && (
                                <div className="field-row">
                                    <span className="field-label">Statut:</span>
                                    <span className="field-value">
                                        <Tag value={selectedCard.cardStatus} severity={
                                            selectedCard.cardStatus === 'DELIVERED' ? 'success' :
                                            selectedCard.cardStatus === 'PAYMENT_VERIFIED' ? 'info' :
                                            selectedCard.cardStatus === 'GENERATED' ? 'warning' :
                                            'danger'
                                        } />
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* ✅ Colonne droite - Dates et paiement */}
                <div className="col-12 md:col-6">
                    <Card title="📅 Dates importantes" className="h-full">
                        <div className="field-grid">
                            <div className="field-row">
                                <span className="field-label">Générée le:</span>
                                <span className="field-value">{formatDate(selectedCard.generatedAt)}</span>
                            </div>
                            
                            {selectedCard.paymentVerifiedAt && (
                                <div className="field-row">
                                    <span className="field-label">💰 Paiement vérifié le:</span>
                                    <span className="field-value">{formatDate(selectedCard.paymentVerifiedAt)}</span>
                                </div>
                            )}
                            {selectedCard.paymentVerified && (
                                <div className="field-row">
                                    <span className="field-label">Vérifié par:</span>
                                    <span className="field-value">{selectedCard.paymentVerified}</span>
                                </div>
                            )}
                            {selectedCard.cardDeliveredAt && (
                                <div className="field-row">
                                    <span className="field-label">✅ Délivrée le:</span>
                                    <span className="field-value">{formatDate(selectedCard.cardDeliveredAt)}</span>
                                </div>
                            )}
                            {selectedCard.cardDeliveredAt && (
                                <div className="field-row">
                                    <span className="field-label">Délivrée le :</span>
                                    <span className="field-value">{selectedCard.cardDeliveredAt}</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* ✅ Informations de paiement - Pleine largeur */}
                <div className="col-12">
                    <Card title="💳 Informations de paiement">
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <div className="field-row">
                                    <span className="field-label">Montant payé:</span>
                                    <span className="field-value font-bold text-success">
                                        {(() => {
                                            // ✅ Essayer toutes les sources
                                            const amount = selectedCard.montant !== undefined && selectedCard.montant !== null 
                                                        ? selectedCard.montant 
                                                        : selectedCard.paymentAmount || 0;
                                            
                                            // ✅ Si le paiement est vérifié mais que le montant est 0 ou null
                                            if (selectedCard.paymentVerified && (amount === 0 || amount === null)) {
                                                return '0 BIF (montant non spécifié)';
                                            }
                                            
                                            return amount > 0 ? `${amount} BIF` : 'Non renseigné';
                                        })()}
                                    </span>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="field-row">
                                    <span className="field-label">Paiement vérifié:</span>
                                    <span className="field-value">
                                        {selectedCard.paymentVerified ? 
                                            <Tag value="✅ Oui" severity="success" /> : 
                                            <Tag value="❌ Non" severity="danger" />
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <div className="field-row">
                                    <span className="field-label">Statut final:</span>
                                    <span className="field-value">
                                        {selectedCard.cardStatus === 'DELIVERED' && (
                                            <Tag value="✅ Délivrée" severity="success" icon="pi pi-check-circle" />
                                        )}
                                        {selectedCard.cardStatus === 'PAYMENT_VERIFIED' && (
                                            <Tag value="⏳ En attente de délivrance" severity="info" icon="pi pi-clock" />
                                        )}
                                        {selectedCard.cardStatus === 'GENERATED' && (
                                            <Tag value="📄 Générée" severity="warning" icon="pi pi-file" />
                                        )}
                                        {selectedCard.cardStatus === 'INVALIDATED' && (
                                            <Tag value="🚫 Invalidée" severity="danger" icon="pi pi-times-circle" />
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {selectedCard.invalidationReason && (
                            <div className="mt-2 p-2 surface-100 border-round border-1 border-red-300">
                                <strong className="text-red-600">❌ Motif invalidation:</strong>
                                <p className="text-600 mt-1">{selectedCard.invalidationReason}</p>
                            </div>
                        )}
                        {(selectedCard as any).notes && (
                            <div className="mt-2 p-2 surface-100 border-round">
                                <strong>📝 Notes:</strong>
                                <p className="text-600 mt-1">{(selectedCard as any).notes}</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* ✅ Images - QR Code et Photo */}
                <div className="col-12">
                   
                    <div className="flex gap-4 justify-content-center flex-wrap">
                        {/* QR Code */}
                        <div className="text-center">
                            <h6 className="m-0 mb-2">📱 QR Code</h6>
                            <div className="p-2 surface-100 border-round">
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
                                                className="border-round"
                                            />
                                        );
                                    } else {
                                        return (
                                            <div className="flex flex-column align-items-center justify-content-center surface-100 border-round" 
                                                 style={{ width: '150px', height: '150px' }}>
                                                <i className="pi pi-qrcode text-5xl text-400" />
                                                <p className="text-600 text-sm mt-2">QR Code non disponible</p>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>

                        {/* Photo */}
                        <div className="text-center">
                            <h6 className="m-0 mb-2">🖼️ Photo</h6>
                            <div className="p-2 surface-100 border-round">
                                {(() => {
                                    let photoSrc = null;
                                    
                                    if (selectedCard.snapshotPhotoPath) {
                                        photoSrc = getFileViewUrl(selectedCard.snapshotPhotoPath);
                                    } else if ((selectedCard as any).photoPath) {
                                        photoSrc = getFileViewUrl((selectedCard as any).photoPath);
                                    } 
                                    
                                    if (photoSrc) {
                                        return (
                                            <Image
                                                src={photoSrc}
                                                alt="Photo de l'actionnaire"
                                                width="150"
                                                height="150"
                                                preview
                                                className="border-round object-fit-cover"
                                            />
                                        );
                                    } else {
                                        return (
                                            <div className="flex flex-column align-items-center justify-content-center surface-100 border-round" 
                                                 style={{ width: '150px', height: '150px' }}>
                                                <i className="pi pi-user text-5xl text-400" />
                                                <p className="text-600 text-sm mt-2">Photo non disponible</p>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ Actions */}
                <div className="col-12">
                    <Divider />
                    <div className="flex gap-2 justify-content-center flex-wrap">
                        <Button
                            icon="pi pi-file-pdf"
                            label="📄 Télécharger le PDF"
                            onClick={() => handleDownloadPDF(selectedCard)}
                            className="p-button-sm p-button-success"
                        />
                        {selectedCard.isActive && selectedCard.cardStatus !== 'DELIVERED' && (
                            <Button
                                icon="pi pi-print"
                                label="🖨️ Imprimer"
                                onClick={() => window.print()}
                                className="p-button-sm p-button-secondary"
                            />
                        )}
                        {selectedCard.isActive && selectedCard.cardStatus !== 'DELIVERED' && (
                            <Button
                                icon="pi pi-envelope"
                                label="📧 Envoyer par email"
                                className="p-button-sm p-button-info"
                                onClick={() => {
                                    // Fonction d'envoi par email
                                    showToast('info', 'Information', 'Fonctionnalité à implémenter');
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )}
</Dialog>












{/* ===== DIALOGUE AUGMENTATION DES ACTIONS ===== */}
<Dialog
    header="Augmenter les actions de l'actionnaire"
    visible={increaseActionsDialog}
    style={{ width: '500px' }}
    onHide={() => {
        setIncreaseActionsDialog(false);
        setAdditionalActions(null);
        setIncreaseReason('');
        setIncreaseNotes('');
        setSelectedActionnaireForIncrease(null);
    }}
>
    <div className="p-fluid">
        {selectedActionnaireForIncrease && (
            <>
                <div className="field">
                    <label className="font-bold">Actionnaire</label>
                    <p className="text-600">
                        {selectedActionnaireForIncrease.nom} {selectedActionnaireForIncrease.prenom}
                        <br />
                        <small>Matricule: {selectedActionnaireForIncrease.matricule1}</small>
                    </p>
                </div>

                <div className="field">
                    <label className="font-bold">Actions actuelles</label>
                    <p className="text-600 text-xl font-bold">
                        {selectedActionnaireForIncrease.nombreActions || 0} actions
                    </p>
                </div>

                <div className="field">
                    <label htmlFor="additionalActions">
                        Nombre d'actions à ajouter <span className="text-danger">*</span>
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-plus" />
                        </span>
                        <InputText
                            id="additionalActions"
                            type="number"
                            min="1"
                            value={additionalActions?.toString() || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setAdditionalActions(value ? parseInt(value) : null);
                            }}
                            placeholder="Ex: 5"
                            className="w-full"
                            disabled={processingIncrease}
                        />
                    </div>
                    <small className="text-400">
                        Ce nombre sera ajouté au nombre d'actions actuel
                    </small>
                    {additionalActions && additionalActions > 0 && (
                        <div className="mt-2 p-2 surface-100 border-round">
                            <strong>Nouveau total:</strong> {(selectedActionnaireForIncrease.nombreActions || 0) + additionalActions} actions
                        </div>
                    )}
                </div>

                <div className="field">
                    <label htmlFor="increaseReason">Motif</label>
                    <Dropdown
                        id="increaseReason"
                        value={increaseReason}
                        options={[
                            { label: 'Achat d\'actions', value: 'Achat d\'actions' },
                            { label: 'Augmentation de capital', value: 'Augmentation de capital' },
                            { label: 'Donation', value: 'Donation' },
                            { label: 'Héritage', value: 'Héritage' },
                            { label: 'Autre', value: 'Autre' }
                        ]}
                        optionLabel="label"
                        optionValue="value"
                        onChange={(e) => setIncreaseReason(e.value)}
                        placeholder="Sélectionner un motif"
                        disabled={processingIncrease}
                    />
                </div>

                <div className="field">
                    <label htmlFor="increaseNotes">Notes</label>
                    <InputTextarea
                        id="increaseNotes"
                        value={increaseNotes}
                        onChange={(e) => setIncreaseNotes(e.target.value)}
                        rows={3}
                        placeholder="Informations complémentaires..."
                        disabled={processingIncrease}
                    />
                </div>

                <div className="flex gap-2 justify-content-end mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        severity="secondary"
                        onClick={() => {
                            setIncreaseActionsDialog(false);
                            setAdditionalActions(null);
                            setIncreaseReason('');
                            setIncreaseNotes('');
                            setSelectedActionnaireForIncrease(null);
                        }}
                        disabled={processingIncrease}
                    />
                    <Button
                        label="Augmenter les actions"
                        icon="pi pi-check"
                        severity="success"
                        onClick={handleIncreaseActions}
                        loading={processingIncrease}
                        disabled={processingIncrease || !additionalActions || additionalActions <= 0}
                    />
                </div>
            </>
        )}
    </div>
</Dialog>











{/* ===== DIALOGUE GÉNÉRATION GROUPÉE ===== */}
<Dialog
    header="Génération groupée de cartes"
    visible={bulkGenerationDialog}
    style={{ width: '600px' }}
    onHide={() => {
        setBulkGenerationDialog(false);
        setBulkGenerationResult(null);
    }}
    closable={!bulkGenerationLoading}
>
    <div className="p-fluid">
        {/* ✅ Résumé des actionnaires sélectionnés */}
        <div className="field">
            <label className="font-bold">Actionnaires sélectionnés</label>
            <div className="p-2 surface-100 border-round" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {selectedActionnaires.map((a, index) => (
                    <div key={a.id} className="flex align-items-center justify-content-between p-1 border-bottom-1 surface-border">
                        <div>
                            <span className="font-semibold">{index + 1}.</span>
                            <span className="ml-2">{a.nom} {a.prenom}</span>
                            <small className="text-400 ml-2">({a.matricule1})</small>
                        </div>
                        <div>
                            <span className="text-400">Actions: {a.nombreActions || 0}</span>
                            {a.activeCard && (
                                <Tag value="Carte active" severity="info" className="ml-2" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <small className="text-400">
                {selectedActionnaires.length} actionnaire(s) sélectionné(s) sur {maxSelection} maximum
            </small>
        </div>

        {/* ✅ Informations sur le format PDF */}
<div className="field">
    <div className="p-2 surface-100 border-round border-1 border-info">
        <div className="flex align-items-center gap-2">
            <i className="pi pi-info-circle text-info" />
            <span className="text-600 font-bold">Format du PDF</span>
        </div>
        <ul className="text-600 mt-1" style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
            <li>Toutes les cartes seront sur <strong>une seule page A4</strong></li>
            <li>Disposition en <strong>grille de 4x2</strong> (4 colonnes, 2 lignes)</li>
            <li>Chaque carte contient: <strong>Photo, QR Code, Informations</strong></li>
            <li>Optimisé pour l'impression sur <strong>une seule feuille</strong></li>
        </ul>
    </div>
</div>

        {/* ✅ Résultat de la génération */}
        {bulkGenerationResult && (
            <div className="field">
                <div className="p-2 surface-100 border-round border-1 border-success">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-check-circle text-success" />
                        <span className="text-600 font-bold">Génération terminée</span>
                    </div>
                    <div className="mt-1">
                        <div><strong>Total généré:</strong> {bulkGenerationResult.totalGenerated} cartes</div>
                        <div><strong>Numéros:</strong> {bulkGenerationResult.cardNumbers.join(', ')}</div>
                        {bulkGenerationResult.errors && bulkGenerationResult.errors.length > 0 && (
                            <div className="mt-1 text-red-600">
                                <strong>Erreurs:</strong>
                                <ul>
                                    {bulkGenerationResult.errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <div className="flex gap-2 justify-content-end mt-3">
            <Button
                label="Annuler"
                icon="pi pi-times"
                severity="secondary"
                onClick={() => {
                    setBulkGenerationDialog(false);
                    setBulkGenerationResult(null);
                }}
                disabled={bulkGenerationLoading}
            />
            {!bulkGenerationResult && (
                <Button
                    label={`Générer ${selectedActionnaires.length} cartes`}
                    icon="pi pi-file-pdf"
                    severity="success"
                    onClick={handleBulkGenerate}
                    loading={bulkGenerationLoading}
                    disabled={bulkGenerationLoading}
                />
            )}
            {bulkGenerationResult && (
                <Button
                    label="Fermer"
                    icon="pi pi-check"
                    severity="secondary"
                    onClick={() => {
                        setBulkGenerationDialog(false);
                        setBulkGenerationResult(null);
                        setSelectionMode(false);
                        setSelectedActionnaires([]);
                    }}
                />
            )}
        </div>
    </div>
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