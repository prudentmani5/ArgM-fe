'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import FluxTresorerieForm from './FluxTresorerieForm';
import { API_BASE_URL } from '@/utils/apiConfig';
import Cookies from 'js-cookie';
import { CptExercice } from '../exercice/CptExercice';

const FluxTresoreriePage: React.FC = () => {

  const [etatEcritures, setEtatEcritures] = useState<string>('toutes');
  const [typeFlux, setTypeFlux] = useState<string>('direct');
  const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);

  const toast = useRef<Toast>(null);

  const [dateReferenceStr, setDateReferenceStr] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  });

  const { data, fetchData } = useConsumApi('');

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  useEffect(() => {
    const savedExercice = Cookies.get('currentExercice');
    if (savedExercice) {
      try {
        setCurrentExercice(JSON.parse(savedExercice));
      } catch (e) {
        console.error('Error parsing currentExercice:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (data) {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `flux-tresorerie.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('success', 'Succès', 'Le flux de trésorerie a été généré.');
    }
  }, [data]);

  const parseFrDateToIso = (value: string): string | null => {
    if (!value || value.length !== 10) return null;
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = () => {
    if (!currentExercice) {
      showToast('warn', 'Exercice manquant', 'Veuillez préciser l’exercice');
      return;
    }

    const params: string[] = [];
    const isoDate = parseFrDateToIso(dateReferenceStr);

    if (isoDate) params.push(`date=${encodeURIComponent(isoDate)}`);
    params.push(`etat=${encodeURIComponent(etatEcritures)}`);
    params.push(`type=${encodeURIComponent(typeFlux)}`);
    params.push(`exercice=${encodeURIComponent(currentExercice.exerciceId)}`);

    const url = `${API_BASE_URL}/reports/flux_tresorerie?${params.join('&')}`;
    console.log('➡️ URL finale:', url);

    fetchData(null, 'GET', url, 'flux-tresorerie', false, 'blob');
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <h5>Flux de trésorerie</h5>

      <FluxTresorerieForm
        dateReference={dateReferenceStr}
        setDateReference={setDateReferenceStr}
        etatEcritures={etatEcritures}
        setEtatEcritures={setEtatEcritures}
        typeFlux={typeFlux}
        setTypeFlux={setTypeFlux}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default FluxTresoreriePage;
