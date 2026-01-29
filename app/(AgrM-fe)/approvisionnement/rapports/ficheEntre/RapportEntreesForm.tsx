// RapportEntreesForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/apiConfig';

interface RapportEntreesFormProps {
  onSearch: (params: {
    dateDebut: Date;
    dateFin: Date;
    numeroPiece?: string;
    magasinId?: string;
    fournisseurId?: string;
  }) => void;
  loading: boolean;
}

const BASE_URL = `${API_BASE_URL}`;

interface Magasin {
  magasinId: string;
  nom: string;
}

interface Fournisseur {
  fournisseurId: string;
  nom: string;
}

const RapportEntreesForm: React.FC<RapportEntreesFormProps> = ({ onSearch, loading }) => {
  const [dateDebut, setDateDebut] = useState<Date>(new Date());
  const [dateFin, setDateFin] = useState<Date>(new Date());
  const [numeroPiece, setNumeroPiece] = useState<string>('');
  const [selectedMagasin, setSelectedMagasin] = useState<string | null>(null);
  const [selectedFournisseur, setSelectedFournisseur] = useState<string | null>(null);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loadingMagasins, setLoadingMagasins] = useState(false);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    setLoadingMagasins(true);
    setLoadingFournisseurs(true);
    
    try {
      const [magasinsRes, fournisseursRes] = await Promise.all([
        axios.get<Magasin[]>(`${BASE_URL}/magasins/findall`),
        axios.get<Fournisseur[]>(`${BASE_URL}/fournisseurs/findall`)
      ]);

      setMagasins(magasinsRes.data);
      setFournisseurs(fournisseursRes.data);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoadingMagasins(false);
      setLoadingFournisseurs(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      dateDebut,
      dateFin,
      numeroPiece: numeroPiece || undefined,
      magasinId: selectedMagasin || undefined,
      fournisseurId: selectedFournisseur || undefined
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
          <label htmlFor="fournisseur">Fournisseur (optionnel)</label>
          <Dropdown
            id="fournisseur"
            value={selectedFournisseur}
            options={fournisseurs}
            optionLabel="nom"
            optionValue="fournisseurId"
            onChange={(e: DropdownChangeEvent) => setSelectedFournisseur(e.value)}
            placeholder={loadingFournisseurs ? "Chargement..." : "Sélectionner un fournisseur"}
            filter
            showClear
            className="w-full"
            disabled={loadingFournisseurs}
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

export default RapportEntreesForm;