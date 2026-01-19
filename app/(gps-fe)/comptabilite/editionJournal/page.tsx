'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import JournalReportForm from './JournalReportForm';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { CptExercice } from '../exercice/CptExercice';
import Cookies from 'js-cookie';

const JournalReportPage: React.FC = () => {

  // Dates en string (format dd/MM/yyyy) pour InputMask
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [journalId, setJournalId] = useState<string | null>(null);
  const [deviseId, setDeviseId] = useState<string | null>(null);
  const [etatEcritures, setEtatEcritures] = useState<string>('toutes');
  const [journals, setJournals] = useState<[]>([]);
  const [devises, setDevises] = useState<[]>([]);
  const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
  const toast = useRef<Toast>(null);

  const { data: dataJrnl, fetchData: jrnlFetchData } = useConsumApi('');
  const { data: dataDevise, fetchData: devFetchData } = useConsumApi('');
  const { data: dataPdf, fetchData: fetchDataPdf } = useConsumApi('');

  useEffect(() => {
    loadAllJournaux();
    loadAllDevise();

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
    if (dataJrnl) setJournals(dataJrnl);
    if (dataDevise) setDevises(dataDevise);
  }, [dataJrnl, dataDevise]);

  useEffect(() => {
    if (dataPdf) {
      const blob = new Blob([dataPdf], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'journal.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('success', 'Succès', 'Le journal a été généré.');
    }
  }, [dataPdf]);

  const loadAllJournaux = () => {
    jrnlFetchData(null, 'Get', `${API_BASE_URL}/journaux/findall`, 'loadJournaux');
  };

  const loadAllDevise = () => {
    devFetchData(null, 'Get', `${API_BASE_URL}/deviseCaisses/findall`, 'loadDevises');
  };

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  // util : dd/MM/yyyy -> yyyy-MM-dd (retourne null si invalide)
  const parseFrDateToIso = (value: string): string | null => {
    if (!value || value.length !== 10) return null;
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (!day || !month || !year) return null;
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    try {
      if (!journalId) {
        showToast('warn', 'Champs manquants', 'Veuillez préciser le journal');
        return;
      }

      const baseUrl = `${API_BASE_URL}/reports/journal`;
      const params: string[] = [];

      const isoDebut = parseFrDateToIso(dateDebut);
      const isoFin = parseFrDateToIso(dateFin);


      if (!currentExercice) {
        showToast('warn', 'Exercice manquant', `Veuillez préciser l'exercice`);
        return;
      }

      if (isoDebut) params.push('dateDebut=' + encodeURIComponent(isoDebut));
      if (isoFin) params.push('dateFin=' + encodeURIComponent(isoFin));
      if (deviseId) params.push('devise=' + encodeURIComponent(deviseId));
      if (etatEcritures) params.push('etat=' + encodeURIComponent(etatEcritures));
      if (journalId) params.push('journalId=' + encodeURIComponent(journalId));

      if (currentExercice && currentExercice.exerciceId) {
        params.push(`exerciceId=${encodeURIComponent(currentExercice.exerciceId)}`);
        console.log('✅ Added exerciceId:', currentExercice.exerciceId);
      } else {
        console.warn('⚠️ No currentExercice or exerciceId available');
      }

      const url = baseUrl + (params.length > 0 ? '?' + params.join('&') : '');
      console.log('➡️ URL finale:', url);

      fetchDataPdf(null, 'Get', url, 'loadJournal', false, 'blob');
    } catch (err) {
      console.error(err);
      showToast('error', 'Erreur', 'Erreur lors de la génération du journal.');
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <h5>État du Journal</h5>
      <JournalReportForm
        dateDebut={dateDebut}
        setDateDebut={setDateDebut}
        dateFin={dateFin}
        setDateFin={setDateFin}
        journalId={journalId}
        setJournalId={setJournalId}
        deviseId={deviseId}
        setDeviseId={setDeviseId}
        etatEcritures={etatEcritures}
        setEtatEcritures={setEtatEcritures}
        journals={journals}
        devises={devises}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default JournalReportPage;
