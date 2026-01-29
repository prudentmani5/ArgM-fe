'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { CptCompte } from '../compte/CptCompte';
import { DropdownChangeEvent } from 'primereact/dropdown';
import AccountReportForm from './AcountReportForm';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { CptExercice } from '../exercice/CptExercice';
import Cookies from 'js-cookie';

function AccountReportComponent() {
  const [compteDebut, setCompteDebut] = useState<string | null>(null);
  const [compteFin, setCompteFin] = useState<string | null>(null);
  const [dateDebut, setDateDebut] = useState<string>(''); // ← string
  const [dateFin, setDateFin] = useState<string>('');     // ← string
  const [comptes, setComptes] = useState<CptCompte[]>([]);
  const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
  const toast = useRef<Toast>(null);

  const { data, fetchData } = useConsumApi('');
  const { data: dataPdf, fetchData: fetchDataPdf } = useConsumApi('');
  const { data: dataExcel, fetchData: fetchDataExcel } = useConsumApi('');

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  useEffect(() => {
    const savedExercice: any = Cookies.get('currentExercice');

    if (savedExercice) {
      const exercice = JSON.parse(savedExercice);
      setCurrentExercice(exercice);
    }
    loadAllAccount();
  }, []);

  useEffect(() => {
    if (data) setComptes(data);
  }, [data]);

  useEffect(() => {
    if (dataPdf) {
      const blob = new Blob([dataPdf], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rapport-comptes.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('success', 'Succès', 'Le rapport a été généré.');
    }
  }, [dataPdf]);

  useEffect(() => {
    console.log("Excell  ==== " + dataExcel);

    if (dataExcel) {
      const blob = new Blob([dataExcel], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'rapport-comptes.xlsx';

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('success', 'Succès', 'Le fichier Excel a été généré.');
    }
  }, [dataExcel]);

  // Fonction utilitaire : dd/MM/yyyy -> yyyy-MM-dd
  const parseFrDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr.length !== 10) return null;
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month}-${day}`;
  };

  function handleDropDownSelect(e: DropdownChangeEvent) {
    setCompteDebut(e.value);
  }

  const handleDateChange = (name: string, value: string) => {
    if (name === 'dateDebut') setDateDebut(value);
    else if (name === 'dateFin') setDateFin(value);
  };

  const loadAllAccount = () => {
    fetchData(null, 'Get', `${API_BASE_URL}/comptes/findall`, 'loadCompte');
  };

  const handleSubmitPdf = () => {
    if (!compteDebut) {
      showToast('warn', 'Champs manquants', 'Veuillez préciser le compte');
      return;
    }

    if(!currentExercice)
    {
      showToast('warn', 'Exercice manquant', `Veuillez préciser l'exercice`);
      return;
    }
    let params: string[] = [];
    const baseUrl = `${API_BASE_URL}/reports/comptes`;

    const parsedDateDebut = parseFrDate(dateDebut);
    const parsedDateFin = parseFrDate(dateFin);

    if (parsedDateDebut) params.push(`dateDebut=${encodeURIComponent(parsedDateDebut)}`);
    if (parsedDateFin) params.push(`dateFin=${encodeURIComponent(parsedDateFin)}`);
    if (compteDebut) params.push(`compteCode=${encodeURIComponent(compteDebut)}`);

    // Add exerciceId if available
    if (currentExercice && currentExercice.exerciceId) {
      params.push(`exerciceId=${encodeURIComponent(currentExercice.exerciceId)}`);
      console.log('✅ Added exerciceId:', currentExercice.exerciceId);
    } else {
      console.warn('⚠️ No currentExercice or exerciceId available');
    }

    const url = baseUrl + (params.length > 0 ? '?' + params.join('&') : '');
    fetchDataPdf(null, 'Get', url, 'loadCompte', false, 'blob');
  };
  const handleSubmitExcel = () => {
    if (!compteDebut) {
      showToast('warn', 'Champs manquants', 'Veuillez préciser le compte');
      return;
    }
 if(!currentExercice)
    {
      showToast('warn', 'Exercice manquant', `Veuillez préciser l'exercice`);
      return;
    }
    let params: string[] = [];
    const baseUrl = `${API_BASE_URL}/reports/compteExcel`;

    const parsedDateDebut = parseFrDate(dateDebut);
    const parsedDateFin = parseFrDate(dateFin);

    if (parsedDateDebut) params.push(`dateDebut=${encodeURIComponent(parsedDateDebut)}`);
    if (parsedDateFin) params.push(`dateFin=${encodeURIComponent(parsedDateFin)}`);
    if (compteDebut) params.push(`compteCode=${encodeURIComponent(compteDebut)}`);
 // Add exerciceId if available
    if (currentExercice && currentExercice.exerciceId) {
      params.push(`exerciceId=${encodeURIComponent(currentExercice.exerciceId)}`);
      console.log('✅ Added exerciceId:', currentExercice.exerciceId);
    } else {
      console.warn('⚠️ No currentExercice or exerciceId available');
    }
    const url = baseUrl + (params.length > 0 ? '?' + params.join('&') : '');

    // ⚠ même fonction que PDF, mais le paramètre format = 'blob' est essentiel
    fetchDataExcel(null, 'Get', url, 'loadExcel', false, 'blob');
  };


  return (
    <>
      <Toast ref={toast} />

      <div className="card">
        <h5>Consultation d'un compte</h5>
        <AccountReportForm
          comptes={comptes}
          compteDebut={compteDebut}
          compteFin={compteFin}
          dateDebut={dateDebut}
          dateFin={dateFin}
          handleDropDownSelect={handleDropDownSelect}
          handleDateChange={handleDateChange}
          handleSubmit={handleSubmitPdf}
          handleExcelSubmit={handleSubmitExcel}
        />
      </div>
    </>
  );
}

export default AccountReportComponent;
