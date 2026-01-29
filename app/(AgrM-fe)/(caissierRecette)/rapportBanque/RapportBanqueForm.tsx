'use client';

import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import { Banque } from './RapportBanque';
import { API_BASE_URL } from '@/utils/apiConfig';

interface RapportBanqueFormProps {
    onSearch: (values: { dateDebut: Date; dateFin: Date; banqueId: number }) => void;
    loading: boolean;
}

const RapportBanqueForm: React.FC<RapportBanqueFormProps> = ({ onSearch, loading }) => {
    const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
    const [banqueId, setBanqueId] = useState<number | null>(null);
    const [banques, setBanques] = useState<Banque[]>([]);
    const [loadingBanques, setLoadingBanques] = useState(false);
    const [dateDebut, setDateDebut] = useState<Date>(new Date());
    const [dateFin, setDateFin] = useState<Date>(new Date());


    useEffect(() => {
        const fetchBanques = async () => {
            setLoadingBanques(true);
            try {
                const response = await fetch(`${API_BASE_URL}/banks/findall`);
                if (!response.ok) throw new Error('Erreur réseau');
                const data = await response.json();

                // Transformez les données pour correspondre à votre interface
                const formattedBanques = data.map((bank: any) => ({
                    banqueId: bank.banqueId,
                    libelleBanque: bank.libelleBanque,
                    sigle: bank.sigle,
                    compte: bank.compte
                }));

                setBanques(formattedBanques);
            } catch (error) {
                console.error("Erreur de chargement:", error);
            } finally {
                setLoadingBanques(false);
            }
        };
        fetchBanques();
    }, []);

    const handleSubmit = () => {
        if (!dateDebut || !dateFin || !banqueId) return;
        onSearch({
            dateDebut,
            dateFin,
            banqueId
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
                    <label htmlFor="banque">Banque</label>
                    <Dropdown
                        id="banque"
                        value={banqueId}
                        options={banques.map(b => ({
                            label: `${b.libelleBanque} (${b.sigle})`,  // Affiche le libellé et le sigle
                            value: b.banqueId
                        }))}
                        onChange={(e: DropdownChangeEvent) => setBanqueId(e.value)}
                        placeholder={loadingBanques ? "Chargement..." : "Sélectionnez une banque"}
                        className="w-full"
                        disabled={loadingBanques}
                        optionLabel="label"  // Spécifie que nous utilisons le champ 'label' pour l'affichage
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

export default RapportBanqueForm;