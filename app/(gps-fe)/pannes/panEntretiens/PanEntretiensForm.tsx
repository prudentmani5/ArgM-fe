'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { PanEntretiens, PanEntretiensDetails, PanEngin, EnginsPartieType, PieceRechange, EntretiensType } from "./panEntretiens.model";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import axios from "axios";
import { API_BASE_URL } from '@/utils/apiConfig';

interface PanEntretiensFormProps {
    entretiens: PanEntretiens;
    details: PanEntretiensDetails[];
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
    setDetails: React.Dispatch<React.SetStateAction<PanEntretiensDetails[]>>;
    engins: PanEngin[];
    parties: EnginsPartieType[];
    pieces: PieceRechange[];
    entretiensTypes: EntretiensType[];
    checkEntretiensId: (entretiensId: string) => Promise<boolean>;
}

const PanEntretiensForm: React.FC<PanEntretiensFormProps> = ({
    entretiens,
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
    entretiensTypes,
    checkEntretiensId
}) => {
    const toast = useRef<Toast>(null);
    const [entretiensIdExists, setEntretiensIdExists] = useState(false);
    const [filteredParties, setFilteredParties] = useState<EnginsPartieType[]>([]);

    useEffect(() => {
        if (entretiens.enginId) {
            const filtered = parties.filter(partie => partie.enginId === entretiens.enginId);
            setFilteredParties(filtered);
        } else {
            setFilteredParties([]);
        }
    }, [entretiens.enginId, parties]);

    const handleEntretiensIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const entretiensId = e.target.value;
        if (entretiensId) {
            const exists = await checkEntretiensId(entretiensId);
            setEntretiensIdExists(exists);
            if (exists) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/panEntretiens/findbyid?entretiensId=${entretiensId}`);
                    const existingEntretiens = response.data;
                    // Update fields with existing data
                    Object.keys(existingEntretiens).forEach(key => {
                        if (key in entretiens) {
                            // entretiens[key as keyof PanEntretiens] = existingEntretiens[key];
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
                    <label htmlFor="entretiensId">ID Entretien</label>
                    <InputText
                        id="entretiensId"
                        name="entretiensId"
                        value={entretiens.entretiensId}
                        onChange={handleChange}
                        onBlur={handleEntretiensIdBlur}
                        className={entretiensIdExists ? 'p-invalid' : ''}
                    />
                    {entretiensIdExists && <small className="p-error">Cet entretien existe déjà</small>}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateDebut">Date Début</label>
                    <Calendar
                        id="dateDebut"
                        value={entretiens.dateDebut}
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
                        value={entretiens.dateFin}
                        onChange={(e) => handleDateChange(e.value as Date, 'dateFin')}
                        showIcon
                        dateFormat="dd/mm/yy"
                        showTime
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateProchainEntretien">Date Prochain Entretien</label>
                    <Calendar
                        id="dateProchainEntretien"
                        value={entretiens.dateProchainEntretien}
                        onChange={(e) => handleDateChange(e.value as Date, 'dateProchainEntretien')}
                        showIcon
                        dateFormat="dd/mm/yy"
                        showTime
                    />
                </div>

               {/* <div className="field col-12 md:col-4 flex align-items-center">
                    <Checkbox
                        inputId="valide"
                        name="valide"
                        checked={entretiens.valide || false}
                        onChange={(e) => handleCheckboxChange(e, 'valide')}
                    />
                    <label htmlFor="valide" className="ml-2">Validé</label>
                </div> */}

                <div className="field col-12 md:col-4">
                    <label htmlFor="numeroOrdre">Numéro d'Ordre</label>
                    <InputNumber
                        id="numeroOrdre"
                        value={entretiens.numeroOrdre}
                        onValueChange={(e) => handleNumberChange(e, 'numeroOrdre')}
                        mode="decimal"
                        min={0}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="heure">Heure</label>
                    <InputNumber
                        id="heure"
                        value={entretiens.heure}
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
                        value={entretiens.enginId}
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
                        value={entretiens.enginPartieId}
                        options={filteredParties}
                        optionLabel="partieDesignation"
                        optionValue="enginPartieId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une partie"
                        disabled={!entretiens.enginId}
                        filter
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="typeOperation">Type d'Opération</label>
                    <Dropdown
                        id="typeOperation"
                        name="typeOperation"
                        value={entretiens.typeOperation}
                        options={entretiensTypes}
                        optionLabel="designation"
                        optionValue="designation"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                        filter
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="indexKilometrique">Index Kilométrique</label>
                    <InputText
                        id="indexKilometrique"
                        name="indexKilometrique"
                        value={entretiens.indexKilometrique}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="prochainEntretien">Prochain Entretien</label>
                    <InputText
                        id="prochainEntretien"
                        name="prochainEntretien"
                        value={entretiens.prochainEntretien}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="observation">Observation</label>
                    <InputTextarea
                        id="observation"
                        name="observation"
                        value={entretiens.observation}
                        onChange={handleTextareaChange}
                        rows={2}
                    />
                </div>

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

export default PanEntretiensForm;