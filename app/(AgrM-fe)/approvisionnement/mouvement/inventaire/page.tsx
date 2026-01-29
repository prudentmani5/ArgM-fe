
'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { StkInventaire, StkInventaireDetails } from './stkInventaire';
import StkInventaireForm from './StkInventaireForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const BASE_URL = `${API_BASE_URL}/stkinventaire`;
const BASE_URLD = `${API_BASE_URL}/inventaireDetails`;

export default function StkInventairePage() {
    const [inventaire, setInventaire] = useState<StkInventaire>(() => {
        const newInventaire = new StkInventaire();
        newInventaire.dateInventaire = new Date(); // Date actuelle par défaut
        return newInventaire;
    });
    const [inventaireEdit, setInventaireEdit] = useState<StkInventaire>(new StkInventaire());
    const [details, setDetails] = useState<StkInventaireDetails[]>([]);
    const [detailsEdit, setDetailsEdit] = useState<StkInventaireDetails[]>([]);
    const [inventaires, setInventaires] = useState<StkInventaire[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [editDialog, setEditDialog] = useState(false);

    // Data for dropdowns
    const [articles, setArticles] = useState<any[]>([]);
    const [exercices, setExercices] = useState<any[]>([]);
    const [magasins, setMagasins] = useState<any[]>([]);
    const [magResponsables, setMagResponsables] = useState<any[]>([]);
    const [unites, setUnites] = useState<any[]>([]);
    const [selectedInventaire, setSelectedInventaire] = useState<StkInventaire | null>(null);
    const [inventaireDetails, setInventaireDetails] = useState<StkInventaireDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
    const [existingInventaireId, setExistingInventaireId] = useState<string | null>(null);
    const [deletingDetailId, setDeletingDetailId] = useState<number | null>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllInventaires();
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);

            const endpoints = [
                { url: `${API_BASE_URL}/articles/findall1`, setter: setArticles, name: 'articles' },
                { url: `${API_BASE_URL}/stkExercices/findanneencours`, setter: setExercices, name: 'exercices' },
                { url: `${API_BASE_URL}/magasins/findall`, setter: setMagasins, name: 'magasins' },
                { url: `${API_BASE_URL}/stkMagasinResponsables/findall`, setter: setMagResponsables, name: 'magResponsables' },
                { url: `${API_BASE_URL}/unites/findall`, setter: setUnites, name: 'unites' }
            ];

            const results = await Promise.allSettled(
                endpoints.map(endpoint => axios.get(endpoint.url))
            );

            results.forEach((result, index) => {
                const endpoint = endpoints[index];
                if (result.status === 'fulfilled') {
                    console.log(`✅ ${endpoint.name} chargés:`, result.value.data);
                    endpoint.setter(result.value.data);
                } else {
                    console.error(`❌ Erreur pour ${endpoint.name}:`, result.reason);
                    console.error(`URL: ${endpoint.url}`);
                    console.error('Response:', result.reason.response?.data);
                    accept('error', 'Erreur', `Échec du chargement des ${endpoint.name}`);
                }
            });

        } catch (error) {
            console.error("Erreur globale lors du chargement des données:", error);
            accept('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const loadAllInventaires = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setInventaires(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des inventaires');
        } finally {
            setLoading(false);
        }
    };

    const loadInventaireDetailsForEdit = async (inventaireId: string) => {
        try {
            const response = await axios.get(`${BASE_URLD}/findbyinventaire?inventaireId=${inventaireId}`);
            setDetailsEdit(response.data);
        } catch (error) {
            console.error("Error loading entry details for edit:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails pour modification');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInventaire(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInventaireEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setInventaire(prev => ({ ...prev, [field]: e.value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent, field: string) => {
        setInventaireEdit(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setInventaire(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setInventaireEdit(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setInventaire(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setInventaireEdit(prev => ({ ...prev, [name]: value }));
    };

    const addDetail = () => {
        setDetails(prev => [{
            ...new StkInventaireDetails(),
            inventaireDetailsId: undefined
        }, ...prev]); // Nouvelle ligne ajoutée au début
    };

    const addDetailEdit = () => {
        setDetailsEdit(prev => [{
            ...new StkInventaireDetails(),
            inventaireDetailsId: undefined,
            inventaireId: inventaireEdit.inventaireId
        }, ...prev]); // Nouvelle ligne ajoutée au début
    };

    const removeDetail = (index: number) => {
        setDetails(prev => prev.filter((_, i) => i !== index));
    };

    const removeDetailEdit = async (index: number, detailId?: number) => {
        // Si le détail a un ID dans la base de données, le supprimer aussi de la BD
        if (detailId && detailId > 0) {
            try {
                setDeletingDetailId(detailId);
                await axios.delete(`${BASE_URLD}/delete/${detailId}`);
                accept('success', 'Succès', 'Ligne supprimée avec succès de la base de données');
            } catch (error) {
                console.error("Erreur lors de la suppression de la ligne:", error);
                accept('error', 'Erreur', 'Échec de la suppression de la ligne de la base de données');
                return; // Ne pas supprimer de l'état si la suppression BD a échoué
            } finally {
                setDeletingDetailId(null);
            }
        }
        
        // Supprimer de l'état local
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

    const searchInventaireByNumeroPiece = async (numeroPiece: string) => {
        if (!numeroPiece.trim()) {
            setExistingInventaireId(null);
            return;
        }
        
        try {
            setLoading(true);
            
            // Recherche dans les inventaires déjà chargés
            const foundInventaire = inventaires.find(s => 
                s.numeroPiece?.toLowerCase() === numeroPiece.toLowerCase()
            );
            
            if (foundInventaire) {
                setExistingInventaireId(foundInventaire.inventaireId);
                
                // Charger l'inventaire principal
                setInventaire({ ...foundInventaire });
                
                // Charger les détails de l'inventaire depuis l'API
                try {
                    const detailsResponse = await axios.get(`${BASE_URLD}/findbyinventaire?inventaireId=${foundInventaire.inventaireId}`);
                    setDetails(detailsResponse.data || []);
                    accept('success', 'Succès', 'Inventaire existant trouvé - Mode modification activé');
                } catch (error) {
                    console.error("Erreur lors du chargement des détails:", error);
                    setDetails([]);
                    accept('info', 'Information', 'Inventaire trouvé mais aucun détail chargé');
                }
            } else {
                setExistingInventaireId(null);
                accept('info', 'Information', 'Nouvel inventaire - Mode création activé');
            }
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
            accept('error', 'Erreur', 'Échec de la recherche');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        // Vérifier si l'exercice est sélectionné
        if (!inventaire.exerciceId) {
            accept('error', 'Erreur', 'Veuillez sélectionner un exercice');
            return;
        }
        
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            if (existingInventaireId) {
                // Mode modification - Mettre à jour l'inventaire principal
                await axios.put(`${BASE_URL}/update/${existingInventaireId}`, {
                    ...inventaire,
                    dateUpdate: now,
                    userUpdate: "system"
                });

                // Préparer la liste complète des détails avec tous les champs
                const detailsToSave = details.map(detail => {
                    // Trouver l'article correspondant pour obtenir le catalogue
                    const article = articles.find(a => a.articleId === detail.articleId);
                    
                    return {
                        ...detail,
                        inventaireId: existingInventaireId,
                        numeroPiece: inventaire.numeroPiece,
                        datePeremption: detail.datePeremption?.toISOString() || null,
                        // S'assurer que tous les champs requis sont inclus
                        articleStockId: detail.articleStockId || detail.articleId || '',
                        uniteId: detail.uniteId || '',
                        // Utiliser le catalogue de l'article ou celui du détail
                        catalogue: article?.catalogue || detail.catalogue || '',
                        quantiteTheorique: detail.quantiteTheorique || 0,
                        prix: detail.prix || detail.prixUnitaire || 0,
                        prixTotal: detail.prixTotal || 0,
                        lot: detail.lot || ''
                    };
                });

                // Envoyer la liste complète des détails en une seule requête
                if (detailsToSave.length > 0) {
                    await axios.post(`${BASE_URLD}/new`, detailsToSave);
                }

                accept('success', 'Succès', 'Inventaire modifié avec succès');
            } else {
                // Mode création - Sauvegarder l'inventaire principal
                const inventaireResponse = await axios.post(`${BASE_URL}/new`, {
                    ...inventaire,
                    inventaireId: null,
                    dateInventaire: inventaire.dateInventaire?.toISOString(),
                    dateCreation: now,
                    dateUpdate: now,
                    userCreation: "system",
                    userUpdate: "system"
                });

                if (!inventaireResponse.data?.inventaireId) {
                    throw new Error("Failed to save main entry");
                }

                // Préparer la liste complète des détails avec tous les champs
                const detailsToSave = details.map(detail => {
                    // Trouver l'article correspondant pour obtenir le catalogue
                    const article = articles.find(a => a.articleId === detail.articleId);
                    
                    return {
                        ...detail,
                        inventaireDetailsId: null,
                        inventaireId: inventaireResponse.data.inventaireId,
                        numeroPiece: inventaireResponse.data.numeroPiece,
                        datePeremption: detail.datePeremption?.toISOString() || null,
                        // S'assurer que tous les champs requis sont inclus
                        articleStockId: detail.articleStockId || detail.articleId || '',
                        uniteId: detail.uniteId || '',
                        // Utiliser le catalogue de l'article ou celui du détail
                        catalogue: article?.catalogue || detail.catalogue || '',
                        quantiteTheorique: detail.quantiteTheorique || 0,
                        prix: detail.prix || detail.prixUnitaire || 0,
                        prixTotal: detail.prixTotal || 0,
                        lot: detail.lot || ''
                    };
                });

                // Envoyer la liste complète des détails en une seule requête
                if (detailsToSave.length > 0) {
                    await axios.post(`${BASE_URLD}/new`, detailsToSave);
                }

                accept('success', 'Succès', 'Inventaire créé avec succès');
            }

            // Réinitialiser le formulaire
            const newInventaire = new StkInventaire();
            newInventaire.dateInventaire = new Date(); // Réinitialiser avec la date actuelle
            setInventaire(newInventaire);
            setDetails([]);
            setExistingInventaireId(null);
            loadAllInventaires();
        } catch (error) {
            console.error("Erreur:", error);
            accept('error', 'Erreur', existingInventaireId ? 'Échec de la modification' : 'Échec de la création');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = async () => {
        // Vérifier si l'exercice est sélectionné
        if (!inventaireEdit.exerciceId) {
            accept('error', 'Erreur', 'Veuillez sélectionner un exercice');
            return;
        }
        
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            // Mettre à jour l'inventaire principal
            await axios.put(`${BASE_URL}/update/${inventaireEdit.inventaireId}`, {
                ...inventaireEdit,
                dateUpdate: now,
                userUpdate: "system"
            });

            // Préparer la liste complète des détails avec tous les champs
            const detailsToSave = detailsEdit.map(detail => {
                // Trouver l'article correspondant pour obtenir le catalogue
                const article = articles.find(a => a.articleId === detail.articleId);
                
                return {
                    ...detail,
                    inventaireId: inventaireEdit.inventaireId,
                    numeroPiece: inventaireEdit.numeroPiece,
                    datePeremption: detail.datePeremption?.toISOString() || null,
                    // S'assurer que tous les champs requis sont inclus
                    articleStockId: detail.articleStockId || detail.articleId || '',
                    uniteId: detail.uniteId || '',
                    // Utiliser le catalogue de l'article ou celui du détail
                    catalogue: article?.catalogue || detail.catalogue || '',
                    quantiteTheorique: detail.quantiteTheorique || 0,
                    prix: detail.prix || detail.prixUnitaire || 0,
                    prixTotal: detail.prixTotal || 0,
                    lot: detail.lot || ''
                };
            });

            // Envoyer la liste complète des détails en une seule requête
            if (detailsToSave.length > 0) {
                await axios.post(`${BASE_URLD}/new`, detailsToSave);
            }

            accept('success', 'Succès', 'Inventaire et détails modifiés avec succès');
            setEditDialog(false);
            loadAllInventaires();
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

    const filteredInventaires = inventaires.filter(inventaire =>
        inventaire.numeroPiece?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        inventaire.libelle?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadInventaireDetails = async (inventaireId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/findbyinventaire?inventaireId=${inventaireId}`);
            setInventaireDetails(response.data);
            setDetailsDialogVisible(true);
        } catch (error) {
            console.error("Error loading entry details:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails');
        } finally {
            setLoading(false);
        }
    };

    const editInventaire = async (inventaire: StkInventaire) => {
        setInventaireEdit({ ...inventaire });
        await loadInventaireDetailsForEdit(inventaire.inventaireId);
        setEditDialog(true);
    };

    const confirmDeleteDetail = (index: number, detailId?: number) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer cette ligne ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => removeDetailEdit(index, detailId),
            acceptClassName: 'p-button-danger'
        });
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="p-tabview"
            >
                <TabPanel header="Nouvel inventaire" className="p-tabview-panel">
                    <StkInventaireForm
                        inventaire={inventaire}
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
                        articles={articles}
                        exercices={exercices}
                        magasins={magasins}
                        responsables={magResponsables}
                        unites={unites}
                        onSearchInventaire={searchInventaireByNumeroPiece}
                        existingInventaireId={existingInventaireId}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label={existingInventaireId ? "Modifier" : "Enregistrer"}
                            icon={existingInventaireId ? "pi pi-refresh" : "pi pi-check"}
                            loading={btnLoading}
                            onClick={handleSubmit}
                            className={existingInventaireId ? "p-button-warning" : "p-button-success"}
                            disabled={!inventaire.exerciceId}
                        />
                        {existingInventaireId && (
                            <Button
                                label="Nouveau"
                                icon="pi pi-plus"
                                onClick={() => {
                                    const newInventaire = new StkInventaire();
                                    newInventaire.dateInventaire = new Date(); // Date actuelle par défaut
                                    setInventaire(newInventaire);
                                    setDetails([]);
                                    setExistingInventaireId(null);
                                }}
                                className="p-button-secondary"
                            />
                        )}
                    </div>
                </TabPanel>
                <TabPanel header="Liste des inventaires" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par pièce ou libellé"
                                className="w-full"
                            />
                        </span>
                    </div>
                     
                    <DataTable
                        value={filteredInventaires}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucun inventaire trouvé"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                        selectionMode="single"
                        onSelectionChange={(e) => {
                            const selected = e.value as StkInventaire;
                            setSelectedInventaire(selected);
                            loadInventaireDetails(selected.inventaireId);
                        }}
                        selection={selectedInventaire}
                        rowClassName={() => "cursor-pointer"}
                    >
                        <Column field="numeroPiece" header="Numéro Pièce" sortable />
                        <Column 
                            field="magasinId" 
                            header="Magasin" 
                            sortable 
                            body={(rowData) => {
                                const magasin = magasins.find(m => m.magasinId === rowData.magasinId);
                                return magasin ? magasin.nom : rowData.magasinId;
                            }}
                        />
                        <Column
                            field="dateInventaire"
                            header="Date Inventaire"
                            body={(rowData) => formatDate(rowData.dateInventaire)}
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
                            field="magrespId" 
                            header="Responsable" 
                            sortable 
                            body={(rowData) => {
                                const responsable = magResponsables.find(r => r.magRespId === rowData.magrespId);
                                return responsable ? responsable.responsableId : rowData.magrespId;
                            }}
                        />
                        <Column field="libelle" header="Libellé" sortable />
                        <Column
                            field="isValid"
                            header="Statut"
                            body={(rowData) => (
                                <span className={`p-tag ${rowData.isValid ? 'p-tag-success' : 'p-tag-warning'}`}>
                                    {rowData.isValid ? 'Validé' : 'En attente'}
                                </span>
                            )}
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
                                        editInventaire(rowData);
                                    }}
                                    tooltip="Modifier"
                                />
                            )}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog pour afficher les détails */}
            <Dialog 
                header={`Détails de l'inventaire ${selectedInventaire?.numeroPiece}`}
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
                        value={inventaireDetails}
                        emptyMessage="Aucun détail trouvé"
                        className="p-datatable-sm"
                    >
                        <Column field="articleId" header="Article" 
                            body={(rowData) => {
                                const article = articles.find(a => a.articleId === rowData.articleId);
                                return (
                                    <div>
                                        <div>{article?.libelle || rowData.articleId}</div>
                                        {article?.catalogue && (
                                            <small className="p-text-secondary block mt-1">
                                                Catalogue: {article.catalogue}
                                            </small>
                                        )}
                                    </div>
                                );
                            }}
                        />
                        <Column field="quantiteTheorique" header="Quantité Théorique" />
                        <Column field="quantitePhysique" header="Quantité Physique" />
                        <Column field="prixUnitaire" header="Prix Unitaire" 
                            body={(rowData) => rowData.prixUnitaire?.toLocaleString('fr-FR', { 
                                style: 'currency', 
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })} 
                        />
                        <Column field="prixTotal" header="Prix Total" 
                            body={(rowData) => rowData.prixTotal?.toLocaleString('fr-FR', { 
                                style: 'currency', 
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })} 
                        />
                    </DataTable>
                )}
            </Dialog>

            {/* Dialog pour modifier un inventaire */}
            <Dialog 
                header={`Modifier l'inventaire ${inventaireEdit.numeroPiece}`}
                visible={editDialog} 
                style={{ width: '90vw' }}
                onHide={() => setEditDialog(false)}
            >
                <StkInventaireForm
                    inventaire={inventaireEdit}
                    details={detailsEdit}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    addDetail={addDetailEdit}
                    removeDetail={confirmDeleteDetail}
                    updateDetail={updateDetailEdit}
                    loading={loading || deletingDetailId !== null}
                    setDetails={setDetailsEdit}
                    articles={articles}
                    exercices={exercices}
                    magasins={magasins}
                    responsables={magResponsables}
                    unites={unites}
                    onSearchInventaire={searchInventaireByNumeroPiece}
                    existingInventaireId={inventaireEdit.inventaireId}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Modifier"
                        icon="pi pi-check"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                        className="p-button-warning"
                        disabled={!inventaireEdit.exerciceId}
                    />
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditDialog(false)}
                        className="p-button-secondary"
                    />
                </div>
            </Dialog>
            
            <style jsx>{`
                .cursor-pointer {
                    cursor: pointer;
                }
                .block {
                    display: block;
                }
                .mt-1 {
                    margin-top: 0.25rem;
                }
            `}</style>
        </div>
    );
}