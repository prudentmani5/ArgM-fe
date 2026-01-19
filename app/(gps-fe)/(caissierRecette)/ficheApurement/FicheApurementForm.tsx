'use client';

import { useEffect, useRef, useState } from "react"; // Ajout de useRef dans l'import
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { FicheApurement, FicheApurementDetail, EnterRSP } from "./FicheApurement";
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";

interface FicheApurementFormProps {
    fiche: FicheApurement;
    //details: FicheApurementDetail[];
    rspData: EnterRSP | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    fetchRSPData: (numLT: string) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    details: FicheApurementDetail[];
    setDetails: React.Dispatch<React.SetStateAction<FicheApurementDetail[]>>;
    
}
const FicheApurementForm: React.FC<FicheApurementFormProps> = ({
    fiche,
    details,
    rspData,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    fetchRSPData,
    addDetail,
    removeDetail,
    updateDetail,
    loading = false,
    //details,
    setDetails
}: FicheApurementFormProps) => {
    const [numLTSearch, setNumLTSearch] = useState<string>('');
    const toast = useRef<Toast>(null); // Cette ligne devrait maintenant fonctionner

    const handleRspSearch = () => {
        if (numLTSearch) {
            fetchRSPData(numLTSearch);
        }
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString() : '';
    };

  const verifyQuantities = (rowIndex: number, nbreColisSortis: number | undefined, poidsSortis: number | undefined) => {
    setDetails((prev: any[]) => prev.map((detail: any, index: number) => {
        if (index !== rowIndex) return detail;

        const errors = {
            colisError: '',
            poidsError: ''
        };

        // Validate colis
        if (nbreColisSortis === undefined || nbreColisSortis === null || isNaN(nbreColisSortis)) {
            errors.colisError = 'La quantité de colis est requise';
        } else if (nbreColisSortis < 0) {
            errors.colisError = 'La quantité ne peut pas être négative';
        } else if (fiche.nbreColisTotal && nbreColisSortis > fiche.nbreColisTotal) {
            errors.colisError = 'La quantité ne peut pas dépasser le total';
        }

        // Validate poids
        if (poidsSortis === undefined || poidsSortis === null || isNaN(poidsSortis)) {
            errors.poidsError = 'Le poids est requis';
        } else if (poidsSortis < 0) {
            errors.poidsError = 'Le poids ne peut pas être négatif';
        } else if (fiche.poidsTotal && poidsSortis > fiche.poidsTotal) {
            errors.poidsError = 'Le poids ne peut pas dépasser le total';
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
                    <label htmlFor="numLT">Rechercher RSP/LT</label>
                    <div className="p-inputgroup">
                        <InputText
                            id="numDMC"
                            value={numLTSearch}
                            onChange={(e) => setNumLTSearch(e.target.value)}
                            placeholder="Entrez le numéro RSP/LT"
                            disabled={loading}
                        />
                        <Button
                            icon="pi pi-search"
                            onClick={handleRspSearch}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="numLT">Numéro LT</label>
                    <InputText
                        id="numLT"
                        name="numLT"
                        value={fiche.numLT}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="numDMC">Numéro DMC</label>
                    <InputText
                        id="numDMC"
                        name="numDMC"
                        value={fiche.numDMC}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nomClient">Client</label>
                    <InputText
                        id="nomClient"
                        name="nomClient"
                        value={fiche.nomClient}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="natureCoils">Nature du colis</label>
                    <InputText
                        id="natureCoils"
                        name="natureCoils"
                        value={fiche.natureCoils}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                 <div className="field col-12 md:col-4">
                    <label htmlFor="natureCoils">Nature du colis</label>
                    <InputText
                        id="natureCoils"
                        name="natureCoils"
                        value={fiche.natureCoils}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nomMarchandise">Marchandise</label>
                    <InputText
                        id="nomMarchandise"
                        name="nomMarchandise"
                        value={fiche.nomMarchandise}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="nbreColisTotal">Nombre total de colis</label>
                    <InputNumber
                        id="nbreColisTotal"
                        value={fiche.nbreColisTotal}
                        onValueChange={(e) => handleNumberChange(e, 'nbreColisTotal')}
                        mode="decimal"
                        min={0}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="poidsTotal">Poids total (kg)</label>
                    <InputNumber
                        id="poidsTotal"
                        value={fiche.poidsTotal}
                        onValueChange={(e) => handleNumberChange(e, 'poidsTotal')}
                        mode="decimal"
                        min={0}
                        suffix=" kg"
                        readOnly
                    />
                </div>

               <div className="col-12">
    <h4>Détails des sorties</h4>
    <Button 
        icon="pi pi-plus" 
        label="Ajouter un détail" 
        onClick={addDetail}
        className="mb-3"
    />
    
    <DataTable value={details} responsiveLayout="scroll">
        <Column field="plaque" header="Plaque" 
            body={(rowData, { rowIndex }) => (
                <InputText
                    value={rowData.plaque || ''}
                    onChange={(e) => updateDetail(rowIndex, 'plaque', e.target.value)}
                />
            )}
        />
        <Column field="dateCaisse" header="Date" 
            body={(rowData, { rowIndex }) => (
                <Calendar
                    value={rowData.dateCaisse}
                    onChange={(e) => updateDetail(rowIndex, 'dateCaisse', e.value)}
                    showTime
                    hourFormat="24"
                    dateFormat="dd/mm/yy"
                />
            )}
        />
        <Column field="nbreColisSortis" header="Colis sortis" 
            body={(rowData, { rowIndex }) => (
                <div className="p-inputgroup">
                    <InputNumber
                        value={rowData.nbreColisSortis || 0}
                        onValueChange={(e) => {
                            if (e.value !== null && e.value !== undefined) {
                                updateDetail(rowIndex, 'nbreColisSortis', e.value);
                                verifyQuantities(rowIndex, e.value, rowData.poidsSortis);
                            }
                        }}
                        mode="decimal"
                        min={0}
                    />
                    {rowData.colisError && (
                        <span className="p-inputgroup-addon p-error">
                            <i className="pi pi-exclamation-triangle" title={rowData.colisError}/>
                        </span>
                    )}
                </div>
            )}
        />
        <Column field="poidsSortis" header="Poids sortis (kg)" 
            body={(rowData, { rowIndex }) => (
                <div className="p-inputgroup">
                    <InputNumber
                        value={rowData.poidsSortis || 0}
                        onValueChange={(e) => {
                            if (e.value !== null && e.value !== undefined) {
                                updateDetail(rowIndex, 'poidsSortis', e.value);
                                verifyQuantities(rowIndex, rowData.nbreColisSortis, e.value);
                            }
                        }}
                        mode="decimal"
                        min={0}
                        minFractionDigits={2} // Toujours afficher 2 décimales
                        suffix=" kg"
                    />
                    {rowData.poidsError && (
                        <span className="p-inputgroup-addon p-error">
                            <i className="pi pi-exclamation-triangle" title={rowData.poidsError}/>
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

export default FicheApurementForm;