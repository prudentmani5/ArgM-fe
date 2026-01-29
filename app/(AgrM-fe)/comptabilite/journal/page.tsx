'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import CptJournalForm from './CptJournalForm';
import { CptJournal } from './CptJournal';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { FilterMatchMode } from 'primereact/api';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { CptExercice } from '../exercice/CptExercice';


function CptJournalComponent() {
  const [journal, setJournal] = useState<CptJournal>(new CptJournal());
  const [journalEdit, setJournalEdit] = useState<CptJournal>(new CptJournal());
  const [editDialog, setEditDialog] = useState(false);
  const [journaux, setJournaux] = useState<CptJournal[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, loading, error, fetchData, callType } = useConsumApi('');
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
    toast.current?.show({ severity: sever, summary: summa, detail: det, life: 3000 });
  };

  useEffect(() => {
    if (data) {
      if (callType === 'loadCptJournaux') {
        setJournaux(Array.isArray(data) ? data : [data]);
      }
      handleAfterApiCall(activeIndex);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJournal((prev) => ({ ...prev, [name]: name === 'dossierId' ? parseInt(value) : value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setJournal((prev) => ({ ...prev, [name]: checked }));
  };

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJournalEdit((prev) => ({ ...prev, [name]: name === 'dossierId' ? parseInt(value) : value }));
  };

  const handleCheckboxChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setJournalEdit((prev) => ({ ...prev, [name]: checked }));
  };
const handleDropdownChangeEdit = (e:DropdownChangeEvent) => {
        setJournalEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
const handleDropdownChange = (e:DropdownChangeEvent) => {
        setJournal((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
  const handleSubmit = () => {
    setBtnLoading(true);
    fetchData(journal, 'Post', `${API_BASE_URL}/journaux/new`, 'createCptJournal');
  };

  const handleSubmitEdit = () => {
    setBtnLoading(true);
    fetchData(journalEdit, 'Put', `${API_BASE_URL}/journaux/update/${journalEdit.journalId}`, 'updateCptJournal');
  };

  const handleAfterApiCall = (chosenTab: number) => {
    if (error !== null && chosenTab === 0) {
      accept('warn', 'Attention', callType === 'updateCptJournal' ? "La mise à jour a échoué." : "L'enregistrement a échoué.");
    } else if (data !== null && error === null) {
      if (callType === 'createCptJournal') {
        setJournal(new CptJournal());
        accept('info', 'OK', "L'enregistrement a été effectué avec succès.");
      } else if (callType === 'updateCptJournal') {
        setJournalEdit(new CptJournal());
        setEditDialog(false);
        loadAllData();
        accept('info', 'OK', 'Modification réussie.');
      }
    }
    setBtnLoading(false);
  };

  const loadAllData = () => {
    fetchData(null, 'Get', `${API_BASE_URL}/journaux/findall`, 'loadCptJournaux');
  };

  const loadToEdit = (data: CptJournal) => {
    setEditDialog(true);
    setJournalEdit(data);
  };

   const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  const onGlobalFilterChange = (e) => {
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


  const optionButtons = (data: CptJournal): React.ReactNode => {
    return (
      <div className='flex gap-2'>
        <Button icon="pi pi-pencil" onClick={() => loadToEdit(data)} raised severity='warning' />
      </div>
    );
  };

  const tableChangeHandle = (e: any) => {
    if (e.index === 1) loadAllData();
    setActiveIndex(e.index);
  };

  return (
    <>
      <Toast ref={toast} />

      <Dialog header="Modifier Journal" visible={editDialog} style={{ width: '50vw' }} modal onHide={() => setEditDialog(false)}>
        <CptJournalForm journal={journalEdit} handleChange={handleChangeEdit} handleCheckboxChange={handleCheckboxChangeEdit} 
        handleDropdownChange={handleDropdownChangeEdit}/>
        <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
      </Dialog>

      <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
        <TabPanel header="Nouveau">
          <CptJournalForm journal={journal} handleChange={handleChange} handleCheckboxChange={handleCheckboxChange} 
          handleDropdownChange={handleDropdownChange}/>
          <div className="card p-fluid">
            <div className="formgrid grid">
              <div className="md:col-offset-3 md:field md:col-3">
                <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setJournal(new CptJournal())} />
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
                <DataTable value={journaux} header={renderSearch} 
                emptyMessage={"Aucun journal à afficher"}  
                paginator rows={10} rowsPerPageOptions={[10, 20, 30]}
                  filters={filters}
                 globalFilterFields={['codeJournal', 'nomJournal']}   
                >
                  <Column field="codeJournal" header="Code Journal" />
                  <Column field="nomJournal" header="Nom Journal" />
                  <Column field="typeJournal" header="Type" />
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

export default CptJournalComponent;
