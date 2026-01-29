// PanPannesForm.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { PanPannes, PanPannesDetails, PanEngin, EnginsPartieType, PieceRechange } from "./panPannes.model";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import axios from "axios";
import { API_BASE_URL } from '@/utils/apiConfig';

interface PanPannesFormProps {
    pannes: PanPannes;
    details: PanPannesDetails[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleCheckboxChange: (e: any, field: string) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<PanPannesDetails[]>>;
    engins: PanEngin[];
    parties: EnginsPartieType[];
    pieces: PieceRechange[];
    checkPannesId: (pannesId: string) => Promise<boolean>;
}

const PanPannesForm: React.FC<PanPannesFormProps> = ({
    pannes,
    details,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleTextareaChange,
    handleCheckboxChange,
    addDetail,
    removeDetail,
    updateDetail,
    loading = false,
    setDetails,
    engins,
    parties,
    pieces,
    checkPannesId
}) => {
    const toast = useRef<Toast>(null);
    const [pannesIdExists, setPannesIdExists] = useState(false);
    const [filteredParties, setFilteredParties] = useState<EnginsPartieType[]>([]);

    useEffect(() => {
        if (pannes.enginId) {
            const filtered = parties.filter(partie => partie.enginId === pannes.enginId);
            setFilteredParties(filtered);
        } else {
            setFilteredParties([]);
        }
    }, [pannes.enginId, parties]);

    const handlePannesIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const pannesId = e.target.value;
        if (pannesId) {
            const exists = await checkPannesId(pannesId);
            setPannesIdExists(exists);
            if (exists) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/panPannes/findbyid?pannesId=${pannesId}`);
                    const existingPannes = response.data;
                    // Mettre à jour les champs avec les données existantes
                    Object.keys(existingPannes).forEach(key => {
                        if (key in pannes) {
                            // pannes[key as keyof PanPannes] = existingPannes[key];
                        }
                    });
                } catch (error) {
                    console.error("Error loading existing entry:", error);
                }
            }
        }
    };

    const verifyQuantities = (rowIndex: number, qte: number | undefined, pu: number | undefined) => {
        const errors = {
            qteError: '',
            puError: ''
        };

        if (qte === undefined || qte === null || isNaN(qte)) {
            errors.qteError = 'La quantité est requise';
        } else if (qte < 0) {
            errors.qteError = 'La quantité ne peut pas être négative';
        }

        if (pu === undefined || pu === null || isNaN(pu)) {
            errors.puError = 'Le prix unitaire est requis';
        } else if (pu < 0) {
            errors.puError = 'Le prix unitaire ne peut pas être négatif';
        }

        if (errors.qteError || errors.puError) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur de validation',
                detail: `${errors.qteError ? errors.qteError + ' ' : ''}${errors.puError || ''}`,
                life: 3000
            });
        }
    };

    const calculateTotal = (qte: number, pu: number) => {
        return qte * pu;
    };

    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="pannesId">ID Panne</label>
                    <InputText
                        id="pannesId"
                        name="pannesId"
                        value={pannes.pannesId}
                        onChange={handleChange}
                        onBlur={handlePannesIdBlur}
                        className={pannesIdExists ? 'p-invalid' : ''}
                    />
                    {pannesIdExists && <small className="p-error">Cette panne existe déjà</small>}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateDebut">Date Début</label>
                    <Calendar
                        id="dateDebut"
                        value={pannes.dateDebut}
                        onChange={(e) => handleDateChange(e.value as Date, 'dateDebut')}
                        showIcon
                        dateFormat="dd/mm/yy"
                        showTime
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateFin">Date Fin</label>
                    <Calendar
                        id="dateFin"
                        value={pannes.dateFin}
                        onChange={(e) => handleDateChange(e.value as Date, 'dateFin')}
                        showIcon
                        dateFormat="dd/mm/yy"
                        showTime
                    />
                </div>

               {/* <div className="field col-12 md:col-4 flex align-items-center">
                    <Checkbox
                        inputId="valide"
                        name="valide"
                        checked={pannes.valide || false}
                        onChange={(e) => handleCheckboxChange(e, 'valide')}
                    />
                    <label htmlFor="valide" className="ml-2">Validé</label>
                </div>  */}

                <div className="field col-12 md:col-4">
                    <label htmlFor="numeroOrdre">Numéro d'Ordre</label>
                    <InputNumber
                        id="numeroOrdre"
                        value={pannes.numeroOrdre}
                        onValueChange={(e) => handleNumberChange(e, 'numeroOrdre')}
                        mode="decimal"
                        min={0}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="heure">Heure</label>
                    <InputNumber
                        id="heure"
                        value={pannes.heure}
                        onValueChange={(e) => handleNumberChange(e, 'heure')}
                        mode="decimal"
                        min={0}
                        max={23}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="enginId">Engin</label>
                    <Dropdown
                        id="enginId"
                        name="enginId"
                        value={pannes.enginId}
                        options={engins}
                        optionLabel="enginDesignation"
                        optionValue="enginId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un engin"
                        filter
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="enginPartieId">Partie Engin</label>
                    <Dropdown
                        id="enginPartieId"
                        name="enginPartieId"
                        value={pannes.enginPartieId}
                        options={filteredParties}
                        optionLabel="partieDesignation"
                        optionValue="enginPartieId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une partie"
                        disabled={!pannes.enginId}
                        filter
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="observation">Observation</label>
                    <InputText
                        id="observation"
                        name="observation"
                        value={pannes.observation}
                       onChange={handleChange}
                        //rows={2}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="anomalie">Anomalie</label>
                    <InputText
                        id="anomalie"
                        name="anomalie"
                        value={pannes.anomalie}
                        //onChange={handleTextareaChange}
                        onChange={handleChange}
                       // rows={2}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="activite">Activité</label>
                    <InputText
                        id="activite"
                        name="activite"
                        value={pannes.activite}
                        onChange={handleChange}
                    />
                </div>

               {/* <div className="field col-12 md:col-4">
                    <label htmlFor="materiel">Matériel</label>
                    <InputText
                        id="materiel"
                        name="materiel"
                        value={pannes.materiel}
                        onChange={handleChange}
                    />
                </div> µ*/}

                <div className="col-12">
                    <h4>Pièces de rechange utilisées</h4>
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
                                            updateDetail(rowIndex, 'total', 
                                                calculateTotal(rowData.quantite, selectedPiece.prixUnitaire));
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
                                                updateDetail(rowIndex, 'total', 
                                                    calculateTotal(e.value, rowData.prixUnitaire));
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
                                                updateDetail(rowIndex, 'total', 
                                                    calculateTotal(rowData.quantite, e.value));
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

export default PanPannesForm;