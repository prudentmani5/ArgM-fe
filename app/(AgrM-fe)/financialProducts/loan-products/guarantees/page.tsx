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
import { LoanProductGuarantee } from "./LoanProductGuarantee";
import LoanProductGuaranteeForm from "./LoanProductGuaranteeForm";
import useConsumApi from "@/hooks/fetchData/useConsumApi";
import { useSearchParams } from "next/navigation";

const LoanProductGuaranteePage = () => {
  const [loanProductGuarantees, setLoanProductGuarantees] = useState<LoanProductGuarantee[]>([]);
  const [selectedLoanProductGuarantee, setSelectedLoanProductGuarantee] = useState<LoanProductGuarantee | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<LoanProductGuarantee[]>>(null);
  const searchParams = useSearchParams();
  const productId = parseInt(searchParams.get("productId") || "0");

  const { processRequest: fetchLoanProductGuarantees } = useConsumApi();
  const { processRequest: createLoanProductGuarantee } = useConsumApi();
  const { processRequest: updateLoanProductGuarantee } = useConsumApi();
  const { processRequest: deleteLoanProductGuarantee } = useConsumApi();

  useEffect(() => {
    if (productId) {
      loadLoanProductGuarantees();
    }
  }, [productId]);

  const loadLoanProductGuarantees = async () => {
    setLoading(true);
    try {
      const response = await fetchLoanProductGuarantees({
        route: `/api/financial-products/loan-products/guarantees/product/${productId}`,
        method: "GET",
      });

      if (response?.data) {
        setLoanProductGuarantees(response.data);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error / Erreur",
        detail: "Failed to load produit de crédit guarantees / Échec du chargement des garanties",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setSelectedLoanProductGuarantee(null);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
    setSelectedLoanProductGuarantee(null);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedLoanProductGuarantee(null);
  };

  const saveLoanProductGuarantee = async (loanProductGuarantee: LoanProductGuarantee) => {
    try {
      if (loanProductGuarantee.id) {
        const response = await updateLoanProductGuarantee({
          route: `/api/financial-products/loan-products/guarantees/update/${loanProductGuarantee.id}`,
          method: "PUT",
          data: loanProductGuarantee,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan product guarantee updated successfully / Garantie mise à jour avec succès",
            life: 3000,
          });
          loadLoanProductGuarantees();
        }
      } else {
        const response = await createLoanProductGuarantee({
          route: "/api/financial-products/loan-products/guarantees/save",
          method: "POST",
          data: loanProductGuarantee,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan product guarantee created successfully / Garantie créée avec succès",
            life: 3000,
          });
          loadLoanProductGuarantees();
        }
      }
      hideDialog();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error / Erreur",
        detail: "Failed to save produit de crédit guarantee / Échec de l'enregistrement de la garantie",
        life: 3000,
      });
    }
  };

  const editLoanProductGuarantee = (loanProductGuarantee: LoanProductGuarantee) => {
    setSelectedLoanProductGuarantee({ ...loanProductGuarantee });
    setDisplayDialog(true);
  };

  const confirmDelete = (loanProductGuarantee: LoanProductGuarantee) => {
    setSelectedLoanProductGuarantee(loanProductGuarantee);
    setDeleteDialog(true);
  };

  const deleteLoanProductGuaranteeAction = async () => {
    if (selectedLoanProductGuarantee?.id) {
      try {
        const response = await deleteLoanProductGuarantee({
          route: `/api/financial-products/loan-products/guarantees/delete/${selectedLoanProductGuarantee.id}`,
          method: "DELETE",
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Success / Succès",
            detail: "Loan product guarantee deleted successfully / Garantie supprimée avec succès",
            life: 3000,
          });
          loadLoanProductGuarantees();
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error / Erreur",
          detail: "Failed to delete produit de crédit guarantee / Échec de la suppression de la garantie",
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

  const actionBodyTemplate = (rowData: LoanProductGuarantee) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editLoanProductGuarantee(rowData)}
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

  const requiredBodyTemplate = (rowData: LoanProductGuarantee) => {
    return (
      <Tag
        value={rowData.isRequired ? "Required / Requis" : "Optional / Optionnel"}
        severity={rowData.isRequired ? "warning" : "info"}
      />
    );
  };

  const valueBodyTemplate = (rowData: LoanProductGuarantee) => {
    const formatter = new Intl.NumberFormat("fr-BI", {
      style: "currency",
      currency: "BIF",
    });

    if (rowData.minValue && rowData.maxValue) {
      return `${formatter.format(rowData.minValue)} - ${formatter.format(rowData.maxValue)}`;
    } else if (rowData.minValue) {
      return `Min: ${formatter.format(rowData.minValue)}`;
    } else if (rowData.maxValue) {
      return `Max: ${formatter.format(rowData.maxValue)}`;
    }
    return "-";
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Gérer les Loan Product Guarantees / Gérer les Garanties de Produit</h4>
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
        onClick={deleteLoanProductGuaranteeAction}
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
            <LoanProductGuaranteeForm
              visible={displayDialog}
              onHide={hideDialog}
              loanProductGuarantee={selectedLoanProductGuarantee}
              onSave={saveLoanProductGuarantee}
              productId={productId}
            />
            <Button
              label="Add Guarantee / Ajouter Garantie"
              icon="pi pi-plus"
              className="p-button-success"
              onClick={openNew}
            />
          </TabPanel>

          <TabPanel header="All / Tous">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
              ref={dt}
              value={loanProductGuarantees}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} guarantees"
              globalFilter={globalFilter}
              header={header}
              loading={loading}
              emptyMessage="No guarantees found / Aucune garantie trouvée"
            >
              <Column
                field="guaranteeType.typeName"
                header="Guarantee Type / Type de Garantie"
                sortable
              />
              <Column header="Value Range / Plage de Valeur" body={valueBodyTemplate} />
              <Column header="Required / Requis" body={requiredBodyTemplate} sortable />
              <Column field="description" header="Description" sortable />
              <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: "8rem" }} />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>

      <LoanProductGuaranteeForm
        visible={displayDialog}
        onHide={hideDialog}
        loanProductGuarantee={selectedLoanProductGuarantee}
        onSave={saveLoanProductGuarantee}
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
          {selectedLoanProductGuarantee && (
            <span>
              Êtes-vous sûr de vouloir supprimer this guarantee? /
              Êtes-vous sûr de vouloir supprimer cette garantie?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default LoanProductGuaranteePage;
