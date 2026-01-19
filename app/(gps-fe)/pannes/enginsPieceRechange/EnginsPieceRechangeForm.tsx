'use client';

import { Dropdown } from "primereact/dropdown";
import { EnginsPieceRechange } from "./EnginsPieceRechange";
import { PanEngin } from "./PanEngin";
import { PieceRechange } from "./PieceRechange";

interface EnginsPieceRechangeProps {
    enginsPieceRechange: EnginsPieceRechange;
    handleChange: (e: any) => void;
    engins: PanEngin[];
    piecesRechange: PieceRechange[];
}

const EnginsPieceRechangeForm: React.FC<EnginsPieceRechangeProps> = ({ 
    enginsPieceRechange, 
    handleChange,
    engins,
    piecesRechange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="enginId">Engin</label>
                    <Dropdown
                        id="enginId"
                        name="enginId"
                        value={enginsPieceRechange.enginId}
                        options={engins || []}
                        onChange={handleChange}
                        optionLabel="enginDesignation"
                        optionValue="enginId"
                        placeholder="Sélectionnez un engin"
                        filter
                        filterBy="enginDesignation,modele,marque"
                        showClear
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="pieceRechangeId">Pièce de rechange</label>
                    <Dropdown
                        id="pieceRechangeId"
                        name="pieceRechangeId"
                        value={enginsPieceRechange.pieceRechangeId}
                        options={piecesRechange}
                        onChange={handleChange}
                        optionLabel="designationPieceRechange"
                        optionValue="pieceRechangeId"
                        placeholder="Sélectionnez une pièce"
                        filter
                        filterBy="designationPieceRechange,numeroCatalogue"
                        showClear
                    />
                </div>
            </div>
        </div>
    );
};

export default EnginsPieceRechangeForm;