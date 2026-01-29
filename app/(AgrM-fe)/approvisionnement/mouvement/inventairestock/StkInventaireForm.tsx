'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { StkInventaire, StkInventaireDetails, StkArticle, StkExercice, StkMagasin, StkMagasinResponsable, StkUnite } from "./stkInventaire";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";
import { API_BASE_URL } from '@/utils/apiConfig';

interface StkInventaireFormProps {
    inventaire: StkInventaire;
    details: StkInventaireDetails[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<StkInventaireDetails[]>>;
    articles: StkArticle[];
    exercices: StkExercice[];
    magasins: StkMagasin[];
    responsables: StkMagasinResponsable[];
    unites: StkUnite[];
    onSearchInventaire?: (numeroPiece: string) => void;
    existingInventaireId?: string | null;
}

interface PaginatedResponse {
    content: StkArticle[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

const StkInventaireForm: React.FC<StkInventaireFormProps> = ({
    inventaire,
    details,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    addDetail,
    removeDetail,
    updateDetail,
    loading = false,
    setDetails,
    articles,
    exercices,
    magasins,
    responsables,
    unites,
    onSearchInventaire,
    existingInventaireId
}) => {
    const toast = useRef<Toast>(null);
    const [numeroPieceTouched, setNumeroPieceTouched] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [filteredArticles, setFilteredArticles] = useState<StkArticle[]>([]);
    const [filteredResponsables, setFilteredResponsables] = useState<StkMagasinResponsable[]>([]);
    const [loadingArticles, setLoadingArticles] = useState(false);
    
    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [totalArticles, setTotalArticles] = useState(0);
    const [hasMoreArticles, setHasMoreArticles] = useState(false);

    // Fonction pour convertir une valeur en Date ou null
    const parseDate = (value: any): Date | null => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    };

    // Fonction pour gérer le changement de date (gestion des types Nullable)
    const handleCalendarChange = (value: Nullable<string | Date | Date[]>, field: string) => {
        let dateValue: Date | null | undefined = null;
        
        if (value instanceof Date) {
            dateValue = value;
        } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
            dateValue = value[0];
        } else if (typeof value === 'string') {
            const parsedDate = new Date(value);
            dateValue = isNaN(parsedDate.getTime()) ? null : parsedDate;
        } else {
            dateValue = null;
        }
        
        handleDateChange(dateValue, field);
    };

    // Fonction pour obtenir la valeur du Calendar
    const getCalendarValue = (date: Date | string | null | undefined): Nullable<string | Date | Date[]> => {
        if (!date) return null;
        if (date instanceof Date) return date;
        if (typeof date === 'string') {
            const parsedDate = new Date(date);
            return isNaN(parsedDate.getTime()) ? null : parsedDate;
        }
        return null;
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString() : '';
    };

    // Trouver l'exercice en cours
    const getExerciceEnCours = (): StkExercice | null => {
        if (!exercices || exercices.length === 0) return null;
        
        if (exercices.length === 1) return exercices[0];
        
        const aujourdHui = new Date();
        return exercices.find(exercice => {
            const dateDebut = new Date(exercice.dateDebut);
            const dateFin = new Date(exercice.dateFin);
            return aujourdHui >= dateDebut && aujourdHui <= dateFin;
        }) || exercices[0];
    };

    // Trouver le responsable principal du magasin
    const getResponsableMagasin = (magasinId: string): StkMagasinResponsable | null => {
        if (!magasinId || !responsables || responsables.length === 0) return null;
        
        const responsablesMagasin = responsables.filter(resp => 
            resp.magasinId === magasinId && resp.actif === true
        );
        
        if (responsablesMagasin.length === 0) return null;
        
        return responsablesMagasin[0];
    };

    // Charger les articles du magasin sélectionné avec pagination
    const loadArticlesByMagasin = async (magasinId: string, page: number = 0, size: number = pageSize) => {
        if (!magasinId) return;
        
        try {
            setLoadingArticles(true);
            
            const response = await axios.get(`${API_BASE_URL}/articles/findbymagasin/paginated`, {
                params: {
                    magasinId: magasinId,
                    page: page,
                    size: size
                }
            });
            
            const data: PaginatedResponse = response.data;
            const newArticles = data.content;
            
            if (page === 0) {
                setFilteredArticles(newArticles);
            } else {
                setFilteredArticles(prev => [...prev, ...newArticles]);
            }
            
            setTotalArticles(data.totalElements);
            setCurrentPage(page);
            setHasMoreArticles(page < data.totalPages - 1);
            
            if (page === 0) {
                const articlesDetails: StkInventaireDetails[] = newArticles.map((article: StkArticle) => ({
                    ...new StkInventaireDetails(),
                    articleStockId: article.articleId,
                    articleId: article.articleId,
                    quantiteTheorique: article.qteStock || 0,
                    quantitePhysique: article.qteStock || 0,
                    prixUnitaire: article.pump || article.pUMP || 0,
                    uniteId: article.uniteId || '',
                    catalogue: article.catalogue || '',
                    prixTotal: calculateArticleTotal(article.qteStock || 0, article.pump || article.pUMP || 0)
                }));
                
                setDetails(articlesDetails);
            }
            
        } catch (error) {
            console.error("Erreur lors du chargement des articles:", error);
            
            // Fallback vers l'endpoint non paginé
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                try {
                    console.warn("Endpoint paginé non trouvé, utilisation de l'endpoint standard");
                    const fallbackResponse = await axios.get(`${API_BASE_URL}/articles/findbymagasin?magasinId=${magasinId}`);
                    const allArticles = fallbackResponse.data;
                    
                    const limitedArticles = allArticles.slice(0, 1000);
                    setFilteredArticles(limitedArticles);
                    
                    const articlesDetails: StkInventaireDetails[] = limitedArticles.map((article: StkArticle) => ({
                        ...new StkInventaireDetails(),
                        articleStockId: article.articleId,
                        articleId: article.articleId,
                        quantiteTheorique: article.qteStock || 0,
                        quantitePhysique: article.qteStock || 0,
                        prixUnitaire: article.pump || article.pUMP || 0,
                        uniteId: article.uniteId || '',
                        catalogue: article.catalogue || '',
                        prixTotal: calculateArticleTotal(article.qteStock || 0, article.pump || article.pUMP || 0)
                    }));
                    
                    setDetails(articlesDetails);
                    setTotalArticles(limitedArticles.length);
                    setHasMoreArticles(allArticles.length > 1000);
                    
                    if (allArticles.length > 1000) {
                        toast.current?.show({
                            severity: 'warn',
                            summary: 'Attention',
                            detail: `Seulement les 1000 premiers articles sur ${allArticles.length} ont été chargés`,
                            life: 5000
                        });
                    }
                } catch (fallbackError) {
                    console.error("Erreur avec l'endpoint de fallback:", fallbackError);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Échec du chargement des articles du magasin',
                        life: 3000
                    });
                }
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Échec du chargement des articles du magasin',
                    life: 3000
                });
            }
        } finally {
            setLoadingArticles(false);
        }
    };

    // Charger plus d'articles
    const loadMoreArticles = () => {
        if (inventaire.magasinId && hasMoreArticles) {
            loadArticlesByMagasin(inventaire.magasinId, currentPage + 1, pageSize);
        }
    };

    // Filtrer les responsables
    useEffect(() => {
        if (inventaire.magasinId) {
            const responsablesFiltres = responsables.filter(resp => 
                resp.magasinId === inventaire.magasinId && resp.actif === true
            );
            setFilteredResponsables(responsablesFiltres);
        } else {
            setFilteredResponsables(responsables);
        }
    }, [inventaire.magasinId, responsables]);

    // Gestion du changement de magasin
    const handleMagasinChange = (e: DropdownChangeEvent) => {
        const magasinId = e.value;
        
        handleDropdownChange(e);
        
        setDetails([]);
        setFilteredArticles([]);
        setCurrentPage(0);
        setTotalArticles(0);
        setHasMoreArticles(false);
        
        if (magasinId) {
            loadArticlesByMagasin(magasinId, 0, pageSize);
        }
        
        const exerciceEnCours = getExerciceEnCours();
        if (exerciceEnCours) {
            handleDropdownChange({
                target: {
                    name: 'exerciceId',
                    value: exerciceEnCours.exerciceId
                }
            } as DropdownChangeEvent);
        }
        
        if (magasinId) {
            const responsableMagasin = getResponsableMagasin(magasinId);
            if (responsableMagasin) {
                handleDropdownChange({
                    target: {
                        name: 'magrespId',
                        value: responsableMagasin.magRespId
                    }
                } as DropdownChangeEvent);
            }
        }
    };

    // Calculer le total pour un article
    const calculateArticleTotal = (quantitePhysique: number, prixUnitaire: number) => {
        const quantity = quantitePhysique || 0;
        const price = prixUnitaire || 0;
        return quantity * price;
    };

    // Mettre à jour la quantité physique
    const updateQuantitePhysique = (index: number, value: number) => {
        const detail = details[index];
        const prixTotal = calculateArticleTotal(value, detail.prixUnitaire || 0);
        
        updateDetail(index, 'quantitePhysique', value);
        updateDetail(index, 'prixTotal', prixTotal);
        
        setForceUpdate(prev => prev + 1);
    };

    // Mettre à jour le prix unitaire
    const updatePrixUnitaire = (index: number, value: number) => {
        const detail = details[index];
        const prixTotal = calculateArticleTotal(detail.quantitePhysique || 0, value || 0);
        
        updateDetail(index, 'prixUnitaire', value);
        updateDetail(index, 'prixTotal', prixTotal);
        
        setForceUpdate(prev => prev + 1);
    };

    // Calculer le montant total
    const calculateMontantTotal = (): number => {
        return details.reduce((total, detail) => {
            return total + (detail.prixTotal || 0);
        }, 0);
    };

    // Mettre à jour le montant total
    useEffect(() => {
        const montantTotal = calculateMontantTotal();
        handleNumberChange({ value: montantTotal } as InputNumberValueChangeEvent, 'montant');
    }, [details, forceUpdate]);

    // Trouver un article
    const findArticle = (articleId: string): StkArticle | undefined => {
        return filteredArticles.find(article => article.articleId === articleId);
    };

    // Gestion de la recherche d'inventaire
    const handleNumeroPieceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e);
        if (onSearchInventaire && numeroPieceTouched) {
            onSearchInventaire(e.target.value);
        }
    };

    const handleNumeroPieceBlur = () => {
        setNumeroPieceTouched(true);
        if (onSearchInventaire && inventaire.numeroPiece) {
            onSearchInventaire(inventaire.numeroPiece);
        }
    };

    return (
        <div className="p-fluid grid">
            <Toast ref={toast} />
            
            {/* Informations sur le mode */}
            {existingInventaireId && (
                <div className="col-12">
                    <div className="p-3 border-round bg-yellow-100 text-yellow-800 border-1 border-yellow-300">
                        <i className="pi pi-info-circle mr-2"></i>
                        <strong>Mode modification</strong> - Vous modifiez un inventaire existant
                    </div>
                </div>
            )}

            {/* Informations sur la pagination */}
            {totalArticles > 0 && (
                <div className="col-12">
                    <div className="p-2 border-round bg-blue-50 text-blue-700 border-1 border-blue-200">
                        <i className="pi pi-database mr-2"></i>
                        <strong>{totalArticles}</strong> articles chargés 
                        {hasMoreArticles && ` (plus d'articles disponibles)`}
                    </div>
                </div>
            )}

            {/* Section Informations principales */}
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="numeroPiece">Numéro Pièce *</label>
                    <InputText
                        id="numeroPiece"
                        name="numeroPiece"
                        value={inventaire.numeroPiece || ''}
                        onChange={handleNumeroPieceChange}
                        onBlur={handleNumeroPieceBlur}
                        className="w-full"
                        placeholder="Saisir le numéro de pièce"
                        required
                    />
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText
                        id="libelle"
                        name="libelle"
                        value={inventaire.libelle || ''}
                        onChange={handleChange}
                        className="w-full"
                        placeholder="Libellé de l'inventaire"
                    />
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="dateInventaire">Date Inventaire *</label>
                    <Calendar
                        id="dateInventaire"
                        value={getCalendarValue(inventaire.dateInventaire)}
                        onChange={(e) => handleCalendarChange(e.value, 'dateInventaire')}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        required
                    />
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="montant">Montant Total</label>
                    <InputNumber
                        id="montant"
                        value={inventaire.montant || 0}
                        onValueChange={(e) => handleNumberChange(e, 'montant')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        className="w-full"
                        disabled
                    />
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="magasinId">Magasin *</label>
                    <Dropdown
                        id="magasinId"
                        name="magasinId"
                        value={inventaire.magasinId || ''}
                        options={magasins}
                        onChange={handleMagasinChange}
                        optionLabel="nom"
                        optionValue="magasinId"
                        placeholder="Sélectionner un magasin"
                        className="w-full"
                        disabled={loading}
                        required
                    />
                    {loading && (
                        <small className="p-text-secondary">
                            <i className="pi pi-spinner pi-spin"></i> Chargement...
                        </small>
                    )}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="exerciceId">Exercice *</label>
                    <Dropdown
                        id="exerciceId"
                        name="exerciceId"
                        value={inventaire.exerciceId || ''}
                        options={exercices}
                        onChange={handleDropdownChange}
                        optionLabel="libelle"
                        optionValue="exerciceId"
                        placeholder="Sélectionner un exercice"
                        className="w-full"
                        disabled={loading}
                        required
                    />
                    {loading && (
                        <small className="p-text-secondary">
                            <i className="pi pi-spinner pi-spin"></i> Chargement...
                        </small>
                    )}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="magrespId">Responsable *</label>
                    <Dropdown
                        id="magrespId"
                        name="magrespId"
                        value={inventaire.magrespId || ''}
                        options={filteredResponsables}
                        onChange={handleDropdownChange}
                        optionLabel="responsableId"
                        optionValue="magRespId"
                        placeholder="Sélectionner un responsable"
                        className="w-full"
                        disabled={loading}
                        required
                    />
                    {loading && (
                        <small className="p-text-secondary">
                            <i className="pi pi-spinner pi-spin"></i> Chargement...
                        </small>
                    )}
                </div>
            </div>

            {/* Section Détails des articles */}
            <div className="col-12">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h3>Détails des Articles</h3>
                    <div className="flex gap-2">
                        {hasMoreArticles && (
                            <Button
                                label="Charger plus d'articles"
                                icon="pi pi-plus"
                                onClick={loadMoreArticles}
                                loading={loadingArticles}
                                className="p-button-outlined p-button-secondary"
                            />
                        )}
                        <Button
                            label="Ajouter une ligne"
                            icon="pi pi-plus"
                            onClick={addDetail}
                            className="p-button-outlined"
                        />
                    </div>
                </div>

                {loadingArticles ? (
                    <div className="flex justify-content-center p-4">
                        <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem' }}></i>
                        <span className="ml-2">Chargement des articles...</span>
                    </div>
                ) : (
                    <div className="card">
                        <DataTable
                            value={details}
                            emptyMessage="Aucun article ajouté. Sélectionnez d'abord un magasin."
                            className="p-datatable-sm"
                            scrollable
                            scrollHeight="400px"
                            size="small"
                        >
                            <Column 
                                header="#" 
                                body={(_, props) => props.rowIndex + 1} 
                                style={{ width: '50px' }}
                            />
                            <Column
                                header="Article"
                                body={(rowData, props) => (
                                    <Dropdown
                                        value={rowData.articleId || ''}
                                        options={filteredArticles}
                                        onChange={(e) => {
                                            const articleId = e.value;
                                            const article = findArticle(articleId);
                                            
                                            updateDetail(props.rowIndex, 'articleId', articleId);
                                            updateDetail(props.rowIndex, 'articleStockId', articleId);
                                            
                                            if (article) {
                                                updateDetail(props.rowIndex, 'quantiteTheorique', article.qteStock || 0);
                                                updateDetail(props.rowIndex, 'quantitePhysique', article.qteStock || 0);
                                                updateDetail(props.rowIndex, 'prixUnitaire', article.pump || article.pUMP || 0);
                                                updateDetail(props.rowIndex, 'uniteId', article.uniteId || '');
                                                updateDetail(props.rowIndex, 'catalogue', article.catalogue || '');
                                                
                                                const prixTotal = calculateArticleTotal(
                                                    article.qteStock || 0,
                                                    article.pump || article.pUMP || 0
                                                );
                                                updateDetail(props.rowIndex, 'prixTotal', prixTotal);
                                            }
                                        }}
                                        optionLabel="libelle"
                                        optionValue="articleId"
                                        placeholder="Sélectionner un article"
                                        className="w-full"
                                        filter
                                        showClear
                                    />
                                )}
                                style={{ minWidth: '200px' }}
                            />
                            <Column
                                header="Unité"
                                body={(rowData) => {
                                    const unite = unites.find(u => u.uniteId === rowData.uniteId);
                                    return unite ? unite.libelle : rowData.uniteId;
                                }}
                                style={{ width: '100px' }}
                            />
                            <Column
                                header="Quantité Théorique"
                                body={(rowData, props) => (
                                    <InputNumber
                                        value={rowData.quantiteTheorique || 0}
                                        onValueChange={(e) => updateDetail(props.rowIndex, 'quantiteTheorique', e.value)}
                                        mode="decimal"
                                        minFractionDigits={2}
                                        className="w-full"
                                        disabled
                                    />
                                )}
                                style={{ width: '150px' }}
                            />
                            <Column
                                header="Quantité Physique"
                                body={(rowData, props) => (
                                    <InputNumber
                                        value={rowData.quantitePhysique || 0}
                                        onValueChange={(e) => updateQuantitePhysique(props.rowIndex, e.value || 0)}
                                        mode="decimal"
                                        minFractionDigits={2}
                                        className="w-full"
                                    />
                                )}
                                style={{ width: '150px' }}
                            />
                            <Column
                                header="Prix Unitaire"
                                body={(rowData, props) => (
                                    <InputNumber
                                        value={rowData.prixUnitaire || 0}
                                        onValueChange={(e) => updatePrixUnitaire(props.rowIndex, e.value || 0)}
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-FR"
                                        className="w-full"
                                    />
                                )}
                                style={{ width: '150px' }}
                            />
                            <Column
                                header="Prix Total"
                                body={(rowData) => (
                                    <InputNumber
                                        value={rowData.prixTotal || 0}
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-FR"
                                        className="w-full"
                                        disabled
                                    />
                                )}
                                style={{ width: '150px' }}
                            />
                            <Column
                                header="Date Péremption"
                                body={(rowData, props) => (
                                    <Calendar
                                        value={getCalendarValue(rowData.datePeremption)}
                                        onChange={(e) => {
                                            const dateValue = parseDate(e.value);
                                            updateDetail(props.rowIndex, 'datePeremption', dateValue);
                                        }}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        className="w-full"
                                    />
                                )}
                                style={{ width: '150px' }}
                            />
                            <Column
                                header="Actions"
                                body={(_, props) => (
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-rounded p-button-danger p-button-text"
                                        onClick={() => removeDetail(props.rowIndex)}
                                        tooltip="Supprimer"
                                    />
                                )}
                                style={{ width: '80px' }}
                            />
                        </DataTable>
                    </div>
                )}
            </div>

            {/* Résumé */}
            <div className="col-12">
                <div className="p-3 border-round bg-gray-50 mt-3">
                    <div className="grid">
                        <div className="col-6 md:col-3">
                            <strong>Nombre d'articles:</strong> {details.length}
                        </div>
                        <div className="col-6 md:col-3">
                            <strong>Montant total:</strong> {calculateMontantTotal().toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                        </div>
                        <div className="col-12 md:col-6 text-right">
                            <small className="text-gray-600">
                                {existingInventaireId ? 'Mode modification' : 'Mode création'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StkInventaireForm;