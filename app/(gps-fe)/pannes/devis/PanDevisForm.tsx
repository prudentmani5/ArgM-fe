'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { PanDevis, PanDevisDetails, StkArticle } from "./PanDevis";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";
import { API_BASE_URL } from '@/utils/apiConfig';

interface PanDevisFormProps {
    devis: PanDevis;
    details: PanDevisDetails[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<PanDevisDetails[]>>;
    articles: StkArticle[];
    checkDevisId: (devisId: string) => Promise<boolean>;
}

const PanDevisForm: React.FC<PanDevisFormProps> = ({
    devis,
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
    checkDevisId
}) => {
    const toast = useRef<Toast>(null);
    const [devisIdExists, setDevisIdExists] = useState(false);

    const handleDevisIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const devisId = e.target.value;
        if (devisId) {
            const exists = await checkDevisId(devisId);
            setDevisIdExists(exists);
            if (exists) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/panDevis/findbyid?devisId=${devisId}`);
                    const existingDevis = response.data;
                    // Mettre à jour les champs avec les données existantes
                    Object.keys(existingDevis).forEach(key => {
                        if (key in devis) {
                            //devis[key as keyof PanDevis] = existingDevis[key];
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
                    <label htmlFor="devisId">ID Devis</label>
                    <InputText
                        id="devisId"
                        name="devisId"
                        value={devis.devisId}
                        onChange={handleChange}
                        onBlur={handleDevisIdBlur}
                        className={devisIdExists ? 'p-invalid' : ''}
                    />
                    {devisIdExists && <small className="p-error">Ce devis existe déjà</small>}
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="date">Date</label>
                    <Calendar
                        id="date"
                        value={devis.date}
                        onChange={(e) => handleDateChange(e.value as Date, 'date')}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="description">Description</label>
                    <InputText
                        id="description"
                        name="description"
                        value={devis.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="devisFraisTransport">Frais de Transport et Main d'oeuvre</label>
                    <InputNumber
                        id="devisFraisTransport"
                        value={devis.devisFraisTransport}
                        onValueChange={(e) => handleNumberChange(e, 'devisFraisTransport')}
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
                        value={devis.tauxTVA}
                        onValueChange={(e) => handleNumberChange(e, 'tauxTVA')}
                        min={0}
                        max={100}
                        suffix="%"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="montantTTVA">Montant TVA</label>
                    <InputNumber
                        id="montantTTVA"
                        value={devis.montantTTVA}
                        onValueChange={(e) => handleNumberChange(e, 'montantTTVA')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                        disabled
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="montantTotal">Montant Total</label>
                    <InputNumber
                        id="montantTotal"
                        value={devis.montantTotal}
                        onValueChange={(e) => handleNumberChange(e, 'montantTotal')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                        disabled
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="montantNet">Montant Net (TTC)</label>
                    <InputNumber
                        id="montantNet"
                        value={devis.montantNet}
                        onValueChange={(e) => handleNumberChange(e, 'montantNet')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        min={0}
                        disabled
                    />
                </div>

                <div className="col-12">
                    <h4>Détails du devis</h4>
                    <Button
                        icon="pi pi-plus"
                        label="Ajouter un article"
                        onClick={addDetail}
                        className="mb-3"
                    />

                    <DataTable value={details} responsiveLayout="scroll">
                        <Column field="ordre" header="Ordre"
                            body={(rowData, { rowIndex }) => (
                                <InputNumber
                                    value={rowData.ordre || 0}
                                    onValueChange={(e) => updateDetail(rowIndex, 'ordre', e.value)}
                                    min={1}
                                    showButtons
                                />
                            )}
                        />
                        <Column field="articleId" header="Article"
                            body={(rowData, { rowIndex }) => (
                                <Dropdown
                                    value={rowData.articleId}
                                    options={articles}
                                    optionLabel="libelle"
                                    optionValue="articleId"
                                    onChange={(e) => {
                                        updateDetail(rowIndex, 'articleId', e.value);
                                        const selectedArticle = articles.find(a => a.articleId === e.value);
                                        if (selectedArticle) {
                                            updateDetail(rowIndex, 'pu', selectedArticle.prixVente);
                                            updateDetail(rowIndex, 'pt', calculatePt(rowData.qte, selectedArticle.prixVente));
                                        }
                                    }}
                                    placeholder="Sélectionnez un article"
                                    filter
                                />
                            )}
                        />
                        <Column field="position" header="Position"
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.position || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'position', e.target.value)}
                                />
                            )}
                        />
                        <Column field="figure" header="Figure"
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.figure || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'figure', e.target.value)}
                                />
                            )}
                        />
                        <Column field="numPiece" header="Numéro Pièce"
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.numPiece || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'numPiece', e.target.value)}
                                />
                            )}
                        />
                        <Column field="qte" header="Quantité"
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.qte || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'qte', e.value);
                                                updateDetail(rowIndex, 'pt', calculatePt(e.value, rowData.pu));
                                                verifyQuantities(rowIndex, e.value, rowData.pu);
                                            }
                                        }}
                                        mode="decimal"
                                        min={0}
                                    />
                                </div>
                            )}
                        />
                        <Column field="pu" header="Prix Unitaire"
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.pu || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'pu', e.value);
                                                updateDetail(rowIndex, 'pt', calculatePt(rowData.qte, e.value));
                                                verifyQuantities(rowIndex, rowData.qte, e.value);
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
                        {/* <Column field="fraisTransport" header="Frais Transport" 
                            body={(rowData, { rowIndex }) => (
                                <InputNumber
                                    value={rowData.fraisTransport || 0}
                                    onValueChange={(e) => updateDetail(rowIndex, 'fraisTransport', e.value)}
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                    min={0}
                                />
                            )}
                        />  */}
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

export default PanDevisForm;