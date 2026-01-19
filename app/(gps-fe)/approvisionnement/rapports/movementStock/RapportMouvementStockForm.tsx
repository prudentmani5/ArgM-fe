'use client';

import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/utils/apiConfig';

interface RapportMouvementStockFormProps {
    onSearch: (values: { 
        dateDebut: Date; 
        dateFin: Date;
        magasinId?: string;
        sousCategorieId?: string;
    }) => void;
    loading: boolean;
}

interface Magasin {
    magasinId: string;
    nom: string;
}

interface SousCategorie {
    sousCategorieId: string;
    libelle: string;
}

// Add authentication utility function
const getAuthHeaders = (): HeadersInit => {
    const token = Cookies.get('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

const RapportMouvementStockForm: React.FC<RapportMouvementStockFormProps> = ({ 
    onSearch, 
    loading 
}) => {
    const baseUrl = `${API_BASE_URL}`;
    const [dateDebut, setDateDebut] = useState<Date>(new Date());
    const [dateFin, setDateFin] = useState<Date>(new Date());
    const [magasinId, setMagasinId] = useState<string | undefined>();
    const [sousCategorieId, setSousCategorieId] = useState<string | undefined>();
    
    const [magasins, setMagasins] = useState<Magasin[]>([]);
    const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
    const [loadingMagasins, setLoadingMagasins] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    useEffect(() => {
        fetchMagasins();
        fetchSousCategories();
    }, []);

    const fetchMagasins = async () => {
        setLoadingMagasins(true);
        try {
            const response = await fetch(`${baseUrl}/magasins/findall`, {
                headers: getAuthHeaders() // ADD THIS LINE
            });
            if (response.ok) {
                const data = await response.json();
                setMagasins(data);
            } else if (response.status === 401) {
                console.error('Non autorisé pour récupérer les magasins');
            }
        } catch (error) {
            console.error('Erreur chargement magasins:', error);
        } finally {
            setLoadingMagasins(false);
        }
    };

    const fetchSousCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await fetch(`${baseUrl}/sousCategories/findall`, {
                headers: getAuthHeaders() // ADD THIS LINE
            });
            if (response.ok) {
                const data = await response.json();
                setSousCategories(data);
            } else if (response.status === 401) {
                console.error('Non autorisé pour récupérer les sous-catégories');
            }
        } catch (error) {
            console.error('Erreur chargement sous-catégories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSubmit = () => {
        if (!dateDebut || !dateFin) return;
        onSearch({
            dateDebut,
            dateFin,
            magasinId,
            sousCategorieId
        });
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
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
                
                <div className="field col-12 md:col-3">
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

                <div className="field col-12 md:col-3">
                    <label htmlFor="magasin">Magasin (optionnel)</label>
                    <Dropdown 
                        id="magasin"
                        value={magasinId}
                        options={magasins}
                        onChange={(e) => setMagasinId(e.value)}
                        optionLabel="nom"
                        optionValue="magasinId"
                        placeholder={loadingMagasins ? "Chargement..." : "Tous les magasins"}
                        showClear
                        className="w-full"
                        disabled={loadingMagasins}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="sousCategorie">Sous-Catégorie (optionnel)</label>
                    <Dropdown 
                        id="sousCategorie"
                        value={sousCategorieId}
                        options={sousCategories}
                        onChange={(e) => setSousCategorieId(e.value)}
                        optionLabel="libelle"
                        optionValue="sousCategorieId"
                        placeholder={loadingCategories ? "Chargement..." : "Toutes les sous-catégories"}
                        showClear
                        className="w-full"
                        disabled={loadingCategories}
                    />
                </div>
                
                <div className="field col-12 flex align-items-end">
                    <Button 
                        label="Générer le rapport" 
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

export default RapportMouvementStockForm;
