// FicheStockForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/apiConfig';

interface FicheStockFormProps {
  onSearch: (params: {
    dateDebut: Date;
    dateFin: Date;
    articleId: string;
    magasinId?: string;
  }) => void;
  loading: boolean;
}

const BASE_URL = `${API_BASE_URL}`;

interface Article {
  articleId: string;
  libelle: string;
  codeArticle: string;
}

interface Magasin {
  magasinId: string;
  nom: string;
}

const FicheStockForm: React.FC<FicheStockFormProps> = ({ onSearch, loading }) => {
  const [dateDebut, setDateDebut] = useState<Date>(new Date());
  const [dateFin, setDateFin] = useState<Date>(new Date());
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedMagasin, setSelectedMagasin] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingMagasins, setLoadingMagasins] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

// Dans FicheStockForm.tsx - amélioration de loadDropdownData
const loadDropdownData = async () => {
  setLoadingArticles(true);
  setLoadingMagasins(true);
  
  try {
    const [articlesRes, magasinsRes] = await Promise.all([
      axios.get<Article[]>(`${BASE_URL}/articles/findall`),
      axios.get<Magasin[]>(`${BASE_URL}/magasins/findall`)
    ]);

    setArticles(articlesRes.data);
    setMagasins(magasinsRes.data);
    
  } catch (error: any) {
    console.error("Erreur chargement données:", error);
    let errorMessage = "Erreur lors du chargement des données";
    
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      errorMessage = "Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur le port 8080.";
    }
    
    alert(errorMessage);
  } finally {
    setLoadingArticles(false);
    setLoadingMagasins(false);
  }
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) {
      alert("Veuillez sélectionner un article");
      return;
    }
    
    onSearch({
      dateDebut,
      dateFin,
      articleId: selectedArticle,
      magasinId: selectedMagasin || undefined
    });
  };

  return (
    <Card title="Paramètres de la fiche de stock">
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
          <label htmlFor="article">Article *</label>
          <Dropdown
            id="article"
            value={selectedArticle}
            options={articles}
            optionLabel="libelle"
            optionValue="articleId"
            onChange={(e: DropdownChangeEvent) => setSelectedArticle(e.value)}
            placeholder={loadingArticles ? "Chargement..." : "Sélectionner un article"}
            filter
            showClear
            className="w-full"
            disabled={loadingArticles}
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

        <div className="field col-12 flex align-items-end">
          <Button
            type="submit"
            label="Générer Fiche de Stock"
            icon="pi pi-file-pdf"
            loading={loading}
            className="w-full md:w-auto"
          />
        </div>
      </form>
    </Card>
  );
};

export default FicheStockForm;