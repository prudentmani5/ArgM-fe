// MouvementStockForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/apiConfig';

interface MouvementStockFormProps {
  onSearch: (params: {
    dateDebut: Date;
    dateFin: Date;
    magasinId?: string;
    categorieId?: string;
  }) => void;
  loading: boolean;
}

const BASE_URL = `${API_BASE_URL}`;

interface Magasin {
  magasinId: string;
  nom: string;
}

interface Categorie {
  categorieId: string;
  libelle: string;
}

const MouvementStockForm: React.FC<MouvementStockFormProps> = ({ onSearch, loading }) => {
  const [dateDebut, setDateDebut] = useState<Date>(new Date());
  const [dateFin, setDateFin] = useState<Date>(new Date());
  const [selectedMagasin, setSelectedMagasin] = useState<string | null>(null);
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(null);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loadingMagasins, setLoadingMagasins] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

const loadDropdownData = async () => {
  setLoadingMagasins(true);
  setLoadingCategories(true);
  
  try {
    const [magasinsRes, categoriesRes] = await Promise.all([
      axios.get<Magasin[]>(`${BASE_URL}/magasins/findall`),
      axios.get<any[]>(`${BASE_URL}/list_category_articles/findall`) // Utilisez any[] temporairement
    ]);

    setMagasins(magasinsRes.data);
    
    // DEBUG: Affichez la structure réelle des données
    console.log("Structure des catégories:", categoriesRes.data);
    
    // Transformez les données selon la structure réelle
    const categoriesData = categoriesRes.data.map(cat => {
      // Ajustez selon la structure réelle de vos données
      return {
        categorieId: cat.categorieId || cat.id || cat.categoryId,
        libelle: cat.libelle || cat.name || cat.label || 'Catégorie sans nom'
      };
    });
    
    console.log("Catégories transformées:", categoriesData);
    setCategories(categoriesData);
    
  } catch (error: any) {
    console.error("Erreur chargement données:", error);
    // ... reste du code d'erreur
  } finally {
    setLoadingMagasins(false);
    setLoadingCategories(false);
  }
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSearch({
      dateDebut,
      dateFin,
      magasinId: selectedMagasin || undefined,
      categorieId: selectedCategorie || undefined
    });
  };

  return (
    <Card title="Paramètres du mouvement de stock">
      <form onSubmit={handleSubmit} className="p-fluid grid">
        <div className="field col-12 md:col-3">
          <label htmlFor="dateDebut">Date Début *</label>
          <Calendar
            id="dateDebut"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.value as Date)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
            maxDate={dateFin}
            required
          />
        </div>

        <div className="field col-12 md:col-3">
          <label htmlFor="dateFin">Date Fin *</label>
          <Calendar
            id="dateFin"
            value={dateFin}
            onChange={(e) => setDateFin(e.value as Date)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
            minDate={dateDebut}
            required
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
          <label htmlFor="categorie">Catégorie (optionnel)</label>
          <Dropdown
            id="categorie"
            value={selectedCategorie}
            options={categories}
            optionLabel="libelle"
            optionValue="categorieId"
            onChange={(e: DropdownChangeEvent) => setSelectedCategorie(e.value)}
            placeholder={loadingCategories ? "Chargement..." : "Sélectionner une catégorie"}
            filter
            showClear
            className="w-full"
            disabled={loadingCategories}
          />
        </div>

        <div className="field col-12 flex align-items-end">
          <Button
            type="submit"
            label="Générer Rapport"
            icon="pi pi-file-excel"
            loading={loading}
            className="w-full md:w-auto"
          />
        </div>
      </form>
    </Card>
  );
};

export default MouvementStockForm;