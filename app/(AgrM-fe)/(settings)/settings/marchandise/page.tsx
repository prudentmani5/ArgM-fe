"use client";

import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { useEffect, useRef, useState } from "react";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { Marchandise } from "./Marchandise";
import MarchandiseForm from "./MarchandiseForm";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { DropdownChangeEvent } from "primereact/dropdown";
import { TypePackaging } from "../typePackaging/TypePackaging";
import { FacClasse } from "../facClasse/FacClasse";
import { ClasseMarchandise } from "../classeMarchandise/ClasseMarchandise";
import { API_BASE_URL } from '@/utils/apiConfig';

function MarchandiseComponent() {
  const [marchandise, setMarchandise] = useState<Marchandise>(new Marchandise());
  const [marchandiseEdit, setMarchandiseEdit] = useState<Marchandise>(new Marchandise());
  const [editMarchandiseDialog, setEditMarchandiseDialog] = useState(false);
  const [marchandises, setMarchandises] = useState<Marchandise[]>([]);
  const [typeConditions, setTypeConditions] = useState<TypePackaging[]>([]);
  const [classeTarifs, setClasseTarifs] = useState<FacClasse[]>([]);
  const [compteClasses, setCompteClasses] = useState<ClasseMarchandise[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, loading, error, fetchData, callType } = useConsumApi("");
  const { data: typePackagingData, loading: tpLoading, error: tpError, fetchData: tpFetchData, callType: tpCallType } = useConsumApi("");
  const { data: facClasseData, loading: fcLoading, error: fcError, fetchData: fcFetchData, callType: fcCallType } = useConsumApi("");
  const { data: marchandiseClasseData, loading: mcLoading, error: mcError, fetchData: mcFetchData, callType: mcCallType } = useConsumApi("");
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const baseUrl = `${API_BASE_URL}/marchandises`;

  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000
    });
  };

  useEffect(() => {
    loadAllTypeCondition();
    loadAllclasseTarifs();
    loadAllCompteClasses();
  }, []);

  useEffect(() => {
    if (data) {
      if (callType === 'loadMarchandises') {
        setMarchandises(Array.isArray(data) ? data : [data]);
      }
    }
    if (typePackagingData) {
      setTypeConditions(Array.isArray(typePackagingData) ? typePackagingData : [typePackagingData]);
    }
    if (facClasseData) {
      setClasseTarifs(Array.isArray(facClasseData) ? facClasseData : [facClasseData]);
    }
    if (marchandiseClasseData) {
      setCompteClasses(Array.isArray(marchandiseClasseData) ? marchandiseClasseData : [marchandiseClasseData]);
    }
    handleAfterApiCall(activeIndex);
  }, [data, typePackagingData, facClasseData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarchandise((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarchandiseEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleValueChange = (e: any) => {
    setMarchandise((prev) => ({ ...prev, [e.target.name]: e.value }));
  };

  const handleValueChangeEdit = (e: any) => {
    setMarchandiseEdit((prev) => ({ ...prev, [e.target.name]: e.value }));
  };

  const handleDropDownSelect = (e: DropdownChangeEvent) => {
    setMarchandise((prev) => ({ ...prev, [e.target.name]: e.value }));
    if (e.target.name === 'classeId') {
      classeTarifs.map((ct) => {
        if (ct.classeId === e.value) {
          
          setMarchandise((prev) => ({ ...prev, "prixCamion": ct.prixCamion })); 
          setMarchandise((prev) => ({ ...prev, "prixBarge": ct.prixBarge})); 
          return;
        }
      });
      
    } else if(e.target.name ==='classeMarchandiseId'){
     
      compteClasses.map((cc) => {
        if (cc.classeMarchandiseId === e.value) {
          setMarchandise((prev) => ({ ...prev, "compte": cc.compteImp }));
          return;
        }
      });
    }
  };

  const handleDropDownSelectEdit = (e: DropdownChangeEvent) => {
    setMarchandiseEdit((prev) => ({ ...prev, [e.target.name]: e.value }));
    if (e.target.name === 'classeId') {
      console.log(" target " + e.target.name);
      console.log(JSON.stringify(classeTarifs));
      classeTarifs.map((ct) => {
        if (ct.classeId === e.value) {
          setMarchandiseEdit((prev) => ({ ...prev, "prixCamion": ct.prixCamion })); 
          setMarchandiseEdit((prev) => ({ ...prev, "prixBarge": ct.prixBarge})); 
          return;
        }
      });
      
    } 
    else if(e.target.name ==='classeMarchandiseId'){
      compteClasses.map((cc) => {
        if (cc.classeMarchandiseId === e.value) {
          
          setMarchandiseEdit((prev) => ({ ...prev, "compte": cc.compteImp }));
          return;
        }
      });
  };
};

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarchandise((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
};

const handleCheckboxChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
  setMarchandiseEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
};

  const handleSubmit = () => {
    setBtnLoading(true);
    fetchData(marchandise, "POST", `${baseUrl}/new`, 'createMarchandise');
    console.log(JSON.stringify(marchandise));
  };

  const handleSubmitEdit = () => {
    setBtnLoading(true);
    fetchData(marchandiseEdit, "PUT", `${baseUrl}/update/${marchandiseEdit.marchandiseId}`, 'updateMarchandise');
  };

  const handleAfterApiCall = (chosenTab: number) => {
    if (error !== null && chosenTab === 0) {
      if (callType !== 'updateMarchandise') {
        showToast('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
      } else if (callType === 'updateMarchandise') {
        showToast('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
      }
    } else if (error !== null && chosenTab === 1) {
      showToast('warn', 'Attention', 'Impossible de charger la liste des marchandises.');
    } else if (data !== null && error === null) {
      if (callType === 'createMarchandise') {
        setMarchandise(new Marchandise());
        showToast('success', 'Succès', 'L\'enregistrement a été effectué avec succès.');
      } else if (callType === 'updateMarchandise') {
        showToast('success', 'Succès', 'La modification a été effectuée avec succès.');
        setMarchandiseEdit(new Marchandise());
        setEditMarchandiseDialog(false);
        loadAllData();
      }
    }
    setBtnLoading(false);
  };

  const clearFilter = () => {
    setMarchandise(new Marchandise());
  };

  const loadAllTypeCondition = () => {
    tpFetchData(null, "GET", `${API_BASE_URL}/typepackagings/findall`, "loadTypeConditions");
  }
  const loadAllclasseTarifs = () => {
    fcFetchData(null, "GET", `${API_BASE_URL}/facclasses/findall`, "loadAllFacClasses");
  };
  const loadAllCompteClasses = () => {
    mcFetchData(null, "GET", `${API_BASE_URL}/classemarchandises/findall`, "loadAllMarchClasses");
  };

  const loadMarchandiseToEdit = (data: Marchandise) => {
    if (data) {
      setEditMarchandiseDialog(true);
      setMarchandiseEdit(data);
      console.log(JSON.stringify(data));
    }
  };

  const optionButtons = (data: any): React.ReactNode => {
    return (
      <div className='flex flex-wrap gap-2'>
        <Button
          icon="pi pi-pencil"
          onClick={() => loadMarchandiseToEdit(data)}
          raised
          severity='warning'
          tooltip="Modifier"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const loadAllData = () => {
    fetchData(null, 'GET', `${baseUrl}/findall`, 'loadMarchandises');
  };

  const tableChangeHandle = (e: TabViewTabChangeEvent) => {
    if (e.index === 1) {
      loadAllData();
    }
    setActiveIndex(e.index);
  };

  const renderSearch = () => {
    return (
      <div className="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-refresh"
          label="Réinitialiser"
          outlined
          onClick={clearFilter}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText placeholder="Recherche" />
        </span>
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Modifier Marchandise"
        visible={editMarchandiseDialog}
        style={{ width: '30vw' }}
        modal
        onHide={() => setEditMarchandiseDialog(false)}
      >
        <MarchandiseForm
          marchandise={marchandiseEdit}
          categories={[
            { label: "MA:Marchandise", value: "MA" }
          ]}
          genres={[
            { label: "Liquide", value: "liquide" },
            { label: "Solide", value: "solide" },
          ]}
          typeConditions={typeConditions}
          classeTarifs={classeTarifs}
          compteClasses={compteClasses}
          handleChange={handleChangeEdit}
          handleValueChange={handleValueChangeEdit}
          handleDropDownSelect={handleDropDownSelectEdit}
          handleCheckboxChange={handleCheckboxChangeEdit}
        />
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Annuler"
            icon="pi pi-times"
            onClick={() => setEditMarchandiseDialog(false)}
            className="p-button-text"
          />
          <Button
            label="Enregistrer"
            icon="pi pi-check"
            loading={btnLoading}
            onClick={handleSubmitEdit}
          />
        </div>
      </Dialog>
      <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
        <TabPanel header="Nouveau">
          <MarchandiseForm
            marchandise={marchandise}
            categories={[
              { label: "MA:Marchandise", value: "MA" }
            ]}
            genres={[
              { label: "Liquide", value: "liquide" },
              { label: "Solide", value: "solide" },
            ]}
            typeConditions={typeConditions}
            classeTarifs={classeTarifs}
            compteClasses={compteClasses}
            handleChange={handleChange}
            handleValueChange={handleValueChange}
            handleDropDownSelect={handleDropDownSelect}
            handleCheckboxChange={handleCheckboxChange}
          />
          <div className="card p-fluid">
            <div className="formgrid grid">
              <div className="md:col-offset-3 md:field md:col-3">
                <Button
                  icon="pi pi-refresh"
                  outlined
                  label="Réinitialiser"
                  onClick={clearFilter}
                />
              </div>
              <div className="md:field md:col-3">
                <Button
                  icon="pi pi-check"
                  label="Enregistrer"
                  loading={btnLoading}
                  onClick={handleSubmit}
                />
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Tous">
          <div className="grid">
            <div className="col-12">
              <div className="card">
                <DataTable
                  value={marchandises}
                  header={renderSearch}
                  emptyMessage={"Pas de marchandises à afficher"}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 20]}
                  loading={loading && callType === 'loadMarchandises'}
                >
                  <Column field="nom" header="Nom" sortable />
                  <Column field="categorie" header="Catégorie" sortable />
                  <Column field="prixCamion" header="Prix Camion" sortable />
                  <Column field="prixBarge" header="Prix Barge" sortable />
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

export default MarchandiseComponent;