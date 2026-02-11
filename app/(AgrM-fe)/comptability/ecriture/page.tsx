'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptEcriture, CptBrouillard, CptCompte, CptExercice } from '../types';
import Cookies from 'js-cookie';

const CptEcritureComponent: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [ecriture, setEcriture] = useState<CptEcriture>(new CptEcriture());
  const [brouillards, setBrouillards] = useState<CptBrouillard[]>([]);
  const [comptes, setComptes] = useState<CptCompte[]>([]);
  const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
  const [ecritures, setEcritures] = useState<CptEcriture[]>([]);
  const [selectedEcritures, setSelectedEcritures] = useState<CptEcriture[]>([]);

  const { data, fetchData, callType, error } = useConsumApi('');
  const { data: dataBrd, fetchData: brdFetchData } = useConsumApi('');
  const { data: dataCpt, fetchData: cptFetchData } = useConsumApi('');
  const { data: dataNumPce, fetchData: numPceFetchData } = useConsumApi('');

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

  const handleDateChange = (name: string, value: string) => {
    const [jj, mm, aa] = value.split('/');
    const iso = aa && mm && jj ? `${aa}-${mm}-${jj}` : '';
    setEcriture({ ...ecriture, [name]: value, dateEcriture: iso });
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
    if (selected.dateEcriture) {
      try {
        const isoDate = selected.dateEcriture.includes(' ') ? selected.dateEcriture.split(' ')[0] : selected.dateEcriture;
        const [year, month, day] = isoDate.split('-');
        formattedDate = `${day}/${month}/${year}`;
      } catch { formattedDate = ''; }
    }
    setEcriture({ ...selected, printDate: formattedDate });
  };

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) =>
    toast.current?.show({ severity, summary, detail, life: 3000 });

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

  // Compute totals
  const totalDebit = ecritures.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = ecritures.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const solde = totalDebit - totalCredit;

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
            <InputMask mask="99/99/9999" value={ecriture.printDate || ''} placeholder="jj/mm/aaaa"
              onChange={(e) => handleDateChange('printDate', e.target.value || '')} />
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
    </div>
  );
};

export default CptEcritureComponent;
