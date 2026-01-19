import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import axios from 'axios';
import { API_BASE_URL } from '../../../../../utils/apiConfig';

interface RapportConsommationFormProps {
  onSearch: (params: {
    dateDebut: Date;
    dateFin: Date;
    matricule?: string;
    partenaireId?: string;
  }) => void;
  loading: boolean;
}

const BASE_URL = API_BASE_URL;

interface Employe {
  matriculeId: string;
  nom: string;
  prenom: string;
}

interface Partenaire {
  partenaireId: string;
  libelle: string;
}

const RapportConsommationForm: React.FC<RapportConsommationFormProps> = ({ onSearch, loading }) => {
  const [dateDebut, setDateDebut] = useState<Date>(new Date());
  const [dateFin, setDateFin] = useState<Date>(new Date());
  const [selectedMatricule, setSelectedMatricule] = useState<string | null>(null);
  const [selectedPartenaire, setSelectedPartenaire] = useState<string | null>(null);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [loadingEmployes, setLoadingEmployes] = useState(false);
  const [loadingPartenaires, setLoadingPartenaires] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    setLoadingEmployes(true);
    setLoadingPartenaires(true);
    
    try {
      const [employesRes, partenairesRes] = await Promise.all([
        axios.get<Employe[]>(`${BASE_URL}/identifications/findall`),
        axios.get<Partenaire[]>(`${BASE_URL}/partenaires/findall`)
      ]);

      setEmployes(employesRes.data);
      setPartenaires(partenairesRes.data);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoadingEmployes(false);
      setLoadingPartenaires(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      dateDebut,
      dateFin,
      matricule: selectedMatricule || undefined,
      partenaireId: selectedPartenaire || undefined
    });
  };

  const employeOptionTemplate = (option: Employe) => {
    return (
      <div>
        {option.matriculeId} - {option.nom} {option.prenom}
      </div>
    );
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
          <label htmlFor="matricule">Employé (optionnel)</label>
          <Dropdown
            id="matricule"
            value={selectedMatricule}
            options={employes}
            optionLabel="matriculeId"
            optionValue="matriculeId"
            itemTemplate={employeOptionTemplate}
            onChange={(e: DropdownChangeEvent) => setSelectedMatricule(e.value)}
            placeholder={loadingEmployes ? "Chargement..." : "Sélectionner un employé"}
            filter
            showClear
            className="w-full"
            disabled={loadingEmployes}
          />
        </div>

        <div className="field col-12 md:col-3">
          <label htmlFor="partenaire">Partenaire (optionnel)</label>
          <Dropdown
            id="partenaire"
            value={selectedPartenaire}
            options={partenaires}
            optionLabel="libelle"
            optionValue="partenaireId"
            onChange={(e: DropdownChangeEvent) => setSelectedPartenaire(e.value)}
            placeholder={loadingPartenaires ? "Chargement..." : "Sélectionner un partenaire"}
            filter
            showClear
            className="w-full"
            disabled={loadingPartenaires}
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

export default RapportConsommationForm;