
'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { StkSortie, StkSortieDetails } from './StkSortie';
import StkSortieForm from './StkSortieForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';
import { useCurrentUser } from '@/hooks/fetchData/useCurrentUser';

const BASE_URL = `${API_BASE_URL}/stkSorties`;
const BASE_URLD = `${API_BASE_URL}/stkSortieDetails`;

export default function StkSortiePage() {
    const [sortie, setSortie] = useState<StkSortie>(() => {
        const newSortie = new StkSortie();
        newSortie.dateSortie = new Date();
        return newSortie;
    });
    const [sortieEdit, setSortieEdit] = useState<StkSortie>(new StkSortie());
    const [details, setDetails] = useState<StkSortieDetails[]>([]);
    const [detailsEdit, setDetailsEdit] = useState<StkSortieDetails[]>([]);
    const [sorties, setSorties] = useState<StkSortie[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [editDialog, setEditDialog] = useState(false);

    const { user: appUser, loading: userLoading, error: userError } = useCurrentUser();

    const [typeMvts, setTypeMvts] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [exercices, setExercices] = useState<any[]>([]);
    const [magasins, setMagasins] = useState<any[]>([]);
    const [magResponsables, setMagResponsables] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [destinations, setDestinations] = useState<any[]>([]);
    const [selectedSortie, setSelectedSortie] = useState<StkSortie | null>(null);
    const [sortieDetails, setSortieDetails] = useState<StkSortieDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
    const [existingSortieId, setExistingSortieId] = useState<string | null>(null);

    // Supprimer les états de suppression différée pour simplifier
    const [pendingDeletions, setPendingDeletions] = useState<number[]>([]);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllSorties();
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);

            const endpoints = [
                { url: `${API_BASE_URL}/articles/findall`, setter: setArticles, name: 'articles' },
                { url: `${API_BASE_URL}/typeMvts/by_sens/S`, setter: setTypeMvts, name: 'typeMvts' },
                { url: `${API_BASE_URL}/stkExercices/findanneencours`, setter: setExercices, name: 'exercices' },
                { url: `${API_BASE_URL}/stkMagasinResponsables/findall`, setter: setMagResponsables, name: 'magResponsables' },
                { url: `${API_BASE_URL}/services/findall`, setter: setServices, name: 'services' },
                { url: `${API_BASE_URL}/magasins/findall`, setter: setMagasins, name: 'magasins' },
                { url: `${API_BASE_URL}/destinations/findall`, setter: setDestinations, name: 'destinations' }
            ];

            const results = await Promise.allSettled(
                endpoints.map(endpoint => axios.get(endpoint.url))
            );

            results.forEach((result, index) => {
                const endpoint = endpoints[index];
                if (result.status === 'fulfilled') {
                    endpoint.setter(result.value.data);
                } else {
                    console.error(`❌ Erreur pour ${endpoint.name}:`, result.reason);
                    accept('error', 'Erreur', `Échec du chargement des ${endpoint.name}`);
                }
            });

            const destinationsResult = results[6];
            if (destinationsResult.status === 'fulfilled') {
                if (!destinationsResult.value.data || destinationsResult.value.data.length === 0) {
                    console.warn('Aucune destination trouvée dans la base de données');
                }
            }

        } catch (error) {
            console.error("Erreur globale lors du chargement des données:", error);
            accept('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const loadAllSorties = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setSorties(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des sorties');
        } finally {
            setLoading(false);
        }
    };

    const loadSortieDetailsForEdit = async (sortieId: string) => {
        try {
            const response = await axios.get(`${BASE_URLD}/findbysortie?sortieId=${sortieId}`);
            setDetailsEdit(response.data);
        } catch (error) {
            console.error("Error loading entry details for edit:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails pour modification');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSortie(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSortieEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setSortie(prev => ({ ...prev, [field]: e.value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent, field: string) => {
        setSortieEdit(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setSortie(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setSortieEdit(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setSortie(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setSortieEdit(prev => ({ ...prev, [name]: value }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, {
            ...new StkSortieDetails(),
            sortieDetailsId: undefined
        }]);
    };

    const addDetailEdit = () => {
        setDetailsEdit(prev => [...prev, {
            ...new StkSortieDetails(),
            sortieDetailsId: undefined,
            sortieId: sortieEdit.sortieId
        }]);
    };

    // Fonction simplifiée de suppression - comme pour les entrées
    const removeDetail = (index: number) => {
        setDetails(prev => prev.filter((_, i) => i !== index));
    };

    const removeDetailEdit = async (index: number) => {
        const detailToRemove = detailsEdit[index];
        
        // Si le détail a un ID (existe en base), demander confirmation
        if (detailToRemove.sortieDetailsId) {
            const confirmDelete = window.confirm('Voulez-vous vraiment supprimer ce détail ?');
            if (confirmDelete) {
                try {
                    // Suppression immédiate depuis l'API
                    await axios.delete(`${BASE_URLD}/delete/${detailToRemove.sortieDetailsId}`);
                    
                    // Mettre à jour l'interface
                    setDetailsEdit(prev => prev.filter((_, i) => i !== index));
                    accept('success', 'Succès', 'Détail supprimé avec succès');
                    
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    accept('error', 'Erreur', 'Échec de la suppression du détail');
                }
            }
        } else {
            // Si c'est un détail non sauvegardé, juste le retirer
            setDetailsEdit(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateDetail = (index: number, field: string, value: any) => {
        setDetails(prev => {
            const newDetails = [...prev];
            newDetails[index] = {
                ...newDetails[index],
                [field]: value
            };
            return newDetails;
        });
    };

    const updateDetailEdit = (index: number, field: string, value: any) => {
        setDetailsEdit(prev => {
            const newDetails = [...prev];
            newDetails[index] = {
                ...newDetails[index],
                [field]: value
            };
            return newDetails;
        });
    };

    const searchSortieByNumeroPiece = async (numeroPiece: string) => {
        if (!numeroPiece.trim()) {
            setExistingSortieId(null);
            return;
        }
        
        try {
            setLoading(true);
            
            const foundSortie = sorties.find(s => 
                s.numeroPiece?.toLowerCase() === numeroPiece.toLowerCase()
            );
            
            if (foundSortie) {
                setExistingSortieId(foundSortie.sortieId);
                setSortie({ ...foundSortie });
                
                try {
                    const detailsResponse = await axios.get(`${BASE_URLD}/findbysortie?sortieId=${foundSortie.sortieId}`);
                    setDetails(detailsResponse.data || []);
                    accept('success', 'Succès', 'Sortie existante trouvée - Mode modification activé');
                } catch (error) {
                    console.error("Erreur lors du chargement des détails:", error);
                    setDetails([]);
                    accept('info', 'Information', 'Sortie trouvée mais aucun détail chargé');
                }
            } else {
                setExistingSortieId(null);
                accept('info', 'Information', 'Nouvelle sortie - Mode création activé');
            }
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
            accept('error', 'Erreur', 'Échec de la recherche');
        } finally {
            setLoading(false);
        }
    };

    // Version alternative plus simple pour le format de date
    const formatLocalDateTime = (date: Date | null | undefined): string | null => {
        if (!date) return null;
        if (isNaN(date.getTime())) return null;
        
        // Retourne YYYY-MM-DDTHH:mm:ss (enlève les millisecondes et le Z)
        return date.toISOString().replace(/\.\d{3}Z$/, '');
    };

    const calculateTotalAmount = (detailsArray: StkSortieDetails[]) => {
        return detailsArray.reduce((total, detail) => {
            const prixTotal = detail.prixTotal || 0;
            return total + prixTotal;
        }, 0);
    };

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();
            
            // Calculer le montant total à partir des détails
            const montantTotal = calculateTotalAmount(details);

            if (existingSortieId) {
                // Mode modification
                await axios.put(`${BASE_URL}/update/${existingSortieId}`, {
                    ...sortie,
                    montant: montantTotal,
                    dateSortie: formatLocalDateTime(sortie.dateSortie),
                    dateUpdate: now,
                    userUpdate: appUser?.firstname
                });

                // Mettre à jour les détails existants
                for (const detail of details) {
                    if (detail.sortieDetailsId) {
                        await axios.put(`${BASE_URLD}/update/${detail.sortieDetailsId}`, {
                            ...detail,
                            datePeremption: formatLocalDateTime(detail.datePeremption),
                            dateUpdate: now,
                            userUpdate: appUser?.firstname
                        });
                    } else {
                        // Créer de nouveaux détails
                        await axios.post(`${BASE_URLD}/new`, {
                            ...detail,
                            sortieDetailsId: null,
                            sortieId: existingSortieId,
                            numeroPiece: sortie.numeroPiece,
                            articleStockId: detail.articleStockId || detail.articleId,
                            prixS: detail.prixS || detail.prixVente || 0,
                            pau: detail.pau || detail.pUMP || 0,
                            pUMP: detail.pUMP || 0,
                            prixTotal: detail.prixTotal || (detail.qteS || 0) * (detail.pUMP || 0),
                            datePeremption: formatLocalDateTime(detail.datePeremption),
                            dateCreation: now,
                            dateUpdate: now,
                            userCreation: appUser?.firstname,
                            userUpdate: appUser?.firstname
                        });
                    }
                }

                accept('success', 'Succès', 'Sortie modifiée avec succès');
            } else {
                // Mode création
                const sortieResponse = await axios.post(`${BASE_URL}/new`, {
                    ...sortie,
                    sortieId: null,
                    montant: montantTotal,
                    dateSortie: formatLocalDateTime(sortie.dateSortie),
                    dateCreation: now,
                    dateUpdate: now,
                    userCreation: appUser?.firstname,
                    userUpdate: appUser?.firstname
                });

                if (!sortieResponse.data?.sortieId) {
                    throw new Error("Failed to save main entry");
                }

                if (details.length > 0) {
                    for (const detail of details) {
                        await axios.post(`${BASE_URLD}/new`, {
                            ...detail,
                            sortieDetailsId: null,
                            sortieId: sortieResponse.data.sortieId,
                            numeroPiece: sortieResponse.data.numeroPiece,
                            articleStockId: detail.articleStockId || detail.articleId,
                            prixS: detail.prixS || detail.prixVente || 0,
                            pau: detail.pau || detail.pUMP || 0,
                            pUMP: detail.pUMP || 0,
                            prixTotal: detail.prixTotal || (detail.qteS || 0) * (detail.pUMP || 0),
                            datePeremption: formatLocalDateTime(detail.datePeremption),
                            dateCreation: now,
                            dateUpdate: now,
                            userCreation: appUser?.firstname,
                            userUpdate: appUser?.firstname
                        });
                    }
                }

                accept('success', 'Succès', 'Sortie créée avec succès');
            }

            // Réinitialiser le formulaire avec la date du jour
            const newSortie = new StkSortie();
            newSortie.dateSortie = new Date();
            setSortie(newSortie);
            setDetails([]);
            setExistingSortieId(null);
            loadAllSorties();
        } catch (error) {
            console.error("Erreur:", error);
            accept('error', 'Erreur', existingSortieId ? 'Échec de la modification' : 'Échec de la création');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            // Calculer le montant pour l'édition
            const montantTotal = calculateTotalAmount(detailsEdit);

            // Mettre à jour la sortie principale
            await axios.put(`${BASE_URL}/update/${sortieEdit.sortieId}`, {
                ...sortieEdit,
                montant: montantTotal,
                dateUpdate: now,
                userUpdate: appUser?.firstname
            });

            // Mettre à jour les détails
            for (const detail of detailsEdit) {
                if (detail.sortieDetailsId) {
                    // Mise à jour des détails existants
                    await axios.put(`${BASE_URLD}/update/${detail.sortieDetailsId}`, {
                        ...detail,
                        dateUpdate: now,
                        userUpdate: appUser?.firstname
                    });
                } else {
                    // Création de nouveaux détails
                    await axios.post(`${BASE_URLD}/new`, {
                        ...detail,
                        sortieDetailsId: null,
                        sortieId: sortieEdit.sortieId,
                        numeroPiece: sortieEdit.numeroPiece,
                        articleStockId: detail.articleStockId || detail.articleId,
                        prixS: detail.prixS || detail.prixVente || 0,
                        pau: detail.pau || detail.pUMP || 0,
                        pUMP: detail.pUMP || 0,
                        prixTotal: detail.prixTotal || (detail.qteS || 0) * (detail.pUMP || 0),
                        dateCreation: now,
                        dateUpdate: now,
                        userCreation: appUser?.firstname,
                        userUpdate: appUser?.firstname
                    });
                }
            }

            accept('success', 'Succès', 'Sortie et détails modifiés avec succès');
            setEditDialog(false);
            loadAllSorties();
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            accept('error', 'Erreur', 'Échec de la modification');
        } finally {
            setBtnLoading(false);
        }
    };

    // Fonction pour rafraîchir les données
    const refreshData = async () => {
        await loadAllSorties();
        if (sortieEdit.sortieId) {
            await loadSortieDetailsForEdit(sortieEdit.sortieId);
        }
    };

    const getArticleStockId = async (articleId: string, magasinId: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/articleStocks/findByArticleAndMagasin`, {
                params: {
                    articleId,
                    magasinId
                }
            });
            return response.data.articleStockId;
        } catch (error) {
            console.error("Erreur récupération articleStockId:", error);
            return articleId;
        }
    };

    const formatDate = (date: Date | string | null | undefined): string => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const filteredSorties = sorties.filter(sortie =>
        sortie.numeroPiece?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadSortieDetails = async (sortieId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/findbysortie?sortieId=${sortieId}`);
            setSortieDetails(response.data);
            setDetailsDialogVisible(true);
        } catch (error) {
            console.error("Error loading entry details:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails');
        } finally {
            setLoading(false);
        }
    };

    const editSortie = async (sortie: StkSortie) => {
        setSortieEdit({ ...sortie });
        await loadSortieDetailsForEdit(sortie.sortieId);
        setEditDialog(true);
    };

    const resetEditDialog = () => {
        setEditDialog(false);
        setPendingDeletions([]);
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="p-tabview"
            >
                <TabPanel header="Nouvelle sortie" className="p-tabview-panel">
                    <div className="mb-3 p-3 border-round surface-100">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-primary"></i>
                            <small className="text-primary">
                                {existingSortieId 
                                    ? "Mode modification - Cette sortie existe déjà dans la base de données" 
                                    : "Mode création - Nouvelle sortie"}
                            </small>
                        </div>
                    </div>

                    <StkSortieForm
                        sortie={sortie}
                        details={details}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        addDetail={addDetail}
                        removeDetail={removeDetail}
                        updateDetail={updateDetail}
                        loading={loading}
                        setDetails={setDetails}
                        typeMvts={typeMvts}
                        articles={articles}
                        exercices={exercices}
                        magasins={magasins}
                        services={services}
                        responsables={magResponsables}
                        destinations={destinations}
                        onSearchSortie={searchSortieByNumeroPiece}
                        existingSortieId={existingSortieId}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label={existingSortieId ? "Modifier" : "Enregistrer"}
                            icon={existingSortieId ? "pi pi-sync" : "pi pi-check"}
                            loading={btnLoading}
                            onClick={handleSubmit}
                            className={existingSortieId ? "p-button-warning" : "p-button-success"}
                        />
                        {existingSortieId && (
                            <Button
                                label="Nouveau"
                                icon="pi pi-plus"
                                onClick={() => {
                                    const newSortie = new StkSortie();
                                    newSortie.dateSortie = new Date();
                                    setSortie(newSortie);
                                    setDetails([]);
                                    setExistingSortieId(null);
                                }}
                                className="p-button-secondary"
                            />
                        )}
                    </div>
                </TabPanel>
                <TabPanel header="Liste des sorties" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par numéro de pièce"
                                className="w-full"
                            />
                        </span>
                        <Button
                            icon="pi pi-refresh"
                            tooltip="Rafraîchir la liste"
                            onClick={refreshData}
                            className="p-button-rounded p-button-text"
                            disabled={loading}
                        />
                    </div>
                     
                    <DataTable
    value={filteredSorties}
    loading={loading}
    paginator
    rows={10}
    emptyMessage="Aucune sortie trouvée"
    className="p-datatable-sm"
    scrollable
    scrollHeight="flex"
    selectionMode="single"
    onSelectionChange={(e) => {
        const selected = e.value as StkSortie;
        setSelectedSortie(selected);
        loadSortieDetails(selected.sortieId);
    }}
    selection={selectedSortie}
    rowClassName={() => "cursor-pointer"}
>
    <Column field="numeroPiece" header="Numéro Pièce" sortable />
    <Column field="magasinId" header="Magasin" sortable />
    <Column
        field="dateSortie"
        header="Date Sortie"
        body={(rowData) => formatDate(rowData.dateSortie)}
        sortable
        style={{ minWidth: '120px' }}
    />
    <Column
        field="montant"
        header="Montant"
        body={(rowData) => rowData.montant?.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0
        })}
        sortable
        style={{ minWidth: '120px' }}
    />
    <Column field="exerciceId" header="Exercice" sortable />
    <Column 
        header="Destinataire" 
        body={(rowData) => {
            // Trouver la destination correspondante dans la liste des destinations
            const destination = destinations.find(d => d.pDestinationId === rowData.destinationId);
            return destination?.pLibelle || rowData.destinationId || "Non spécifié";
        }}
        sortable
    />
    <Column
        header="Actions"
        body={(rowData) => (
            <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-warning p-button-text"
                onClick={(e) => {
                    e.stopPropagation();
                    editSortie(rowData);
                }}
                tooltip="Modifier"
            />
        )}
    />
</DataTable>
                </TabPanel>
            </TabView>

            <Dialog 
                header={`Détails de la sortie ${selectedSortie?.numeroPiece}`}
                visible={detailsDialogVisible} 
                style={{ width: '75vw' }}
                onHide={() => setDetailsDialogVisible(false)}
            >
                {loading ? (
                    <div className="flex justify-content-center">
                        <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem' }}></i>
                    </div>
                ) : (
                    <DataTable
                    value={sortieDetails}
                    emptyMessage="Aucun détail trouvé"
                    className="p-datatable-sm"
                >
                    <Column 
                        header="Article" 
                        body={(rowData) => {
                            // Trouver l'article correspondant dans la liste des articles
                            const article = articles.find(a => a.articleId === rowData.articleId);
                            return article?.libelle || rowData.articleId || "Non trouvé";
                        }}
                    />
                    <Column field="qteS" header="Quantité" />
                    <Column field="prixS" header="Prix de sortie" 
                        body={(rowData) => rowData.prixS?.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'BIF',
                            minimumFractionDigits: 0
                        })} 
                    />
                    <Column field="pUMP" header="PUMP" 
                        body={(rowData) => rowData.pUMP?.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'BIF',
                            minimumFractionDigits: 0
                        })} 
                    />
                    
                </DataTable>
                )}
            </Dialog>

            <Dialog 
                header={`Modifier la sortie ${sortieEdit.numeroPiece}`}
                visible={editDialog} 
                style={{ width: '90vw' }}
                onHide={resetEditDialog}
                footer={
                    <div className="flex justify-content-between align-items-center w-full">
                        <div>
                            {pendingDeletions.length > 0 && (
                                <small className="p-text-warning">
                                    <i className="pi pi-info-circle mr-1"></i>
                                    {pendingDeletions.length} détail(s) marqué(s) pour suppression
                                </small>
                            )}
                        </div>
                        <div className="flex justify-content-end gap-2">
                            <Button
                                label="Rafraîchir"
                                icon="pi pi-refresh"
                                onClick={refreshData}
                                className="p-button-secondary"
                                disabled={btnLoading}
                            />
                            <Button
                                label="Annuler"
                                icon="pi pi-times"
                                onClick={resetEditDialog}
                                className="p-button-secondary"
                            />
                            <Button
                                label="Modifier"
                                icon="pi pi-check"
                                loading={btnLoading}
                                onClick={handleSubmitEdit}
                                className="p-button-warning"
                            />
                        </div>
                    </div>
                }
            >
                <StkSortieForm
                    sortie={sortieEdit}
                    details={detailsEdit}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    addDetail={addDetailEdit}
                    removeDetail={removeDetailEdit}
                    updateDetail={updateDetailEdit}
                    loading={loading}
                    setDetails={setDetailsEdit}
                    typeMvts={typeMvts}
                    articles={articles}
                    exercices={exercices}
                    magasins={magasins}
                    services={services}
                    responsables={magResponsables}
                    destinations={destinations}
                />
            </Dialog>
            
            <style jsx>{`
                .cursor-pointer {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}