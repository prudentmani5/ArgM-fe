'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { TrancheImpotAnnuelParametre } from "./TrancheImpotAnnuelParametre";
import { TrancheImpotAnnuelParametreDetail } from "./TrancheImpotAnnuelParametreDetail";

interface TrancheImpotAnnuelParametreProps {
    trancheImpotAnnuelParametre: TrancheImpotAnnuelParametre;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (field: string, value: number | null) => void;
    onAddDetail: () => void;
    onRemoveDetail: (index: number) => void;
    onDetailChange: (index: number, field: string, value: number | null) => void;
    isEditMode?: boolean;
}

const TrancheImpotAnnuelParametreForm: React.FC<TrancheImpotAnnuelParametreProps> = ({
    trancheImpotAnnuelParametre, 
    handleChange, 
    handleNumberChange,
    onAddDetail,
    onRemoveDetail,
    onDetailChange,
    isEditMode = false
}) => {

    const actionBodyTemplate = (rowData: TrancheImpotAnnuelParametreDetail, options: any) => {
        return (
            <Button 
                icon="pi pi-trash" 
                className="p-button-rounded p-button-danger p-button-text" 
                onClick={() => onRemoveDetail(options.rowIndex)}
                tooltip="Supprimer"
            />
        );
    };

    const tranche1BodyTemplate = (rowData: TrancheImpotAnnuelParametreDetail, options: any) => {
        return (
            <InputNumber 
                value={rowData.tranche1} 
                onValueChange={(e) => onDetailChange(options.rowIndex, 'tranche1', e.value)}
                mode="decimal" 
                minFractionDigits={2} 
                maxFractionDigits={2}
                className="w-full"
            />
        );
    };

    const tranche2BodyTemplate = (rowData: TrancheImpotAnnuelParametreDetail, options: any) => {
        return (
            <InputNumber 
                value={rowData.tranche2} 
                onValueChange={(e) => onDetailChange(options.rowIndex, 'tranche2', e.value)}
                mode="decimal" 
                minFractionDigits={2} 
                maxFractionDigits={2}
                className="w-full"
            />
        );
    };

    const tauxBodyTemplate = (rowData: TrancheImpotAnnuelParametreDetail, options: any) => {
        return (
            <InputNumber 
                value={rowData.taux} 
                onValueChange={(e) => onDetailChange(options.rowIndex, 'taux', e.value)}
                mode="decimal" 
                minFractionDigits={2} 
                maxFractionDigits={2}
                suffix=" %"
                className="w-full"
            />
        );
    };

    const correctifBodyTemplate = (rowData: TrancheImpotAnnuelParametreDetail, options: any) => {
        return (
            <InputNumber 
                value={rowData.correctif} 
                onValueChange={(e) => onDetailChange(options.rowIndex, 'correctif', e.value)}
                mode="decimal" 
                minFractionDigits={2} 
                maxFractionDigits={2}
                className="w-full"
            />
        );
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="trancheId">Code</label>
                    <InputText 
                        id="trancheId" 
                        name="trancheId" 
                        value={trancheImpotAnnuelParametre.trancheId.toString()} 
                        disabled
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="dateEnVigueur">Date d'entrée en vigueur *</label>
                    <InputText 
                        id="dateEnVigueur" 
                        name="dateEnVigueur" 
                        value={trancheImpotAnnuelParametre.dateEnVigueur} 
                        onChange={handleChange}
                        placeholder="YYYY/MM/DD"
                        required
                    />
                </div>
            </div>

            <div className="card mt-4">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h5>Détails des Tranches Annuelles</h5>
                    <Button 
                        icon="pi pi-plus" 
                        label="Ajouter Tranche" 
                        onClick={onAddDetail}
                        className="p-button-success"
                    />
                </div>
                
                <DataTable 
                    value={trancheImpotAnnuelParametre.details} 
                    emptyMessage="Aucun détail de tranche annuelle"
                    editMode="cell"
                >
                    <Column field="numero" header="Numéro" style={{ width: '10%' }} />
                    <Column 
                        field="tranche1" 
                        header="Minimum (Tranche1)" 
                        body={tranche1BodyTemplate}
                        style={{ width: '20%' }} 
                    />
                    <Column 
                        field="tranche2" 
                        header="Maximum (Tranche2)" 
                        body={tranche2BodyTemplate}
                        style={{ width: '20%' }} 
                    />
                    <Column 
                        field="taux" 
                        header="Taux (%)" 
                        body={tauxBodyTemplate}
                        style={{ width: '15%' }} 
                    />
                    <Column 
                        field="correctif" 
                        header="Correctif" 
                        body={correctifBodyTemplate}
                        style={{ width: '20%' }} 
                    />
                    <Column 
                        header="Actions" 
                        body={actionBodyTemplate}
                        style={{ width: '10%' }} 
                    />
                </DataTable>
            </div>
        </div>
    );
}

export default TrancheImpotAnnuelParametreForm;