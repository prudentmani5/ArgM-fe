'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { FacServicePresteEntree } from './FacServicePresteEntree';
import FacServicePresteForm from './FacServicePresteForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { FacService } from '../../../(settings)/settings/facService/FacService';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { Importer } from '../../../(settings)/settings/importateur/Importer';
import { Badge } from 'primereact/badge';
import FacServicePresteResult from './FacServicePresteResult';
import { Calendar } from 'primereact/calendar';
import { useCurrentUser } from '../../../../../hooks/fetchData/useCurrentUser';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { RedevanceInformatique } from '../../../(settings)/settings/redevanceInformatique/RedevanceInformatique';
import FacServicePresteEntreeForm from './FacServicePresteForm';
import { useAuthorities } from '../../../../../hooks/useAuthorities';
import { API_BASE_URL } from '@/utils/apiConfig';

interface FacServicePresteGroupedDto {
    servicePresteId: number;
    numFacture: string;
    date: Date;
    lettreTransp: string;
    montant: number;
    montTaxe: number;
    typeVehicule: string;
    plaque: string;
    noCont: string;
    modePayement: string;
    valide1: boolean;
    valide2: boolean;
    userValide1: string;
    userValide2: string;
    userCreation: string;
    dateCreation: Date;
    serviceNames: string;
}

function FacServicePresteComponent() {
    const [facServicePreste, setFacServicePreste] = useState<FacServicePresteEntree>(new FacServicePresteEntree());
    const [facServicePresteEdit, setFacServicePresteEdit] = useState<FacServicePresteEntree>(new FacServicePresteEntree());
    const [editFacServicePresteDialog, setEditFacServicePresteDialog] = useState(false);
    const [facServicesPrestes, setFacServicesPrestes] = useState<FacServicePresteGroupedDto[]>([]);
    const [facServicesValidation1, setFacServicesValidation1] = useState<FacServicePresteGroupedDto[]>([]);
    const [facServicesValidation2, setFacServicesValidation2] = useState<FacServicePresteGroupedDto[]>([]);
    const [services, setServices] = useState<FacService[]>([]);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [servicePrestESize, setServicePrestESize] = useState(0);
    const [allServicePrestE, setAllServicePrestE] = useState<FacServicePresteEntree[]>([]);
    const [searchResults, setSearchResults] = useState<FacServicePresteEntree[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isGPSSaved, setIsGPSSaved] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
    const pendingEditServiceRef = useRef<FacServicePresteEntree | null>(null);

    // Date filter states
    const [dateDebut, setDateDebut] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFin, setDateFin] = useState<Date>(new Date());
    const [searchGPS, setSearchGPS] = useState<string>('');

    // Validation states
    const [dateDebutValidation1, setDateDebutValidation1] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFinValidation1, setDateFinValidation1] = useState<Date>(new Date());
    const [searchGPSValidation1, setSearchGPSValidation1] = useState<string>('');

    const [dateDebutValidation2, setDateDebutValidation2] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFinValidation2, setDateFinValidation2] = useState<Date>(new Date());
    const [searchGPSValidation2, setSearchGPSValidation2] = useState<string>('');

    const [serviceDetailsDialog, setServiceDetailsDialog] = useState(false);
    const [serviceDetails, setServiceDetails] = useState<FacServicePresteEntree[]>([]);
    const [selectedNumFacture, setSelectedNumFacture] = useState<string>('');
    const [selectedClientName, setSelectedClientName] = useState<string>('');
    const [redevanceInformatique, setRedevanceInformatique] = useState<RedevanceInformatique>(new RedevanceInformatique());


    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: serviceData, loading: serviceLoading, error: serviceError, fetchData: serviceFetchData, callType: serviceCallType } = useConsumApi('');
    const { data: importateurData, loading: importateurLoading, error: importateurError, fetchData: fetchImportateurData, callType: importateurCallType } = useConsumApi('');
    const { data: searchData, loading: searchLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: validationData, loading: validationLoading, error: validationError, fetchData: fetchValidationData, callType: validationCallType } = useConsumApi('');
    const { data: redevanceData, loading: redevanceLoading, error: redevanceError, fetchData: fetchRedevanceData, callType: redevanceCallType } = useConsumApi('');
    const { data: pdfData, loading: pdfLoading, error: pdfError, fetchData: fetchPdfData, callType: pdfCallType } = useConsumApi('');
    const { data: tauxChangeData, loading: tauxChangeLoading, error: tauxChangeError, fetchData: fetchTauxChangeData, callType: tauxChangeCallType } = useConsumApi('');

    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalRecordsValidation1, setTotalRecordsValidation1] = useState(0);
    const [totalRecordsValidation2, setTotalRecordsValidation2] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: '',
        sortOrder: null as number | null
    });
    const [lazyParamsValidation1, setLazyParamsValidation1] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: '',
        sortOrder: null as number | null
    });
    const [lazyParamsValidation2, setLazyParamsValidation2] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: '',
        sortOrder: null as number | null
    });
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const importateurValueRef = useRef('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [importateurFilter, setImportateurFilter] = useState('');

    // Add user management
    const { user: appUser, loading: userLoading, error: userError } = useCurrentUser();
    const { hasAuthority, authorities } = useAuthorities();

    const BASE_URL = `${API_BASE_URL}/servicepreste`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;
    const URL_REDEVANCE = `${API_BASE_URL}/redevance-informatique`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string, sticky: boolean = false) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: sticky ? undefined : 3000,
            sticky: sticky
        });
    };

    useEffect(() => {
        serviceFetchData(null, 'GET', `${API_BASE_URL}/facservices/findall?actif=true&type=E`, `loadServices`);
        loadAllImportateurs();
        fetchRedevanceData(null, 'GET', URL_REDEVANCE, 'loadRedevance');
        // Vehicle categories are now static - no API call needed
    }, []);

    useEffect(() => {
        if (serviceData) {
            if (serviceCallType === 'loadServices') {
                setServices(serviceData);
            } else if (serviceCallType === 'loadServiceById') {
                // Add the loaded service to the list if not already present
                if (serviceData && serviceData.id) {
                    const exists = services.some(svc => svc.id === serviceData.id);
                    if (!exists) {
                        setServices(prev => [serviceData, ...prev]);
                    }
                }

                // Check if we have a pending edit service to activate
                if (pendingEditServiceRef.current) {
                    const pending = pendingEditServiceRef.current;
                    // Check if all required data is now loaded
                    const hasImportateur = !pending.importateurId || importateurs.some(imp => imp.importateurId === pending.importateurId);
                    const hasService = !pending.serviceId || services.some(svc => svc.id === pending.serviceId) || serviceData.id === pending.serviceId;

                    if (hasImportateur && hasService) {
                        // All dependencies loaded, activate edit mode
                        const index = allServicePrestE.findIndex(s =>
                            s.servicePresteId ? s.servicePresteId === pending.servicePresteId : s.serviceId === pending.serviceId
                        );
                        if (index !== -1) {
                            setFacServicePreste(pending);
                            setEditingServiceIndex(index);
                            setIsEditMode(true);
                            accept('info', 'Mode édition', 'Modifiez les champs et cliquez sur "Mettre à jour le service".');
                            pendingEditServiceRef.current = null;
                        }
                    }
                }
            }
        }

        if (data) {
            if (callType === 'loadFacServicesPreste') {
                setFacServicesPrestes(data.content || []);
                setTotalRecords(data.totalElements || 0);
            } else if (callType === 'loadFacServicesValidation1') {
                // Show all records for 1er niveau validation (both validated and not validated)
                setFacServicesValidation1(data.content || []);
                setTotalRecordsValidation1(data.totalElements || 0);
            } else if (callType === 'loadFacServicesValidation2') {
                // Show all records for 2ème niveau validation (both validated and not validated)
                setFacServicesValidation2(data.content || []);
                setTotalRecordsValidation2(data.totalElements || 0);
            } else if (callType === 'viewServiceDetails') {
                setServiceDetails(data || []);
                // Get client name from the first service
                if (Array.isArray(data) && data.length > 0 && data[0].importateurId) {
                    const client = importateurs.find(imp => imp.importateurId === data[0].importateurId);
                    if (client) {
                        setSelectedClientName(client.nom);
                    } else {
                        // Load the importateur if not in the list
                        fetchImportateurData(null, 'GET', `${API_BASE_URL}/importers/${data[0].importateurId}`, 'loadImportateurForDialog');
                    }
                }
                setServiceDetailsDialog(true);
            } else if (callType === 'loadServiceForEdit') {
                // Load all services for editing
                if (Array.isArray(data) && data.length > 0) {
                    setAllServicePrestE(data);
                    setIsGPSSaved(true); // Mark as saved since we're loading existing data
                    const firstItem = data[0];
                    // Set GPS info but clear service-specific fields
                    const gpsInfo = new FacServicePresteEntree();
                    gpsInfo.numFacture = firstItem.numFacture;
                    gpsInfo.lettreTransp = firstItem.lettreTransp;
                    gpsInfo.importateurId = firstItem.importateurId;
                    gpsInfo.dateDebut = firstItem.dateDebut;
                    gpsInfo.dateFin = firstItem.dateFin;
                    setFacServicePreste(gpsInfo);
                    // Show sticky toast with GPS info
                    accept('info', 'GPS chargé', `Numéro Facture: ${firstItem.numFacture}\nGPS: ${firstItem.lettreTransp}\nMode édition: Cliquez sur l'icône crayon pour modifier un service.`, true);
                }
            }
        }

        if (callType === 'batchCreateFacServicePreste' || callType === 'batchUpdateFacServicePreste') {
            if (Array.isArray(data) && data.length > 0) {
                // Update the list with returned data (has numFacture and lettreTransp)
                setAllServicePrestE(data);
                setIsGPSSaved(true);
                setBtnLoading(false);

                const firstItem = data[0];
                const action = callType === 'batchCreateFacServicePreste' ? 'créé' : 'mis à jour';
                accept('success', 'Succès', `GPS ${action} avec succès!\nNuméro Facture: ${firstItem.numFacture}\nGPS: ${firstItem.lettreTransp}`, true);
            }
        }

        if (callType === 'updateSingleService') {
            if (data && editingServiceIndex !== null) {
                // Update the service in the list with the response from API
                setAllServicePrestE(prev => {
                    const updated = [...prev];
                    updated[editingServiceIndex] = data;
                    return updated;
                });

                // Reset editing state
                setEditingServiceIndex(null);
                setIsEditMode(false);

                // Reset form but keep GPS info
                setFacServicePreste(prev => {
                    const newState = new FacServicePresteEntree();
                    newState.numFacture = prev.numFacture;
                    newState.lettreTransp = prev.lettreTransp;
                    newState.importateurId = prev.importateurId;
                    newState.dateDebut = prev.dateDebut;
                    newState.dateFin = prev.dateFin;
                    return newState;
                });

                setBtnLoading(false);
                accept('success', 'Service mis à jour', 'Le service a été mis à jour avec succès.');
            }
        }

        if (importateurData) {
            if (importateurCallType === 'loadAllImportateur' && importateurData.content) {
                const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
                if (newItems.length > 0) {
                    setImportateurs(prev => [...prev, ...newItems]);
                }
            } else if (importateurCallType === 'loadImportateurById') {
                // Add the loaded importateur to the list if not already present
                if (importateurData && importateurData.importateurId) {
                    const exists = importateurs.some(imp => imp.importateurId === importateurData.importateurId);
                    if (!exists) {
                        setImportateurs(prev => [importateurData, ...prev]);
                    }
                }

                // Check if we have a pending edit service to activate
                if (pendingEditServiceRef.current) {
                    const pending = pendingEditServiceRef.current;
                    // Check if all required data is now loaded
                    const hasImportateur = !pending.importateurId || importateurs.some(imp => imp.importateurId === pending.importateurId) || importateurData.importateurId === pending.importateurId;
                    const hasService = !pending.serviceId || services.some(svc => svc.id === pending.serviceId);

                    if (hasImportateur && hasService) {
                        // All dependencies loaded, activate edit mode
                        const index = allServicePrestE.findIndex(s =>
                            s.servicePresteId ? s.servicePresteId === pending.servicePresteId : s.serviceId === pending.serviceId
                        );
                        if (index !== -1) {
                            setFacServicePreste(pending);
                            setEditingServiceIndex(index);
                            setIsEditMode(true);
                            accept('info', 'Mode édition', 'Modifiez les champs et cliquez sur "Mettre à jour le service".');
                            pendingEditServiceRef.current = null;
                        }
                    }
                }
            } else if (importateurCallType === 'loadImportateurForDialog') {
                // Set client name for dialog
                if (importateurData && importateurData.nom) {
                    setSelectedClientName(importateurData.nom);
                    // Also add to list for future use
                    const exists = importateurs.some(imp => imp.importateurId === importateurData.importateurId);
                    if (!exists) {
                        setImportateurs(prev => [importateurData, ...prev]);
                    }
                }
            }
        }

        // Handle redevance informatique load
        if (redevanceData && redevanceCallType === 'loadRedevance') {
            setRedevanceInformatique(redevanceData);
        }

        // Vehicle categories are now static - no handler needed

        // Handle GPS search results
        if (searchData && searchCallType === 'searchByGPS') {
            if (Array.isArray(searchData) && searchData.length > 0) {
                const unvalidatedResults = searchData.filter(item => !item.valide1 && !item.valide2);
                setSearchResults(unvalidatedResults);
                setShowSearchResults(true);
                if (unvalidatedResults.length === 0) {
                    accept('info', 'Information', 'Tous les services pour ce GPS sont déjà validés.');
                }
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
                accept('warn', 'Aucun résultat', 'Aucun service trouvé pour ce numéro GPS.');
            }
        }

        handleAfterApiCall(activeIndex);
    }, [data, serviceData, importateurData, searchData]);

    // Handle PDF export responses
    useEffect(() => {
        if (pdfData && pdfCallType === 'exportPdfReport') {
            // Handle blob data for PDF download
            const blob = new Blob([pdfData], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            const dateStr = new Date().toISOString().split('T')[0];
            link.download = `rapport_services_prestes_${dateStr}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            accept('success', 'Succès', 'Rapport PDF généré avec succès');
        }

        if (pdfError && pdfCallType === 'exportPdfReport') {
            accept('error', 'Erreur', 'Erreur lors de la génération du rapport PDF');
        }
    }, [pdfData, pdfError]);

    // Separate useEffect for handling validation results
    useEffect(() => {
        if (validationData) {

            console.log("Kicking validationData ...")

            if (validationCallType === 'validateServiceLevel1') {
                accept('success', 'Validation réussie', validationData?.message);

                const newParams = { ...lazyParamsValidation1 };
                loadValidationData1(newParams);
            } else if (validationCallType === 'validateServiceLevel2') {
                accept('success', 'Validation réussie', validationData?.message);

                const newParams = { ...lazyParamsValidation2 };
                loadValidationData2(newParams);
            } else if (validationCallType === 'invalidateServiceLevel1') {
                accept('success', 'Invalidation réussie', validationData?.message || 'La facture a été invalidée au 1er niveau.');

                const newParams = { ...lazyParamsValidation1 };
                loadValidationData1(newParams);
            } else if (validationCallType === 'invalidateServiceLevel2') {
                accept('success', 'Invalidation réussie', validationData?.message || 'La facture a été invalidée au 2ème niveau.');

                const newParams = { ...lazyParamsValidation2 };
                loadValidationData2(newParams);
            }
        } else {
            console.log("Kicking validationData is null as f ...")
        }
    }, [validationData, validationCallType]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (importateurValueRef.current) {
                loadAllImportateurs(importateurValueRef.current, 0, 20);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [importateurFilter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacServicePreste((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacServicePresteEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle GPS blur event to search for existing services
    const handleGPSBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const gpsValue = e.target.value.trim();
        if (gpsValue) {
            fetchSearchData(null, 'GET', `${BASE_URL}/listevalidation?keyword=${encodeURIComponent(gpsValue)}`, 'searchByGPS');
        }
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;

        setFacServicePreste((prev) => {
            const updatedState = { ...prev, [field]: value };

            // Calculate amount when poids changes and service uses tonnage
            if (field === 'poids' && updatedState.serviceId != null) {
                const selectedService = services.find(service => service.id === updatedState.serviceId);
                if (selectedService && selectedService.tonnage && updatedState.poids) {
                    const tonnes = updatedState.poids / 1000;
                    updatedState.montant = Math.round(tonnes * selectedService.montant);
                    console.log(`Poids changed - Tonnage pricing: ${updatedState.poids} kg = ${tonnes} tonnes × ${selectedService.montant} = ${updatedState.montant}`);

                    // Recalculate tax if enabled
                    if (updatedState.taxe) {
                        updatedState.montTaxe = updatedState.montant * 0.18;
                    }
                }
            }

            // Calculate amount based on service and quantity
            if (field === 'nbreCont' && updatedState.serviceId != null) {
                const selectedService = services.find(service => service.id === updatedState.serviceId);
                if (selectedService) {
                    const nbreCont = updatedState.nbreCont || 1;

                    // Check if this service uses tonnage pricing
                    if (selectedService.tonnage && updatedState.poids) {
                        // Tonnage pricing: (poids / 1000) * service.montant
                        const tonnes = updatedState.poids / 1000;
                        updatedState.montant = Math.round(tonnes * selectedService.montant);
                        console.log(`NbreCont changed - Tonnage pricing: ${updatedState.poids} kg = ${tonnes} tonnes × ${selectedService.montant} = ${updatedState.montant}`);
                    }
                    // Check if this service uses per-day pricing with tiered tariffs
                    else if (selectedService.prixUnitaireParJour && updatedState.dateDebut && updatedState.dateFin) {
                        // Use tiered pricing calculation
                        updatedState.montant = calculateTieredPricing(
                            new Date(updatedState.dateDebut),
                            new Date(updatedState.dateFin),
                            selectedService,
                            nbreCont
                        );
                    } else {
                        // Standard pricing
                        updatedState.montant = Math.round(selectedService.montant * nbreCont);
                    }

                    // Recalculate redevance informatique when quantity changes - only for first service
                    const isFirstService = allServicePrestE.length === 0;
                    if (isFirstService) {
                        updatedState.montRedev = Math.round((redevanceInformatique.montant || 0) * nbreCont);
                        updatedState.montRedevTaxe = updatedState.montRedev * 0.18;
                    }
                }
            }

            // Calculate tax automatically if taxe is enabled
            if (field === 'montant' && updatedState.taxe) {
                updatedState.montTaxe = (updatedState.montant || 0) * 0.18;
            }

            // Calculate montRedevTaxe when montRedev changes - only for first service
            if (field === 'montRedev') {
                const isFirstService = allServicePrestE.length === 0;
                if (isFirstService) {
                    updatedState.montRedevTaxe = (updatedState.montRedev || 0) * 0.18;
                }
            }

            return updatedState;
        });
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;

        setFacServicePresteEdit((prev) => {
            const updatedState = { ...prev, [field]: value };

            // Calculate tax automatically if taxe is enabled
            if (field === 'montant' && updatedState.taxe) {
                updatedState.montTaxe = (updatedState.montant || 0) * 0.18;
            }

            return updatedState;
        });
    };

    /**
     * Calculate tiered pricing based on date range and service tariff flags (nuitées/nights)
     * Nights 1-7: Free
     * Nights 8-14 (7 nights): service.montant * nights (if tarif1)
     * Nights 15-44 (30 nights max): service.montant * nights (if tarif2)
     * Nights 45+: service.montant * nights (if tarif3)
     *
     * Example: Aug 1 to Oct 19 = 79 nights
     * - Nights 1-7: Free
     * - Nights 8-14: 7 nights (tarif1)
     * - Nights 15-44: 30 nights (tarif2)
     * - Nights 45-79: 35 nights (tarif3)
     */
    const calculateTieredPricing = (dateDebut: Date, dateFin: Date, service: FacService, nbreCont: number): number => {
        if (!dateDebut || !dateFin || !service) return 0;

        // Reset hours to compare only dates
        const startDate = new Date(dateDebut);
        const endDate = new Date(dateFin);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        // Calculate total nights (nuitées) - EXCLUSIVE of end date
        const timeDifference = endDate.getTime() - startDate.getTime();
        const totalNights = Math.floor(timeDifference / (1000 * 3600 * 24));

        if (totalNights <= 0) return 0;

        let totalAmount = 0;
        const baseAmount = service.montant * (nbreCont || 1);

        console.log(`=== Tiered Pricing Calculation (Nuitées) ===`);
        console.log(`Date Entrée: ${startDate.toLocaleDateString()}, Date Fin: ${endDate.toLocaleDateString()}`);
        console.log(`Total nuitées: ${totalNights}, Base amount: ${baseAmount}`);
        console.log(`Tarif1: ${service.tarif1}, Tarif2: ${service.tarif2}, Tarif3: ${service.tarif3}`);

        // Check if any tiered tariffs are defined
        const hasTieredTariffs = service.tarif1 !== null || service.tarif2 !== null || service.tarif3 !== null;

        if (!hasTieredTariffs) {
            // No tiered tariffs defined - charge for ALL days (no 7-day free period)
            totalAmount = baseAmount * totalNights;
            console.log(`No tiered tariffs - Charging all days: ${totalNights} nuitées × ${baseAmount} = ${totalAmount}`);
        } else {
            // Tiered tariffs are set - apply 7-day free period
            if (totalNights <= 7) {
                console.log(`Nuitées 1-7: Free - No charge (tiered tariffs active)`);
                return 0;
            }

            // Nights 8-14: Tarif 1 (7 nights maximum)
            if (totalNights >= 8 && service.tarif1) {
                const tarif1Nights = Math.min(totalNights - 7, 7); // Max 7 nights for tarif1
                const tarif1Amount = baseAmount * tarif1Nights;
                totalAmount += tarif1Amount;
                console.log(`Nuitées 8-14 (Tarif1): ${tarif1Nights} nuitées × ${baseAmount} = ${tarif1Amount}`);
            }

            // Nights 15-44: Tarif 2 (30 nights maximum)
            if (totalNights >= 15 && service.tarif2) {
                const tarif2Nights = Math.min(totalNights - 14, 30); // Max 30 nights for tarif2
                const tarif2Amount = baseAmount * tarif2Nights;
                totalAmount += tarif2Amount;
                console.log(`Nuitées 15-44 (Tarif2): ${tarif2Nights} nuitées × ${baseAmount} = ${tarif2Amount}`);
            }

            // Nights 45+: Tarif 3 (remaining nights)
            if (totalNights >= 45 && service.tarif3) {
                const tarif3Nights = totalNights - 44; // All remaining nights
                const tarif3Amount = baseAmount * tarif3Nights;
                totalAmount += tarif3Amount;
                console.log(`Nuitées 45+ (Tarif3): ${tarif3Nights} nuitées × ${baseAmount} = ${tarif3Amount}`);
            }
        }

        console.log(`Total amount: ${totalAmount}`);
        return Math.round(totalAmount);
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setFacServicePreste((prev) => {
            const updatedState = { ...prev, [field]: value };

            // Recalculate amount if service is selected and both dates are available
            if (updatedState.serviceId && updatedState.dateDebut && updatedState.dateFin) {
                const selectedService = services.find(service => service.id === updatedState.serviceId);

                if (selectedService && selectedService.prixUnitaireParJour) {
                    const nbreCont = updatedState.nbreCont || 1;

                    // Use tiered pricing calculation
                    updatedState.montant = calculateTieredPricing(
                        new Date(updatedState.dateDebut),
                        new Date(updatedState.dateFin),
                        selectedService,
                        nbreCont
                    );

                    // Recalculate tax if taxe is enabled
                    if (updatedState.taxe) {
                        updatedState.montTaxe = updatedState.montant * 0.18;
                    }
                }
            }

            return updatedState;
        });
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setFacServicePresteEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setFacServicePreste((prev) => {
            const updatedState = { ...prev, [e.target.name]: e.target.value };

            if (e.target.name === 'serviceId') {
                const selectedService = services.find(service => service.id === e.target.value);
                console.log(JSON.stringify(selectedService));
                if (selectedService) {
                    const nbreCont = updatedState.nbreCont || 1;

                    // Check if this service uses tonnage pricing
                    if (selectedService.tonnage && updatedState.poids) {
                        // Tonnage pricing: (poids / 1000) * service.montant
                        const tonnes = updatedState.poids / 1000;
                        updatedState.montant = Math.round(tonnes * selectedService.montant);
                        console.log(`Tonnage pricing: ${updatedState.poids} kg = ${tonnes} tonnes × ${selectedService.montant} = ${updatedState.montant}`);
                    }
                    // Check if this service uses per-day pricing with tiered tariffs
                    else if (selectedService.prixUnitaireParJour && updatedState.dateDebut && updatedState.dateFin) {
                        // Use tiered pricing calculation
                        console.log('About to calculate ..... ' + selectedService?.tarif1);
                        updatedState.montant = calculateTieredPricing(
                            new Date(updatedState.dateDebut),
                            new Date(updatedState.dateFin),
                            selectedService,
                            nbreCont
                        );
                    } else {
                        // Standard pricing (one-time charge)
                        updatedState.montant = Math.round(selectedService.montant * nbreCont);
                    }

                    // Calculate tax automatically if taxe is enabled
                    if (updatedState.taxe) {
                        updatedState.montTaxe = updatedState.montant * 0.18;
                    }

                    // Calculate redevance informatique only for the first service
                    const isFirstService = allServicePrestE.length === 0;
                    if (isFirstService) {
                        updatedState.montRedev = Math.round((redevanceInformatique.montant || 0) * nbreCont);
                        updatedState.montRedevTaxe = updatedState.montRedev * 0.18;
                    } else {
                        // Clear redevance for subsequent services
                        updatedState.montRedev = 0;
                        updatedState.montRedevTaxe = 0;
                    }
                }
            }

            return updatedState;
        });
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setFacServicePresteEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setFacServicePreste((prev) => {
            const updatedState = { ...prev, [e.target.name]: e.target.checked };

            // Calculate tax when checkbox changes
            if (e.target.name === 'taxe') {
                if (e.target.checked && updatedState.montant) {
                    updatedState.montTaxe = updatedState.montant * 0.18;
                    // Recalculate Taxe Redevance if Redevance Informatique is not zero
                    if (updatedState.montRedev && updatedState.montRedev > 0) {
                        updatedState.montRedevTaxe = updatedState.montRedev * 0.18;
                    }
                } else {
                    // When TVA is unchecked, set both tax fields to 0
                    updatedState.montTaxe = 0;
                    updatedState.montRedevTaxe = 0;
                }
            }

            return updatedState;
        });
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setFacServicePresteEdit((prev) => {
            const updatedState = { ...prev, [e.target.name]: e.target.checked };

            // Calculate tax when checkbox changes
            if (e.target.name === 'taxe') {
                if (e.target.checked && updatedState.montant) {
                    updatedState.montTaxe = updatedState.montant * 0.18;
                    // Recalculate Taxe Redevance if Redevance Informatique is not zero
                    if (updatedState.montRedev && updatedState.montRedev > 0) {
                        updatedState.montRedevTaxe = updatedState.montRedev * 0.18;
                    }
                } else {
                    updatedState.montTaxe = 0;
                    updatedState.montRedevTaxe = 0;
                }
            }

            return updatedState;
        });
    };

    const handleMontantChange = (montant: number) => {
        // This callback is used to recalculate tax when montant changes

        if (facServicePreste.taxe && montant > 0) {
            setFacServicePreste(prev => ({
                ...prev,
                montTaxe: montant * 0.18
            }));
        }
    };

    const checkIfFormIsOk = () => {
        let checkForm = { status: true, errorMessage: '' };
        if (facServicePreste.serviceId == null || facServicePreste.serviceId == 0) {
            checkForm.status = false;
            checkForm.errorMessage = "Veuillez préciser le service presté";
        }
        // if (!facServicePreste.montant || facServicePreste.montant <= 0) {
        //     checkForm.status = false;
        //     checkForm.errorMessage = "Veuillez préciser le montant du service";
        // }

        if (!facServicePreste.importateurId) {
            checkForm.status = false;
            checkForm.errorMessage = "Veuillez préciser le client";
        }

        if (!facServicePreste.declarant || facServicePreste.declarant.trim() === '') {
            checkForm.status = false;
            checkForm.errorMessage = "Veuillez préciser le déclarant/agence";
        }

        if (!facServicePreste.telephoneNumber || facServicePreste.telephoneNumber.trim() === '' || facServicePreste.telephoneNumber.trim() === '+257') {
            checkForm.status = false;
            checkForm.errorMessage = "Veuillez préciser le numéro de téléphone";
        }

        if (!facServicePreste.modePayement || facServicePreste.modePayement === '') {
            checkForm.status = false;
            checkForm.errorMessage = "Veuillez préciser le mode de paiement";
        }

        return checkForm;
    }

    const handleSubmit = () => {
        const formValidation = checkIfFormIsOk();
        const summary = "A votre attention SVP";
        if (!formValidation.status) {
            accept('warn', summary, formValidation.errorMessage);
            return;
        }

        // Check if service already exists in the list
        const serviceExists = allServicePrestE.some(s => s.serviceId === facServicePreste.serviceId);
        if (serviceExists) {
            accept('warn', 'Attention', 'Ce service existe déjà dans la liste. Un GPS ne peut pas avoir deux fois le même service.');
            return;
        }

        let userCreationName = 'Unknown';
        if (appUser?.fullName) {
            const nameParts = appUser.fullName.split(" ");
            if (nameParts.length >= 2) {
                userCreationName = nameParts[1];
            } else {
                userCreationName = appUser.fullName;
            }
        }

        const newService = {
            ...facServicePreste,
            userCreation: userCreationName
        };

        setAllServicePrestE(prev => [...prev, newService]);

        setServicePrestESize(prevSize => prevSize + 1);

        // Reset form but keep GPS info and telephoneNumber
        setFacServicePreste(prev => {
            const newState = new FacServicePresteEntree();
            newState.lettreTransp = prev.lettreTransp;
            newState.importateurId = prev.importateurId;
            newState.dateDebut = prev.dateDebut;
            newState.dateFin = prev.dateFin;
            newState.nbreCont = prev.nbreCont;
            newState.noCont = prev.noCont;
            newState.poids = prev.poids;
            newState.typeVehicule = prev.typeVehicule;
            newState.plaque = prev.plaque;
            newState.peage = prev.peage;
            newState.pesage = prev.pesage;
            newState.declarant = prev.declarant;
            newState.modePayement = prev.modePayement;
            newState.telephoneNumber = prev.telephoneNumber;
            return newState;
        });

        accept('success', 'Service ajouté', 'Le service a été ajouté à la liste. Cliquez sur "Enregistrer le GPS" pour sauvegarder.');
    };

    const handleBatchSave = () => {
        if (allServicePrestE.length === 0) {
            accept('warn', 'Attention', 'Aucun service à enregistrer.');
            return;
        }

        setBtnLoading(true);

        // Check if updating (has numFacture) or creating (no numFacture)
        const isUpdate = allServicePrestE.some(s => s.numFacture && s.numFacture.trim() !== '');

        if (isUpdate) {
            // PUT for update
            fetchData(allServicePrestE, 'PUT', `${BASE_URL}/batch`, 'batchUpdateFacServicePreste');
        } else {
            // POST for creation
            fetchData(allServicePrestE, 'POST', `${BASE_URL}/batch`, 'batchCreateFacServicePreste');
        }
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(facServicePresteEdit, 'PUT', `${BASE_URL}/update/${facServicePresteEdit.servicePresteId}`, 'updateFacServicePreste');
    };

    // Batch validation functions
    const handleValidation1 = (groupedService: FacServicePresteGroupedDto) => {
        let userValidationName = 'Unknown';
        if (appUser?.fullName) {
            const nameParts = appUser.fullName.split(" ");
            if (nameParts.length >= 2) {
                userValidationName = nameParts[0] + ' ' + nameParts[1];
            } else {
                userValidationName = appUser.fullName;
            }
        }

        confirmDialog({
            message: `Êtes-vous sûr de vouloir valider cette facture au 1er niveau ?
                     
        Facture: ${groupedService.numFacture}
        GPS: ${groupedService.lettreTransp}
        Montant Total: ${formatCurrency(groupedService.montant)}`,
            header: 'Confirmation de validation 1er niveau',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchValidationData(
                    null,
                    'PUT',
                    `${BASE_URL}/validateNumFactureLevel1?numFacture=${encodeURIComponent(groupedService.numFacture)}&userValide1=${encodeURIComponent(userValidationName)}`,
                    'validateServiceLevel1'
                );
            }
        });
    };

    const handleValidation2 = (groupedService: FacServicePresteGroupedDto) => {
        let userValidationName = 'Unknown';
        if (appUser?.fullName) {
            const nameParts = appUser.fullName.split(" ");
            if (nameParts.length >= 2) {
                userValidationName = nameParts[0] + ' ' + nameParts[1];
            } else {
                userValidationName = appUser.fullName;
            }
        }

        confirmDialog({
            message: `Êtes-vous sûr de vouloir valider cette facture au 2ème niveau ?

Facture: ${groupedService.numFacture}
GPS: ${groupedService.lettreTransp}
Services: ${groupedService.serviceNames}
Montant Total: ${formatCurrency(groupedService.montant)}`,
            header: 'Confirmation de validation 2ème niveau',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                fetchValidationData(
                    null,
                    'PUT',
                    `${BASE_URL}/validateNumFactureLevel2?numFacture=${encodeURIComponent(groupedService.numFacture)}&userValide2=${encodeURIComponent(userValidationName)}`,
                    'validateServiceLevel2'
                );
            }
        });
    };

    // Batch invalidation functions
    const handleInvalidation1 = (groupedService: FacServicePresteGroupedDto) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir invalider cette facture au 1er niveau ?

Facture: ${groupedService.numFacture}
GPS: ${groupedService.lettreTransp}
Montant Total: ${formatCurrency(groupedService.montant)}

Cette action annulera la validation de 1er niveau.`,
            header: 'Confirmation d\'invalidation 1er niveau',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                fetchValidationData(
                    null,
                    'PUT',
                    `${BASE_URL}/invalidateNumFactureLevel1?numFacture=${encodeURIComponent(groupedService.numFacture)}`,
                    'invalidateServiceLevel1'
                );
            }
        });
    };

    const handleInvalidation2 = (groupedService: FacServicePresteGroupedDto) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir invalider cette facture au 2ème niveau ?

Facture: ${groupedService.numFacture}
GPS: ${groupedService.lettreTransp}
Services: ${groupedService.serviceNames}
Montant Total: ${formatCurrency(groupedService.montant)}

Cette action annulera la validation de 2ème niveau.`,
            header: 'Confirmation d\'invalidation 2ème niveau',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                fetchValidationData(
                    null,
                    'PUT',
                    `${BASE_URL}/invalidateNumFactureLevel2?numFacture=${encodeURIComponent(groupedService.numFacture)}`,
                    'invalidateServiceLevel2'
                );
            }
        });
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateFacServicePreste') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateFacServicePreste') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && (chooseenTab === 1 || chooseenTab === 2 || chooseenTab === 3)) {
            accept('warn', 'Attention', 'Impossible de charger la liste des services prestés.');
        } else if (data !== null && error === null) {
            if (callType === 'createFacServicePreste') {
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateFacServicePreste') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setFacServicePresteEdit(new FacServicePresteEntree());
                setEditFacServicePresteDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterFacServicePreste = () => {
        setFacServicePreste(new FacServicePresteEntree());
        setSearchResults([]);
        setShowSearchResults(false);
        setAllServicePrestE([]);
        setServicePrestESize(0);
        setIsGPSSaved(false);
        setIsEditMode(false);
        setEditingServiceIndex(null);
        toast.current?.clear();
    };

    const handleDeleteService = (service: FacServicePresteEntree) => {
        // Check if the service is validated at level 1 or level 2
        if (service.valide1 || service.valide2) {
            const validationLevel = service.valide2 ? '2ème niveau' : '1er niveau';
            accept('error', 'Suppression impossible',
                `Ce service a déjà été validé au ${validationLevel} et ne peut plus être supprimé.\n\n` +
                `Numéro GPS: ${service.lettreTransp}\n` +
                `Numéro Facture: ${service.numFacture}`,
                true
            );
            return;
        }

        // Check if service is saved (has servicePresteId or numFacture)
        const isSaved = service.servicePresteId || (service.numFacture && service.numFacture.trim() !== '');

        if (isSaved) {
            // Delete from backend
            if (service.servicePresteId) {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${service.servicePresteId}`, 'deleteServicePreste');
            }
        }

        // Remove from local list and transfer redevance if necessary
        setAllServicePrestE(prev => {
            const updatedList = prev.filter(s => s.serviceId !== service.serviceId);

            // If the deleted service was the first one and had montRedev, transfer it to the new first service
            const isFirstService = prev[0] === service ||
                                   (prev[0] && service.servicePresteId && prev[0].servicePresteId === service.servicePresteId);

            if (isFirstService && service.montRedev && service.montRedev > 0 && updatedList.length > 0) {
                // Transfer redevance to the new first service
                updatedList[0].montRedev = service.montRedev;
                updatedList[0].montRedevTaxe = service.montRedevTaxe || 0;
            }

            return updatedList;
        });

        setServicePrestESize(prevSize => prevSize - 1);

        if (!isSaved) {
            accept('info', 'Service retiré', 'Le service a été retiré de la liste.');
        }
    };

    const handleEditService = (service: FacServicePresteEntree) => {
        // Check if the service is validated at level 1 or level 2
        if (service.valide1 || service.valide2) {
            const validationLevel = service.valide2 ? '2ème niveau' : '1er niveau';
            accept('error', 'Modification impossible',
                `Ce service a déjà été validé au ${validationLevel} et ne peut plus être modifié.\n\n` +
                `Numéro GPS: ${service.lettreTransp}\n` +
                `Numéro Facture: ${service.numFacture}`,
                true
            );
            return;
        }

        // Find the index of the service in the list
        const index = allServicePrestE.findIndex(s =>
            s.servicePresteId ? s.servicePresteId === service.servicePresteId : s.serviceId === service.serviceId
        );

        if (index !== -1) {
            let needsToLoadData = false;

            // Check if we need to load the importateur
            if (service.importateurId) {
                const importateurExists = importateurs.some(imp => imp.importateurId === service.importateurId);
                if (!importateurExists) {
                    needsToLoadData = true;
                    fetchImportateurData(null, 'GET', `${API_BASE_URL}/importers/${service.importateurId}`, 'loadImportateurById');
                }
            }

            // Check if we need to load the service (FacService)
            if (service.serviceId) {
                const serviceExists = services.some(svc => svc.id === service.serviceId);
                if (!serviceExists) {
                    needsToLoadData = true;
                    serviceFetchData(null, 'GET', `${API_BASE_URL}/facservices/findbyid/${service.serviceId}`, 'loadServiceById');
                }
            }

            if (needsToLoadData) {
                // Store the service to edit after dependencies are loaded
                pendingEditServiceRef.current = service;
            } else {
                // All data is already available, activate edit mode immediately
                setFacServicePreste(service);
                setEditingServiceIndex(index);
                setIsEditMode(true);
                accept('info', 'Mode édition', 'Modifiez les champs et cliquez sur "Mettre à jour le service".');
            }
        }
    };

    const handleUpdateService = () => {
        if (editingServiceIndex === null) return;

        // Validate required fields
        if (!facServicePreste.serviceId) {
            accept('warn', 'Attention', 'Veuillez sélectionner un service.');
            return;
        }

        // Make API call to update the service
        if (facServicePreste.servicePresteId) {
            setBtnLoading(true);
            fetchData(facServicePreste, 'PUT', `${BASE_URL}/update/${facServicePreste.servicePresteId}`, 'updateSingleService');
        } else {
            accept('error', 'Erreur', 'Impossible de mettre à jour: ID du service manquant.');
        }
    };

    const handleCancelEdit = () => {
        setEditingServiceIndex(null);
        setIsEditMode(false);
        setFacServicePreste(prev => {
            const newState = new FacServicePresteEntree();
            // Keep GPS info
            newState.numFacture = prev.numFacture;
            newState.lettreTransp = prev.lettreTransp;
            newState.importateurId = prev.importateurId;
            newState.dateDebut = prev.dateDebut;
            newState.dateFin = prev.dateFin;
            return newState;
        });
        accept('info', 'Annulé', 'Modification annulée.');
    };

    const loadFacServicePresteToEdit = (data: FacServicePresteGroupedDto) => {
        if (data) {
            // Check if the GPS is validated at level 1 or level 2
            if (data.valide1 || data.valide2) {
                const validationLevel = data.valide2 ? '2ème niveau' : '1er niveau';
                accept('error', 'Modification impossible',
                    `Ce GPS a déjà été validé au ${validationLevel} et ne peut plus être modifié.\n\n` +
                    `Numéro GPS: ${data.lettreTransp}\n` +
                    `Numéro Facture: ${data.numFacture}`,
                    true
                );
                return;
            }

            // Load all services for this NumFacture for editing
            fetchData(null, 'GET', `${BASE_URL}/findByNumFacture?numFacture=${encodeURIComponent(data.numFacture)}`, 'loadServiceForEdit');
            // Switch to "Nouveau" tab
            setActiveIndex(0);
        }
    };

    const loadAllImportateurs = (searchName: string = '', page: number = 0, size: number = 20) => {
        let pageNumber = 0;
        let sizeNumber = 20;

        if (Number.isNaN(page) || page === 0 || page === 1) {
            setLoadedPages(new Set([0]));
            setImportateurs([]);
        } else {
            pageNumber = page;
        }

        if (Number.isNaN(size) || size === 0) {
            sizeNumber = 20;
        } else {
            sizeNumber = size;
        }

        const url = `${URL_IMPORTATEUR}?query=${encodeURIComponent(searchName)}&page=${pageNumber}&size=${sizeNumber}`;
        fetchImportateurData(null, "GET", url, "loadAllImportateur");
    };

    const handleLazyLoading = (e: VirtualScrollerLazyEvent) => {
        const pageSize = e.last - e.first;
        const pageNumber = Math.floor(e.first / pageSize);

        // Prevent negative page numbers to avoid 401 and refresh token loop
        if (pageNumber < 0 || pageSize <= 0) {
            return;
        }

        if (!loadedPages.has(pageNumber)) {
            setLoadedPages(prev => new Set(prev).add(pageNumber));
            loadAllImportateurs(importateurFilter, pageNumber, pageSize);
        }
    };

    const handleServiceFilterChange = (value: string) => {
        setServiceFilter(value);
    };

    const handleImportateurFilterChange = (value: string) => {
        importateurValueRef.current = value;
        setImportateurFilter(value);
    };

    const handleFactureSelect = (facServicePresteSelected: FacServicePresteEntree) => {
        setFacServicePreste(facServicePresteSelected);
    };

    const clearFactureSearchResults = () => {
        setSearchResults([]);
        setShowSearchResults(false);
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadFacServicePresteToEdit(data)} raised severity='warning' />
                <Button icon="pi pi-eye" onClick={() => viewServiceDetails(data)} raised severity='info' />
            </div>
        );
    };



    const viewServiceDetails = (groupedService: FacServicePresteGroupedDto) => {
        if (!groupedService?.numFacture) {
            accept('warn', 'Erreur', 'Numéro de facture manquant');
            return;
        }

        setSelectedNumFacture(groupedService.numFacture);
        const encodedNumFacture = encodeURIComponent(groupedService.numFacture);
        fetchData(null, 'GET', `${BASE_URL}/findByNumFacture?numFacture=${encodedNumFacture}`, 'viewServiceDetails');
    };

    // Validation 1er niveau option buttons
    const optionButtonsValidation1 = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                {!data.valide1 ? (
                    <Button
                        icon="pi pi-check"
                        onClick={() => handleValidation1(data)}
                        raised
                        severity='success'
                        size="small"
                        tooltip="Valider"
                        tooltipOptions={{ position: 'top' }}
                    />
                ) : (
                    <Button
                        icon="pi pi-times"
                        onClick={() => handleInvalidation1(data)}
                        raised
                        severity='danger'
                        size="small"
                        tooltip="Invalider"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}
                <Button icon="pi pi-eye" onClick={() => viewServiceDetails(data)} raised severity='info' size="small" />
            </div>
        );
    };

    // Validation 2ème niveau option buttons
    const optionButtonsValidation2 = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                {data.valide1 && !data.valide2 ? (
                    <Button
                        icon="pi pi-check"
                        onClick={() => handleValidation2(data)}
                        raised
                        severity='success'
                        size="small"
                        tooltip="Valider"
                        tooltipOptions={{ position: 'top' }}
                    />
                ) : data.valide2 ? (
                    <Button
                        icon="pi pi-times"
                        onClick={() => handleInvalidation2(data)}
                        raised
                        severity='danger'
                        size="small"
                        tooltip="Invalider"
                        tooltipOptions={{ position: 'top' }}
                    />
                ) : null}
                <Button icon="pi pi-eye" onClick={() => viewServiceDetails(data)} raised severity='info' size="small" />
            </div>
        );
    };

    const loadAllData = (params = lazyParams) => {
        const { page, rows } = params;

        let url = `${BASE_URL}/findall?page=${page}&size=${rows}&type=E`;

        if (dateDebut && dateFin) {
            const formatDate = (date: Date) => date.toISOString().split('T')[0];
            url += `&dateDebut=${formatDate(dateDebut)}&dateFin=${formatDate(dateFin)}`;
        }

        if (searchGPS.trim()) {
            url += `&lettreTransp=${encodeURIComponent(searchGPS.trim())}`;
        }

        fetchData(null, 'GET', url, 'loadFacServicesPreste');
    };

    // Load validation 1er niveau data
    const loadValidationData1 = (params = lazyParamsValidation1) => {
        const { page, rows } = params;

        let url = `${BASE_URL}/findall?page=${page}&size=${rows}&type=E`;

        if (dateDebutValidation1 && dateFinValidation1) {
            const formatDate = (date: Date) => date.toISOString().split('T')[0];
            url += `&dateDebut=${formatDate(dateDebutValidation1)}&dateFin=${formatDate(dateFinValidation1)}`;
        }

        if (searchGPSValidation1.trim()) {
            url += `&lettreTransp=${encodeURIComponent(searchGPSValidation1.trim())}`;
        }

        fetchData(null, 'GET', url, 'loadFacServicesValidation1');
    };

    // Load validation 2ème niveau data
    const loadValidationData2 = (params = lazyParamsValidation2) => {
        const { page, rows } = params;

        let url = `${BASE_URL}/findall?page=${page}&size=${rows}&type=E`;

        if (dateDebutValidation2 && dateFinValidation2) {
            const formatDate = (date: Date) => date.toISOString().split('T')[0];
            url += `&dateDebut=${formatDate(dateDebutValidation2)}&dateFin=${formatDate(dateFinValidation2)}`;
        }

        if (searchGPSValidation2.trim()) {
            url += `&lettreTransp=${encodeURIComponent(searchGPSValidation2.trim())}`;
        }

        fetchData(null, 'GET', url, 'loadFacServicesValidation2');
    };

    const handleSearch = () => {
        const newParams = { ...lazyParams, first: 0, page: 0 };
        setLazyParams(newParams);
        loadAllData(newParams);
    };

    const handleSearchValidation1 = () => {
        const newParams = { ...lazyParamsValidation1, first: 0, page: 0 };
        setLazyParamsValidation1(newParams);
        loadValidationData1(newParams);
    };

    const handleSearchValidation2 = () => {
        const newParams = { ...lazyParamsValidation2, first: 0, page: 0 };
        setLazyParamsValidation2(newParams);
        loadValidationData2(newParams);
    };

    const clearSearch = () => {
        setDateDebut(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFin(new Date());
        setSearchGPS('');
        const newParams = { ...lazyParams, first: 0, page: 0 };
        setLazyParams(newParams);
        loadAllData(newParams);
    };

    const generatePdfReport = () => {
        let url = `${BASE_URL}/report/pdf`;
        const params = new URLSearchParams();

        if (dateDebut) {
            const startOfDay = new Date(dateDebut);
            startOfDay.setHours(0, 0, 0, 0);
            params.append('dateDebut', startOfDay.toISOString().split('T')[0]);
        }
        if (dateFin) {
            const endOfDay = new Date(dateFin);
            endOfDay.setHours(23, 59, 59, 999);
            params.append('dateFin', endOfDay.toISOString().split('T')[0]);
        }
        if (searchGPS.trim()) {
            params.append('lettreTransp', searchGPS.trim());
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        // Use useConsumApi with blob response type
        fetchPdfData(null, 'GET', url, 'exportPdfReport', false, 'blob');
    };

    const clearSearchValidation1 = () => {
        setDateDebutValidation1(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFinValidation1(new Date());
        setSearchGPSValidation1('');
        const newParams = { ...lazyParamsValidation1, first: 0, page: 0 };
        setLazyParamsValidation1(newParams);
        loadValidationData1(newParams);
    };

    const clearSearchValidation2 = () => {
        setDateDebutValidation2(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFinValidation2(new Date());
        setSearchGPSValidation2('');
        const newParams = { ...lazyParamsValidation2, first: 0, page: 0 };
        setLazyParamsValidation2(newParams);
        loadValidationData2(newParams);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else if (e.index === 2) {
            loadValidationData1();
        } else if (e.index === 3) {
            loadValidationData2();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche des services prestés</h5>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Rechercher"
                            onClick={handleSearch}
                            loading={loading}
                        />
                        <Button
                            icon="pi pi-times"
                            label="Effacer"
                            outlined
                            onClick={clearSearch}
                        />
                        <Button
                            icon="pi pi-file-pdf"
                            label="Exporter PDF"
                            severity="danger"
                            onClick={generatePdfReport}
                            loading={pdfLoading}
                        />
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-4">
                        <label htmlFor="dateDebut">Date Début</label>
                        <Calendar
                            id="dateDebut"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor="dateFin">Date Fin</label>
                        <Calendar
                            id="dateFin"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor="searchGPS">Numéro GPS</label>
                        <InputText
                            id="searchGPS"
                            value={searchGPS}
                            onChange={(e) => setSearchGPS(e.target.value)}
                            placeholder="Rechercher par numéro GPS"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderSearchValidation1 = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche pour validation 1er niveau</h5>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Rechercher"
                            onClick={handleSearchValidation1}
                            loading={loading}
                        />
                        <Button
                            icon="pi pi-times"
                            label="Effacer"
                            outlined
                            onClick={clearSearchValidation1}
                        />
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-3">
                        <label htmlFor="dateDebutValidation1">Date Début</label>
                        <Calendar
                            id="dateDebutValidation1"
                            value={dateDebutValidation1}
                            onChange={(e) => setDateDebutValidation1(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="dateFinValidation1">Date Fin</label>
                        <Calendar
                            id="dateFinValidation1"
                            value={dateFinValidation1}
                            onChange={(e) => setDateFinValidation1(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-6">
                        <label htmlFor="searchGPSValidation1">Numéro GPS</label>
                        <InputText
                            id="searchGPSValidation1"
                            value={searchGPSValidation1}
                            onChange={(e) => setSearchGPSValidation1(e.target.value)}
                            placeholder="Rechercher par numéro GPS"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderSearchValidation2 = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche pour validation 2ème niveau</h5>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Rechercher"
                            onClick={handleSearchValidation2}
                            loading={loading}
                        />
                        <Button
                            icon="pi pi-times"
                            label="Effacer"
                            outlined
                            onClick={clearSearchValidation2}
                        />
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-3">
                        <label htmlFor="dateDebutValidation2">Date Début</label>
                        <Calendar
                            id="dateDebutValidation2"
                            value={dateDebutValidation2}
                            onChange={(e) => setDateDebutValidation2(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="dateFinValidation2">Date Fin</label>
                        <Calendar
                            id="dateFinValidation2"
                            value={dateFinValidation2}
                            onChange={(e) => setDateFinValidation2(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-6">
                        <label htmlFor="searchGPSValidation2">Numéro GPS</label>
                        <InputText
                            id="searchGPSValidation2"
                            value={searchGPSValidation2}
                            onChange={(e) => setSearchGPSValidation2(e.target.value)}
                            placeholder="Rechercher par numéro GPS"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleString() : '';
    };

    const formatDateOnly = (date: Date | null) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount: number | null) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
    };

    const formatCurrencyWithDecimals = (amount: number | null) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const getValidationStatus1 = (rowData: any) => {
        if (rowData.valide1) {
            return <Badge value="Validé" severity="success" />;
        }
        return <Badge value="En attente" severity="warning" />;
    };

    const getValidationStatus2 = (rowData: any) => {
        if (rowData.valide2) {
            return <Badge value="Validé" severity="success" />;
        } else if (rowData.valide1) {
            return <Badge value="Prêt pour validation" severity="info" />;
        }
        return <Badge value="En attente 1er niv" severity="warning" />;
    };

    const getServiceLibelle = (serviceId: number | null): string => {
        if (!serviceId) return 'N/A';
        const service = services.find(s => s.id === serviceId);
        return service ? service.libelleService : `Service #${serviceId}`;
    };

    const getImportateurName = (importateurId: number | null): string => {
        if (!importateurId) return 'N/A';
        const importateur = importateurs.find(imp => imp.importateurId === importateurId);
        return importateur ? importateur.nom : `Client #${importateurId}`;
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Dialog
                header="Modifier Service Presté"
                visible={editFacServicePresteDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditFacServicePresteDialog(false)}
            >
                <FacServicePresteEntreeForm
                    facServicePresteEntree={facServicePresteEdit}
                    services={services}
                    importateurs={importateurs}
                    loadingStatus={loading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    serviceFilter={serviceFilter}
                    importateurFilter={importateurFilter}
                    onServiceFilterChange={handleServiceFilterChange}
                    onImportateurFilterChange={handleImportateurFilterChange}
                    onMontantChange={handleMontantChange}
                    disabled={false}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditFacServicePresteDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>


            <Dialog
                header={`Détails des services - Facture: ${selectedNumFacture}${selectedClientName ? ` - Client: ${selectedClientName}` : ''}`}
                visible={serviceDetailsDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => {
                    setServiceDetailsDialog(false);
                    setServiceDetails([]);
                    setSelectedNumFacture('');
                    setSelectedClientName('');
                }}
            >
                <DataTable
                    value={serviceDetails}
                    emptyMessage="Aucun service trouvé"
                    responsiveLayout="scroll"
                >
                    {/* <Column header="Client" body={(rowData) => getImportateurName(rowData.importateurId)} /> */}
                    <Column header="Service" body={(rowData) => getServiceLibelle(rowData.serviceId)} />
                    <Column field="montant" header="Montant" body={(rowData) => `${formatCurrency(rowData.montant)} FBU`} />
                    <Column field="montTaxe" header="Montant Taxe" body={(rowData) => `${formatCurrencyWithDecimals(rowData.montTaxe)} FBU`} />
                    <Column field="nbreCont" header="Quantité" />
                    <Column field="userCreation" header="Créé par" />
                    {/* <Column field="dateCreation" header="Date Création" body={(rowData) => formatDate(rowData.dateCreation)} /> */}
                    <Column field="valide1" header="Valid. 1" body={(rowData) => rowData.valide1 ? 'Oui' : 'Non'} />
                    <Column field="valide2" header="Valid. 2" body={(rowData) => rowData.valide2 ? 'Oui' : 'Non'} />
                </DataTable>

                <div className="mt-3 p-3 border-1 surface-border border-round">
                    <h6>Résumé</h6>
                    <div className="flex justify-content-between">
                        <span>Total services: <strong>{serviceDetails.length}</strong></span>
                        <span>Montant total: <strong>{formatCurrency(serviceDetails.reduce((sum, item) => sum + (item.montant || 0) + (item.montTaxe || 0) + (item.montRedev || 0) + (item.montRedevTaxe || 0), 0))} FBU</strong></span>
                        <span>Total taxes: <strong>{formatCurrencyWithDecimals(serviceDetails.reduce((sum, item) => sum + (item.montTaxe || 0) + (item.montRedevTaxe || 0), 0))} FBU</strong></span>
                    </div>
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <FacServicePresteEntreeForm
                        facServicePresteEntree={facServicePreste}
                        services={services}
                        importateurs={importateurs}
                        loadingStatus={loading}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleLazyLoading={handleLazyLoading}
                        serviceFilter={serviceFilter}
                        importateurFilter={importateurFilter}
                        onServiceFilterChange={handleServiceFilterChange}
                        onImportateurFilterChange={handleImportateurFilterChange}
                        onGPSBlur={handleGPSBlur}
                        onMontantChange={handleMontantChange}
                        disabled={isGPSSaved && !isEditMode}
                        isFirstService={allServicePrestE.length === 0}
                    />

                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-2 md:field md:col-2">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterFacServicePreste} />
                            </div>
                            {!isEditMode ? (
                                <>
                                    <div className="md:field md:col-3">
                                        <Button
                                            icon="pi pi-plus"
                                            label="Ajouter un service"
                                            loading={btnLoading}
                                            onClick={handleSubmit}
                                            disabled={isGPSSaved}
                                        />
                                    </div>
                                    <div className="md:field md:col-3">
                                        <Button
                                            icon="pi pi-save"
                                            label="Enregistrer le GPS"
                                            severity="success"
                                            loading={btnLoading}
                                            onClick={handleBatchSave}
                                            disabled={allServicePrestE.length === 0 || isGPSSaved}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="md:field md:col-3">
                                        <Button
                                            icon="pi pi-check"
                                            label="Mettre à jour le service"
                                            severity="success"
                                            loading={btnLoading}
                                            onClick={handleUpdateService}
                                        />
                                    </div>
                                    <div className="md:field md:col-3">
                                        <Button
                                            icon="pi pi-times"
                                            label="Annuler"
                                            severity="secondary"
                                            outlined
                                            onClick={handleCancelEdit}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* {showSearchResults && (
                        <FacServicePresteResult
                            facServiceTableTitle={`Services non validés pour le GPS: ${facServicePreste.lettreTransp}`}
                            results={searchResults}
                            loading={searchLoading}
                            onSelect={handleFactureSelect}
                            onClear={clearFactureSearchResults}
                        />
                    )} */}

                    <FacServicePresteResult
                        facServiceTableTitle={`Service(s) presté(s) pour ${facServicePreste.numFacture || facServicePreste.lettreTransp || 'GPS'}`}
                        results={allServicePrestE}
                        loading={loading}
                        onSelect={handleFactureSelect}
                        onClear={clearFactureSearchResults}
                        onDelete={handleDeleteService}
                        onEdit={handleEditService}
                        services={services}
                        isEditMode={isGPSSaved}
                    />
                </TabPanel>

                <TabPanel header="Consultation">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={facServicesPrestes}
                                    header={renderSearch}
                                    emptyMessage={"Pas de services prestés à afficher"}
                                    lazy
                                    paginator
                                    rows={lazyParams.rows}
                                    totalRecords={totalRecords}
                                    first={lazyParams.first}
                                    onPage={(e) => {
                                        const newParams = {
                                            ...lazyParams,
                                            first: e.first,
                                            rows: e.rows,
                                            page: e.page
                                        };
                                        setLazyParams(newParams);
                                        loadAllData(newParams);
                                    }}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field="numFacture" header="Numéro Facture" sortable />
                                    <Column field="date" header="Date" body={(rowData) => formatDateOnly(rowData.date)} sortable />
                                    <Column field="lettreTransp" header="GPS" sortable />
                                    {/* <Column field="serviceNames" header="Services" sortable /> */}
                                    <Column field="montant" header="Montant" body={(rowData) => `${formatCurrency(rowData.montant)} FBU`} sortable />
                                    <Column field="montTaxe" header="Montant Taxe" body={(rowData) => `${formatCurrencyWithDecimals(rowData.montTaxe)} FBU`} sortable />
                                    <Column field="typeVehicule" header="Type Véhicule" sortable />
                                    <Column field="plaque" header="Plaque" sortable />
                                    <Column field="valide1" header="Valid. Niv 1" body={(rowData) => rowData.valide1 ? 'Oui' : 'Non'} sortable />
                                    <Column field="valide2" header="Valid. Niv 2" body={(rowData) => rowData.valide2 ? 'Oui' : 'Non'} sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>

                {hasAuthority('GPS_MAGASIN_VALIDATE_1') && (
                    <TabPanel header="Validation 1er Niv">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={facServicesValidation1}
                                        header={renderSearchValidation1}
                                        emptyMessage={"Pas de services à afficher pour validation 1er niveau"}
                                        lazy
                                        paginator
                                        rows={lazyParamsValidation1.rows}
                                        totalRecords={totalRecordsValidation1}
                                        first={lazyParamsValidation1.first}
                                        onPage={(e) => {
                                            const newParams = {
                                                ...lazyParamsValidation1,
                                                first: e.first,
                                                rows: e.rows,
                                                page: e.page || 0
                                            };
                                            setLazyParamsValidation1(newParams);
                                            loadValidationData1(newParams);
                                        }}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                    >
                                        <Column field="numFacture" header="Numéro Facture" sortable />
                                        <Column field="date" header="Date" body={(rowData) => formatDateOnly(rowData.date)} sortable />
                                        <Column field="lettreTransp" header="GPS" sortable />
                                        {/* <Column field="serviceNames" header="Services" sortable /> */}
                                        <Column field="montant" header="Montant" body={(rowData) => `${formatCurrency(rowData.montant)} FBU`} sortable />
                                        <Column field="montTaxe" header="Montant Taxe" body={(rowData) => `${formatCurrencyWithDecimals(rowData.montTaxe)} FBU`} sortable />
                                        <Column field="plaque" header="Plaque" sortable />
                                        <Column field="userCreation" header="Créé par" sortable />
                                        {/* <Column field="dateCreation" header="Date Création" body={(rowData) => formatDate(rowData.dateCreation)} sortable /> */}
                                        <Column header="Statut" body={getValidationStatus1} />
                                        <Column header="Action" body={optionButtonsValidation1} />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}

                {hasAuthority('GPS_MAGASIN_VALIDATE_2') && (
                    <TabPanel header="Validation 2eme Niv">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={facServicesValidation2}
                                        header={renderSearchValidation2}
                                        emptyMessage={"Pas de services à afficher pour validation 2ème niveau"}
                                        lazy
                                        paginator
                                        rows={lazyParamsValidation2.rows}
                                        totalRecords={totalRecordsValidation2}
                                        first={lazyParamsValidation2.first}
                                        onPage={(e) => {
                                            const newParams = {
                                                ...lazyParamsValidation2,
                                                first: e.first,
                                                rows: e.rows,
                                                page: e.page || 0
                                            };
                                            setLazyParamsValidation2(newParams);
                                            loadValidationData2(newParams);
                                        }}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                    >
                                        <Column field="numFacture" header="Numéro Facture" sortable />
                                        <Column field="date" header="Date" body={(rowData) => formatDateOnly(rowData.date)} sortable />
                                        <Column field="lettreTransp" header="GPS" sortable />
                                        {/* <Column field="serviceNames" header="Services" sortable /> */}
                                        <Column field="montant" header="Montant" body={(rowData) => `${formatCurrency(rowData.montant)} FBU`} sortable />
                                        <Column field="montTaxe" header="Montant Taxe" body={(rowData) => `${formatCurrency(rowData.montTaxe)} FBU`} sortable />
                                        <Column field="plaque" header="Plaque" sortable />
                                        <Column field="userCreation" header="Créé par" sortable />
                                        <Column field="userValide1" header="Valid. 1er niv par" sortable />
                                        <Column header="Statut" body={getValidationStatus2} />
                                        <Column header="Action" body={optionButtonsValidation2} />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}
            </TabView>
        </>
    );
}

export default FacServicePresteComponent;