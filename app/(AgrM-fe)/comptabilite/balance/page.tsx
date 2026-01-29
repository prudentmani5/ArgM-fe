'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { CptCompte } from '../compte/CptCompte';
import BalanceForm from './BalanceForm';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { CptExercice } from '../exercice/CptExercice';
import Cookies from 'js-cookie';

const BalancePage: React.FC = () => {
  const [dateDebutStr, setDateDebutStr] = useState<string>('');
  const [dateFinStr, setDateFinStr] = useState<string>('');
  const [typeBalance, setTypeBalance] = useState<string>('generale');
  const [compteDebut, setCompteDebut] = useState<string | null>(null);
  const [compteFin, setCompteFin] = useState<string | null>(null);
  const [regroupement, setRegroupement] = useState<string>('compte');
  const [etatEcritures, setEtatEcritures] = useState<string>('toutes');
  const [dbcomptes, setdbComptes] = useState<CptCompte[]>([]);
  const [fincomptes, setfinComptes] = useState<CptCompte[]>([]);
 const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
  const { fetchData, data: dataPdf } = useConsumApi('');
  const { data: dataCptDeb, fetchData: dbFetchData } = useConsumApi('');
  const { data: dataCptFin, fetchData: fnFetchData } = useConsumApi('');

  const toast = useRef<Toast>(null);

  useEffect(() => {
    dbFetchData(null, 'Get', `${API_BASE_URL}/ecritures/findListCompte`, 'loadcomptesDb');
    fnFetchData(null, 'Get', `${API_BASE_URL}/ecritures/findListCompte`, 'loadcomptesFn');
    
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

  useEffect(() => {
    if (dataPdf) {
      const blob = new Blob([dataPdf], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `balance-${typeBalance}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('success', 'Succès', 'La balance a été générée avec succès.');
    }
  }, [dataPdf]);

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const convertDateStrToIso = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    try {
      const dateDebutIso = convertDateStrToIso(dateDebutStr);
      const dateFinIso = convertDateStrToIso(dateFinStr);

      const params: string[] = [];
      const baseUrl = `${API_BASE_URL}/reports/balance`;

      //const savedExercice = Cookies.get('currentExercice');
      
    
      if (!currentExercice) {
        showToast('warn', 'Exercice manquant', `Veuillez préciser l'exercice`);
        return;
      }

      if (currentExercice && currentExercice.exerciceId) {
        params.push(`exerciceId=${encodeURIComponent(currentExercice.exerciceId)}`);
        console.log('✅ Added exerciceId:', currentExercice.exerciceId);
      } else {
        console.warn('⚠️ No currentExercice or exerciceId available');
      }
      if (dateDebutIso) params.push(`dateDebut=${encodeURIComponent(dateDebutIso)}`);
      if (dateFinIso) params.push(`dateFin=${encodeURIComponent(dateFinIso)}`);
      if (typeBalance) params.push(`typeBlc=${encodeURIComponent(typeBalance)}`);
      if (regroupement) params.push(`etat=${encodeURIComponent(regroupement)}`);
      if (etatEcritures) params.push(`grp=${encodeURIComponent(etatEcritures)}`);
      if (compteDebut) params.push(`compteDebut=${encodeURIComponent(compteDebut)}`);
      if (compteFin) params.push(`compteFin=${encodeURIComponent(compteFin)}`);

      const url = baseUrl + (params.length > 0 ? "?" + params.join("&") : "");

      console.log("➡️ URL API :", url);

      fetchData(null, 'Get', url, 'loadBalance', false, 'blob');
    } catch (err) {
      showToast('error', 'Erreur', 'Erreur lors de la génération de la balance.');
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <h5>Balance comptable</h5>
      <BalanceForm
        dateDebutStr={dateDebutStr}
        setDateDebutStr={setDateDebutStr}
        dateFinStr={dateFinStr}
        setDateFinStr={setDateFinStr}
        typeBalance={typeBalance}
        setTypeBalance={setTypeBalance}
        compteDebut={compteDebut}
        compteFin={compteFin}
        setCompteDebut={setCompteDebut}
        setCompteFin={setCompteFin}
        regroupement={regroupement}
        setRegroupement={setRegroupement}
        etatEcritures={etatEcritures}
        setEtatEcritures={setEtatEcritures}
        comptesDb={dbcomptes}
        comptesFn={fincomptes}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default BalancePage;
