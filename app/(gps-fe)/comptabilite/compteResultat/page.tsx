'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import CompteResultatForm from './CompteResultatForm';
import { API_BASE_URL } from '@/utils/apiConfig';
import Cookies from 'js-cookie';
import { CptExercice } from '../exercice/CptExercice';

const CompteResultatPage: React.FC = () => {
  
  const [etatEcritures, setEtatEcritures] = useState<string>('toutes');
  const [typeCompteResultat, setTypeCompteResultat] = useState<string>('exploitation');
  const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
  const toast = useRef<Toast>(null);

  const [dateReferenceStr, setDateReferenceStr] = useState<string>(() => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
});

  const { data, fetchData } = useConsumApi('');

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  useEffect(()=>{
    const savedExercice = Cookies.get('currentExercice');
      if (savedExercice) {
        try {
          setCurrentExercice(JSON.parse(savedExercice));
        } catch (e) {
          console.error('Error parsing currentExercice:', e);
        }
      }

  },[]);
  useEffect(() => {
    if (data) {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compte-resultat.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('success', 'Succès', 'Le compte de résultat a été généré.');
    }
  }, [data]);

  const parseFrDateToIso = (value: string): string | null => {
    if (!value || value.length !== 10) return null;
    const [day, month, year] = value.split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    try {
      const baseUrl = `${API_BASE_URL}/reports/compte_resultat`;
      const params: string[] = [];

      
      if (!currentExercice) {
        showToast('warn', 'Exercice manquant', `Veuillez préciser l'exercice`);
        return;
      }

      const isoDate = parseFrDateToIso(dateReferenceStr);
      if (isoDate) params.push('date=' + encodeURIComponent(isoDate));
      if (etatEcritures) params.push('Etat=' + encodeURIComponent(etatEcritures));
      if (typeCompteResultat) params.push('type=' + encodeURIComponent(typeCompteResultat));
      if (currentExercice && currentExercice.exerciceId) {
        params.push(`exercice=${encodeURIComponent(currentExercice.exerciceId)}`);
        console.log('✅ Added exerciceId:', currentExercice.exerciceId);
      } else {
        console.warn('⚠️ No currentExercice or exerciceId available');
      }
      const url = baseUrl + (params.length > 0 ? '?' + params.join('&') : '');

      console.log('➡️ URL finale:', url);
      fetchData(null, 'Get', url, 'compte-resultat', false, 'blob');
    } catch (error) {
      showToast('error', 'Erreur', 'Erreur lors de la génération du compte de résultat.');
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <h5>Compte de résultat</h5>
      <CompteResultatForm
        dateReference={dateReferenceStr}
        setDateReference={setDateReferenceStr}
        etatEcritures={etatEcritures}
        setEtatEcritures={setEtatEcritures}
        typeCompteResultat={typeCompteResultat}
        setTypeCompteResultat={setTypeCompteResultat}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default CompteResultatPage;
