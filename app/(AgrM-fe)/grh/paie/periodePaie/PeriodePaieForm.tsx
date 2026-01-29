'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { PeriodePaie } from "./PeriodePaie";

interface PeriodePaieProps {
    periodePaie: PeriodePaie;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleDateChange: (e: CalendarChangeEvent) => void;
    dateDebut: Date | null;
    dateFin: Date | null;
}

const PeriodePaieForm: React.FC<PeriodePaieProps> = ({
    periodePaie,
    handleChange,
    handleDropDownSelect,
    handleDateChange,
    dateDebut,
    dateFin
}) => {

    const monthOptions = [
        { label: "Janvier", value: 1 },
        { label: "Février", value: 2 },
        { label: "Mars", value: 3 },
        { label: "Avril", value: 4 },
        { label: "Mai", value: 5 },
        { label: "Juin", value: 6 },
        { label: "Juillet", value: 7 },
        { label: "Août", value: 8 },
        { label: "Septembre", value: 9 },
        { label: "Octobre", value: 10 },
        { label: "Novembre", value: 11 },
        { label: "Décembre", value: 12 }
    ];

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="mois">Mois *</label>
                    <Dropdown 
                        id="mois"
                        name="mois"
                        value={periodePaie.mois} 
                        options={monthOptions} 
                        optionLabel="label" 
                        optionValue="value" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner le mois"
                        required
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="annee">Année *</label>
                    <InputText
                        id="annee"
                        type="number"
                        name="annee"
                        value={periodePaie.annee.toString()}
                        onChange={handleChange}
                        required
                        min="2000"
                        max="2100"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dateDebut">Date Début *</label>
                    <Calendar
                        id="dateDebut"
                        name="dateDebut"
                        value={dateDebut}
                        onChange={handleDateChange}
                        dateFormat="dd/mm/yy"
                        showIcon
                        placeholder="Sélectionner la date de début"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dateFin">Date Fin *</label>
                    <Calendar
                        id="dateFin"
                        name="dateFin"
                        value={dateFin}
                        onChange={handleDateChange}
                        dateFormat="dd/mm/yy"
                        showIcon
                        placeholder="Sélectionner la date de fin"
                    />
                </div>
            </div>
        </div>
    );
}

export default PeriodePaieForm;