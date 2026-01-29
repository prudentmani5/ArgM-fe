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
    destinationId?: string;
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

interface Destination {
  destinationId: string;
  libelle: string;
}

const RapportSortiesForm: React.FC<RapportSortiesFormProps> = ({ onSearch, loading }) => {
  const [dateDebut, setDateDebut] = useState<Date>(new Date());
  const [dateFin, setDateFin] = useState<Date>(new Date());
  const [numeroPiece, setNumeroPiece] = useState<string>('');
  const [selectedMagasin, setSelectedMagasin] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingMagasins, setLoadingMagasins] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    setLoadingMagasins(true);
    setLoadingServices(true);
    setLoadingDestinations(true);
    
    try {
      const [magasinsRes, servicesRes, destinationsRes] = await Promise.all([

        
        axios.get<Magasin[]>(`${BASE_URL}/magasins/findall`),
        axios.get<Service[]>(`${BASE_URL}/services/findall`),
        axios.get(`${BASE_URL}/destinations/findall`)
      ]);

      // Debug: afficher la structure des données
      console.log('Magasins API response:', magasinsRes.data);
      console.log('Services API response:', servicesRes.data);
      console.log('Destinations API response:', destinationsRes.data);

      // Adapter selon la structure réelle de l'API
      setMagasins(magasinsRes.data || []);
      setServices(servicesRes.data || []);
      setDestinations(destinationsRes.data || []);

    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoadingMagasins(false);
      setLoadingServices(false);
      setLoadingDestinations(false);
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
      destinationId: selectedDestination || undefined
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
            placeholder={loadingMagasins ? "Chargement..." : magasins.length > 0 ? "Sélectionner un magasin" : "Aucun magasin"}
            filter
            showClear
            className="w-full"
            disabled={loadingMagasins}
          />
          {magasins.length === 0 && !loadingMagasins && (
            <small className="text-red-500">Aucun magasin disponible</small>
          )}
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
            placeholder={loadingServices ? "Chargement..." : services.length > 0 ? "Sélectionner un service" : "Aucun service"}
            filter
            showClear
            className="w-full"
            disabled={loadingServices}
          />
          {services.length === 0 && !loadingServices && (
            <small className="text-red-500">Aucun service disponible</small>
          )}
        </div>

        <div className="field col-12 md:col-3">
          <label htmlFor="destination">Destinateur (optionnel)</label>
          <Dropdown
            id="destination"
            value={selectedDestination}
            options={destinations}
            optionLabel="libelle"
            optionValue="destinationId"
            onChange={(e: DropdownChangeEvent) => setSelectedDestination(e.value)}
            placeholder={loadingDestinations ? "Chargement..." : destinations.length > 0 ? "Sélectionner un destinateur" : "Aucun destinateur"}
            filter
            showClear
            className="w-full"
            disabled={loadingDestinations}
          />
          {destinations.length === 0 && !loadingDestinations && (
            <small className="text-red-500">Aucun destinateur disponible</small>
          )}
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