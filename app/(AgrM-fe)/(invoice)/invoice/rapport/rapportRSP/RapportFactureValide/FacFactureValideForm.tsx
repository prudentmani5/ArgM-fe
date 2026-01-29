'use client';

import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useState } from 'react';

interface FacFactureValideFormProps {
    onSearch: (values: { dateDebut: Date; dateFin: Date }) => void;
    loading: boolean;
}

const FacFactureValideForm: React.FC<FacFactureValideFormProps> = ({ onSearch, loading }) => {
    const [dateDebut, setDateDebut] = useState<Date>(new Date());
    const [dateFin, setDateFin] = useState<Date>(new Date());

    const handleSubmit = () => {
        if (!dateDebut || !dateFin) return;
        onSearch({
            dateDebut,
            dateFin
        });
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-5">
                    <label htmlFor="dateDebut">Date validation début</label>
                    <Calendar
                        id="dateDebut"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        maxDate={dateFin}
                    />
                </div>

                <div className="field col-12 md:col-5">
                    <label htmlFor="dateFin">Date validation fin</label>
                    <Calendar
                        id="dateFin"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        minDate={dateDebut}
                    />
                </div>

                <div className="field col-12 md:col-2 flex align-items-end">
                    <Button
                        label="Rechercher"
                        icon="pi pi-search"
                        onClick={handleSubmit}
                        loading={loading}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default FacFactureValideForm;
