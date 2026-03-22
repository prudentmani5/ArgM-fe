'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptEcriture, CptBrouillard, CptCompte, CptExercice } from '../types';
import Cookies from 'js-cookie';
import { toLocalISODate } from '../../../../utils/component/dateUtils';
import { ProtectedPage } from '@/components/ProtectedPage';

const CptEcritureComponent: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [ecriture, setEcriture] = useState<CptEcriture>(new CptEcriture());
  const [brouillards, setBrouillards] = useState<CptBrouillard[]>([]);
  const [comptes, setComptes] = useState<CptCompte[]>([]);
  const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
  const [ecritures, setEcritures] = useState<CptEcriture[]>([]);
  const [selectedEcritures, setSelectedEcritures] = useState<CptEcriture[]>([]);
  const [dateCalendarValue, setDateCalendarValue] = useState<Date | null>(null);

  // List tab state
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [listDateDebut, setListDateDebut] = useState<Date | null>(null);
  const [listDateFin, setListDateFin] = useState<Date | null>(null);
  const [listeEcritures, setListeEcritures] = useState<CptEcriture[]>([]);
  const [listGlobalFilter, setListGlobalFilter] = useState('');

  const { data, fetchData, callType, error } = useConsumApi('');
  const { data: dataBrd, fetchData: brdFetchData } = useConsumApi('');
  const { data: dataCpt, fetchData: cptFetchData } = useConsumApi('');
  const { data: dataNumPce, fetchData: numPceFetchData } = useConsumApi('');
  const { data: dataListEcritures, loading: listLoading, fetchData: fetchListEcritures, callType: listCallType } = useConsumApi('');

  const apiUrl = buildApiUrl('/api/comptability/ecritures');

  const formatDate = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  };

  const loadAllBrouillards = (exerciceId?: string) => {
    const url = exerciceId
      ? `${apiUrl}/findListBrouillard?exerciceId=${encodeURIComponent(exerciceId)}`
      : `${apiUrl}/findListBrouillard`;
    brdFetchData(null, 'Get', url, 'loadBrouillards');
  };

  const loadAllComptes = () => cptFetchData(null, 'Get', `${apiUrl}/findListCompte`, 'loadComptes');

  useEffect(() => {
    const savedExercice = Cookies.get('currentExercice');
    getUserFromCookies();
    if (savedExercice) {
      try {
        const exercice = JSON.parse(savedExercice);
        setCurrentExercice(exercice);
        loadAllBrouillards(exercice.exerciceId);
      } catch (e) {
        loadAllBrouillards();
      }
    } else {
      loadAllBrouillards();
    }
    loadAllComptes();
  }, []);

  useEffect(() => {
    if (dataBrd) setBrouillards(Array.isArray(dataBrd) ? dataBrd : [dataBrd]);
    if (dataCpt) setComptes(Array.isArray(dataCpt) ? dataCpt : [dataCpt]);
    if (data) {
      setEcritures(Array.isArray(data) ? data : [data]);
      const listeEcritures = Array.isArray(data) ? data : [data];
      const premiereEcriture: CptEcriture = listeEcritures[0];
      if (premiereEcriture != null) {
        ecriture.reference = premiereEcriture.reference;
        ecriture.printDate = premiereEcriture.printDate;
      }
    }
  }, [data, dataBrd, dataCpt]);

  useEffect(() => {
    if (dataNumPce) {
      const listePiece = Array.isArray(dataNumPce) ? dataNumPce : [dataNumPce];
      const numeros = listePiece.map((num: any) => Number(num)).filter((n: number) => !isNaN(n));
      const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
      setEcriture((prev) => ({ ...prev, numeroPiece: (maxNumero + 1).toString() }));
    }
  }, [dataNumPce, ecriture.brouillardId]);

  // Handle list ecritures response
  useEffect(() => {
    if (dataListEcritures && listCallType === 'loadListEcritures') {
      setListeEcritures(Array.isArray(dataListEcritures) ? dataListEcritures : [dataListEcritures]);
    }
  }, [dataListEcritures, listCallType]);

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) =>
    toast.current?.show({ severity, summary, detail, life: 3000 });

  // Compute totals
  const totalDebit = ecritures.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = ecritures.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const solde = totalDebit - totalCredit;

  // List tab totals
  const listTotalDebit = listeEcritures.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const listTotalCredit = listeEcritures.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const listSolde = listTotalDebit - listTotalCredit;

  const searchEcrituresByPeriod = () => {
    if (!currentExercice?.exerciceId) {
      showToast('warn', 'Exercice requis', 'Veuillez sélectionner un exercice.');
      return;
    }
    if (!listDateDebut || !listDateFin) {
      showToast('warn', 'Période requise', 'Veuillez sélectionner la date début et la date fin.');
      return;
    }
    const dateFrom = toLocalISODate(listDateDebut);
    const dateTo = toLocalISODate(listDateFin);
    fetchListEcritures(null, 'GET', `${apiUrl}/findByDateRange?exerciceId=${currentExercice.exerciceId}&dateDebut=${dateFrom}&dateFin=${dateTo}`, 'loadListEcritures');
  };

  const formatCurrencyPlain = (value: number | undefined) => {
    return (value || 0).toLocaleString('fr-FR') + ' FBu';
  };

  const exportListPdf = () => {
    if (listeEcritures.length === 0) {
      showToast('warn', 'Attention', 'Aucune donnée à exporter');
      return;
    }
    const dateRange = listDateDebut && listDateFin
      ? `${listDateDebut.toLocaleDateString('fr-FR')} au ${listDateFin.toLocaleDateString('fr-FR')}`
      : 'Toutes les dates';

    const tableRows = listeEcritures.map(e => `
      <tr>
        <td>${e.codeJournal || ''}</td>
        <td>${e.numeroPiece || ''}</td>
        <td>${e.codeCompte || ''}</td>
        <td>${e.libelle || ''}</td>
        <td>${e.printDate || formatDate(e.dateEcriture)}</td>
        <td>${e.reference || ''}</td>
        <td style="text-align:right">${e.debit ? e.debit.toLocaleString('fr-FR') : '-'}</td>
        <td style="text-align:right">${e.credit ? e.credit.toLocaleString('fr-FR') : '-'}</td>
        <td>${e.valide ? 'Validé' : 'Brouillon'}</td>
      </tr>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Liste des Écritures Comptables</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
          .header h1 { color: #3B82F6; margin: 0; font-size: 20px; }
          .header p { margin: 5px 0; color: #666; }
          .summary { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .summary div { text-align: center; }
          .summary .value { font-size: 16px; font-weight: bold; color: #3B82F6; }
          .summary .label { font-size: 11px; color: #888; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #3B82F6; color: white; padding: 8px 6px; text-align: left; font-size: 11px; }
          td { padding: 6px; border-bottom: 1px solid #ddd; font-size: 11px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .total-row { background-color: #e8f0fe !important; font-weight: bold; }
          .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #999; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${window.location.origin}/layout/images/logo/logoAgrinova.PNG" alt="Logo" style="height:50px;margin-bottom:8px;" />
          <h1>Liste des Écritures Comptables</h1>
          <p>Période: ${dateRange}</p>
          <p>Exercice: ${currentExercice?.codeExercice || '-'}</p>
          <p>Imprimé le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
        <div class="summary">
          <div><div class="value">${listeEcritures.length}</div><div class="label">Nombre d'écritures</div></div>
          <div><div class="value">${formatCurrencyPlain(listTotalDebit)}</div><div class="label">Total Débit</div></div>
          <div><div class="value">${formatCurrencyPlain(listTotalCredit)}</div><div class="label">Total Crédit</div></div>
          <div><div class="value">${formatCurrencyPlain(listSolde)}</div><div class="label">Solde</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Journal</th>
              <th>N° Pièce</th>
              <th>Compte</th>
              <th>Libellé</th>
              <th>Date</th>
              <th>Référence</th>
              <th style="text-align:right">Débit</th>
              <th style="text-align:right">Crédit</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            <tr class="total-row">
              <td colspan="6" style="text-align:right">TOTAL</td>
              <td style="text-align:right">${formatCurrencyPlain(listTotalDebit)}</td>
              <td style="text-align:right">${formatCurrencyPlain(listTotalCredit)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div class="footer">
          <p>AGRINOVA MICROFINANCE - Rapport généré automatiquement</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 250);
    }
    showToast('success', 'Export PDF', 'Le document est prêt pour impression/enregistrement en PDF');
  };

  const exportListExcel = () => {
    if (listeEcritures.length === 0) {
      showToast('warn', 'Attention', 'Aucune donnée à exporter');
      return;
    }
    const headers = ['Journal', 'N° Pièce', 'Compte', 'Libellé', 'Date', 'Référence', 'Débit', 'Crédit', 'Statut'];
    const rows = listeEcritures.map(e => [
      e.codeJournal || '',
      e.numeroPiece || '',
      e.codeCompte || '',
      e.libelle || '',
      e.printDate || formatDate(e.dateEcriture),
      e.reference || '',
      String(Number(e.debit) || 0),
      String(Number(e.credit) || 0),
      e.valide ? 'Validé' : 'Brouillon'
    ]);

    let csvContent = '\uFEFF' + headers.join(';') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
    });
    csvContent += '\n';
    csvContent += `"TOTAL";"${listeEcritures.length} écritures";;;;"";` +
      `"${listTotalDebit}";"${listTotalCredit}";"";\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ecritures_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Export Excel', 'Le fichier CSV a été téléchargé');
  };

  const getUserFromCookies = () => {
    try {
      const appUserCookie = Cookies.get('appUser');
      if (appUserCookie) {
        const parsedUser = JSON.parse(appUserCookie);
        ecriture.userCreation = parsedUser['firstname'];
      }
    } catch (err) { /* ignore */ }
  };

  const loadEcritures = (brouillardId: string, numeroPiece: string) => {
    if (!brouillardId || !numeroPiece) { setEcritures([]); return; }
    let params: string[] = [];
    if (currentExercice?.exerciceId) params.push(`exerciceId=${encodeURIComponent(currentExercice.exerciceId)}`);
    if (brouillardId) params.push(`brouillardId=${encodeURIComponent(brouillardId)}`);
    if (numeroPiece) params.push(`numeroPiece=${encodeURIComponent(numeroPiece)}`);
    fetchData(null, 'Get', `${apiUrl}/findList/?${params.join('&')}`, 'loadCptEcritures');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEcriture({ ...ecriture, [e.target.name]: e.target.value });
  };

  const handleCalendarDateChange = (date: Date | null) => {
    setDateCalendarValue(date);
    if (date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const iso = `${yyyy}-${mm}-${dd}`;
      const display = `${dd}/${mm}/${yyyy}`;
      setEcriture(prev => ({ ...prev, dateEcriture: iso, printDate: display }));
    } else {
      setEcriture(prev => ({ ...prev, dateEcriture: '', printDate: '' }));
    }
  };

  const handleBrdDropDownSelect = (e: any) => {
    const selected = brouillards.find((b) => b.brouillardId === e.value);
    setEcriture({
      ...ecriture, brouillardId: e.value,
      codeJournal: selected?.codeJournal || '',
      journalId: selected?.journalId || ''
    });
    if (selected?.brouillardId) {
      numPceFetchData(null, 'Get', `${apiUrl}/findListeNum?brouillardId=${encodeURIComponent(selected.brouillardId)}`, 'loadNumero');
    }
  };

  const handleCptDropDownSelect = (e: any) => {
    const selected = comptes.find((c) => c.compteId === e.value);
    setEcriture({ ...ecriture, compteId: e.value, codeCompte: selected?.codeCompte || '' });
  };

  const handlePieceBlur = () => { loadEcritures(ecriture.brouillardId, ecriture.numeroPiece); };

  const handleSubmit = async () => {
    if (!ecriture.dateEcriture || !ecriture.compteId || (!ecriture.debit && !ecriture.credit)) {
      return showToast('warn', 'Champs manquants', 'Veuillez saisir date, compte et montant.');
    }
    const ecritureToSubmit = { ...ecriture, exerciceId: currentExercice?.exerciceId || ecriture.exerciceId, userAction: getUserAction() };
    setEcritures([]);
    if (ecriture.ecritureId) {
      fetchData(ecritureToSubmit, 'Put', `${apiUrl}/update/${ecriture.ecritureId}`, 'updateEcriture');
      showToast('success', 'Mise à jour', 'Écriture modifiée avec succès.');
    } else {
      fetchData(ecritureToSubmit, 'Post', `${apiUrl}/new`, 'createEcriture');
      showToast('success', 'Créé', 'Écriture enregistrée avec succès.');
    }
    handleReset();
    loadEcritures(ecriture.brouillardId, ecriture.numeroPiece);
  };

  const handleDelete = async () => {
    if (!ecriture.ecritureId) return showToast('warn', 'Aucune sélection', 'Sélectionnez une écriture.');
    fetchData(ecriture, 'Delete', `${apiUrl}/delete/${ecriture.ecritureId}`, 'deleteEcriture');
    showToast('success', 'Supprimée', 'Écriture supprimée.');
    handleReset();
    loadEcritures(ecriture.brouillardId, ecriture.numeroPiece);
  };

  const handleReset = () => {
    setEcriture((prev) => ({
      ...new CptEcriture(), brouillardId: prev.brouillardId, codeJournal: prev.codeJournal,
      journalId: prev.journalId, numeroPiece: prev.numeroPiece, reference: prev.reference,
      dateEcriture: prev.dateEcriture, printDate: prev.printDate, libelle: prev.libelle
    }));
    // Keep calendar date synced (don't reset it - date stays for next entry)
  };

  const handleAutoEcriture = () => {
    if (ecritures && ecritures.length > 0) {
      const solde = ecritures.reduce((total, e) => total + (Number(e.debit) || 0) - (Number(e.credit) || 0), 0);
      if (solde !== 0) {
        ecriture.debit = solde < 0 ? -solde : 0;
        ecriture.credit = solde > 0 ? solde : 0;
        if (!ecriture.dateEcriture || !ecriture.compteId) return showToast('warn', 'Champs manquants', 'Veuillez saisir date et compte.');
        const ecritureToSubmit = { ...ecriture, exerciceId: currentExercice?.exerciceId || ecriture.exerciceId, userAction: getUserAction() };
        fetchData(ecritureToSubmit, 'Post', `${apiUrl}/new`, 'createEcriture');
        handleReset();
        loadEcritures(ecriture.brouillardId, ecriture.numeroPiece);
        showToast('success', 'Équilibré', 'Écriture d\'équilibre enregistrée.');
      }
    }
  };

  const initializeEcriture = () => {
    if (ecritures && ecritures.length > 0) {
      const solde = ecritures.reduce((total, e) => total + (Number(e.debit) || 0) - (Number(e.credit) || 0), 0);
      if (solde !== 0) {
        showToast('warn', 'Non équilibrée', `Solde = ${solde.toLocaleString('fr-FR')} FBu`);
        return;
      }
    }
    setEcriture(new CptEcriture());
    setEcritures([]);
  };

  const handelSavePiece = () => {
    if (!ecriture.reference) return showToast('warn', 'Référence', 'Préciser la référence.');
    if (!ecriture.brouillardId) return showToast('warn', 'Brouillard', 'Préciser le brouillard.');
    if (!ecriture.numeroPiece) return showToast('warn', 'Numéro', 'Préciser le numéro pièce.');
    if (!ecriture.dateEcriture) return showToast('warn', 'Date', 'Préciser la date.');
    const pieceWithUser = { ...ecriture, userAction: getUserAction() };
    fetchData(pieceWithUser, 'Post', `${apiUrl}/newPiece`, 'createPiece');
    handleReset();
    setEcritures([]);
    showToast('success', 'Créé', 'Pièce enregistrée avec succès.');
  };

  const handleDeleteNumeroPiece = () => {
    if (ecriture.numeroPiece && ecriture.brouillardId) {
      const pieceId = ecriture.numeroPiece + ecriture.journalId + ecriture.brouillardId;
      confirmDialog({
        message: 'Êtes-vous sûr de vouloir supprimer cette pièce ?',
        header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui', rejectLabel: 'Non',
        accept: () => {
          fetchData(null, 'Delete', `${apiUrl}/deletePiece?idPiece=${encodeURIComponent(pieceId)}`, 'deleteNumero');
          showToast('success', 'Supprimée', 'Pièce supprimée.');
        }
      });
    } else showToast('warn', 'Erreur', 'Préciser le brouillard et le numéro pièce.');
  };

  const deleteSelectedEcritures = () => {
    if (!selectedEcritures || selectedEcritures.length === 0) {
      showToast('warn', 'Aucune sélection', 'Sélectionnez au moins une écriture.');
      return;
    }
    const ids = selectedEcritures.map((e) => e.ecritureId);
    const url = `${apiUrl}/deleteList?${ids.map(id => `ids=${encodeURIComponent(id)}`).join('&')}`;
    confirmDialog({
      message: 'Supprimer les écritures sélectionnées ?',
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui', rejectLabel: 'Non',
      accept: () => {
        fetchData(null, 'Delete', url, 'deleteEcriture');
        setEcritures(ecritures.filter(e => !ids.includes(e.ecritureId)));
        setSelectedEcritures([]);
        showToast('success', 'Supprimées', 'Écritures supprimées.');
      }
    });
  };

  const onRowSelect = (e: any) => {
    const selected = e.data as CptEcriture;
    if (!selected) return;
    let formattedDate = '';
    let calDate: Date | null = null;
    if (selected.dateEcriture) {
      try {
        const isoDate = selected.dateEcriture.includes(' ') ? selected.dateEcriture.split(' ')[0] : selected.dateEcriture;
        const [year, month, day] = isoDate.split('-');
        formattedDate = `${day}/${month}/${year}`;
        calDate = new Date(Number(year), Number(month) - 1, Number(day));
      } catch { formattedDate = ''; }
    }
    setEcriture({ ...selected, printDate: formattedDate });
    setDateCalendarValue(calDate);
  };

  const actionBodyTemplate = (rowData: CptEcriture) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => onRowSelect({ data: rowData })} tooltip="Modifier" />
      <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => {
        confirmDialog({
          message: 'Supprimer cette écriture ?', header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Oui', rejectLabel: 'Non',
          accept: () => {
            fetchData(rowData, 'Delete', `${apiUrl}/delete/${rowData.ecritureId}`, 'deleteEcriture');
            loadEcritures(rowData.brouillardId, rowData.numeroPiece);
            showToast('success', 'Supprimée', 'Écriture supprimée.');
          }
        });
      }} tooltip="Supprimer" />
    </div>
  );

  return (
    <div className="card p-3 mt-2">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Exercice banner */}
      <div className="card mb-3" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #2196F3' }}>
        <div className="flex align-items-center justify-content-between p-3">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-calendar text-2xl text-primary"></i>
            <div>
              <div className="font-bold text-lg">
                {currentExercice ? (<>Exercice: <span className="text-primary">{currentExercice.codeExercice}</span></>) : (<span className="text-orange-500">Aucun exercice sélectionné</span>)}
              </div>
              {currentExercice && <div className="text-sm text-600">{currentExercice.description} - Du {formatDate(currentExercice.dateDebut)} au {formatDate(currentExercice.dateFin)}</div>}
            </div>
          </div>
          <Button icon="pi pi-refresh" label="Actualiser" size="small" outlined onClick={() => {
            const saved = Cookies.get('currentExercice');
            if (saved) { try { const ex = JSON.parse(saved); setCurrentExercice(ex); loadAllBrouillards(ex.exerciceId); } catch {} }
          }} />
        </div>
      </div>

      <TabView activeIndex={activeTabIndex} onTabChange={(e) => setActiveTabIndex(e.index)}>
        {/* Tab 1: Saisie des écritures */}
        <TabPanel header="Saisie" leftIcon="pi pi-pencil mr-2">
          {/* Saisie form */}
          <div className="card p-fluid">
            <div className="formgrid grid">
              <div className="field col-12 md:col-3">
                <label>Brouillard</label>
                <Dropdown value={ecriture.brouillardId} options={brouillards} optionLabel="codeBrouillard" optionValue="brouillardId"
                  onChange={handleBrdDropDownSelect} placeholder="Sélectionner" filter showClear className="w-full" />
              </div>
              <div className="field col-12 md:col-2">
                <label>N° Pièce</label>
                <InputText name="numeroPiece" value={ecriture.numeroPiece} onChange={handleChange} onBlur={handlePieceBlur} />
              </div>
              <div className="field col-12 md:col-2">
                <label>Date</label>
                <Calendar
                  value={dateCalendarValue}
                  onChange={(e) => handleCalendarDateChange(e.value as Date | null)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  placeholder="jj/mm/aaaa"
                  className="w-full"
                />
              </div>
              <div className="field col-12 md:col-2">
                <label>Référence</label>
                <InputText name="reference" value={ecriture.reference} onChange={handleChange} />
              </div>
              <div className="field col-12 md:col-3">
                <label>Libellé</label>
                <InputText name="libelle" value={ecriture.libelle} onChange={handleChange} />
              </div>
            </div>
            <div className="formgrid grid">
              <div className="field col-12 md:col-3">
                <label>Compte</label>
                <Dropdown value={ecriture.compteId} options={comptes} optionLabel="codeCompte" optionValue="compteId"
                  onChange={handleCptDropDownSelect} placeholder="Sélectionner" filter showClear className="w-full"
                  itemTemplate={(option: CptCompte) => <span>{option.codeCompte} - {option.libelle}</span>} />
              </div>
              <div className="field col-12 md:col-2">
                <label>Débit</label>
                <InputNumber value={ecriture.debit || null} onValueChange={(e) => setEcriture({ ...ecriture, debit: e.value ?? 0 })}
                  mode="decimal" locale="fr-FR" minFractionDigits={0} maxFractionDigits={2} />
              </div>
              <div className="field col-12 md:col-2">
                <label>Crédit</label>
                <InputNumber value={ecriture.credit || null} onValueChange={(e) => setEcriture({ ...ecriture, credit: e.value ?? 0 })}
                  mode="decimal" locale="fr-FR" minFractionDigits={0} maxFractionDigits={2} />
              </div>
              <div className="field col-12 md:col-5">
                <label>&nbsp;</label>
                <div className="flex gap-2 flex-wrap">
                  <Button icon="pi pi-plus" label="Ajouter" onClick={handleSubmit} size="small" />
                  <Button icon="pi pi-refresh" label="RAZ" onClick={initializeEcriture} size="small" outlined />
                  <Button icon="pi pi-trash" label="Supprimer" onClick={handleDelete} size="small" severity="danger" outlined />
                  <Button icon="pi pi-balance-scale" label="Équilibrer" onClick={handleAutoEcriture} size="small" severity="warning" />
                  <Button icon="pi pi-save" label="Sauver pièce" onClick={handelSavePiece} size="small" severity="success" />
                  <Button icon="pi pi-trash" label="Suppr. pièce" onClick={handleDeleteNumeroPiece} size="small" severity="danger" />
                  <Button icon="pi pi-trash" label="Suppr. sél." onClick={deleteSelectedEcritures} size="small" severity="danger" outlined />
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex gap-4 mb-2 mt-2">
            <span className="font-bold">Total Débit: <span className="text-blue-500">{totalDebit.toLocaleString('fr-FR')} FBu</span></span>
            <span className="font-bold">Total Crédit: <span className="text-green-500">{totalCredit.toLocaleString('fr-FR')} FBu</span></span>
            <span className={`font-bold ${solde === 0 ? 'text-green-600' : 'text-red-500'}`}>
              Solde: {solde.toLocaleString('fr-FR')} FBu {solde === 0 ? '✓' : ''}
            </span>
          </div>

          {/* DataTable */}
          <div className="card mt-2">
            <DataTable value={ecritures} showGridlines stripedRows dataKey="ecritureId"
              emptyMessage="Aucune écriture" size="small" scrollable scrollHeight="450px"
              selection={selectedEcritures} onSelectionChange={(e) => setSelectedEcritures(e.value)} selectionMode="multiple">
              <Column selectionMode="multiple" headerStyle={{ width: '3%' }} />
              <Column field="codeCompte" header="Compte" style={{ width: '10%' }} />
              <Column field="libelle" header="Libellé" style={{ width: '30%' }} />
              <Column field="dateEcriture" header="Date" body={(r: CptEcriture) => r.printDate} style={{ width: '10%' }} />
              <Column field="debit" header="Débit" style={{ width: '13%', textAlign: 'right' }}
                body={(r: CptEcriture) => r.debit ? r.debit.toLocaleString('fr-FR') : '0'} />
              <Column field="credit" header="Crédit" style={{ width: '13%', textAlign: 'right' }}
                body={(r: CptEcriture) => r.credit ? r.credit.toLocaleString('fr-FR') : '0'} />
              <Column header="Actions" body={actionBodyTemplate} style={{ width: '10%' }} />
            </DataTable>
          </div>
        </TabPanel>

        {/* Tab 2: Liste des écritures par période */}
        <TabPanel header="Liste des Écritures" leftIcon="pi pi-list mr-2">
          {/* Period selection */}
          <div className="card p-fluid mb-3">
            <div className="formgrid grid align-items-end">
              <div className="field col-12 md:col-3">
                <label>Date Début</label>
                <Calendar
                  value={listDateDebut}
                  onChange={(e) => setListDateDebut(e.value as Date | null)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  placeholder="jj/mm/aaaa"
                  className="w-full"
                />
              </div>
              <div className="field col-12 md:col-3">
                <label>Date Fin</label>
                <Calendar
                  value={listDateFin}
                  onChange={(e) => setListDateFin(e.value as Date | null)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  placeholder="jj/mm/aaaa"
                  className="w-full"
                />
              </div>
              <div className="field col-12 md:col-2">
                <Button icon="pi pi-search" label="Rechercher" onClick={searchEcrituresByPeriod} loading={listLoading} />
              </div>
              <div className="field col-12 md:col-4">
                <span className="p-input-icon-left w-full">
                  <i className="pi pi-search" />
                  <InputText
                    value={listGlobalFilter}
                    onChange={(e) => setListGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Totals + Export buttons */}
          <div className="flex flex-wrap align-items-center justify-content-between mb-2">
            <div className="flex gap-4">
              <span className="font-bold">Nombre: <span className="text-primary">{listeEcritures.length}</span></span>
              <span className="font-bold">Total Débit: <span className="text-blue-500">{listTotalDebit.toLocaleString('fr-FR')} FBu</span></span>
              <span className="font-bold">Total Crédit: <span className="text-green-500">{listTotalCredit.toLocaleString('fr-FR')} FBu</span></span>
              <span className={`font-bold ${listSolde === 0 ? 'text-green-600' : 'text-red-500'}`}>
                Solde: {listSolde.toLocaleString('fr-FR')} FBu {listSolde === 0 ? '✓' : ''}
              </span>
            </div>
            <div className="flex gap-2">
              <Button label="PDF" icon="pi pi-file-pdf" severity="danger" size="small" onClick={exportListPdf} />
              <Button label="Excel" icon="pi pi-file-excel" severity="success" size="small" onClick={exportListExcel} />
            </div>
          </div>

          {/* DataTable */}
          <div className="card">
            <DataTable value={listeEcritures} showGridlines stripedRows dataKey="ecritureId"
              emptyMessage="Sélectionnez une période et cliquez sur Rechercher" size="small"
              scrollable scrollHeight="500px" paginator rows={50} rowsPerPageOptions={[25, 50, 100]}
              globalFilter={listGlobalFilter} loading={listLoading}
              sortField="dateEcriture" sortOrder={1}>
              <Column field="codeJournal" header="Journal" style={{ width: '8%' }} sortable />
              <Column field="numeroPiece" header="N° Pièce" style={{ width: '8%' }} sortable />
              <Column field="codeCompte" header="Compte" style={{ width: '10%' }} sortable />
              <Column field="libelle" header="Libellé" style={{ width: '25%' }} />
              <Column field="dateEcriture" header="Date" body={(r: CptEcriture) => r.printDate || formatDate(r.dateEcriture)} style={{ width: '10%' }} sortable />
              <Column field="reference" header="Référence" style={{ width: '10%' }} />
              <Column field="debit" header="Débit" style={{ width: '12%', textAlign: 'right' }} sortable
                body={(r: CptEcriture) => r.debit ? <span className="text-blue-500 font-bold">{r.debit.toLocaleString('fr-FR')}</span> : <span>-</span>} />
              <Column field="credit" header="Crédit" style={{ width: '12%', textAlign: 'right' }} sortable
                body={(r: CptEcriture) => r.credit ? <span className="text-green-500 font-bold">{r.credit.toLocaleString('fr-FR')}</span> : <span>-</span>} />
              <Column field="valide" header="Statut" style={{ width: '5%' }}
                body={(r: CptEcriture) => <Tag value={r.valide ? 'Validé' : 'Brouillon'} severity={r.valide ? 'success' : 'warning'} />} />
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_ENTRY_CREATE']}>
            <CptEcritureComponent />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
