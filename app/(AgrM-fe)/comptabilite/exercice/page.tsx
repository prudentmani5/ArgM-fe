'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import CptExerciceForm from './CptExerciceForm';
import { CptExercice } from './CptExercice';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';

function CptExerciceComponent() {
  const [exercice, setExercice] = useState<CptExercice>(new CptExercice());
  const [exerciceEdit, setExerciceEdit] = useState<CptExercice>(new CptExercice());
  const [editDialog, setEditDialog] = useState(false);
  const [exercices, setExercices] = useState<CptExercice[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, loading, error, fetchData, callType } = useConsumApi('');
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  useEffect(() => {
    if (data) {
      if (callType === 'loadCptExercices') {
        setExercices(Array.isArray(data) ? data : [data]);
      }
      handleAfterApiCall(activeIndex);
    }
  }, [data]);

  // FR -> ISO pour le backend
  const parseFrDate = (value: string): string => {
    if (!value) return '';
    const parts = value.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  };

  // ISO -> FR pour InputMask
  const isoToFr = (value: string): string => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDate = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  };

  // Handlers génériques
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExercice(prev => ({ ...prev, [name]: name === 'dossierId' ? parseInt(value) : value }));
  };

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExerciceEdit(prev => ({ ...prev, [name]: name === 'dossierId' ? parseInt(value) : value }));
  };

  const handleDateChange = (name: string, value: string) => {
    setExercice(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChangeEdit = (name: string, value: string) => {
    setExerciceEdit(prev => ({ ...prev, [name]: value }));
  };

  const prepareExerciceForSubmit = (ex: CptExercice) => ({
    ...ex,
    dateDebut: ex.dateDebut ? parseFrDate(ex.dateDebut) : '',
    dateFin: ex.dateFin ? parseFrDate(ex.dateFin) : '',
    dateCloture: ex.dateCloture ? parseFrDate(ex.dateCloture) : ''
  });

  const handleSubmit = () => {
    setBtnLoading(true);
    fetchData(prepareExerciceForSubmit(exercice), 'Post', `${API_BASE_URL}/exercices/new`, 'createCptExercice');
  };

  const handleSubmitEdit = () => {
    setBtnLoading(true);
    fetchData(prepareExerciceForSubmit(exerciceEdit), 'Put', `${API_BASE_URL}/exercices/update/${exerciceEdit.exerciceId}`, 'updateCptExercice');
  };

  const handleAfterApiCall = (chosenTab: number) => {
    if (error !== null && chosenTab === 0) {
      accept('warn', 'Attention', callType === 'updateCptExercice' ? "La mise à jour a échoué." : "L'enregistrement a échoué.");
    } else if (data !== null && error === null) {
      if (callType === 'createCptExercice') {
        setExercice(new CptExercice());
        accept('info', 'OK', "L'enregistrement a été effectué avec succès.");
      } else if (callType === 'updateCptExercice') {
        setExerciceEdit(new CptExercice());
        setEditDialog(false);
        loadAllData();
        accept('info', 'OK', 'Modification réussie.');
      }
    }
    setBtnLoading(false);
  };

  const loadAllData = () => {
    fetchData(null, 'Get', `${API_BASE_URL}/exercices/findall`, 'loadCptExercices');
  };

  // Chargement pour édition
  const loadToEdit = (data: CptExercice) => {
    setExerciceEdit({
      ...data,
      dateDebut: isoToFr(data.dateDebut),
      dateFin: isoToFr(data.dateFin),
      dateCloture: isoToFr(data.dateCloture)
    });
    setEditDialog(true);
  };

  const renderSearch = () => (
    <div className="flex justify-content-between">
      <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={loadAllData} />
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText placeholder="Recherche" />
      </span>
    </div>
  );

  const optionButtons = (data: CptExercice): React.ReactNode => (
    <div className='flex gap-2'>
      <Button icon="pi pi-pencil" onClick={() => loadToEdit(data)} raised severity='warning' />
    </div>
  );

  const tableChangeHandle = (e: any) => {
    if (e.index === 1) loadAllData();
    setActiveIndex(e.index);
  };

  return (
    <>
      <Toast ref={toast} />

      {/* Dialog édition */}
      <Dialog header="Modifier Exercice" visible={editDialog} style={{ width: '50vw' }} modal onHide={() => setEditDialog(false)}>
        <CptExerciceForm
          exercice={exerciceEdit}
          handleChange={handleChangeEdit}
          handleDateChange={handleDateChangeEdit}
        />
        <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
      </Dialog>

      <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
        <TabPanel header="Nouveau">
          <CptExerciceForm
            exercice={exercice}
            handleChange={handleChange}
            handleDateChange={handleDateChange}
          />
          <div className="card p-fluid">
            <div className="formgrid grid">
              <div className="md:col-offset-3 md:field md:col-3">
                <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setExercice(new CptExercice())} />
              </div>
              <div className="md:field md:col-3">
                <Button icon="pi pi-check" label="Enregistrer" loading={loading} onClick={handleSubmit} />
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Tous">
          <div className='grid'>
            <div className='col-12'>
              <div className='card'>
                <DataTable value={exercices} header={renderSearch} emptyMessage={"Aucun exercice à afficher"}
                  paginator rows={10} rowsPerPageOptions={[10, 20, 30]}>
                  <Column field="codeExercice" header="Code" />
                  <Column field="description" header="Description" />
                  <Column field="dateDebut" header="Début" body={(rowData) => formatDate(rowData.dateDebut)} />
                  <Column field="dateFin" header="Fin" body={(rowData) => formatDate(rowData.dateFin)} />
                  <Column field="dateCloture" header="Clôture" body={(rowData) => formatDate(rowData.dateCloture)} />
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

export default CptExerciceComponent;
