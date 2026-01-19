'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { StkEntree, StkEntreeDetails, Fournisseur, TypeMvt, StkArticle, StkExercice, StkMagasin, StkMagasinResponsable } from "./StkEntree";
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
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
    responsables
}) => {
    const toast = useRef<Toast>(null);

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString() : '';
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
                    />
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
                        optionLabel="libelle"
                        optionValue="exerciceId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un exercice"
                        filter
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
                        filter
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
                    <label htmlFor="magRespId">Responsable</label>
                    <Dropdown
                        id="magRespId"
                        name="magRespId"
                        value={entree.magRespId}
                        options={responsables}
                        optionLabel="responsableId"
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
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="montant">Montant</label>
                    <InputNumber
                        id="montant"
                        value={entree.montant}
                        onValueChange={(e) => handleNumberChange(e, 'montant')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="reference">Référence</label>
                    <InputText
                        id="reference"
                        name="reference"
                        value={entree.reference}
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
                        <Column field="qteE" header="Quantité" 
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
        </div>
    );
};

export default StkEntreeForm;