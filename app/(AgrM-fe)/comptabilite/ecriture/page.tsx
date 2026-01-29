'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { CptEcriture } from './CptEcriture';
import { CptBrouillard } from '../brouillard/CptBrouillard';
import { CptCompte } from '../compte/CptCompte';
import CptEcritureForm from './CptEcritureForm';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { CptExercice } from '../exercice/CptExercice';
import Cookies from 'js-cookie';
import { AppUserResponse } from '../../usermanagement/types';
import { API_BASE_URL } from '../../../../utils/apiConfig';

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


  const apiUrl = `${API_BASE_URL}/ecritures`;

  // Utility function to format dates
  const formatDate = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const loadAllBrouillards = (exerciceId?: string) => {
    const url = exerciceId
      ? `${apiUrl}/findListBrouillard?exerciceId=${encodeURIComponent(exerciceId)}`
      : `${apiUrl}/findListBrouillard`;
    console.log('🔍 Loading brouillards with URL:', url);
    brdFetchData(null, 'Get', url, 'loadBrouillards');
  };

  const loadAllComptes = () => cptFetchData(null, 'Get', `${apiUrl}/findListCompte`, 'loadComptes');

  useEffect(() => {
    // Load current exercice from cookies
    const savedExercice = Cookies.get('currentExercice');

    getUserFromCookies();


    if (savedExercice) {
      try {
        const exercice = JSON.parse(savedExercice);
        setCurrentExercice(exercice);
        // Load brouillards filtered by exercice
        loadAllBrouillards(exercice.exerciceId);
      } catch (e) {
        console.error('Error parsing currentExercice:', e);
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
      const numeros = listePiece.map(num => Number(num)).filter(n => !isNaN(n));
      const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
      const nouveauNumero = maxNumero + 1;

      setEcriture((prev) => ({
        ...prev,
        numeroPiece: nouveauNumero.toString(),
      }));
    }
  }, [dataNumPce, ecriture.brouillardId]);

  const getUserFromCookies = (): AppUserResponse | null => {
    try {
      const appUserCookie = Cookies.get('appUser');

      if (!appUserCookie) {
        return null;
      }

      const parsedUser = JSON.parse(appUserCookie);
      ecriture.userCreation = parsedUser['firstname'];

      return parsedUser;
    } catch (err) {
      console.error('Error parsing user from cookies:', err);

      return null;
    }
  };

  const loadEcritures = (brouillardId: string, numeroPiece: string) => {
    console.log('🔍 loadEcritures called with:', { brouillardId, numeroPiece });

    let params: string[] = [];

    if (!brouillardId || !numeroPiece) {
      console.warn('⚠️ Missing brouillardId or numeroPiece, clearing ecritures');
      setEcritures([]);
      return;
    }

    // Add exerciceId if available
    if (currentExercice && currentExercice.exerciceId) {
      params.push(`exerciceId=${encodeURIComponent(currentExercice.exerciceId)}`);
      console.log('✅ Added exerciceId:', currentExercice.exerciceId);
    } else {
      console.warn('⚠️ No currentExercice or exerciceId available');
    }

    if (brouillardId) {
      params.push(`brouillardId=${encodeURIComponent(brouillardId)}`);
      console.log('✅ Added brouillardId:', brouillardId);
    }

    if (numeroPiece) {
      params.push(`numeroPiece=${encodeURIComponent(numeroPiece)}`);
      console.log('✅ Added numeroPiece:', numeroPiece);
    }

    const url = apiUrl + '/findList/' + (params.length > 0 ? '?' + params.join('&') : '');
    console.log('🌐 Final URL:', url);
    console.log('📤 Calling fetchData with method: Get');

    fetchData(null, 'Get', `${url}`, 'loadCptEcritures');
  };



  // handleChange for InputText (e.target.value)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEcriture({ ...ecriture, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name: string, value: string) => {
    const [jj, mm, aa] = value.split('/');
    const iso = aa && mm && jj ? `${aa}-${mm}-${jj}` : '';
    setEcriture({ ...ecriture, [name]: value, dateEcriture: iso });
  };

  const handleNumberChange = (name: string, value: number | null) => {
    setEcriture({ ...ecriture, [name]: value ?? 0 });
  };

  const handleBrdDropDownSelect = (e: any) => {
    const selected = brouillards.find((b) => b.brouillardId === e.value);
    setEcriture({
      ...ecriture,
      brouillardId: e.value,
      codeJournal: selected?.codeJournal || '',
      journalId: selected?.journalId || ''
    });

    console.log("Brouillards:", brouillards);

    searchNumeroPiece(selected?.brouillardId);
  };

  const handleCptDropDownSelect = (e: any) => {
    const selected = comptes.find((c) => c.compteId === e.value);
    setEcriture({
      ...ecriture,
      compteId: e.value,
      codeCompte: selected?.codeCompte || ''
    });
  };

  const handlePieceBlur = () => {
    loadEcritures(ecriture.brouillardId, ecriture.numeroPiece);

  };
  const searchNumeroPiece = (brd: any) => {

    if (brd) {
      let params: string[] = [];

      params.push(`brouillardId=${encodeURIComponent(brd)}`);
      const url = apiUrl + '/findListeNum' + (params.length > 0 ? '?' + params.join('&') : '');
      numPceFetchData(null, 'Get', `${url}`, 'loadNumero');


    }


  };

  const handleDeleteNumeroPiece = () => {

    if (ecriture.numeroPiece && ecriture.brouillardId) {
      let params: string[] = [];
      let pieceId = ecriture.numeroPiece + ecriture.journalId + ecriture.brouillardId;
      console.log("BROUILLARD === " + ecriture.numeroPiece + ecriture.journalId + ecriture.brouillardId);
      params.push(`idPiece=${encodeURIComponent(pieceId)}`);
      const url = apiUrl + '/deletePiece' + (params.length > 0 ? '?' + params.join('&') : '');
      confirmDialog({
        message: `Êtes-vous sûr de vouloir supprimer cette pièce ?`,
        header: 'Confirmation de suppression',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui',
        rejectLabel: 'Non',
        accept: () => {
          fetchData(null, 'Delete', `${url}`, 'deleteNumero');
          //searchNumeroPiece(ecriture.brouillardId);
          showToast('success', 'Supprimée', 'Pièce supprimée avec succès.');
        }
      });



    }
    else
      showToast('warn', 'Erreur', 'Veuillez preciser le brouillard et le numero piece');


  };

  const handleSubmit = async () => {
    if (!ecriture.dateEcriture || !ecriture.compteId || (!ecriture.debit && !ecriture.credit)) {
      return showToast('warn', 'Champs manquants', 'Veuillez saisir date, compte et montant.');
    }

    // Ensure exerciceId is set from currentExercice
    const ecritureToSubmit = {
      ...ecriture,
      exerciceId: currentExercice?.exerciceId || ecriture.exerciceId
    };

    console.log('📤 Submitting ecriture with exerciceId:', ecritureToSubmit.exerciceId);
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
    if (!ecriture.ecritureId) {
      return showToast('warn', 'Aucune sélection', 'Sélectionnez une écriture à supprimer.');
    }
    fetchData(ecriture, 'Delete', `${apiUrl}/delete/${ecriture.ecritureId}`, 'deleteEcriture');

    showToast('success', 'Supprimée', 'Écriture supprimée.');
    handleReset();
    loadEcritures(ecriture.brouillardId, ecriture.numeroPiece);
  };

  const handleReset = () => {
    setEcriture((prev) => ({
      ...new CptEcriture(),
      brouillardId: prev.brouillardId,
      codeJournal: prev.codeJournal,
      journalId: prev.journalId,
      numeroPiece: prev.numeroPiece,
      reference: prev.reference,
      dateEcriture: prev.dateEcriture,
      dateEcritureStr: prev.printDate,
      libelle: prev.libelle,
      printDate: prev.printDate
    }));

  };

  const handleAutoEcriture = () => {
    if (ecritures && ecritures.length > 0) {

      // Calcul du solde : somme(debit - credit)
      const solde = ecritures.reduce((total, e) => {
        const debit = e.debit ? Number(e.debit) : 0;
        const credit = e.credit ? Number(e.credit) : 0;
        return total + (debit - credit);
      }, 0);

      if (solde !== 0) {
       

        ecriture.debit = solde < 0 ? -solde : 0;
        ecriture.credit = solde > 0 ? solde : 0;

        if (!ecriture.dateEcriture || !ecriture.compteId || (!ecriture.debit && !ecriture.credit)) {
          return showToast('warn', 'Champs manquants', 'Veuillez saisir date, compte et montant.');
        }

        // Ensure exerciceId is set from currentExercice
        const ecritureToSubmit = {
          ...ecriture,
          exerciceId: currentExercice?.exerciceId || ecriture.exerciceId
        };

        fetchData(ecritureToSubmit, 'Post', `${apiUrl}/new`, 'createEcriture');
        handleReset();
        loadEcritures(ecriture.brouillardId, ecriture.numeroPiece);
        showToast('success', 'Créé', 'Écriture enregistrée avec succès.');
      }


    }
  }

  const initializeEcriture = () => {

    // Vérifier si la liste contient des écritures
    if (ecritures && ecritures.length > 0) {

      // Calcul du solde : somme(debit - credit)
      const solde = ecritures.reduce((total, e) => {
        const debit = e.debit ? Number(e.debit) : 0;
        const credit = e.credit ? Number(e.credit) : 0;
        return total + (debit - credit);
      }, 0);

      console.log("Solde des écritures =", solde);

      // Tu peux afficher un message, bloquer, ou confirmer
      if (solde !== 0) {
        // Exemple : afficher un toast ou bloquer la réinitialisation
        showToast("warn", "Opération non équilibrée", `Impossible de réinitialiser. Solde = ${solde.toLocaleString('fr-FR')}`);
        return; // Stop ici
      }
    }

    // Si liste vide ou solde = 0 → on réinitialise
    setEcriture(new CptEcriture());
    setEcritures([]);
  };

  const handelSavePiece = () => {
    if (!ecriture.reference) {
      return showToast('warn', 'Référence', 'Préciser la référence une pièce.');
    }
    if (!ecriture.brouillardId) {
      return showToast('warn', 'Brouillard', 'Préciser le brouillard.');
    }
    if (!ecriture.numeroPiece) {
      return showToast('warn', 'Numéro', 'Préciser le Numéro pièce.');
    }
    if (!ecriture.dateEcriture) {
      return showToast('warn', 'Numéro', 'Préciser la date de la piece.');
    }


    fetchData(ecriture, 'Post', `${apiUrl}/newPiece`, 'createPiece');
    handleReset();
    setEcritures([]);
    showToast('success', 'Créé', 'Pièce enregistrée avec succès.');

  }
  const onRowSelect = (e: any) => {
    const selected = e.data as CptEcriture;

    if (!selected) {
      console.warn('⚠️ No row selected');
      return;
    }

    let formattedDate = "";

    if (selected.dateEcriture) {
      try {
        // Nettoyer la date : garder seulement AAAA-MM-JJ
        const isoDate =
          selected.dateEcriture.includes(" ")
            ? selected.dateEcriture.split(" ")[0]
            : selected.dateEcriture;

        // Décomposer
        const [year, month, day] = isoDate.split("-");

        // Formater en français
        formattedDate = `${day}/${month}/${year}`;
      } catch (error) {
        console.error("❌ Erreur parsing date:", error);
        formattedDate = "";
      }
    }

    setEcriture({
      ...selected,
      printDate: formattedDate,
    });

    console.log("Date formatée =", formattedDate);
  };

  const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) =>
    toast.current?.show({ severity, summary, detail, life: 3000 });

  // Handle edit action from DataTable
  const handleEditAction = (rowData: CptEcriture) => {
    onRowSelect({ data: rowData });
  };

  // Handle delete action from DataTable with confirmation
  const handleDeleteAction = (rowData: CptEcriture) => {


    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer cette écriture ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        fetchData(rowData, 'Delete', `${apiUrl}/delete/${rowData.ecritureId}`, 'deleteEcriture');
        loadEcritures(rowData.brouillardId, rowData.numeroPiece);
        showToast('success', 'Supprimée', 'Écriture supprimée avec succès.');
      }
    });
  };

  const deleteSelectedEcritures = () => {
    if (!selectedEcritures || selectedEcritures.length === 0) {
      showToast("warn", "Aucune ligne sélectionnée", "Veuillez sélectionner au moins une écriture");
      return;
    }
    const ids = selectedEcritures.map((e) => e.ecritureId);
    let params: string[] = [];
    ids.forEach(id => params.push(`ids=${encodeURIComponent(id)}`));
    const url = `${apiUrl}/deleteList?${params.join("&")}`;

    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer ces écritures ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {

        fetchData(null, 'Delete', url, 'deleteEcriture');

        const newList = ecritures.filter(e => !ids.includes(e.ecritureId));
        setEcritures(newList);          // mettre à jour la liste
        setSelectedEcritures([]);       // vider la sélection

        showToast("success", "Suppression réussie", "Les écritures sélectionnées ont été supprimées");
      }
    });



  };

  // Action column template
  const actionBodyTemplate = (rowData: CptEcriture) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleEditAction(rowData)}
          tooltip="Modifier"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDeleteAction(rowData)}
          tooltip="Supprimer"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  return (
    <div className="card p-3 mt-2">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Display current exercice */}
      <div className="card mb-3" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #2196F3' }}>
        <div className="flex align-items-center justify-content-between p-3">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-calendar text-2xl text-primary"></i>
            <div>
              <div className="font-bold text-lg">
                {currentExercice ? (
                  <>
                    Exercice en cours: <span className="text-primary">{currentExercice.codeExercice}</span>
                  </>
                ) : (
                  <span className="text-orange-500">Aucun exercice sélectionné</span>
                )}
              </div>
              {currentExercice && (
                <div className="text-sm text-600">
                  {currentExercice.description} - Du {formatDate(currentExercice.dateDebut)} au {formatDate(currentExercice.dateFin)}
                </div>
              )}
            </div>
          </div>
          <div className="flex align-items-center gap-2">
            {!currentExercice && (
              <div className="flex align-items-center gap-2 text-orange-500 mr-3">
                <i className="pi pi-exclamation-triangle"></i>
                <span className="text-sm">Veuillez sélectionner un exercice depuis le menu utilisateur</span>
              </div>
            )}
            <Button
              icon="pi pi-refresh"
              label="Actualiser"
              size="small"
              outlined
              onClick={() => {
                const savedExercice = Cookies.get('currentExercice');
                if (savedExercice) {
                  try {
                    const exercice = JSON.parse(savedExercice);
                    setCurrentExercice(exercice);
                    // loadEcritures();
                    loadAllBrouillards(exercice.exerciceId);
                  } catch (e) {
                    console.error('Error parsing currentExercice:', e);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <CptEcritureForm
        ecriture={ecriture}
        brouillards={brouillards}
        comptes={comptes}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleNumberChange={handleNumberChange}
        handleBrdDropDownSelect={handleBrdDropDownSelect}
        handleCptDropDownSelect={handleCptDropDownSelect}
        handleSubmit={handleSubmit}
        handleReset={initializeEcriture}
        handleDelete={handleDelete}
        handlePieceBlur={handlePieceBlur}
        handelSavePiece={handelSavePiece}
        handelNumeroPiece={searchNumeroPiece}
        handelDeletePiece={handleDeleteNumeroPiece}
        handelDeleteList={deleteSelectedEcritures}
        handleAutoEquilibre={handleAutoEcriture}
      />

      <div className="card mt-3">
        <DataTable
          value={ecritures}
          showGridlines
          stripedRows
          dataKey="ecritureId"
          emptyMessage="Aucune information à afficher"
          size="small"
          scrollable
          scrollHeight="450px"
          selection={selectedEcritures}
          onSelectionChange={(e) => setSelectedEcritures(e.value)}
          selectionMode="multiple"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3%' }} />
          <Column field="codeCompte" header="Compte" style={{ width: '10%' }} />
          <Column field="libelle" header="Libellé" style={{ width: '30%' }} />
          <Column
            field="dateEcriture"
            header="Date"
            body={(rowData) => rowData.printDate}
            style={{ width: '10%' }} />
          <Column
            field="debit"
            header="Débit"
            style={{ width: '13%', textAlign: 'right' }}
            body={(rowData) => rowData.debit ? rowData.debit.toLocaleString('fr-FR') : '0'}
          />
          <Column
            field="credit"
            header="Crédit"
            style={{ width: '13%', textAlign: 'right' }}
            body={(rowData) => rowData.credit ? rowData.credit.toLocaleString('fr-FR') : '0'}
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            style={{ width: '10%' }}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default CptEcritureComponent;
