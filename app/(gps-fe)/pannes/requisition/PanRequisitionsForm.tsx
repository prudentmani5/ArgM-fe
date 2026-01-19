// PanRequisitionsForm.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import PanRequisitions from "./PanRequisitions";
import { PanRequisitionsDetails, PanEngin, PieceRechange } from "./PanRequisitions";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";
import { PersonnelTechnique } from './PersonnelTechnique';
import { API_BASE_URL } from '@/utils/apiConfig';

interface PanRequisitionsFormProps {
    requisition: PanRequisitions;
    details: PanRequisitionsDetails[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<PanRequisitionsDetails[]>>;
    engins: PanEngin[];
    pieces: PieceRechange[];
    //checkRequisitionId: (requisitionId: string) => Promise<boolean>;
    personnelTechniques: PersonnelTechnique[];
}

const PanRequisitionsForm: React.FC<PanRequisitionsFormProps> = ({
    requisition,
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
    engins,
    pieces,
    //checkRequisitionId,
    personnelTechniques
}) => {
    const toast = useRef<Toast>(null);
    const [requisitionIdExists, setRequisitionIdExists] = useState(false);

    {/*const handleRequisitionIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const requisitionId = e.target.value;
        if (requisitionId) {
            const exists = await checkRequisitionId(requisitionId);
            setRequisitionIdExists(exists);
            if (exists) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/panRequisitions/findbyid?requisitionId=${requisitionId}`);
                    const existingRequisition = response.data;
                    // Mettre à jour les champs avec les données existantes
                    Object.keys(existingRequisition).forEach(key => {
                        if (key in requisition) {
                            //requisition[key as keyof PanRequisitions] = existingRequisition[key];
                        }
                    });
                } catch (error) {
                    console.error("Error loading existing entry:", error);
                }
            }
        }
    };
      */}
    const verifyQuantities = (rowIndex: number, quantite: number | undefined, prixUnitaire: number | undefined) => {
        const errors = {
            quantiteError: '',
            prixUnitaireError: ''
        };

        if (quantite === undefined || quantite === null || isNaN(quantite)) {
            errors.quantiteError = 'La quantité est requise';
        } else if (quantite < 0) {
            errors.quantiteError = 'La quantité ne peut pas être négative';
        }

        if (prixUnitaire === undefined || prixUnitaire === null || isNaN(prixUnitaire)) {
            errors.prixUnitaireError = 'Le prix unitaire est requis';
        } else if (prixUnitaire < 0) {
            errors.prixUnitaireError = 'Le prix unitaire ne peut pas être négatif';
        }

        if (errors.quantiteError || errors.prixUnitaireError) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur de validation',
                detail: `${errors.quantiteError ? errors.quantiteError + ' ' : ''}${errors.prixUnitaireError || ''}`,
                life: 3000
            });
        }
    };

    const calculateTotal = (quantite: number, prixUnitaire: number) => {
        return quantite * prixUnitaire;
    };

    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="requisitionsId">ID Requisition</label>
                    <InputText
                        id="requisitionsId"
                        name="requisitionsId"
                        value={requisition.requisitionsId?.toString() || ''}
                        onChange={handleChange}
                        //onBlur={handleRequisitionIdBlur}
                        className={requisitionIdExists ? 'p-invalid' : ''}
                    />
                    {requisitionIdExists && <small className="p-error">Cette réquisition existe déjà</small>}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="date">Date</label>
                    <Calendar
                        id="date"
                        value={requisition.date}
                        onChange={(e) => handleDateChange(e.value as Date, 'date')}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="enginId">Engin</label>
                    <Dropdown
                        id="enginId"
                        value={requisition.enginId}
                        options={engins}
                        optionLabel="enginDesignation"
                        optionValue="enginId"
                        onChange={(e) => handleDropdownChange(e)}
                        placeholder="Sélectionnez un engin"
                        filter
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="catalogue">Catalogue</label>
                    <InputText
                        id="catalogue"
                        name="catalogue"
                        value={requisition.catalogue}
                        onChange={handleChange}
                    />
                </div>



                <div className="field col-12 md:col-4">
                    <label htmlFor="matricule">Matricule Technicien</label>
                    <Dropdown
                        id="matricule"
                        value={requisition.matricule}
                        options={personnelTechniques}
                        onChange={(e) => handleDropdownChange(e)}
                        optionLabel="nom"
                        optionValue="matricule"
                        placeholder="Sélectionnez un technicien"
                        filter
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="typeRequisition">Type Requisition</label>
                    <InputText
                        id="typeRequisition"
                        name="typeRequisition"
                        value={requisition.typeRequisition}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="observations">Observations</label>
                    <InputText
                        id="observations"
                        name="observations"
                        value={requisition.observations}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="tonage">Tonage</label>
                    <InputNumber
                        id="tonage"
                        value={requisition.tonage}
                        onValueChange={(e) => handleNumberChange(e, 'tonage')}
                        min={0}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="indexDepart">Index Départ</label>
                    <InputNumber
                        id="indexDepart"
                        value={requisition.indexDepart}
                        onValueChange={(e) => handleNumberChange(e, 'indexDepart')}
                        min={0}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="indexFin">Index Fin</label>
                    <InputNumber
                        id="indexFin"
                        value={requisition.indexFin}
                        onValueChange={(e) => handleNumberChange(e, 'indexFin')}
                        min={0}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="diffIndex">Différence Index</label>
                    <InputNumber
                        id="diffIndex"
                        value={requisition.diffIndex || 0}
                        disabled
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="consH">Consommation par heure</label>
                    <InputNumber
                        id="consH"
                        value={requisition.consH || 0}
                        disabled
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="ratio">Ratio</label>
                    <InputNumber
                        id="ratio"
                        value={requisition.ratio || 0}
                        disabled
                    />
                </div>

                <div className="col-12">
                    <h4>Détails de la réquisition</h4>
                    <Button
                        icon="pi pi-plus"
                        label="Ajouter une pièce"
                        onClick={addDetail}
                        className="mb-3"
                    />

                    <DataTable value={details} responsiveLayout="scroll">
                        <Column field="produitPieceId" header="Pièce de rechange"
                            body={(rowData, { rowIndex }) => (
                                <Dropdown
                                    value={rowData.produitPieceId}
                                    options={pieces}
                                    optionLabel="designationPieceRechange"
                                    optionValue="pieceRechangeId"
                                    onChange={(e) => {
                                        updateDetail(rowIndex, 'produitPieceId', e.value);
                                        const selectedPiece = pieces.find(p => p.pieceRechangeId === e.value);
                                        if (selectedPiece) {
                                            updateDetail(rowIndex, 'prixUnitaire', selectedPiece.prixUnitaire);
                                            updateDetail(rowIndex, 'total', calculateTotal(rowData.quantite, selectedPiece.prixUnitaire));
                                        }
                                    }}
                                    placeholder="Sélectionnez une pièce"
                                    filter
                                />
                            )}
                        />
                        <Column field="quantite" header="Quantité"
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.quantite || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'quantite', e.value);
                                                updateDetail(rowIndex, 'total', calculateTotal(e.value, rowData.prixUnitaire));
                                                verifyQuantities(rowIndex, e.value, rowData.prixUnitaire);
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
                                                updateDetail(rowIndex, 'total', calculateTotal(rowData.quantite, e.value));
                                                verifyQuantities(rowIndex, rowData.quantite, e.value);
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
                        <Column field="total" header="Total"
                            body={(rowData) => (
                                <InputNumber
                                    value={rowData.total || 0}
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                    disabled
                                />
                            )}
                        />
                        <Column field="nouvelleQuantite" header="Nouvelle Quantité"
                            body={(rowData, { rowIndex }) => (
                                <InputNumber
                                    value={rowData.nouvelleQuantite || 0}
                                    onValueChange={(e) => updateDetail(rowIndex, 'nouvelleQuantite', e.value)}
                                    mode="decimal"
                                    min={0}
                                />
                            )}
                        />
                        <Column field="initialisation" header="Initialisation"
                            body={(rowData, { rowIndex }) => (
                                <input
                                    type="checkbox"
                                    checked={rowData.initialisation || false}
                                    onChange={(e) => updateDetail(rowIndex, 'initialisation', e.target.checked)}
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

export default PanRequisitionsForm;