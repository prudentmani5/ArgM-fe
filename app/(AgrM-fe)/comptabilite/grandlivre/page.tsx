'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { CptCompte } from '../compte/CptCompte';
import { DropdownChangeEvent } from 'primereact/dropdown';
import GrandLivreForm from './GrandLivreForm';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { CptExercice } from '../exercice/CptExercice';
import Cookies from 'js-cookie';

function GrandLivreComponent() {
  const [compteDebut, setCompteDebut] = useState<string | null>(null);
  const [compteFin, setCompteFin] = useState<string | null>(null);
  const [dateDebutStr, setDateDebutStr] = useState<string>('01/01/2025');
  const [dateFinStr, setDateFinStr] = useState<string>('31/12/2025');
  const [dbcomptes, setdbComptes] = useState<CptCompte[]>([]);
  const [fincomptes, setfinComptes] = useState<CptCompte[]>([]);
  const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
  const toast = useRef<Toast>(null);

  const { data: dataCptDeb, fetchData: dbFetchData } = useConsumApi('');
  const { data: dataCptFin, fetchData: fnFetchData } = useConsumApi('');
  const { data: dataPdf, fetchData: fetchDataPdf } = useConsumApi('');

  useEffect(() => {
    loadAllComptesDb();
    loadAllComptesFn();

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
    if (dataCptDeb) setdbComptes(dataCptDeb);
    if (dataCptFin) setfinComptes(dataCptFin);
  }, [dataCptDeb, dataCptFin]);

  const loadAllComptesDb = () => {
    dbFetchData(null, 'Get', `${API_BASE_URL}/ecritures/findListCompte`, 'loadcomptesDb');
  };

  const loadAllComptesFn = () => {
    fnFetchData(null, 'Get', `${API_BASE_URL}/ecritures/findListCompte`, 'loadcomptesFn');
  };

  useEffect(() => {
    if (dataPdf) {
      const blob = new Blob([dataPdf], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'grand-livre.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('success', 'Succès', 'Le Grand Livre a été généré.');
    }
  }, [dataPdf]);

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const convertDateStrToIso = (dateStr: string): string | null => {
    if (!dateStr || dateStr.length !== 10) return null;
    const [jour, mois, annee] = dateStr.split('/');
    return `${annee}-${mois}-${jour}`;
  };

  const handleSubmit = async () => {
    try {
      let exercice = '';
      let journal = '';
      let piece = '';
      let brouillar = '';
      let ref = '';
      let baseUrl = `${API_BASE_URL}/reports/grand-livre`;
      let params: string[] = [];

      const dateDebutIso = convertDateStrToIso(dateDebutStr);
      const dateFinIso = convertDateStrToIso(dateFinStr);
      
      if (!currentExercice) {
        showToast('warn', 'Exercice manquant', `Veuillez préciser l'exercice`);
        return;
      }
      if (currentExercice && currentExercice.exerciceId) {
        params.push(`exercice=${encodeURIComponent(currentExercice.exerciceId)}`);
        console.log('✅ Added exerciceId:', currentExercice.exerciceId);
      } else {
        console.warn('⚠️ No currentExercice or exerciceId available');
      }

      if (dateDebutIso) params.push(`dateDebut=${encodeURIComponent(dateDebutIso)}`);
      if (dateFinIso) params.push(`dateFin=${encodeURIComponent(dateFinIso)}`);
      if (brouillar) params.push(`brouillardId=${encodeURIComponent(brouillar)}`);
      if (ref) params.push(`reference=${encodeURIComponent(ref)}`);
      if (exercice) params.push(`exercice=${encodeURIComponent(exercice)}`);
      if (piece) params.push(`numeroPiece=${encodeURIComponent(piece)}`);
      if (journal) params.push(`journalId=${encodeURIComponent(journal)}`);
      if (compteDebut) params.push(`compteDebut=${encodeURIComponent(compteDebut)}`);
      if (compteFin) params.push(`compteFin=${encodeURIComponent(compteFin)}`);

      const url = baseUrl + (params.length > 0 ? '?' + params.join('&') : '');
      fetchDataPdf(null, 'Get', url, 'loadGrdLvre', false, 'blob');
    } catch (err) {
      showToast('error', 'Erreur', 'Erreur lors de la génération du Grand Livre.');
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="card">
        <h5>Grand Livre</h5>
        <GrandLivreForm
          comptesDb={dbcomptes}
          comptesFn={fincomptes}
          compteDebut={compteDebut}
          setCompteDebut={setCompteDebut}
          compteFin={compteFin}
          setCompteFin={setCompteFin}
          dateDebutStr={dateDebutStr}
          setDateDebutStr={setDateDebutStr}
          dateFinStr={dateFinStr}
          setDateFinStr={setDateFinStr}
          handleSubmit={handleSubmit}
        />
      </div>
    </>
  );
}

export default GrandLivreComponent;
