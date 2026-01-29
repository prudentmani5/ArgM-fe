'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { StkEntree, StkEntreeDetails } from './StkEntree';
import StkEntreeForm from './StkEntreeForm';
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

const BASE_URL = `${API_BASE_URL}/stkEntrees`;
const BASE_URLD = `${API_BASE_URL}/stkEntreeDetails`;



export default function StkEntreePage() {
    const [entree, setEntree] = useState<StkEntree>(new StkEntree());
    const [entreeEdit, setEntreeEdit] = useState<StkEntree>(new StkEntree());
    const [details, setDetails] = useState<StkEntreeDetails[]>([]);
    const [detailsEdit, setDetailsEdit] = useState<StkEntreeDetails[]>([]);
    const [entrees, setEntrees] = useState<StkEntree[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [editDialog, setEditDialog] = useState(false);

    const { user: appUser, loading: userLoading, error: userError } = useCurrentUser();

    // Data for dropdowns
    const [fournisseurs, setFournisseurs] = useState<any[]>([]);
    const [typeMvts, setTypeMvts] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [exercices, setExercices] = useState<any[]>([]);
    const [magasins, setMagasins] = useState<any[]>([]);
    const [responsables, setResponsables] = useState<any[]>([]);
    const [selectedEntree, setSelectedEntree] = useState<StkEntree | null>(null);
    const [entreeDetails, setEntreeDetails] = useState<StkEntreeDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
    const [existingEntreeId, setExistingEntreeId] = useState<string | null>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllEntrees();
        loadDropdownData();
        
        // Initialiser la date d'entrée avec la date du jour
        const today = new Date();
        const initialEntree = new StkEntree();
        initialEntree.dateEntree = today;
        
        setEntree(initialEntree);
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);   

            const endpoints = [
                { url: `${API_BASE_URL}/articles/findall`, setter: setArticles },
                { url: `${API_BASE_URL}/typeMvts/by_sens/E`, setter: setTypeMvts },
                { url: `${API_BASE_URL}/stkExercices/findanneencours`, setter: setExercices },
                { url: `${API_BASE_URL}/stkMagasinResponsables/findall`, setter: setResponsables },
                { url: `${API_BASE_URL}/magasins/findall`, setter: setMagasins },
                { url: `${API_BASE_URL}/fournisseurs/findall`, setter: setFournisseurs }
            ];

            const results = await Promise.allSettled(
                endpoints.map(endpoint => axios.get(endpoint.url))
            );

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    endpoints[index].setter(result.value.data);
                } else {
                    console.error(`Erreur de chargement pour ${endpoints[index].url}:`, result.reason);
                    accept('error', 'Erreur', `Échec du chargement des données pour ${endpoints[index].url.split('/')[3]}`);
                }
            });

        } catch (error) {
            console.error("Erreur globale lors du chargement des données:", error);
            accept('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const loadAllEntrees = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setEntrees(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des entrées');
        } finally {
            setLoading(false);
        }
    };

    const loadEntreeDetailsForEdit = async (entreeId: string) => {
        try {
            const response = await axios.get(`${BASE_URLD}/findbyentree?entreeId=${entreeId}`);
            setDetailsEdit(response.data);
        } catch (error) {
            console.error("Error loading entry details for edit:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails pour modification');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntree(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntreeEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setEntree(prev => ({ ...prev, [field]: e.value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent, field: string) => {
        setEntreeEdit(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setEntree(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setEntreeEdit(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setEntree(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setEntreeEdit(prev => ({ ...prev, [name]: value }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, {
            ...new StkEntreeDetails(),
            entreeDetailsId: undefined
        }]);
    };

    const addDetailEdit = () => {
        setDetailsEdit(prev => [...prev, {
            ...new StkEntreeDetails(),
            entreeDetailsId: undefined,
            entreeId: entreeEdit.entreeId
        }]);
    };

    const removeDetail = (index: number) => {
        setDetails(prev => prev.filter((_, i) => i !== index));
    };

    const removeDetailEdit = (index: number) => {
        setDetailsEdit(prev => prev.filter((_, i) => i !== index));
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

    const searchEntreeByNumeroPiece = async (numeroPiece: string) => {
        if (!numeroPiece.trim()) {
            setExistingEntreeId(null);
            return;
        }
        
        try {
            setLoading(true);
            
            // Recherche dans les entrées déjà chargées
            const foundEntree = entrees.find(e => 
                e.numeroPiece?.toLowerCase() === numeroPiece.toLowerCase()
            );
            
            if (foundEntree) {
                setExistingEntreeId(foundEntree.entreeId);
                
                // Charger l'entrée principale
                setEntree({ ...foundEntree });
                
                // Charger les détails de l'entrée depuis l'API
                try {
                    const detailsResponse = await axios.get(`${BASE_URLD}/findbyentree?entreeId=${foundEntree.entreeId}`);
                    setDetails(detailsResponse.data || []);
                    accept('success', 'Succès', 'Entrée existante trouvée - Mode modification activé');
                } catch (error) {
                    console.error("Erreur lors du chargement des détails:", error);
                    setDetails([]);
                    accept('info', 'Information', 'Entrée trouvée mais aucun détail chargé');
                }
            } else {
                setExistingEntreeId(null);
                // Réinitialiser avec la date du jour pour une nouvelle entrée
                setEntree(prev => ({
                    ...prev,
                    dateEntree: new Date()
                }));
                accept('info', 'Information', 'Nouvelle entrée - Mode création activé');
            }
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
            accept('error', 'Erreur', 'Échec de la recherche');
        } finally {
            setLoading(false);
        }
    };

    // Version alternative plus simple
    const formatLocalDateTime = (date: Date | null | undefined): string | null => {
        if (!date) return null;
        if (isNaN(date.getTime())) return null;
        
        // Retourne YYYY-MM-DDTHH:mm:ss (enlève les millisecondes et le Z)
        return date.toISOString().replace(/\.\d{3}Z$/, '');
    };

    const calculateTotalAmount = (detailsArray: StkEntreeDetails[]) => {
        return detailsArray.reduce((total, detail) => {
            const prixE = detail.prixE || 0;
            return total + prixE;
        }, 0);
    };

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();
            
            // Calculer le montant total à partir des détails
            const montantTotal = calculateTotalAmount(details);

            if (existingEntreeId) {
                // Mode modification
                await axios.put(`${BASE_URL}/update/${existingEntreeId}`, {
                    ...entree,
                    montant: montantTotal,
                    dateEntree: formatLocalDateTime(entree.dateEntree),
                    dateUpdate: now,
                    userUpdate: appUser?.firstname
                });

                // Mettre à jour les détails existants
                for (const detail of details) {
                    if (detail.entreeDetailsId) {
                        await axios.put(`${BASE_URLD}/update/${detail.entreeDetailsId}`, {
                            ...detail,
                            datePeremption: formatLocalDateTime(detail.datePeremption),
                            dateFabrication: formatLocalDateTime(detail.dateFabrication),
                            dateUpdate: now,
                            userUpdate: appUser?.firstname
                        });
                    } else {
                        // Créer de nouveaux détails
                        await axios.post(`${BASE_URLD}/new`, {
                            ...detail,
                            entreeDetailsId: null,
                            entreeId: existingEntreeId,
                            numeroPiece: entree.numeroPiece,
                            uniteId: detail.uniteId, // Sauvegarde de l'unité
                            datePeremption: formatLocalDateTime(detail.datePeremption),
                            dateFabrication: formatLocalDateTime(detail.dateFabrication),
                            dateCreation: now,
                            dateUpdate: now,
                            userCreation: appUser?.firstname,
                            userUpdate: appUser?.firstname
                        });
                    }
                }

                accept('success', 'Succès', 'Entrée modifiée avec succès');
            } else {
                // Mode création
                const entreeResponse = await axios.post(`${BASE_URL}/new`, {
                    ...entree,
                    entreeId: null,
                    montant: montantTotal,
                    dateEntree: formatLocalDateTime(entree.dateEntree),
                    dateCreation: now,
                    dateUpdate: now,
                    userCreation: appUser?.firstname,
                    userUpdate: appUser?.firstname
                });

                if (!entreeResponse.data?.entreeId) {
                    throw new Error("Failed to save main entry");
                }

                if (details.length > 0) {
                    for (const detail of details) {
                        await axios.post(`${BASE_URLD}/new`, {
                            ...detail,
                            entreeDetailsId: null,
                            entreeId: entreeResponse.data.entreeId,
                            numeroPiece: entreeResponse.data.numeroPiece,
                            articleStockId: entreeResponse.data.numeroPiece,
                            uniteId: detail.uniteId, // Sauvegarde de l'unité
                            datePeremption: formatLocalDateTime(detail.datePeremption),
                            dateFabrication: formatLocalDateTime(detail.dateFabrication),
                            dateCreation: now,
                            dateUpdate: now,
                            userCreation: appUser?.firstname,
                            userUpdate: appUser?.firstname
                        });
                    }
                }

                accept('success', 'Succès', 'Entrée créée avec succès');
            }

            // Réinitialiser le formulaire avec la date du jour
            const today = new Date();
            const resetEntree = new StkEntree();
            resetEntree.dateEntree = today;
            
            setEntree(resetEntree);
            setDetails([]);
            setExistingEntreeId(null);
            loadAllEntrees();
        } catch (error) {
            console.error("Erreur:", error);
            accept('error', 'Erreur', existingEntreeId ? 'Échec de la modification' : 'Échec de la création');
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

            // Mettre à jour l'entrée principale
            await axios.put(`${BASE_URL}/update/${entreeEdit.entreeId}`, {
                ...entreeEdit,
                montant: montantTotal,
                dateUpdate: now,
                userUpdate: appUser?.firstname
            });

            // Mettre à jour les détails
            for (const detail of detailsEdit) {
                if (detail.entreeDetailsId) {
                    // Mise à jour des détails existants
                    await axios.put(`${BASE_URLD}/update/${detail.entreeDetailsId}`, {
                        ...detail,
                        dateUpdate: now,
                        userUpdate: appUser?.firstname
                    });
                } else {
                    // Création de nouveaux détails
                    await axios.post(`${BASE_URLD}/new`, {
                        ...detail,
                        entreeDetailsId: null,
                        entreeId: entreeEdit.entreeId,
                        numeroPiece: entreeEdit.numeroPiece,
                        uniteId: detail.uniteId, // Sauvegarde de l'unité
                        dateCreation: now,
                        dateUpdate: now,
                        userCreation: appUser?.firstname,
                        userUpdate: appUser?.firstname
                    });
                }
            }

            accept('success', 'Succès', 'Entrée et détails modifiés avec succès');
            setEditDialog(false);
            loadAllEntrees();
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            accept('error', 'Erreur', 'Échec de la modification');
        } finally {
            setBtnLoading(false);
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

    const filteredEntrees = entrees.filter(entree =>
        entree.numeroPiece?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        entree.reference?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadEntreeDetails = async (entreeId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/findbyentree?entreeId=${entreeId}`);
            setEntreeDetails(response.data);
            setDetailsDialogVisible(true);
        } catch (error) {
            console.error("Error loading entry details:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails');
        } finally {
            setLoading(false);
        }
    };

    const editEntree = async (entree: StkEntree) => {
        setEntreeEdit({ ...entree });
        await loadEntreeDetailsForEdit(entree.entreeId);
        setEditDialog(true);
    };

    const actionBodyTemplate = (rowData: StkEntree) => {
        return (
            <Button 
                icon="pi pi-pencil" 
                rounded 
                severity="warning" 
                onClick={() => editEntree(rowData)} 
            />
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            
            {/* Dialog pour modifier l'entrée avec ses détails */}
            <Dialog 
                header={`Modifier l'entrée ${entreeEdit.numeroPiece}`} 
                visible={editDialog} 
                style={{ width: '90vw', maxWidth: '1400px' }}
                onHide={() => setEditDialog(false)}
                className="max-h-screen overflow-auto"
            >
                <div className="grid">
                    <div className="col-12">
                        <h3>Informations principales</h3>
                        <StkEntreeForm
                            entree={entreeEdit}
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
                            fournisseurs={fournisseurs}
                            typeMvts={typeMvts}
                            articles={articles}
                            exercices={exercices}
                            magasins={magasins}
                            responsables={responsables}
                            onSearchEntree={searchEntreeByNumeroPiece}
                        />
                    </div>
                </div>
                
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditDialog(false)}
                        className="p-button-secondary"
                    />
                    <Button 
                        label="Modifier" 
                        icon="pi pi-check" 
                        loading={btnLoading}
                        onClick={handleSubmitEdit} 
                        className="p-button-primary"
                    />
                </div>
            </Dialog>

            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="p-tabview"
            >
                <TabPanel header="Nouvelle entrée" className="p-tabview-panel">
                    <div className="mb-3 p-3 border-round surface-100">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-primary"></i>
                            <small className="text-primary">
                                {existingEntreeId 
                                    ? "Mode modification - Cette entrée existe déjà dans la base de données" 
                                    : "Mode création - Nouvelle entrée"}
                            </small>
                        </div>
                    </div>

                    <StkEntreeForm
                        entree={entree}
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
                        fournisseurs={fournisseurs}
                        typeMvts={typeMvts}
                        articles={articles}
                        exercices={exercices}
                        magasins={magasins}
                        responsables={responsables}
                        onSearchEntree={searchEntreeByNumeroPiece}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label={existingEntreeId ? "Modifier" : "Enregistrer"}
                            icon={existingEntreeId ? "pi pi-sync" : "pi pi-check"}
                            loading={btnLoading}
                            onClick={handleSubmit}
                            className={existingEntreeId ? "p-button-warning" : "p-button-success"}
                        />
                    </div>
                </TabPanel>
                <TabPanel header="Liste des entrées" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par pièce ou référence"
                                className="w-full"
                            />
                        </span>
                    </div>
                     
                    <DataTable
                    value={filteredEntrees}
                    loading={loading}
                    paginator
                    rows={10}
                    emptyMessage="Aucune entrée trouvée"
                    className="p-datatable-sm"
                    scrollable
                    scrollHeight="flex"
                    selectionMode="single"
                    onSelectionChange={(e) => {
                        const selected = e.value as StkEntree;
                        setSelectedEntree(selected);
                        loadEntreeDetails(selected.entreeId);
                    }}
                    selection={selectedEntree}
                    rowClassName={() => "cursor-pointer"}
                >
                    <Column field="numeroPiece" header="Numéro Pièce" sortable />
                    <Column field="magasinId" header="Magasin" sortable />
                    <Column
                        field="dateEntree"
                        header="Date Entrée"
                        body={(rowData) => formatDate(rowData.dateEntree)}
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
                        header="Fournisseur" 
                        sortable
                        sortField="fournisseurId"
                        body={(rowData) => {
                            // Rechercher le fournisseur correspondant dans la liste fournisseurs
                            const fournisseur = fournisseurs.find(f => f.fournisseurId === rowData.fournisseurId);
                            return fournisseur?.nom || rowData.fournisseurId || "Non spécifié";
                        }}
                    />
                    <Column body={actionBodyTemplate} header="Actions" />
                </DataTable>
                </TabPanel>
            </TabView>
            
           <Dialog 
    header={`Détails de l'entrée ${selectedEntree?.numeroPiece}`}
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
            value={entreeDetails}
            emptyMessage="Aucun détail trouvé"
            className="p-datatable-sm"
        >
            <Column 
                header="Article" 
                body={(rowData) => {
                    // Rechercher l'article correspondant dans la liste des articles
                    const article = articles.find(a => a.articleId === rowData.articleId);
                    return article?.libelle || rowData.articleId || "Non spécifié";
                }}
            />
            <Column field="qteE" header="Quantité" />
             <Column field="uniteId" header="Unité" />
            <Column field="pau" header="Prix d'achat unitaire" 
                body={(rowData) => rowData.pau?.toLocaleString('fr-FR', { 
                    style: 'currency', 
                    currency: 'BIF',
                    minimumFractionDigits: 0
                })} 
            />
            <Column field="prixE" header="Prix total" 
                body={(rowData) => rowData.prixE?.toLocaleString('fr-FR', { 
                    style: 'currency', 
                    currency: 'BIF',
                    minimumFractionDigits: 0
                })} 
            />
        </DataTable>
    )}
</Dialog>
            
            <style jsx>{`
                .cursor-pointer {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}