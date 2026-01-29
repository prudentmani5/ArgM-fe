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
import { LoanProductSector } from "./LoanProductSector";
import LoanProductSectorForm from "./LoanProductSectorForm";
import useConsumApi from "@/hooks/fetchData/useConsumApi";
import { useSearchParams } from "next/navigation";

const LoanProductSectorPage = () => {
  const [loanProductSectors, setLoanProductSectors] = useState<LoanProductSector[]>([]);
  const [selectedLoanProductSector, setSelectedLoanProductSector] = useState<LoanProductSector | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<LoanProductSector[]>>(null);
  const searchParams = useSearchParams();
  const productId = parseInt(searchParams.get("productId") || "0");

  const { processRequest: fetchLoanProductSectors } = useConsumApi();
  const { processRequest: createLoanProductSector } = useConsumApi();
  const { processRequest: updateLoanProductSector } = useConsumApi();
  const { processRequest: deleteLoanProductSector } = useConsumApi();

  useEffect(() => {
    if (productId) {
      loadLoanProductSectors();
    }
  }, [productId]);

  const loadLoanProductSectors = async () => {
    setLoading(true);
    try {
      const response = await fetchLoanProductSectors({
        route: `/api/financial-products/loan-products/sectors/product/${productId}`,
        method: "GET",
      });

      if (response?.data) {
        setLoanProductSectors(response.data);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error / Erreur",
        detail: "Failed to load produit de crédit sectors / Échec du chargement des secteurs",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setSelectedLoanProductSector(null);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
    setSelectedLoanProductSector(null);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedLoanProductSector(null);
  };

  const saveLoanProductSector = async (loanProductSector: LoanProductSector) => {
    try {
      if (loanProductSector.id) {
        const response = await updateLoanProductSector({
          route: `/api/financial-products/loan-products/sectors/update/${loanProductSector.id}`,
          method: "PUT",
          data: loanProductSector,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan product sector updated successfully / Secteur mis à jour avec succès",
            life: 3000,
          });
          loadLoanProductSectors();
        }
      } else {
        const response = await createLoanProductSector({
          route: "/api/financial-products/loan-products/sectors/save",
          method: "POST",
          data: loanProductSector,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan product sector created successfully / Secteur créé avec succès",
            life: 3000,
          });
          loadLoanProductSectors();
        }
      }
      hideDialog();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error / Erreur",
        detail: "Failed to save produit de crédit sector / Échec de l'enregistrement du secteur",
        life: 3000,
      });
    }
  };

  const editLoanProductSector = (loanProductSector: LoanProductSector) => {
    setSelectedLoanProductSector({ ...loanProductSector });
    setDisplayDialog(true);
  };

  const confirmDelete = (loanProductSector: LoanProductSector) => {
    setSelectedLoanProductSector(loanProductSector);
    setDeleteDialog(true);
  };

  const deleteLoanProductSectorAction = async () => {
    if (selectedLoanProductSector?.id) {
      try {
        const response = await deleteLoanProductSector({
          route: `/api/financial-products/loan-products/sectors/delete/${selectedLoanProductSector.id}`,
          method: "DELETE",
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan product sector deleted successfully / Secteur supprimé avec succès",
            life: 3000,
          });
          loadLoanProductSectors();
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error / Erreur",
          detail: "Failed to delete produit de crédit sector / Échec de la suppression du secteur",
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
          label="New / Nouveau"
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

  const actionBodyTemplate = (rowData: LoanProductSector) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editLoanProductSector(rowData)}
          tooltip="Edit / Modifier"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip="Delete / Supprimer"
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Gérer les Loan Product Sectors / Gérer les Secteurs de Produit</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Search / Rechercher..."
          onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
        />
      </span>
    </div>
  );

  const deleteDialogFooter = (
    <>
      <Button
        label="No / Non"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteDialog}
      />
      <Button
        label="Yes / Oui"
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteLoanProductSectorAction}
      />
    </>
  );

  if (!productId) {
    return (
      <div className="card">
        <div className="flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
          <div className="text-center">
            <i className="pi pi-exclamation-triangle" style={{ fontSize: "3rem", color: "var(--orange-500)" }} />
            <h3>No Product Selected / Aucun Produit Sélectionné</h3>
            <p>Please select a produit de crédit first / Veuillez d&apos;abord sélectionner un produit de crédit</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="datatable-crud-demo">
      <Toast ref={toast} />

      <div className="card">
        <TabView>
          <TabPanel header="New / Nouveau">
            <LoanProductSectorForm
              visible={displayDialog}
              onHide={hideDialog}
              loanProductSector={selectedLoanProductSector}
              onSave={saveLoanProductSector}
              productId={productId}
            />
            <Button
              label="Add Sector / Ajouter Secteur"
              icon="pi pi-plus"
              className="p-button-success"
              onClick={openNew}
            />
          </TabPanel>

          <TabPanel header="All / Tous">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
              ref={dt}
              value={loanProductSectors}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} sectors"
              globalFilter={globalFilter}
              header={header}
              loading={loading}
              emptyMessage="No sectors found / Aucun secteur trouvé"
            >
              <Column field="sector.sectorName" header="Sector Name / Nom du Secteur" sortable />
              <Column field="sector.sectorCode" header="Sector Code / Code Secteur" sortable />
              <Column
                field="createdAt"
                header="Created At / Créé le"
                body={(rowData) =>
                  rowData.createdAt
                    ? new Date(rowData.createdAt).toLocaleDateString()
                    : "-"
                }
                sortable
              />
              <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: "8rem" }} />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>

      <LoanProductSectorForm
        visible={displayDialog}
        onHide={hideDialog}
        loanProductSector={selectedLoanProductSector}
        onSave={saveLoanProductSector}
        productId={productId}
      />

      <Dialog
        visible={deleteDialog}
        style={{ width: "450px" }}
        header="Confirm / Confirmer"
        modal
        footer={deleteDialogFooter}
        onHide={hideDeleteDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
          {selectedLoanProductSector && (
            <span>
              Êtes-vous sûr de vouloir supprimer this sector? /
              Êtes-vous sûr de vouloir supprimer ce secteur?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default LoanProductSectorPage;
