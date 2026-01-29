// StkInventaireForm.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import {
    StkInventaireDetails,
    StkMagasin,
    StkExercice,
    StkMagasinResponsable,
    StkArticle,
    StkUnite
} from "./StkInventaire";

import StkInventaire from "./StkInventaire";
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
    handleCheckboxChange: (e: any, field: string) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<StkInventaireDetails[]>>;
    magasins: StkMagasin[];
    exercices: StkExercice[];
    responsables: StkMagasinResponsable[];
    articles: StkArticle[];
    unites: StkUnite[];
    checkInventaireId: (inventaireId: string) => Promise<boolean>;
}

const StkInventaireForm: React.FC<StkInventaireFormProps> = ({
    inventaire,
    details,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange,
    addDetail,
    removeDetail,
    updateDetail,
    loading = false,
    setDetails,
    magasins,
    exercices,
    responsables,
    articles,
    unites,
    checkInventaireId
}) => {
    const toast = useRef<Toast>(null);
    const [inventaireIdExists, setInventaireIdExists] = useState(false);
    const [selectedMagasin, setSelectedMagasin] = useState<StkMagasin | null>(null);

    // Filtrer les responsables pour n'afficher que ceux du magasin sélectionné
    const filteredResponsables = selectedMagasin
        ? responsables.filter(resp => resp.magasinId === selectedMagasin.magasinId && resp.actif)
        : [];

    const handleMagasinChange = (e: DropdownChangeEvent) => {
        // Mettre à jour la valeur du magasin
        handleDropdownChange(e);

        // Trouver le magasin sélectionné pour filtrer les responsables
        const selected = magasins.find(mag => mag.magasinId === e.value);
        setSelectedMagasin(selected || null);
    };

    const handleInventaireIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const inventaireId = e.target.value;
        if (inventaireId) {
            const exists = await checkInventaireId(inventaireId);
            setInventaireIdExists(exists);
            if (exists) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/stkInventaires/findbyid?inventaireId=${inventaireId}`);
                    const existingInventaire = response.data;
                    Object.keys(existingInventaire).forEach(key => {
                        if (key in inventaire) {
                            //inventaire[key as keyof StkInventaire] = existingInventaire[key];
                        }
                    });
                } catch (error) {
                    console.error("Error loading existing entry:", error);
                }
            }
        }
    };

    const calculatePrixTotal = (quantitePhysique: number, prixUnitaire: number) => {
        return quantitePhysique * prixUnitaire;
    };

    // Fonction pour calculer le montant total
    const calculateTotalAmount = (details: StkInventaireDetails[]): number => {
        return details.reduce((total, detail) => {
            return total + (detail.prixTotal || 0);
        }, 0);
    };

     // Mettre à jour le montant total chaque fois que les détails changent
    useEffect(() => {
        const totalAmount = calculateTotalAmount(details);
        // Mettre à jour le montant dans l'objet inventaire
        // Vous devrez peut-être ajouter une fonction pour cela dans vos props
        // ou utiliser votre handleNumberChange
        handleNumberChange({ value: totalAmount } as InputNumberValueChangeEvent, 'montant');
    }, [details]);


    const verifyQuantities = (rowIndex: number, quantitePhysique: number | undefined, prixUnitaire: number | undefined) => {
        const errors = {
            quantiteError: '',
            prixError: ''
        };

        if (quantitePhysique === undefined || quantitePhysique === null || isNaN(quantitePhysique)) {
            errors.quantiteError = 'La quantité est requise';
        } else if (quantitePhysique < 0) {
            errors.quantiteError = 'La quantité ne peut pas être négative';
        }

        if (prixUnitaire === undefined || prixUnitaire === null || isNaN(prixUnitaire)) {
            errors.prixError = 'Le prix unitaire est requis';
        } else if (prixUnitaire < 0) {
            errors.prixError = 'Le prix unitaire ne peut pas être négatif';
        }

        if (errors.quantiteError || errors.prixError) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur de validation',
                detail: `${errors.quantiteError ? errors.quantiteError + ' ' : ''}${errors.prixError || ''}`,
                life: 3000
            });
        }
        // Après la validation, recalculer le montant total
        const totalAmount = calculateTotalAmount(details);
        handleNumberChange({ value: totalAmount } as InputNumberValueChangeEvent, 'montant');
    };

    // Modifier les fonctions de mise à jour des détails pour recalculer le montant total
    const handleUpdateDetail = (index: number, field: string, value: any) => {
        updateDetail(index, field, value);
        
        // Si le champ affecte le prix total, recalculer le montant
        if (field === 'quantitePhysique' || field === 'prixUnitaire' || field === 'prixTotal') {
            const totalAmount = calculateTotalAmount(details);
            handleNumberChange({ value: totalAmount } as InputNumberValueChangeEvent, 'montant');
        }
    };

    // Modifier addDetail et removeDetail pour recalculer le montant
    const handleAddDetail = () => {
        addDetail();
        // Le useEffect se chargera de recalculer le montant
    };

    const handleRemoveDetail = (index: number) => {
        removeDetail(index);
        // Le useEffect se chargera de recalculer le montant
    };


    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <div className="formgrid grid">
               {/* <div className="field col-12 md:col-3">
                    <label htmlFor="inventaireId">ID Inventaire</label>
                    <InputText
                        id="inventaireId"
                        name="inventaireId"
                        value={inventaire.inventaireId}
                        onChange={handleChange}
                        onBlur={handleInventaireIdBlur}
                        className={inventaireIdExists ? 'p-invalid' : ''}
                    />
                    {inventaireIdExists && <small className="p-error">Cet ID existe déjà</small>}
                </div> * */}

                <div className="field col-12 md:col-3">
                    <label htmlFor="numeroPiece">Numéro de Pièce</label>
                    <InputText
                        id="numeroPiece"
                        name="numeroPiece"
                        value={inventaire.numeroPiece}
                        onChange={handleChange}
                    />
                </div>

               {/*  <div className="field col-12 md:col-3">
                    <label htmlFor="magasinId">Magasin</label>
                    <Dropdown
                        id="magasinId"
                        name="magasinId"
                        value={inventaire.magasinId}
                        options={magasins}
                        optionLabel="nom"
                        optionValue="magasinId"
                        onChange={handleMagasinChange}
                        placeholder="Sélectionnez un magasin"
                        filter
                    />
                </div> */}

                 <div className="field col-12 md:col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText
                        id="libelle"
                        name="libelle"
                        value={inventaire.libelle}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="exerciceId">Exercice</label>
                    <Dropdown
                        id="exerciceId"
                        name="exerciceId"
                        value={inventaire.exerciceId}
                        options={exercices}
                        optionLabel="libelle"
                        optionValue="exerciceId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un exercice"
                        filter
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateInventaire">Date Inventaire</label>
                    <Calendar
                        id="dateInventaire"
                        value={inventaire.dateInventaire}
                        onChange={(e) => handleDateChange(e.value as Date, 'dateInventaire')}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                {/* <div className="field col-12 md:col-3">
                    <label htmlFor="magrespId">Responsable</label>
                    <Dropdown
                        id="magrespId"
                        name="magrespId"
                        value={inventaire.magrespId}
                        options={filteredResponsables}
                        optionLabel="responsableId"
                        optionValue="magRespId"
                        onChange={handleDropdownChange}
                        placeholder={selectedMagasin ? "Sélectionnez un responsable" : "Sélectionnez d'abord un magasin"}
                        disabled={!selectedMagasin}
                        filter
                    />
                </div> */}

               

                <div className="field col-12 md:col-3">
                    <label htmlFor="montant">Montant</label>
                    <InputNumber
                        id="montant"
                        value={inventaire.montant}
                        onValueChange={(e) => handleNumberChange(e, 'montant')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                        disabled // Désactiver l'édition manuelle puisque c'est calculé automatiquement
                    />
                </div>

                 {/*<div className="field col-12 md:col-3">
                    <label htmlFor="isValid" className="block">Valide</label>
                    <Checkbox
                        inputId="isValid"
                        checked={inventaire.isValid}
                        onChange={(e) => handleCheckboxChange(e, 'isValid')}
                    />
                </div> */}

                <div className="col-12">
                    <h4>Détails de l'inventaire</h4>
                    <Button
                        icon="pi pi-plus"
                        label="Ajouter un détail"
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
                                onChange={(e) => handleUpdateDetail(rowIndex, 'articleId', e.value)}
                                placeholder="Sélectionnez un article"
                                filter
                            />
                        )}
                    />
                       <Column field="quantitePhysique" header="Quantité Physique"
                        body={(rowData, { rowIndex }) => (
                            <div className="p-inputgroup">
                                <InputNumber
                                    value={rowData.quantitePhysique || 0}
                                    onValueChange={(e) => {
                                        if (e.value !== null && e.value !== undefined) {
                                            handleUpdateDetail(rowIndex, 'quantitePhysique', e.value);
                                            const newPrixUnitaire = rowData.prixUnitaire || 0;
                                            handleUpdateDetail(rowIndex, 'prixTotal', calculatePrixTotal(e.value, newPrixUnitaire));
                                            verifyQuantities(rowIndex, e.value, newPrixUnitaire);
                                        }
                                    }}
                                    mode="decimal"
                                    min={0}
                                />
                            </div>
                        )}
                    />
                        <Column field="quantiteTheorique" header="Quantité Théorique"
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.quantiteTheorique || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'quantiteTheorique', e.value);
                                            }
                                        }}
                                        mode="decimal"
                                        min={0}
                                    />
                                </div>
                            )}
                        />
                        <Column field="prixUnitaire" header="Prix Unitaire"
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.prixUnitaire || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'prixUnitaire', e.value);
                                                const newQuantite = rowData.quantitePhysique || 0;
                                                updateDetail(rowIndex, 'prixTotal', calculatePrixTotal(newQuantite, e.value));
                                                verifyQuantities(rowIndex, newQuantite, e.value);
                                            }
                                        }}
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-FR"
                                        min={0}
                                    />
                                </div>
                            )}
                        />
                        <Column field="uniteId" header="Unité"
                            body={(rowData, { rowIndex }) => (
                                <Dropdown
                                    value={rowData.uniteId}
                                    options={unites}
                                    optionLabel="libelle"
                                    optionValue="uniteId"
                                    onChange={(e) => updateDetail(rowIndex, 'uniteId', e.value)}
                                    placeholder="Sélectionnez une unité"
                                    filter
                                />
                            )}
                        />
                        <Column field="catalogue" header="Catalogue"
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.catalogue}
                                    onChange={(e) => updateDetail(rowIndex, 'catalogue', e.target.value)}
                                />
                            )}
                        />
                        <Column field="datePeremption" header="Date Péremption"
                            body={(rowData, { rowIndex }) => (
                                <Calendar
                                    value={rowData.datePeremption}
                                    onChange={(e) => updateDetail(rowIndex, 'datePeremption', e.value as Date)}
                                    showIcon
                                    dateFormat="dd/mm/yy"
                                />
                            )}
                        />
                        <Column field="lot" header="Lot"
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.lot}
                                    onChange={(e) => updateDetail(rowIndex, 'lot', e.target.value)}
                                />
                            )}
                        />
                        <Column field="prixTotal" header="Prix Total"
                            body={(rowData) => (
                                <InputNumber
                                    value={rowData.prixTotal || 0}
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                    disabled
                                />
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
        </div>
    );
};

export default StkInventaireForm;