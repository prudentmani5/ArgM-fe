// PanTravauxForm.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { PanTravaux, PanTravauxDetails, PanEngin } from "./PanTravaux";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { API_BASE_URL } from '@/utils/apiConfig';

interface PanTravauxFormProps {
    travaux: PanTravaux;
    details: PanTravauxDetails[];
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
    setDetails: React.Dispatch<React.SetStateAction<PanTravauxDetails[]>>;
    engins: PanEngin[];
    checkTravauxId: (travauxId: string) => Promise<boolean>;
}

const PanTravauxForm: React.FC<PanTravauxFormProps> = ({
    travaux,
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
    checkTravauxId
}) => {
    const toast = useRef<Toast>(null);
    const [travauxIdExists, setTravauxIdExists] = useState(false);

    const handleTravauxIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const travauxId = e.target.value;
        if (travauxId) {
            const exists = await checkTravauxId(travauxId);
            setTravauxIdExists(exists);
            if (exists) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/panTravaux/findbyid?travauxId=${travauxId}`);
                    const existingTravaux = response.data;
                    // Mettre à jour les champs avec les données existantes
                    Object.keys(existingTravaux).forEach(key => {
                        if (key in travaux) {
                            // travaux[key as keyof PanTravaux] = existingTravaux[key];
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

    const calculatePt = (qte: number, pu: number) => {
        return qte * pu;
    };

    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="travauxId">ID Travaux</label>
                    <InputText
                        id="travauxId"
                        name="travauxId"
                        value={travaux.travauxId}
                        onChange={handleChange}
                        onBlur={handleTravauxIdBlur}
                        className={travauxIdExists ? 'p-invalid' : ''}
                    />
                    {travauxIdExists && <small className="p-error">Ces travaux existent déjà</small>}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="date">Date</label>
                    <Calendar
                        id="date"
                        value={travaux.date}
                        onChange={(e) => handleDateChange(e.value as Date, 'date')}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

              {/*  <div className="field col-12 md:col-4 flex align-items-center">
                    <Checkbox
                        inputId="valide"
                        name="valide"
                        checked={travaux.valide || false}
                        onChange={(e) => handleCheckboxChange(e, 'valide')}
                    />
                    <label htmlFor="valide" className="ml-2">Validé</label>
                </div>
                      */}

                 <div className="field col-4">
                    <label htmlFor="description">Description</label>
                    <InputText
                        id="description"
                        name="description"
                        value={travaux.description}
                        onChange={handleChange}
                        //rows={3}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="type">Type</label>
                    <InputText
                        id="type"
                        name="type"
                        value={travaux.type}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="matricule">Matricule</label>
                    <InputText
                        id="matricule"
                        name="matricule"
                        value={travaux.matricule}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="enginId">Engin</label>
                    <Dropdown
                        id="enginId"
                        name="enginId"
                        value={travaux.enginId}
                        options={engins}
                        optionLabel="enginDesignation"
                        optionValue="enginId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un engin"
                        filter
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="catalogue">Catalogue</label>
                    <InputText
                        id="catalogue"
                        name="catalogue"
                        value={travaux.catalogue}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="activiteTravaux">Activité Travaux</label>
                    <InputText
                        id="activiteTravaux"
                        name="activiteTravaux"
                        value={travaux.activiteTravaux}
                        onChange={handleChange}
                    />
                </div>



                  <div className="field col-4">
                    <label htmlFor="observationTravaux">Observation Travaux</label>
                    <InputTextarea
                        id="observationTravaux"
                        name="observationTravaux"
                        value={travaux.observationTravaux}
                        onChange={handleTextareaChange}
                        rows={3}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="anomalieTravaux">Anomalie Travaux</label>
                    <InputTextarea
                        id="anomalieTravaux"
                        name="anomalieTravaux"
                        value={travaux.anomalieTravaux}
                        onChange={handleTextareaChange}
                        rows={3}
                    />
                </div>

                 

                {/* <div className="field col-12 md:col-6">
                    <label htmlFor="indexKilometrique">Index Kilométrique</label>
                    <InputText
                        id="indexKilometrique"
                        name="indexKilometrique"
                        value={travaux.indexKilometrique}
                        onChange={handleChange}
                    />
                </div>
                */}

               

                {/*<div className="field col-12 md:col-6">
                    <label htmlFor="dureTravaux">Durée Travaux</label>
                    <InputText
                        id="dureTravaux"
                        name="dureTravaux"
                        value={travaux.dureTravaux}
                        onChange={handleChange}
                    />
                </div>
                */}

                <div className="field col-12 md:col-4">
                    <label htmlFor="client">Client</label>
                    <InputText
                        id="client"
                        name="client"
                        value={travaux.client}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="clientFone">Téléphone Client</label>
                    <InputText
                        id="clientFone"
                        name="clientFone"
                        value={travaux.clientFone}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="clientNif">NIF Client</label>
                    <InputText
                        id="clientNif"
                        name="clientNif"
                        value={travaux.clientNif}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="clientAdresse">Adresse Client</label>
                    <InputText
                        id="clientAdresse"
                        name="clientAdresse"
                        value={travaux.clientAdresse}
                        onChange={handleChange}
                    />
                </div>

               

                <div className="field col-12 md:col-4">
                    <label htmlFor="mo">Main d'œuvre</label>
                    <InputNumber
                        id="mo"
                        value={travaux.mo}
                        onValueChange={(e) => handleNumberChange(e, 'mo')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="tauxTVA">Taux TVA (%)</label>
                    <InputNumber
                        id="tauxTVA"
                        value={travaux.tauxTVA}
                        onValueChange={(e) => handleNumberChange(e, 'tauxTVA')}
                        min={0}
                        max={100}
                        suffix="%"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="montantTVA">Montant TVA</label>
                    <InputNumber
                        id="montantTVA"
                        value={travaux.montantTVA}
                        onValueChange={(e) => handleNumberChange(e, 'montantTVA')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                        disabled
                    />
                </div>

                

               

              

                <div className="col-12">
                    <h4>Détails des travaux</h4>
                    <Button
                        icon="pi pi-plus"
                        label="Ajouter un détail"
                        onClick={addDetail}
                        className="mb-3"
                    />

                    <DataTable value={details} responsiveLayout="scroll">
                        <Column field="indexKilometrique" header="Index Kilométrique"
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.indexKilometrique || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'indexKilometrique', e.target.value)}
                                />
                            )}
                        />
                        <Column field="activite" header="Activité"
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.activite || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'activite', e.target.value)}
                                />
                            )}
                        />
                        <Column field="materiel" header="Matériel"
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.materiel || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'materiel', e.target.value)}
                                />
                            )}
                        />
                        <Column field="quantite" header="Quantité"
                            body={(rowData, { rowIndex }) => (
                                <InputNumber
                                    value={rowData.quantite || 0}
                                    onValueChange={(e) => {
                                        if (e.value !== null && e.value !== undefined) {
                                            updateDetail(rowIndex, 'quantite', e.value);
                                            updateDetail(rowIndex, 'pt', calculatePt(e.value, rowData.pu));
                                            verifyQuantities(rowIndex, e.value, rowData.pu);
                                        }
                                    }}
                                    mode="decimal"
                                    min={0}
                                />
                            )}
                        />
                        <Column field="pu" header="Prix Unitaire"
                            body={(rowData, { rowIndex }) => (
                                <InputNumber
                                    value={rowData.pu || 0}
                                    onValueChange={(e) => {
                                        if (e.value !== null && e.value !== undefined) {
                                            updateDetail(rowIndex, 'pu', e.value);
                                            updateDetail(rowIndex, 'pt', calculatePt(rowData.quantite, e.value));
                                            verifyQuantities(rowIndex, rowData.quantite, e.value);
                                        }
                                    }}
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                    min={0}
                                />
                            )}
                        />
                        <Column field="pt" header="Prix Total"
                            body={(rowData) => (
                                <InputNumber
                                    value={rowData.pt || 0}
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                    disabled
                                />
                            )}
                        />
                        <Column field="duree" header="Durée"
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.duree || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'duree', e.target.value)}
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

export default PanTravauxForm;