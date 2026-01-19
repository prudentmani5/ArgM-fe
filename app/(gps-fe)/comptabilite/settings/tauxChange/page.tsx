'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { TauxChange, TauxChangeRequestDTO } from './TauxChange';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { useCurrentUser } from '../../../../../hooks/fetchData/useCurrentUser';
import { format } from 'date-fns';
import { API_BASE_URL } from '../../../../../utils/apiConfig';

function TauxChangeComponent() {
  const [taux, setTaux] = useState<number | null>(null);
  const [tauxList, setTauxList] = useState<TauxChange[]>([]);
  const [currentTaux, setCurrentTaux] = useState<TauxChange | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, loading, error, fetchData, callType } = useConsumApi('');
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const { user, isLoggedIn } = useCurrentUser();

  const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
    toast.current?.show({ severity: sever, summary: summa, detail: det, life: 3000 });
  };

  useEffect(() => {
    loadCurrentTaux();
    loadAllTaux();
  }, []);

  useEffect(() => {
    if (data) {
      if (callType === 'loadAllTaux') {
        setTauxList(Array.isArray(data) ? data : [data]);
      } else if (callType === 'loadCurrentTaux') {
        console.log('Current Taux Data received:', data);
        // Check if data is a valid TauxChange object with required fields
        if (data && data.tauxChangeId && data.taux !== undefined) {
          setCurrentTaux(data);
        } else {
          console.log('Invalid data structure, setting to null');
          setCurrentTaux(null);
        }
      }
      handleAfterApiCall();
    } else if (error && callType === 'loadCurrentTaux') {
      // If there's an error loading current taux (e.g., 404 - no rate for today), set to null
      console.log('Error loading current taux:', error);
      setCurrentTaux(null);
    }
  }, [data, error, callType]);

  const handleAfterApiCall = () => {
    if (error !== null && callType === 'createTaux') {
      accept('warn', 'Attention', "L'enregistrement a échoué.");
      setBtnLoading(false);
    } else if (data !== null && error === null && callType === 'createTaux') {
      setTaux(null);
      accept('success', 'Succès', 'Le taux de change a été enregistré avec succès.');
      setBtnLoading(false);
      // Reload data after a short delay to ensure backend has processed
      setTimeout(() => {
        loadCurrentTaux();
        loadAllTaux();
      }, 300);
    }
  };

  const handleSubmit = () => {
    if (!user || !isLoggedIn) {
      accept('error', 'Erreur', 'Vous devez être connecté pour effectuer cette action.');
      return;
    }

    if (taux === null || taux <= 0) {
      accept('warn', 'Attention', 'Veuillez entrer un taux de change valide.');
      return;
    }

    const requestDTO: TauxChangeRequestDTO = {
      taux: taux,
      userId: user.id
    };

    setBtnLoading(true);
    fetchData(requestDTO, 'Post', `${API_BASE_URL}/comptabilite/settings/taux-change/new`, 'createTaux');
  };

  const loadAllTaux = () => {
    fetchData(null, 'Get', `${API_BASE_URL}/comptabilite/settings/taux-change/findall`, 'loadAllTaux');
  };

  const loadCurrentTaux = () => {
    fetchData(null, 'Get', `${API_BASE_URL}/comptabilite/settings/taux-change/current`, 'loadCurrentTaux');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };

  const dateBodyTemplate = (rowData: TauxChange) => {
    return formatDate(rowData.dateCreation);
  };

  const tauxBodyTemplate = (rowData: TauxChange) => {
    return rowData.taux.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const actifBodyTemplate = (rowData: TauxChange) => {
    return (
      <i
        className={`pi ${rowData.actif ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'}`}
        style={{ fontSize: '1.5rem' }}
      ></i>
    );
  };

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card">
          <h5>Gestion du Taux de Change</h5>

          <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            {/* Tab 1: Nouveau Taux */}
            <TabPanel header="Nouveau Taux de Change">
              <div className="grid">
                <div className="col-12 md:col-6">
                  <Card
                    title="Taux de Change du Jour"
                    className="mb-4"
                    subTitle={
                      <Button
                        label="Actualiser"
                        icon="pi pi-refresh"
                        className="p-button-text p-button-sm"
                        onClick={loadCurrentTaux}
                        loading={loading && callType === 'loadCurrentTaux'}
                      />
                    }
                  >
                    {currentTaux && currentTaux.taux !== undefined && currentTaux.taux !== null ? (
                      <div>
                        <p className="text-4xl font-bold text-primary mb-2">
                          {currentTaux.taux.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} FBU
                        </p>
                        <p className="text-sm text-600">
                          <i className="pi pi-user mr-2"></i>
                          {currentTaux.userName || 'N/A'}
                        </p>
                        <p className="text-sm text-600">
                          <i className="pi pi-calendar mr-2"></i>
                          {formatDate(currentTaux.dateCreation)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="pi pi-info-circle text-4xl text-400 mb-3"></i>
                        <p className="text-600">Aucun taux de change pour aujourd'hui</p>
                        <small className="text-500">Veuillez enregistrer un nouveau taux</small>
                      </div>
                    )}
                  </Card>
                </div>

                <div className="col-12 md:col-6">
                  <Card title="Enregistrer un Nouveau Taux">
                    <div className="field">
                      <label htmlFor="taux" className="block mb-2">
                        Taux de Change (1 USD = ? FBU) <span className="text-red-500">*</span>
                      </label>
                      <InputNumber
                        id="taux"
                        value={taux}
                        onValueChange={(e) => setTaux(e.value ?? null)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={4}
                        min={0}
                        placeholder="Entrez le taux de change"
                        className="w-full"
                        showButtons
                        buttonLayout="horizontal"
                        step={0.01}
                        decrementButtonClassName="p-button-danger"
                        incrementButtonClassName="p-button-success"
                        locale='fr-FR'
                      />
                      <small className="text-600">Exemple: 3500.50 FBU pour 1 USD</small>
                    </div>

                    {user && (
                      <div className="field mt-3">
                        <label className="block mb-2">Utilisateur connecté</label>
                        <p className="text-700 font-medium">
                          <i className="pi pi-user mr-2"></i>
                          {user.fullName}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-content-end mt-4">
                      <Button
                        label="Enregistrer"
                        icon="pi pi-save"
                        onClick={handleSubmit}
                        loading={btnLoading}
                        disabled={!isLoggedIn || taux === null || taux <= 0}
                        className="p-button-primary"
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </TabPanel>

            {/* Tab 2: Historique */}
            <TabPanel header="Historique des Taux">
              <div className="card">
                <div className="flex justify-content-between align-items-center mb-4">
                  <h6>Historique Complet</h6>
                  <Button
                    label="Actualiser"
                    icon="pi pi-refresh"
                    className="p-button-outlined"
                    onClick={loadAllTaux}
                    loading={loading}
                  />
                </div>

                <DataTable
                  value={tauxList}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  loading={loading}
                  emptyMessage="Aucun taux de change trouvé"
                  responsiveLayout="scroll"
                  stripedRows
                >
                  <Column
                    field="dateCreation"
                    header="Date & Heure"
                    body={dateBodyTemplate}
                    sortable
                    style={{ minWidth: '200px' }}
                  />
                  <Column
                    field="taux"
                    header="Taux (FBU)"
                    body={tauxBodyTemplate}
                    sortable
                    style={{ minWidth: '150px' }}
                  />
                  <Column
                    field="userName"
                    header="Enregistré par"
                    sortable
                    style={{ minWidth: '200px' }}
                  />
                  <Column
                    field="actif"
                    header="Actif"
                    body={actifBodyTemplate}
                    sortable
                    style={{ minWidth: '100px', textAlign: 'center' }}
                  />
                </DataTable>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  );
}

export default TauxChangeComponent;
