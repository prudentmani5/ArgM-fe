'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { StkEntree, StkEntreeDetails, Fournisseur, TypeMvt, StkArticle, StkExercice, StkMagasin, StkMagasinResponsable } from "./StkEntree";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";

interface StkEntreeFormProps {
    entree: StkEntree;
    details: StkEntreeDetails[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<StkEntreeDetails[]>>;
    fournisseurs: Fournisseur[];
    typeMvts: TypeMvt[];
    articles: StkArticle[];
    exercices: StkExercice[];
    magasins: StkMagasin[];
    responsables: StkMagasinResponsable[];
    onSearchEntree?: (numeroPiece: string) => void;
}

const StkEntreeForm: React.FC<StkEntreeFormProps> = ({
    entree,
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
    fournisseurs,
    typeMvts,
    articles,
    exercices,
    magasins,
    responsables,
    onSearchEntree
}) => {
    const toast = useRef<Toast>(null);
    const [numeroPieceTouched, setNumeroPieceTouched] = useState(false);
    const [filteredFournisseurs, setFilteredFournisseurs] = useState<Fournisseur[]>(fournisseurs);

    // Initialiser les fournisseurs filtrés
    useEffect(() => {
        setFilteredFournisseurs(fournisseurs);
    }, [fournisseurs]);

    // Fonction pour filtrer les fournisseurs
    const filterFournisseurs = (query: string) => {
        if (!query.trim()) {
            setFilteredFournisseurs(fournisseurs);
            return;
        }
        
        const filtered = fournisseurs.filter(fournisseur =>
            fournisseur.nom?.toLowerCase().includes(query.toLowerCase()) ||
            fournisseur.email?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredFournisseurs(filtered);
    };

    // Fonction de recherche pour le dropdown Fournisseur
    const fournisseurFilterTemplate = (options: any) => {
        return (
            <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                    <i className="pi pi-search" />
                </span>
                <InputText
                    placeholder="Rechercher un fournisseur..."
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => filterFournisseurs(e.target.value)}
                    className="w-full"
                />
            </div>
        );
    };

    // Template d'affichage pour le fournisseur sélectionné
    const selectedFournisseurTemplate = (option: Fournisseur) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>
                        <div className="font-medium">{option.nom}</div>
                        <div className="text-sm text-color-secondary">{option.adresse}</div>
                    </div>
                </div>
            );
        }
        return <span>Sélectionnez un fournisseur</span>;
    };

    // Template d'option pour la liste déroulante
    const fournisseurOptionTemplate = (option: Fournisseur) => {
        return (
            <div className="flex align-items-center justify-content-between">
                <div>
                    <div className="font-medium">{option.nom}</div>
                    <div className="text-sm text-color-secondary">
                        {option.adresse && <span>Adresse: {option.adresse} | </span>}
                        {option.email && <span>Email: {option.email}</span>}
                    </div>
                </div>
                <div className="text-sm">
                    {option.tel && <span>{option.tel}</span>}
                </div>
            </div>
        );
    };

    // Fonction pour réinitialiser le filtre des fournisseurs
    const resetFournisseurFilter = () => {
        setFilteredFournisseurs(fournisseurs);
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString() : '';
    };

    // Mettre à jour automatiquement le montant dans l'entité entree
    useEffect(() => {
        const totalAmount = calculateTotalAmount();
        handleNumberChange({ value: totalAmount } as InputNumberValueChangeEvent, 'montant');
    }, [details]);

    // Fonction pour mettre à jour l'unité lorsque l'article est sélectionné
    const handleArticleChange = (rowIndex: number, articleId: string) => {
        // Trouver l'article sélectionné
        const selectedArticle = articles.find(article => article.articleId === articleId);
        
        if (selectedArticle) {
            // Mettre à jour l'unité de l'article
            updateDetail(rowIndex, 'uniteId', selectedArticle.uniteId);
        }
    };

    const verifyQuantities = (rowIndex: number, qteE: number | undefined, prixE: number | undefined) => {
        setDetails((prev: any[]) => prev.map((detail: any, index: number) => {
            if (index !== rowIndex) return detail;

            const errors = {
                qteError: '',
                prixError: ''
            };

            // Validate quantity
            if (qteE === undefined || qteE === null || isNaN(qteE)) {
                errors.qteError = 'La quantité est requise';
            } else if (qteE < 0) {
                errors.qteError = 'La quantité ne peut pas être négative';
            }

            // Validate price
            if (prixE === undefined || prixE === null || isNaN(prixE)) {
                errors.prixError = 'Le prix est requis';
            } else if (prixE < 0) {
                errors.prixError = 'Le prix ne peut pas être négatif';
            }

            return {
                ...detail,
                ...errors
            };
        }));
    };

    // Gestionnaire pour le blur du champ numeroPiece
    const handleNumeroPieceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setNumeroPieceTouched(true);
        const numeroPiece = e.target.value.trim();
        
        if (numeroPiece && onSearchEntree) {
            onSearchEntree(numeroPiece);
        }
    };

    const calculateTotalAmount = () => {
        return details.reduce((total, detail) => {
            const prixE = detail.prixE || 0;
            return total + prixE;
        }, 0);
    };

    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="numeroPiece">Numéro Pièce</label>
                    <InputText
                        id="numeroPiece"
                        name="numeroPiece"
                        value={entree.numeroPiece}
                        onChange={handleChange}
                        onBlur={handleNumeroPieceBlur}
                        placeholder="Saisissez le numéro de pièce"
                    />
                    {numeroPieceTouched && (
                        <small className="p-text-secondary">
                            Tapez le numéro de pièce et appuyez sur Tab pour rechercher
                        </small>
                    )}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="magasinId">Magasin</label>
                    <Dropdown
                        id="magasinId"
                        name="magasinId"
                        value={entree.magasinId}
                        options={magasins}
                        optionLabel="nom"
                        optionValue="magasinId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un magasin"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="exerciceId">Exercice</label>
                    <Dropdown
                        id="exerciceId"
                        name="exerciceId"
                        value={entree.exerciceId}
                        options={exercices}
                        optionLabel="annee"
                        optionValue="annee"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un exercice"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="typeMvtId">Type Mouvement</label>
                    <Dropdown
                        id="typeMvtId"
                        name="typeMvtId"
                        value={entree.typeMvtId}
                        options={typeMvts}
                        optionLabel="libelle"
                        optionValue="typeMvtId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateEntree">Date Entrée</label>
                    <Calendar
                        id="dateEntree"
                        value={entree.dateEntree}
                        onChange={(e) => handleDateChange(e.value as Date, 'dateEntree')}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="magRespId">Magasin Responsable</label>
                    <Dropdown
                        id="magRespId"
                        name="magRespId"
                        value={entree.magRespId}
                        options={responsables}
                        optionLabel="magasinId"
                        optionValue="magRespId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un responsable"
                    />
                </div>

               <div className="field col-12 md:col-4">
    <label htmlFor="fournisseurId">Fournisseur</label>
    <Dropdown
        id="fournisseurId"
        name="fournisseurId"
        value={entree.fournisseurId}
        options={fournisseurs}
        optionLabel="nom"
        optionValue="fournisseurId"
        onChange={handleDropdownChange}
        placeholder="Sélectionnez un fournisseur"
        filter
        filterBy="nom,email,adresse"
        filterPlaceholder="Rechercher un fournisseur..."
        emptyFilterMessage="Aucun fournisseur trouvé"
        panelClassName="min-w-max"
        itemTemplate={fournisseurOptionTemplate}
        valueTemplate={selectedFournisseurTemplate}
    />
    <small className="p-text-secondary">
        Tapez pour rechercher par nom, email ou adresse
    </small>
</div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="montant">Montant Total</label>
                    <InputNumber
                        readOnly
                        id="montant"
                        value={calculateTotalAmount()}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                        className="readonly-input"
                    />
                </div>

                <div className="col-12">
                    <h4>Détails des articles</h4>
                    <Button 
                        icon="pi pi-plus" 
                        label="Ajouter un article" 
                        onClick={addDetail}
                        className="mb-3"
                    />
                    
                    <DataTable value={details} responsiveLayout="scroll">
                        <Column field="articleId" header="Article" 
                            body={(rowData, { rowIndex }) => (
                                <Dropdown
                                    value={rowData.articleId}
                                    options={articles}
                                    optionLabel="libelle"
                                    optionValue="articleId"
                                    onChange={(e) => {
                                        // Mettre à jour l'article
                                        updateDetail(rowIndex, 'articleId', e.value);
                                        // Mettre à jour l'unité correspondante
                                        handleArticleChange(rowIndex, e.value);
                                    }}
                                    placeholder="Sélectionnez un article"
                                    filter
                                />
                            )}
                        />
                        
                        <Column field="uniteId" header="Unité" 
                            body={(rowData) => {
                                // Afficher l'unité stockée dans le détail
                                return (
                                    <InputText
                                        value={rowData.uniteId || 'N/A'}
                                        readOnly
                                        className="readonly-input"
                                    />
                                );
                            }}
                        />
                        
                        <Column field="qteStock" header="Qté en stock" 
                            body={(rowData) => {
                                // Trouver l'article correspondant dans la liste des articles
                                const article = articles.find(a => a.articleId === rowData.articleId);
                                
                                return (
                                    <InputNumber
                                        value={article?.qteStock || 0}
                                        readOnly
                                        className="readonly-input"
                                    />
                                );
                            }}
                        />
                        
                        <Column field="qteE" header="Qté fournie" 
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.qteE || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'qteE', e.value);
                                                verifyQuantities(rowIndex, e.value, rowData.prixE);
                                            }
                                        }}
                                        mode="decimal"
                                        min={0}
                                    />
                                    {rowData.qteError && (
                                        <span className="p-inputgroup-addon p-error">
                                            <i className="pi pi-exclamation-triangle" title={rowData.qteError}/>
                                        </span>
                                    )}
                                </div>
                            )}
                        />
                        <Column field="prixE" header="Prix d'entrée" 
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.prixE || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'prixE', e.value);
                                                verifyQuantities(rowIndex, rowData.qteE, e.value);
                                            }
                                        }}
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-FR"
                                        min={0}
                                    />
                                    {rowData.prixError && (
                                        <span className="p-inputgroup-addon p-error">
                                            <i className="pi pi-exclamation-triangle" title={rowData.prixError}/>
                                        </span>
                                    )}
                                </div>
                            )}
                        />
                        <Column header="Action" 
                            body={(rowData, { rowIndex }) => (
                                <Button 
                                    icon="pi pi-trash" 
                                    className="p-button-danger" 
                                    onClick={() => removeDetail(rowIndex)}
                                />
                            )}
                        />
                    </DataTable>
                </div>
            </div>
            
            <style jsx>{`
                .stock-quantity-input input {
                    background-color: #d4edda !important;
                    color: #155724 !important;
                    font-weight: bold;
                    border: 1px solid #c3e6cb !important;
                }
                
                .stock-quantity-input input:focus {
                    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
                }
                
                .readonly-input input {
                    background-color: #e9ecef !important;
                    color: #6c757d !important;
                    cursor: not-allowed !important;
                }
                
                .min-w-max {
                    min-width: 400px !important;
                }
            `}</style>
        </div>
    );
};

export default StkEntreeForm;