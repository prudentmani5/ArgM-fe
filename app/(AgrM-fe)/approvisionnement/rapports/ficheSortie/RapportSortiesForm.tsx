// RapportSortiesForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/apiConfig';

interface RapportSortiesFormProps {
  onSearch: (params: {
    dateDebut: Date;
    dateFin: Date;
    numeroPiece?: string;
    magasinId?: string;
    serviceId?: string;
    destinationId?: string; // Ajouté pour correspondre
  }) => void;
  loading: boolean;
}

const BASE_URL = `${API_BASE_URL}`;

interface Magasin {
  magasinId: string;
  nom: string;
}

interface Service {
  serviceId: string;
  libelle: string;
}

const RapportSortiesForm: React.FC<RapportSortiesFormProps> = ({ onSearch, loading }) => {
  const [dateDebut, setDateDebut] = useState<Date>(new Date());
  const [dateFin, setDateFin] = useState<Date>(new Date());
  const [numeroPiece, setNumeroPiece] = useState<string>('');
  const [selectedMagasin, setSelectedMagasin] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingMagasins, setLoadingMagasins] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    setLoadingMagasins(true);
    setLoadingServices(true);
    
    try {
      const [magasinsRes, servicesRes] = await Promise.all([
        axios.get<Magasin[]>(`${BASE_URL}/magasins/findall`),
        axios.get<Service[]>(`${BASE_URL}/services/findall`)
      ]);

      setMagasins(magasinsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoadingMagasins(false);
      setLoadingServices(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      dateDebut,
      dateFin,
      numeroPiece: numeroPiece || undefined,
      magasinId: selectedMagasin || undefined,
      serviceId: selectedService || undefined,
      destinationId: undefined // Optionnel, peut être ajouté plus tard si besoin
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-fluid grid">
        <div className="field col-12 md:col-3">
          <label htmlFor="dateDebut">Date Début</label>
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
          <label htmlFor="dateFin">Date Fin</label>
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
          <label htmlFor="numeroPiece">Numéro Pièce (optionnel)</label>
          <input
            id="numeroPiece"
            type="text"
            value={numeroPiece}
            onChange={(e) => setNumeroPiece(e.target.value)}
            placeholder="Saisir le numéro de pièce"
            className="p-inputtext p-component w-full"
          />
        </div>

        <div className="field col-12 md:col-3">
          <label htmlFor="magasin">Magasin (optionnel)</label>
          <Dropdown
            id="magasin"
            value={selectedMagasin}
            options={magasins}
            optionLabel="nom"
            optionValue="magasinId"
            onChange={(e: DropdownChangeEvent) => setSelectedMagasin(e.value)}
            placeholder={loadingMagasins ? "Chargement..." : "Sélectionner un magasin"}
            filter
            showClear
            className="w-full"
            disabled={loadingMagasins}
          />
        </div>

        <div className="field col-12 md:col-3">
          <label htmlFor="service">Service (optionnel)</label>
          <Dropdown
            id="service"
            value={selectedService}
            options={services}
            optionLabel="libelle"
            optionValue="serviceId"
            onChange={(e: DropdownChangeEvent) => setSelectedService(e.value)}
            placeholder={loadingServices ? "Chargement..." : "Sélectionner un service"}
            filter
            showClear
            className="w-full"
            disabled={loadingServices}
          />
        </div>

        <div className="field col-12 flex align-items-end">
          <Button
            type="submit"
            label="Générer Rapport"
            icon="pi pi-search"
            loading={loading}
            className="w-full md:w-auto"
          />
        </div>
      </form>
    </Card>
  );
};

export default RapportSortiesForm;