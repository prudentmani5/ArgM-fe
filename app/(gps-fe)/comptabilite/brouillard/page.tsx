'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { FilterMatchMode } from 'primereact/api';

import CptBrouillardForm from './CptBrouillardForm';
import { CptBrouillard } from './CptBrouillard';
import { CptJournal } from '../journal/CptJournal';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { CptExercice } from '../exercice/CptExercice';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../../../utils/apiConfig';

function CptBrouillardComponent() {
  const [brouillard, setBrouillard] = useState<CptBrouillard>(new CptBrouillard());
  const [brouillardEdit, setBrouillardEdit] = useState<CptBrouillard>(new CptBrouillard());
  const [editDialog, setEditDialog] = useState(false);
  const [brouillards, setBrouillards] = useState<CptBrouillard[]>([]);
  const [journaux, setJournaux] = useState<CptJournal[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, loading, error, fetchData, callType } = useConsumApi('');
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);

  // Toast helper
  const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  // Utils date
  const parseFrDate = (value: string): string => {
    if (!value) return '';
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  };

  const isoToFr = (value: string): string => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDate = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  // Load current exercice from cookies
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

  // Load journaux once
  useEffect(() => {
    fetchData(null, 'Get', `${API_BASE_URL}/brouillards/findJournaux`, 'loadAllJournaux');
  }, []);

  // Handle API responses
  useEffect(() => {
    if (data) {
      if (callType === 'loadCptBrouillards') setBrouillards(Array.isArray(data) ? data : [data]);
      if (callType === 'loadAllJournaux') setJournaux(data);
      handleAfterApiCall(activeIndex);
    }
  }, [data]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBrouillard(prev => ({
      ...prev,
      [name]: ['exerciceId', 'dossierId', 'journalId'].includes(name) ? parseInt(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setBrouillard(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name: string, value: string) => {
    setBrouillard(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBrouillardEdit(prev => ({
      ...prev,
      [name]: ['exerciceId', 'dossierId', 'journalId'].includes(name) ? parseInt(value) : value
    }));
  };

  const handleCheckboxChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setBrouillardEdit(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChangeEdit = (name: string, value: string) => {
    setBrouillardEdit(prev => ({ ...prev, [name]: value }));
  };

  const prepareBrouillardForSubmit = (b: CptBrouillard) => ({
    ...b,
    dateDebut: b.dateDebut ? parseFrDate(b.dateDebut) : '',
    dateFin: b.dateFin ? parseFrDate(b.dateFin) : ''
  });

  const handleSubmit = () => {
    setBtnLoading(true);
    if (!brouillard.codeBrouillard?.trim()) {
      accept('warn', 'A votre attention', 'Veuillez mettre le code.');
      setBtnLoading(false);
      return;
    }
    fetchData(prepareBrouillardForSubmit(brouillard), 'Post', `${API_BASE_URL}/brouillards/new`, 'createCptBrouillard');
  };

  const handleSubmitEdit = () => {
    setBtnLoading(true);
    fetchData(
      prepareBrouillardForSubmit(brouillardEdit),
      'Put',
      `${API_BASE_URL}/brouillards/update/${brouillardEdit.brouillardId}`,
      'updateCptBrouillard'
    );
  };

  const handleAfterApiCall = (chosenTab: number) => {
    if (error && chosenTab === 0) {
      accept('warn', 'Attention', callType === 'updateCptBrouillard' ? 'La mise à jour a échoué.' : "L'enregistrement a échoué.");
    } else if (data && !error) {
      if (callType === 'createCptBrouillard') {
        setBrouillard(new CptBrouillard());
        accept('info', 'OK', "L'enregistrement a été effectué avec succès.");
      } else if (callType === 'updateCptBrouillard') {
        setBrouillardEdit(new CptBrouillard());
        setEditDialog(false);
        loadAllData();
        accept('info', 'OK', 'Modification réussie.');
      }
    }
    setBtnLoading(false);
  };

  const loadAllData = () => {
    if (currentExercice && currentExercice.exerciceId) {
      fetchData(null, 'Get', `${API_BASE_URL}/brouillards/findbyexercice/${currentExercice.exerciceId}`, 'loadCptBrouillards');
    } else {
      fetchData(null, 'Get', `${API_BASE_URL}/brouillards/findall`, 'loadCptBrouillards');
    }
  };

  const loadToEdit = (data: CptBrouillard) => {
    setBrouillardEdit({
      ...data,
      dateDebut: isoToFr(data.dateDebut),
      dateFin: isoToFr(data.dateFin)
    });
    setEditDialog(true);
  };

  const optionButtons = (data: CptBrouillard): React.ReactNode => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" onClick={() => loadToEdit(data)} raised severity="warning" />
    </div>
  );

  const tableChangeHandle = (e: any) => {
    if (e.index === 1) loadAllData();
    setActiveIndex(e.index);
  };

  const onDropdownSelect = (e: DropdownChangeEvent) => {
    setBrouillard(prev => ({ ...prev, [e.target.name]: e.value }));
  };

  const onDropdownSelectEdit = (e: DropdownChangeEvent) => {
    setBrouillardEdit(prev => ({ ...prev, [e.target.name]: e.value }));
  };

  const valideBodyTemplate = (rowData: CptBrouillard) => <Checkbox checked={rowData.valide} disabled />;

  const onGlobalFilterChange = (e: any) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderSearch = (
    <span className="p-input-icon-left">
      <i className="pi pi-search" />
      <InputText
        value={globalFilterValue}
        onChange={onGlobalFilterChange}
        placeholder="Recherche par code ou libellé"
        style={{ width: '350px' }}
      />
    </span>
  );

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        header="Modifier Brouillard"
        visible={editDialog}
        style={{ width: '60vw' }}
        modal
        onHide={() => setEditDialog(false)}
      >
        <CptBrouillardForm
          brouillard={brouillardEdit}
          handleChange={handleChangeEdit}
          handleCheckboxChange={handleCheckboxChangeEdit}
          handleDateChange={handleDateChangeEdit}
          journaux={journaux}
          handleDropDownSelect={onDropdownSelectEdit}
        />
        <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
      </Dialog>

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
                    setCurrentExercice(JSON.parse(savedExercice));
                    loadAllData();
                  } catch (e) {
                    console.error('Error parsing currentExercice:', e);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
        <TabPanel header="Nouveau">
          <CptBrouillardForm
            brouillard={brouillard}
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
            handleDateChange={handleDateChange}
            journaux={journaux}
            handleDropDownSelect={onDropdownSelect}
          />
          <div className="card p-fluid">
            <div className="formgrid grid">
              <div className="md:col-offset-3 md:field md:col-3">
                <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setBrouillard(new CptBrouillard())} />
              </div>
              <div className="md:field md:col-3">
                <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Tous">
          <div className="grid">
            <div className="col-12">
              <div className="card">
                <DataTable
                  value={brouillards}
                  header={renderSearch}
                  emptyMessage="Aucun brouillard à afficher"
                  paginator
                  rows={10}
                  rowsPerPageOptions={[10, 20, 30]}
                  filters={filters}
                  globalFilterFields={['codeBrouillard', 'description']}
                >
                  <Column field="codeBrouillard" header="Code" />
                  <Column field="description" header="Description" />
                  <Column field="dateDebut" header="Début" body={(rowData) => formatDate(rowData.dateDebut)} />
                  <Column field="dateFin" header="Fin" body={(rowData) => formatDate(rowData.dateFin)} />
                  <Column header="valide" body={valideBodyTemplate} />
                  <Column header="Options" body={optionButtons} />
                </DataTable>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </>
  );
}

export default CptBrouillardComponent;
