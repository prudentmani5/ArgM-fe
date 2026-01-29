'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
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
    const [usedArticleIds, setUsedArticleIds] = useState<Set<string>>(new Set());

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString() : '';
    };

    // Mettre à jour les articles déjà utilisés
    useEffect(() => {
        const usedIds = new Set(details.map(detail => detail.articleId).filter(id => id));
        setUsedArticleIds(usedIds);
    }, [details]);

    // Filtrer les articles disponibles (non déjà sélectionnés)
    const getAvailableArticles = () => {
        return articles.filter(article => 
            !usedArticleIds.has(article.articleId) || 
            details.some(detail => detail.articleId === article.articleId)
        );
    };

    // Trouver l'exercice en cours
    const getExerciceEnCours = (): StkExercice | null => {
        if (!exercices || exercices.length === 0) return null;
        
        // Si un seul exercice, le retourner
        if (exercices.length === 1) return exercices[0];
        
        // Sinon, chercher l'exercice avec la date actuelle
        const aujourdHui = new Date();
        return exercices.find(exercice => {
            const dateDebut = new Date(exercice.dateDebut);
            const dateFin = new Date(exercice.dateFin);
            return aujourdHui >= dateDebut && aujourdHui <= dateFin;
        }) || exercices[0]; // Retourner le premier si aucun trouvé
    };

    // Trouver le responsable principal du magasin
    const getResponsableMagasin = (magasinId: string): StkMagasinResponsable | null => {
        if (!magasinId || !responsables || responsables.length === 0) return null;
        
        const responsablesMagasin = responsables.filter(resp => 
            resp.magasinId === magasinId && resp.actif === true
        );
        
        if (responsablesMagasin.length === 0) return null;
        
        // Retourner le premier responsable actif du magasin
        return responsablesMagasin[0];
    };

    // Charger les articles du magasin sélectionné
    const loadArticlesByMagasin = async (magasinId: string) => {
        if (!magasinId) return;
        
        try {
            setLoadingArticles(true);
            const response = await axios.get(`${API_BASE_URL}/inventaireDetails/findbymagasin?magasinId=${magasinId}`);
            setFilteredArticles(response.data);
            
            // Si on est en mode modification et que la liste des détails est vide, créer les détails
            if (existingInventaireId && details.length === 0) {
                const articlesDetails: StkInventaireDetails[] = response.data.map((article: StkArticle) => ({
                    ...new StkInventaireDetails(),
                    articleStockId: article.articleId,
                    articleId: article.articleId,
                    quantiteTheorique: article.qteStock || 0,
                    quantitePhysique: article.qteStock || 0, // Initialiser avec la quantité théorique
                    prixUnitaire: article.pump || article.pUMP || 0,
                    uniteId: article.uniteId || '',
                    catalogue: article.catalogue || '',
                    prixTotal: calculateArticleTotal(article.qteStock || 0, article.pump || article.pUMP || 0)
                }));
                
                setDetails(articlesDetails);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `${articlesDetails.length} articles chargés automatiquement`,
                    life: 3000
                });
            } else {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Information',
                    detail: `${response.data.length} articles disponibles pour ce magasin`,
                    life: 3000
                });
            }
            
        } catch (error) {
            console.error("Erreur lors du chargement des articles:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Échec du chargement des articles du magasin',
                life: 3000
            });
        } finally {
            setLoadingArticles(false);
        }
    };

    // Filtrer les responsables en fonction du magasin sélectionné
    useEffect(() => {
        if (inventaire.magasinId) {
            // Filtrer les responsables par magasin
            const responsablesFiltres = responsables.filter(resp => 
                resp.magasinId === inventaire.magasinId && resp.actif === true
            );
            setFilteredResponsables(responsablesFiltres);
        } else {
            setFilteredResponsables(responsables);
        }
    }, [inventaire.magasinId, articles, responsables]);

    // Fonction pour gérer le changement de magasin
    const handleMagasinChange = (e: DropdownChangeEvent) => {
        const magasinId = e.value;
        
        // Mettre à jour le magasin
        handleDropdownChange(e);
        
        // Attribuer automatiquement l'exercice en cours
        const exerciceEnCours = getExerciceEnCours();
        if (exerciceEnCours) {
            handleDropdownChange({
                target: {
                    name: 'exerciceId',
                    value: exerciceEnCours.exerciceId
                }
            } as DropdownChangeEvent);
        }
        
        // Attribuer automatiquement le responsable du magasin
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

    // Fonction pour calculer le montant total pour un article
    const calculateArticleTotal = (quantitePhysique: number, prixUnitaire: number) => {
        const quantity = quantitePhysique || 0;
        const price = prixUnitaire || 0;
        const total = quantity * price;
        return total;
    };

    // Fonction pour mettre à jour le montant total d'un article
    const updateArticleTotal = (rowIndex: number) => {
        const detail = details[rowIndex];
        const prixTotal = calculateArticleTotal(detail.quantitePhysique, detail.prixUnitaire);
        updateDetail(rowIndex, 'prixTotal', prixTotal);
        
        // Forcer le recalcul du montant total général
        setForceUpdate(prev => prev + 1);
    };

    // Fonction pour gérer le changement de quantité physique
    const handleQuantityChange = (rowIndex: number, quantitePhysique: number) => {
        updateDetail(rowIndex, 'quantitePhysique', quantitePhysique);
        updateArticleTotal(rowIndex);
    };

    // Fonction pour gérer le blur (quand on relâche le curseur)
    const handleQuantityBlur = (rowIndex: number, currentValue: number) => {
        // S'assurer que le calcul est fait après le blur
        setTimeout(() => {
            updateArticleTotal(rowIndex);
        }, 100);
    };

    // Fonction pour gérer les changements de touches (Enter, Tab)
    const handleQuantityKeyDown = (rowIndex: number, e: React.KeyboardEvent, currentValue: number) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            updateArticleTotal(rowIndex);
        }
    };

    // Gestionnaire pour le blur du champ numeroPiece
    const handleNumeroPieceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setNumeroPieceTouched(true);
        const numeroPiece = e.target.value.trim();
        
        if (numeroPiece && onSearchInventaire) {
            onSearchInventaire(numeroPiece);
        }
    };

    const calculateTotalAmount = () => {
        return details.reduce((total, detail) => {
            const prixTotal = detail.prixTotal || 0;
            return total + prixTotal;
        }, 0);
    };

    // Mettre à jour le montant total dans l'entête de l'inventaire
    useEffect(() => {
        const totalAmount = calculateTotalAmount();
        if (inventaire.montant !== totalAmount) {
            handleNumberChange({ value: totalAmount } as InputNumberValueChangeEvent, 'montant');
        }
    }, [details, forceUpdate]);

    // Fonction pour gérer le changement de date du Calendar (version corrigée)
    const handleCalendarChange = (value: any, field: string) => {
        if (value instanceof Date) {
            handleDateChange(value, field);
        } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
            handleDateChange(value[0], field);
        } else if (value === null) {
            handleDateChange(null, field);
        } else {
            handleDateChange(null, field);
        }
    };

    // Afficher le nom du responsable sélectionné
    const getResponsableDisplay = () => {
        if (!inventaire.magrespId) return "Aucun responsable";
        
        const responsable = responsables.find(r => r.magRespId === inventaire.magrespId);
        return responsable ? responsable.responsableId : inventaire.magrespId;
    };

    // Trouver l'article par ID
    const getArticleById = (articleId: string): StkArticle | undefined => {
        return articles.find(article => article.articleId === articleId);
    };

    // Trouver l'unité par ID
    const getUniteById = (uniteId: string): StkUnite | undefined => {
        return unites.find(unite => unite.uniteId === uniteId);
    };

    // Déterminer si on doit afficher le bouton "Charger les articles du magasin"
    const shouldShowLoadArticlesButton = () => {
        // Afficher uniquement en mode modification ET quand la liste des détails est vide
        return existingInventaireId && details.length === 0 && inventaire.magasinId;
    };

    // Fonction pour gérer le changement d'article
    const handleArticleChange = (rowIndex: number, articleId: string) => {
        // Vérifier si l'article est déjà utilisé ailleurs
        const isAlreadyUsed = details.some((detail, idx) => 
            idx !== rowIndex && detail.articleId === articleId
        );
        
        if (isAlreadyUsed && articleId) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Cet article est déjà sélectionné',
                life: 3000
            });
            return;
        }
        
        const article = getArticleById(articleId);
        if (article) {
            // Mettre à jour le détail avec les informations de l'article
            updateDetail(rowIndex, 'articleId', articleId);
            updateDetail(rowIndex, 'quantiteTheorique', article.qteStock || 0);
            updateDetail(rowIndex, 'prixUnitaire', article.pump || article.pUMP || 0);
            updateDetail(rowIndex, 'uniteId', article.uniteId || '');
            updateDetail(rowIndex, 'catalogue', article.catalogue || '');
            updateDetail(rowIndex, 'quantitePhysique', article.qteStock || 0);
            
            // Calculer le prix total
            const prixTotal = calculateArticleTotal(article.qteStock || 0, article.pump || article.pUMP || 0);
            updateDetail(rowIndex, 'prixTotal', prixTotal);
            
            // Forcer le recalcul du montant total général
            setForceUpdate(prev => prev + 1);
        }
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="p-fluid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="numeroPiece">Numéro Pièce *</label>
                    <InputText
                        id="numeroPiece"
                        name="numeroPiece"
                        value={inventaire.numeroPiece}
                        onChange={handleChange}
                        onBlur={handleNumeroPieceBlur}
                        placeholder="Saisir le numéro de pièce"
                        className={numeroPieceTouched && !inventaire.numeroPiece ? 'p-invalid' : ''}
                    />
                    {numeroPieceTouched && !inventaire.numeroPiece && (
                        <small className="p-error">Le numéro de pièce est requis</small>
                    )}
                    {existingInventaireId && (
                        <small className="p-text-secondary">
                            <i className="pi pi-info-circle"></i> Inventaire existant - Mode modification
                        </small>
                    )}
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateInventaire">Date Inventaire *</label>
                    <Calendar
                        id="dateInventaire"
                        name="dateInventaire"
                        value={inventaire.dateInventaire}
                        onChange={(e) => handleCalendarChange(e.value, 'dateInventaire')}
                        dateFormat="dd/mm/yy"
                        showIcon
                        placeholder="Sélectionner la date"
                        className="w-full"
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="magasinId">Magasin *</label>
                    <Dropdown
                        id="magasinId"
                        name="magasinId"
                        value={inventaire.magasinId}
                        options={magasins}
                        onChange={handleMagasinChange}
                        optionLabel="nom"
                        optionValue="magasinId"
                        placeholder="Sélectionner un magasin"
                        className="w-full"
                        filter
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="exerciceId">Exercice *</label>
                    <InputText
                        id="exerciceId"
                        name="exerciceId"
                        value={inventaire.exerciceId}
                        className="w-full readonly-input"
                        disabled
                        placeholder="Sélection automatique"
                    />
                    <small className="p-text-secondary">
                        Exercice attribué automatiquement
                    </small>
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="magrespId">Responsable *</label>
                    <InputText
                        id="magrespId"
                        name="magrespId"
                        value={getResponsableDisplay()}
                        className="w-full readonly-input"
                        disabled
                        placeholder="Sélection automatique"
                    />
                    <small className="p-text-secondary">
                        Responsable attribué automatiquement
                    </small>
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="libelle">Libellé *</label>
                    <InputText
                        id="libelle"
                        name="libelle"
                        value={inventaire.libelle}
                        onChange={handleChange}
                        placeholder="Saisir le libellé"
                        className="w-full"
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="montant">Montant Total</label>
                    <InputNumber
                        id="montant"
                        name="montant"
                        value={calculateTotalAmount()}
                        onValueChange={(e) => handleNumberChange(e, 'montant')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        className="w-full readonly-input"
                        disabled
                        placeholder="Calculé automatiquement"
                    />
                    <small className="p-text-secondary">
                        Total: {calculateTotalAmount().toLocaleString('fr-FR')} FBU
                    </small>
                </div>
            </div>

            {/* Section des détails */}
            <div className="mt-4">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h3>
                        Détails de l'inventaire
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            label="Ajouter un article"
                            icon="pi pi-plus"
                            onClick={addDetail}
                            className="p-button-primary"
                        />
                        {/* Bouton pour charger les articles du magasin - uniquement en mode modification et quand les détails sont vides */}
                        {shouldShowLoadArticlesButton() && (
                            <Button
                                label="Charger les articles du magasin"
                                icon="pi pi-download"
                                onClick={() => loadArticlesByMagasin(inventaire.magasinId)}
                                className="p-button-info"
                                disabled={loadingArticles}
                                loading={loadingArticles}
                            />
                        )}
                    </div>
                </div>

                {/* Message d'information pour le mode modification avec détails vides */}
                {existingInventaireId && details.length === 0 && inventaire.magasinId && (
                    <div className="p-message p-message-info mb-3">
                        <i className="pi pi-info-circle"></i>
                        <span>
                            Mode modification: Aucun détail trouvé. Vous pouvez ajouter manuellement des articles 
                            ou utiliser le bouton "Charger les articles du magasin" pour pré-remplir avec les articles disponibles.
                        </span>
                    </div>
                )}

                <DataTable
                    value={details}
                    emptyMessage={
                        existingInventaireId && inventaire.magasinId 
                            ? "Aucun article ajouté. Cliquez sur 'Ajouter un article' ou 'Charger les articles du magasin' pour commencer." 
                            : "Aucun article ajouté. Cliquez sur 'Ajouter un article' pour commencer."
                    }
                    className="p-datatable-sm"
                    scrollable
                    scrollHeight="400px"
                >
                    <Column
                        header="Article"
                        body={(rowData, { rowIndex }) => {
                            const availableArticles = getAvailableArticles();
                            const currentArticle = getArticleById(rowData.articleId);
                            return (
                                <div>
                                    <Dropdown
                                        value={rowData.articleId}
                                        options={availableArticles}
                                        onChange={(e) => handleArticleChange(rowIndex, e.value)}
                                        optionLabel="libelle"
                                        optionValue="articleId"
                                        placeholder="Sélectionner un article"
                                        className="w-full"
                                        filter
                                        showClear
                                    />
                                    {currentArticle && currentArticle.catalogue && (
                                        <small className="p-text-secondary block mt-1">
                                            Catalogue: {currentArticle.catalogue}
                                        </small>
                                    )}
                                </div>
                            );
                        }}
                        style={{ minWidth: '250px' }}
                    />

                    <Column
                        header="Quantité Théorique"
                        body={(rowData, { rowIndex }) => {
                            const article = getArticleById(rowData.articleId);
                            const quantiteTheorique = article?.qteStock || rowData.quantiteTheorique || 0;
                            return (
                                <div>
                                    <InputNumber
                                        value={quantiteTheorique}
                                        mode="decimal"
                                        minFractionDigits={2}
                                        maxFractionDigits={4}
                                        className="w-full readonly-input"
                                        disabled
                                    />
                                    {article && article.catalogue && (
                                        <small className="p-text-secondary block mt-1">
                                            Catalogue: {article.catalogue}
                                        </small>
                                    )}
                                </div>
                            );
                        }}
                        style={{ minWidth: '150px' }}
                    />

                    <Column
                        header="Unité"
                        body={(rowData, { rowIndex }) => {
                            const article = getArticleById(rowData.articleId);
                            const uniteId = article?.uniteId || rowData.uniteId;
                            const unite = getUniteById(uniteId);
                            return (
                                <div>
                                    <InputText
                                        value={unite?.symbole || uniteId || ''}
                                        className="w-full readonly-input"
                                        disabled
                                    />
                                    {article && article.catalogue && (
                                        <small className="p-text-secondary block mt-1">
                                            Catalogue: {article.catalogue}
                                        </small>
                                    )}
                                </div>
                            );
                        }}
                        style={{ minWidth: '100px' }}
                    />

                    <Column
                        header="Quantité Physique"
                        body={(rowData, { rowIndex }) => {
                            const article = getArticleById(rowData.articleId);
                            return (
                                <div>
                                    <InputNumber
                                        value={rowData.quantitePhysique}
                                        onValueChange={(e) => {
                                            const value = e.value !== null && e.value !== undefined ? Number(e.value) : 0;
                                            handleQuantityChange(rowIndex, value);
                                        }}
                                        onBlur={() => handleQuantityBlur(rowIndex, rowData.quantitePhysique)}
                                        onKeyDown={(e) => handleQuantityKeyDown(rowIndex, e, rowData.quantitePhysique)}
                                        mode="decimal"
                                        minFractionDigits={2}
                                        maxFractionDigits={4}
                                        className="w-full"
                                        placeholder="0.00"
                                        min={0}
                                        useGrouping={false}
                                    />
                                    {article && article.catalogue && (
                                        <small className="p-text-secondary block mt-1">
                                            Catalogue: {article.catalogue}
                                        </small>
                                    )}
                                </div>
                            );
                        }}
                        style={{ minWidth: '150px' }}
                    />

                    <Column
                        header="PUMP/Prix Unitaire"
                        body={(rowData, { rowIndex }) => {
                            const article = getArticleById(rowData.articleId);
                            const prixUnitaire = rowData.prixUnitaire || article?.pump || article?.pUMP || 0;
                            return (
                                <div>
                                    <InputNumber
                                        value={prixUnitaire}
                                        onValueChange={(e) => {
                                            const value = e.value !== null && e.value !== undefined ? Number(e.value) : 0;
                                            updateDetail(rowIndex, 'prixUnitaire', value);
                                            updateArticleTotal(rowIndex);
                                        }}
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-FR"
                                        className="w-full"
                                    />
                                    {article && article.catalogue && (
                                        <small className="p-text-secondary block mt-1">
                                            Catalogue: {article.catalogue}
                                        </small>
                                    )}
                                </div>
                            );
                        }}
                        style={{ minWidth: '140px' }}
                    />

                    <Column
                        header="Montant total article"
                        body={(rowData) => {
                            const article = getArticleById(rowData.articleId);
                            return (
                                <div>
                                    <InputNumber
                                        value={rowData.prixTotal || 0}
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-FR"
                                        className="w-full readonly-input"
                                        disabled
                                    />
                                    {article && article.catalogue && (
                                        <small className="p-text-secondary block mt-1">
                                            Catalogue: {article.catalogue}
                                        </small>
                                    )}
                                </div>
                            );
                        }}
                        style={{ minWidth: '160px' }}
                    />

                    <Column
                        header="Actions"
                        body={(rowData, { rowIndex }) => {
                            const article = getArticleById(rowData.articleId);
                            return (
                                <div>
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-rounded p-button-danger p-button-text"
                                        onClick={() => removeDetail(rowIndex)}
                                        tooltip="Supprimer"
                                    />
                                    {article && article.catalogue && (
                                        <small className="p-text-secondary block mt-1">
                                            {article.catalogue}
                                        </small>
                                    )}
                                </div>
                            );
                        }}
                        style={{ minWidth: '120px' }}
                    />
                </DataTable>
            </div>

            <style jsx>{`
                .readonly-input input {
                    background-color: #f8f9fa !important;
                    color: #6c757d !important;
                    cursor: not-allowed !important;
                }
                .p-message {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    border-radius: 6px;
                    background-color: #e9ecef;
                    border: 1px solid #ced4da;
                }
                .p-message i {
                    font-size: 1.2rem;
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
};

export default StkInventaireForm;