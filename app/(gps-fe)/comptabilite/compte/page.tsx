'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import CptCompteForm from './CptCompteForm';
import { CptCompte } from './CptCompte';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { FilterMatchMode } from 'primereact/api';
import { API_BASE_URL } from '../../../../utils/apiConfig';


function CptCompteComponent() {
  const [compte, setCompte] = useState<CptCompte>(new CptCompte());
  const [compteEdit, setCompteEdit] = useState<CptCompte>(new CptCompte());
  const [editDialog, setEditDialog] = useState(false);
  const [comptes, setComptes] = useState<CptCompte[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, loading, error, fetchData, callType } = useConsumApi('');
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

 

  const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
    toast.current?.show({ severity: sever, summary: summa, detail: det, life: 3000 });
  };

  useEffect(() => {
    if (data) {
      if (callType === 'loadCptComptes') {
        setComptes(Array.isArray(data) ? data : [data]);
      }
      handleAfterApiCall(activeIndex);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompte((prev) => ({ ...prev, [name]: name === 'dossierId' || name === 'typeCompte' ? parseInt(value) : value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCompte((prev) => ({ ...prev, [name]: checked }));
  };

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompteEdit((prev) => ({ ...prev, [name]: name === 'dossierId' || name === 'typeCompte' ? parseInt(value) : value }));
  };

  const handleCheckboxChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCompteEdit((prev) => ({ ...prev, [name]: checked }));
  };
const handleDropdownChangeEdit = (e:DropdownChangeEvent) => {
        setCompteEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
const handleDropdownChange = (e:DropdownChangeEvent) => {
        setCompte((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

  const handleSubmit = () => {
    setBtnLoading(true);
    fetchData(compte, 'Post', `${API_BASE_URL}/comptes/new`, 'createCptCompte');
  };

  const handleSubmitEdit = () => {
    setBtnLoading(true);
    fetchData(compteEdit, 'Put', `${API_BASE_URL}/comptes/update/${compteEdit.compteId}`, 'updateCptCompte');
  };

  const handleAfterApiCall = (chosenTab: number) => {
    if (error !== null && chosenTab === 0) {
      accept('warn', 'Attention', callType === 'updateCptCompte' ? "La mise à jour a échoué." : "L'enregistrement a échoué.");
    } else if (data !== null && error === null) {
      if (callType === 'createCptCompte') {
        setCompte(new CptCompte());
        accept('info', 'OK', "L'enregistrement a été effectué avec succès.");
      } else if (callType === 'updateCptCompte') {
        setCompteEdit(new CptCompte());
        setEditDialog(false);
        loadAllData();
        accept('info', 'OK', 'Modification réussie.');
      }
    }
    setBtnLoading(false);
  };

  const loadAllData = () => {
    fetchData(null, 'Get', `${API_BASE_URL}/comptes/findall`, 'loadCptComptes');
  };

  const loadToEdit = (data: CptCompte) => {
    setEditDialog(true);
    setCompteEdit(data);
  };

  
  const optionButtons = (data: CptCompte): React.ReactNode => {
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

  return (
    <>
      <Toast ref={toast} />

      <Dialog header="Modifier Compte" visible={editDialog} style={{ width: '50vw' }} modal onHide={() => setEditDialog(false)}>
        <CptCompteForm compte={compteEdit} handleChange={handleChangeEdit} handleCheckboxChange={handleCheckboxChangeEdit}  handleDropdownChange={handleDropdownChangeEdit}/>
        <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
      </Dialog>

      <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
        <TabPanel header="Nouveau">
          <CptCompteForm compte={compte} handleChange={handleChange} handleCheckboxChange={handleCheckboxChange}  handleDropdownChange={handleDropdownChange}/>
          <div className="card p-fluid">
            <div className="formgrid grid">
              <div className="md:col-offset-3 md:field md:col-3">
                <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setCompte(new CptCompte())} />
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
                <DataTable value={comptes} header={renderSearch} 
                    emptyMessage={"Aucun compte à afficher"}  paginator
                    rows={10}
                    rowsPerPageOptions={[10, 20, 30]}
                    filters={filters}
                    globalFilterFields={['codeCompte', 'libelle']}
                >
                  <Column field="codeCompte" header="Code Compte" />
                  <Column field="libelle" header="Libellé" />
                  <Column field="typeCompte" header="Type" />
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

export default CptCompteComponent;