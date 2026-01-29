'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import BilanForm from './BilanForm';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { CptExercice } from '../exercice/CptExercice';
import Cookies from 'js-cookie';

const BilanPage: React.FC = () => {
  
  const [etatEcritures, setEtatEcritures] = useState<string>('toutes');
  const [typeBilan, setTypeBilan] = useState<string>('actif');
  const toast = useRef<Toast>(null);
  const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
  const { data, fetchData } = useConsumApi('');

  const [dateReferenceStr, setDateReferenceStr] = useState<string>(() => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
});

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  // Convertit "dd/MM/yyyy" → "yyyy-MM-dd"
  const convertDateStrToIso = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
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
      link.download = `bilan-${typeBilan}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('success', 'Succès', 'Le bilan a été généré.');
    }
  }, [data]);

  const handleSubmit = async () => {
    try {
      const dateIso = convertDateStrToIso(dateReferenceStr);

      

      if (!currentExercice) {
        showToast('warn', 'Exercice manquant', `Veuillez préciser l'exercice`);
        return;
      }
      const params: string[] = [];
      if (dateIso) params.push(`date=${encodeURIComponent(dateIso)}`);
      if (etatEcritures) params.push(`Etat=${encodeURIComponent(etatEcritures)}`);
      if (typeBilan) params.push(`type=${encodeURIComponent(typeBilan)}`);
      // Add exerciceId if available
      if (currentExercice && currentExercice.exerciceId) {
        params.push(`exercice=${encodeURIComponent(currentExercice.exerciceId)}`);
        console.log('✅ Added exerciceId:', currentExercice.exerciceId);
      } else {
        console.warn('⚠️ No currentExercice or exerciceId available');
      }
      const baseUrl = `${API_BASE_URL}/reports/bilan`;
      const url = baseUrl + (params.length > 0 ? '?' + params.join('&') : '');

      console.log('➡️ URL API :', url);

      // Appel via ton hook
      fetchData(null, 'Get', url, 'bilan', false, 'blob');
    } catch (error) {
      showToast('error', 'Erreur', 'Erreur lors de la génération du bilan.');
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <h5>Bilan comptable</h5>
      <BilanForm
        dateReferenceStr={dateReferenceStr}
        setDateReferenceStr={setDateReferenceStr}
        etatEcritures={etatEcritures}
        setEtatEcritures={setEtatEcritures}
        typeBilan={typeBilan}
        setTypeBilan={setTypeBilan}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default BilanPage;
