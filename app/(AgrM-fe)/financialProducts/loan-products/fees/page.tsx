"use client";
import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from "primereact/tabview";
import { Tag } from "primereact/tag";
import { LoanProductFee } from "./LoanProductFee";
import LoanProductFeeForm from "./LoanProductFeeForm";
import useConsumApi from "@/hooks/fetchData/useConsumApi";
import { useSearchParams } from "next/navigation";

const LoanProductFeePage = () => {
  const [loanProductFees, setLoanProductFees] = useState<LoanProductFee[]>([]);
  const [selectedLoanProductFee, setSelectedLoanProductFee] = useState<LoanProductFee | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<LoanProductFee[]>>(null);
  const searchParams = useSearchParams();
  const productId = parseInt(searchParams.get("productId") || "0");

  const { processRequest: fetchLoanProductFees } = useConsumApi();
  const { processRequest: createLoanProductFee } = useConsumApi();
  const { processRequest: updateLoanProductFee } = useConsumApi();
  const { processRequest: deleteLoanProductFee } = useConsumApi();

  useEffect(() => {
    if (productId) {
      loadLoanProductFees();
    }
  }, [productId]);

  const loadLoanProductFees = async () => {
    setLoading(true);
    try {
      const response = await fetchLoanProductFees({
        route: `/api/financial-products/loan-products/${productId}/fees`,
        method: "GET",
      });

      if (response?.data) {
        setLoanProductFees(response.data);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec du chargement des frais",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setSelectedLoanProductFee(null);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
    setSelectedLoanProductFee(null);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedLoanProductFee(null);
  };

  const saveLoanProductFee = async (loanProductFee: LoanProductFee) => {
    try {
      const dataToSend = {
        ...loanProductFee,
        product: { id: productId },
        feeType: { id: loanProductFee.feeTypeId },
        calculationMethod: { id: loanProductFee.calculationMethodId },
      };

      if (loanProductFee.id) {
        const response = await updateLoanProductFee({
          route: `/api/financial-products/loan-products/fees/${loanProductFee.id}/update`,
          method: "PUT",
          data: dataToSend,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Frais mis à jour avec succès",
            life: 3000,
          });
          loadLoanProductFees();
          setActiveIndex(1);
        }
      } else {
        const response = await createLoanProductFee({
          route: `/api/financial-products/loan-products/${productId}/fees/new`,
          method: "POST",
          data: dataToSend,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Frais créé avec succès",
            life: 3000,
          });
          loadLoanProductFees();
          setActiveIndex(1);
        }
      }
      hideDialog();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l'enregistrement du frais",
        life: 3000,
      });
    }
  };

  const editLoanProductFee = (loanProductFee: LoanProductFee) => {
    const feeToEdit = {
      ...loanProductFee,
      feeTypeId: loanProductFee.feeType?.id || loanProductFee.feeTypeId,
      calculationMethodId: loanProductFee.calculationMethod?.id || loanProductFee.calculationMethodId,
    };
    setSelectedLoanProductFee(feeToEdit);
    setDisplayDialog(true);
  };

  const confirmDelete = (loanProductFee: LoanProductFee) => {
    setSelectedLoanProductFee(loanProductFee);
    setDeleteDialog(true);
  };

  const deleteLoanProductFeeAction = async () => {
    if (selectedLoanProductFee?.id) {
      try {
        const response = await deleteLoanProductFee({
          route: `/api/financial-products/loan-products/fees/${selectedLoanProductFee.id}/delete`,
          method: "DELETE",
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Frais supprimé avec succès",
            life: 3000,
          });
          loadLoanProductFees();
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Échec de la suppression du frais",
          life: 3000,
        });
      }
      hideDeleteDialog();
    }
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Nouveau"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNew}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Exporter"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={exportCSV}
        />
      </div>
    );
  };

  const actionBodyTemplate = (rowData: LoanProductFee) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editLoanProductFee(rowData)}
          tooltip="Modifier"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip="Supprimer"
        />
      </div>
    );
  };

  const statusBodyTemplate = (rowData: LoanProductFee) => {
    return (
      <Tag
        value={rowData.isActive ? "Actif" : "Inactif"}
        severity={rowData.isActive ? "success" : "danger"}
      />
    );
  };

  const amountBodyTemplate = (rowData: LoanProductFee) => {
    if (rowData.fixedAmount) {
      return new Intl.NumberFormat("fr-BI", {
        style: "currency",
        currency: "BIF",
        maximumFractionDigits: 0,
      }).format(rowData.fixedAmount);
    } else if (rowData.percentageRate) {
      return `${rowData.percentageRate.toFixed(2)}%`;
    }
    return "-";
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Gérer les Frais de Produit</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Rechercher..."
          onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
        />
      </span>
    </div>
  );

  const deleteDialogFooter = (
    <>
      <Button
        label="Non"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteDialog}
      />
      <Button
        label="Oui"
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteLoanProductFeeAction}
      />
    </>
  );

  if (!productId) {
    return (
      <div className="card">
        <div className="flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
          <div className="text-center">
            <i className="pi pi-exclamation-triangle" style={{ fontSize: "3rem", color: "var(--orange-500)" }} />
            <h3>Aucun Produit Sélectionné</h3>
            <p>Veuillez d&apos;abord sélectionner un produit de crédit</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="datatable-crud-demo">
      <Toast ref={toast} />

      <div className="card">
        <h5>Frais du Produit de Crédit</h5>
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Nouveau" leftIcon="pi pi-plus mr-2">
            <LoanProductFeeForm
              visible={displayDialog}
              onHide={hideDialog}
              loanProductFee={selectedLoanProductFee}
              onSave={saveLoanProductFee}
              productId={productId}
            />
            <Button
              label="Ajouter Frais"
              icon="pi pi-plus"
              className="p-button-success"
              onClick={openNew}
            />
          </TabPanel>

          <TabPanel header="Tous" leftIcon="pi pi-list mr-2">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
              ref={dt}
              value={loanProductFees}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} frais"
              globalFilter={globalFilter}
              header={header}
              loading={loading}
              emptyMessage="Aucun frais trouvé"
              className="p-datatable-sm"
            >
              <Column field="feeType.nameFr" header="Type de Frais" sortable filter />
              <Column
                field="calculationMethod.nameFr"
                header="Méthode de Calcul"
                sortable
                filter
              />
              <Column header="Montant" body={amountBodyTemplate} />
              <Column field="collectionTime" header="Moment de Collecte" sortable />
              <Column header="Statut" body={statusBodyTemplate} sortable />
              <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: "8rem" }} />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>

      <LoanProductFeeForm
        visible={displayDialog}
        onHide={hideDialog}
        loanProductFee={selectedLoanProductFee}
        onSave={saveLoanProductFee}
        productId={productId}
      />

      <Dialog
        visible={deleteDialog}
        style={{ width: "450px" }}
        header="Confirmer la suppression"
        modal
        footer={deleteDialogFooter}
        onHide={hideDeleteDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
          {selectedLoanProductFee && (
            <span>
              Êtes-vous sûr de vouloir supprimer ce frais?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default LoanProductFeePage;
