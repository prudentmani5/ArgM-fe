// StkSortieForm.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { StkSortie, StkSortieDetails, TypeMvt, StkArticle, StkExercice, StkMagasin, StkMagasinResponsable, StkServiceResponsable, StkUnite } from "./StkSortie";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";
import { API_BASE_URL } from '@/utils/apiConfig';

interface StkSortieFormProps {
    sortie: StkSortie;
    details: StkSortieDetails[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<StkSortieDetails[]>>;
    typeMvts: TypeMvt[];
    articles: StkArticle[];
    exercices: StkExercice[];
    magasins: StkMagasin[];
    magResponsables: StkMagasinResponsable[];
    servResponsables: StkServiceResponsable[];
    unites: StkUnite[];
    checkNumeroPiece: (numeroPiece: string) => Promise<boolean>;
}

const StkSortieForm: React.FC<StkSortieFormProps> = ({
    sortie,
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
    typeMvts,
    articles,
    exercices,
    magasins,
    magResponsables,
    servResponsables,
    unites,
    checkNumeroPiece
}) => {
    const toast = useRef<Toast>(null);
    const [numeroPieceExists, setNumeroPieceExists] = useState(false);

    const handleNumeroPieceBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const numeroPiece = e.target.value;
        if (numeroPiece) {
            const exists = await checkNumeroPiece(numeroPiece);
            setNumeroPieceExists(exists);
            if (exists) {
                // Charger les données existantes si le numéro existe
                try {
                    const response = await axios.get(`${API_BASE_URL}/stkSorties/findbynumero?numeroPiece=${numeroPiece}`);
                    const existingSortie = response.data;
                    // Mettre à jour les champs avec les données existantes
                    Object.keys(existingSortie).forEach(key => {
                        if (key in sortie) {
                            //sortie[key as keyof StkSortie] = existingSortie[key];
                        }
                    });
                } catch (error) {
                    console.error("Error loading existing entry:", error);
                }
            }
        }
    };

   const verifyQuantities = (rowIndex: number, qteS: number | undefined, prixS: number | undefined) => {
    const errors = {
        qteError: '',
        prixError: ''
    };

    // Validate quantity
    if (qteS === undefined || qteS === null || isNaN(qteS)) {
        errors.qteError = 'La quantité est requise';
    } else if (qteS < 0) {
        errors.qteError = 'La quantité ne peut pas être négative';
    }

    // Validate price
    if (prixS === undefined || prixS === null || isNaN(prixS)) {
        errors.prixError = 'Le prix est requis';
    } else if (prixS < 0) {
        errors.prixError = 'Le prix ne peut pas être négatif';
    }

    // Afficher les erreurs via Toast au lieu de les stocker
    if (errors.qteError || errors.prixError) {
        toast.current?.show({
            severity: 'error',
            summary: 'Erreur de validation',
            detail: `${errors.qteError ? errors.qteError + ' ' : ''}${errors.prixError || ''}`,
            life: 3000
        });
    }
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
                        value={sortie.numeroPiece}
                        onChange={handleChange}
                        onBlur={handleNumeroPieceBlur}
                        className={numeroPieceExists ? 'p-invalid' : ''}
                    />
                    {numeroPieceExists && <small className="p-error">Ce numéro existe déjà</small>}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="magasinId">Magasin</label>
                    <Dropdown
                        id="magasinId"
                        name="magasinId"
                        value={sortie.magasinId}
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
                        value={sortie.exerciceId}
                        options={exercices}
                        optionLabel="libelle"
                        optionValue="exerciceId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un exercice"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="typeMvtId">Type Mouvement</label>
                    <Dropdown
                        id="typeMvtId"
                        name="typeMvtId"
                        value={sortie.typeMvtId}
                        options={typeMvts}
                        optionLabel="libelle"
                        optionValue="typeMvtId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateSortie">Date Sortie</label>
                    <Calendar
                        id="dateSortie"
                        value={sortie.dateSortie}
                        onChange={(e) => handleDateChange(e.value as Date, 'dateSortie')}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="servRespIdSuperviseur">Superviseur</label>
                    <Dropdown
                        id="servRespIdSuperviseur"
                        name="servRespIdSuperviseur"
                        value={sortie.servRespIdSuperviseur}
                        options={servResponsables}
                        optionLabel="responsableId"
                        optionValue="servRespId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un superviseur"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="servRespIdDemandeur">Demandeur</label>
                    <Dropdown
                        id="servRespIdDemandeur"
                        name="servRespIdDemandeur"
                        value={sortie.servRespIdDemandeur}
                        options={servResponsables}
                        optionLabel="responsableId"
                        optionValue="servRespId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un demandeur"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="magRespId">Responsable Magasin</label>
                    <Dropdown
                        id="magRespId"
                        name="magRespId"
                        value={sortie.magRespId}
                        options={magResponsables}
                        optionLabel="responsableId"
                        optionValue="magRespId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un responsable"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="reference">Référence</label>
                    <InputText
                        id="reference"
                        name="reference"
                        value={sortie.reference}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="montant">Montant</label>
                    <InputNumber
                        id="montant"
                        value={sortie.montant}
                        onValueChange={(e) => handleNumberChange(e, 'montant')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="matricule">Matricule</label>
                    <InputText
                        id="matricule"
                        name="matricule"
                        value={sortie.matricule}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="ayantDroit">Ayant Droit</label>
                    <InputText
                        id="ayantDroit"
                        name="ayantDroit"
                        value={sortie.ayantDroit}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="destinationId">Destination</label>
                    <InputText
                        id="destinationId"
                        name="destinationId"
                        value={sortie.destinationId}
                        onChange={handleChange}
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
                                    onChange={(e) => updateDetail(rowIndex, 'articleId', e.value)}
                                    placeholder="Sélectionnez un article"
                                    filter
                                />
                            )}
                        />
                        <Column field="datePeremption" header="Date Péremption" 
                            body={(rowData, { rowIndex }) => (
                                <Calendar
                                    value={rowData.datePeremption}
                                    onChange={(e) => updateDetail(rowIndex, 'datePeremption', e.value)}
                                    showIcon
                                    dateFormat="dd/mm/yy"
                                />
                            )}
                        />
                        <Column field="lot" header="Lot" 
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.lot || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'lot', e.target.value)}
                                />
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
                                />
                            )}
                        />
                        <Column field="qteS" header="Quantité" 
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.qteS || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'qteS', e.value);
                                                verifyQuantities(rowIndex, e.value, rowData.prixS);
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
                        <Column field="prixS" header="Prix de sortie" 
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.prixS || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'prixS', e.value);
                                                verifyQuantities(rowIndex, rowData.qteS, e.value);
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
        </div>
    );
};

export default StkSortieForm;