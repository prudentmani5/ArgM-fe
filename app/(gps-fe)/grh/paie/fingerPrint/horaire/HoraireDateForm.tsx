'use client';

import { Calendar, CalendarChangeEvent } from "primereact/calendar";
import { HoraireDateRange } from "./HoraireEmploye";

interface HoraireDateFormProps {
    horaireDates: HoraireDateRange;
    handleCalendarChange: (e: CalendarChangeEvent) => void;
}

const HoraireDateForm: React.FC<HoraireDateFormProps> = ({ horaireDates, handleCalendarChange }) => {

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="dateDebutD">Date Début *</label>
                    <Calendar
                        id="dateDebutD"
                        name="dateDebutD"
                        value={horaireDates.dateDebutD}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        placeholder="Sélectionnez la date de début"
                    />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="dateFinD">Date Fin *</label>
                    <Calendar
                        id="dateFinD"
                        name="dateFinD"
                        value={horaireDates.dateFinD}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        placeholder="Sélectionnez la date de fin"
                    />
                </div>
            </div>
        </div>
    );
};

export default HoraireDateForm;