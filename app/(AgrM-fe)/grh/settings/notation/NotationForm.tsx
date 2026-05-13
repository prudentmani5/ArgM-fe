'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Notation, NotationEnum, StatutEnum } from "./Notation";

interface NotationProps {
    notation: Notation;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDropdownChange: (name: string, value: any) => void;
}

const NotationForm: React.FC<NotationProps> = ({notation, handleChange, handleNumberChange, handleDropdownChange}) => {

    const statutOptions = [
        { label: 'SC', value: StatutEnum.SC },
        { label: 'SS', value: StatutEnum.SS }
    ];

    const notationOptions = [
        { label: 'ELITE', value: NotationEnum.ELITE },
        { label: 'TB', value: NotationEnum.TB },
        { label: 'B', value: NotationEnum.B },
        { label: 'AB', value: NotationEnum.AB },
        { label: 'INS', value: NotationEnum.INS },
        { label: 'MED', value: NotationEnum.MED }
    ];

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-3">
                <label htmlFor="notationId">Code</label>
                <InputText 
                    id="notationId" 
                    type="text" 
                    name="notationId" 
                    value={notation.notationId} 
                    onChange={handleChange} 
                    maxLength={7}
                />
            </div>
            <div className="field col-3">
                <label htmlFor="statut">Statut</label>
                <Dropdown
                    id="statut"
                    name="statut"
                    value={notation.statut}
                    options={statutOptions}
                    onChange={(e) => handleDropdownChange('statut', e.value)}
                    placeholder="Sélectionner un statut"
                />
            </div>
            <div className="field col-3">
                <label htmlFor="notations">Notation</label>
                <Dropdown
                    id="notations"
                    name="notations"
                    value={notation.notations}
                    options={notationOptions}
                    onChange={(e) => handleDropdownChange('notations', e.value)}
                    placeholder="Sélectionner une notation"
                />
            </div>
            <div className="field col-3">
                <label htmlFor="nbreEchelonGagne">Nombre Échelon Gagné</label>
                <InputNumber
                    id="nbreEchelonGagne"
                    value={notation.nbreEchelonGagne}
                    onValueChange={(e) => handleNumberChange('nbreEchelonGagne', e.value)}
                    showButtons
                    min={0}
                />
            </div>
            <div className="field col-3">
                <label htmlFor="anale">Anale</label>
                <InputNumber
                    id="anale"
                    value={notation.anale}
                    onValueChange={(e) => handleNumberChange('anale', e.value)}
                    showButtons
                    min={0}
                    max={99}
                    maxFractionDigits={0}
                />
            </div>
            <div className="field col-3">
                <label htmlFor="limite1">Note Entre</label>
                <InputNumber
                    id="limite1"
                    value={notation.limite1}
                    onValueChange={(e) => handleNumberChange('limite1', e.value)}
                    showButtons
                    min={0}
                    maxFractionDigits={2}
                    minFractionDigits={2}
                />
            </div>
            <div className="field col-3">
                <label htmlFor="limite2">Et</label>
                <InputNumber
                    id="limite2"
                    value={notation.limite2}
                    onValueChange={(e) => handleNumberChange('limite2', e.value)}
                    showButtons
                    min={0}
                    maxFractionDigits={2}
                    minFractionDigits={2}
                />
            </div>
        </div>
    </div>
);
}

export default NotationForm;