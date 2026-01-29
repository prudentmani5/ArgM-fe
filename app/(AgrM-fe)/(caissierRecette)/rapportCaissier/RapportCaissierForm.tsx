'use client';

import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import { RapportCaissier, Caissier } from './RapportCaissier';
import { API_BASE_URL } from '@/utils/apiConfig';

interface RapportCaissierFormProps {
    onSearch: (values: { dateDebut: Date; dateFin: Date; caissierId: number }) => void;
    loading: boolean;
}

const RapportCaissierForm: React.FC<RapportCaissierFormProps> = ({ onSearch, loading }) => {
    const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
    const [caissierId, setCaissierId] = useState<number | null>(null);
    const [caissiers, setCaissiers] = useState<Caissier[]>([]);
    const [loadingCaissiers, setLoadingCaissiers] = useState(false);
    const [dateDebut, setDateDebut] = useState<Date>(new Date());
    const [dateFin, setDateFin] = useState<Date>(new Date());

    useEffect(() => {
        const fetchCaissiers = async () => {
            setLoadingCaissiers(true);
            try {
                const response = await fetch(`${API_BASE_URL}/caissiers/findall`);
                if (!response.ok) throw new Error('Erreur réseau');
                const data = await response.json();
                setCaissiers(data);
            } catch (error) {
                console.error("Erreur de chargement:", error);
            } finally {
                setLoadingCaissiers(false);
            }
        };
        fetchCaissiers();
    }, []);

        const handleSubmit = () => {
            if (!dateDebut || !dateFin || !caissierId) return;
            onSearch({
                dateDebut,
                dateFin,
                caissierId
            });
        };

        return (
            <div className="card p-fluid">
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="dateDebut">Date début</label>
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

                    <div className="field col-12 md:col-4">
                        <label htmlFor="dateFin">Date fin</label>
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

                    <div className="field col-12 md:col-4">
                        <label htmlFor="caissier">Caissier</label>
                        <Dropdown
                            id="caissier"
                            value={caissierId}
                            options={caissiers.map(c => ({
                                label: c.nomPrenom,
                                value: c.caissierId
                            }))}
                            onChange={(e: DropdownChangeEvent) => setCaissierId(e.value)}
                            placeholder={loadingCaissiers ? "Chargement..." : "Sélectionnez un caissier"}
                            className="w-full"
                            disabled={loadingCaissiers}
                        />
                    </div>

                    <div className="field col-12 md:col-4 flex align-items-end">
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

    export default RapportCaissierForm;