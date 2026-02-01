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
import { LoanApprovalWorkflow } from "./LoanApprovalWorkflow";
import LoanApprovalWorkflowForm from "./LoanApprovalWorkflowForm";
import useConsumApi from "@/hooks/fetchData/useConsumApi";
import { useSearchParams } from "next/navigation";

const LoanApprovalWorkflowPage = () => {
  const [loanApprovalWorkflows, setLoanApprovalWorkflows] = useState<LoanApprovalWorkflow[]>([]);
  const [selectedLoanApprovalWorkflow, setSelectedLoanApprovalWorkflow] = useState<LoanApprovalWorkflow | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<LoanApprovalWorkflow[]>>(null);
  const searchParams = useSearchParams();
  const productId = parseInt(searchParams.get("productId") || "0");

  const { processRequest: fetchLoanApprovalWorkflows } = useConsumApi();
  const { processRequest: createLoanApprovalWorkflow } = useConsumApi();
  const { processRequest: updateLoanApprovalWorkflow } = useConsumApi();
  const { processRequest: deleteLoanApprovalWorkflow } = useConsumApi();

  useEffect(() => {
    if (productId) {
      loadLoanApprovalWorkflows();
    }
  }, [productId]);

  const loadLoanApprovalWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetchLoanApprovalWorkflows({
        route: `/api/financial-products/loan-products/${productId}/workflows`,
        method: "GET",
      });

      if (response?.data) {
        setLoanApprovalWorkflows(response.data);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec du chargement des flux d'approbation",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setSelectedLoanApprovalWorkflow(null);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
    setSelectedLoanApprovalWorkflow(null);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedLoanApprovalWorkflow(null);
  };

  const saveLoanApprovalWorkflow = async (loanApprovalWorkflow: LoanApprovalWorkflow) => {
    try {
      const dataToSend = {
        ...loanApprovalWorkflow,
        product: { id: productId },
        approvalLevel: { id: loanApprovalWorkflow.approvalLevelId },
      };

      if (loanApprovalWorkflow.id) {
        const response = await updateLoanApprovalWorkflow({
          route: `/api/financial-products/loan-products/workflows/${loanApprovalWorkflow.id}/update`,
          method: "PUT",
          data: dataToSend,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Flux d'approbation mis à jour avec succès",
            life: 3000,
          });
          loadLoanApprovalWorkflows();
          setActiveIndex(1);
        }
      } else {
        const response = await createLoanApprovalWorkflow({
          route: `/api/financial-products/loan-products/${productId}/workflows/new`,
          method: "POST",
          data: dataToSend,
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Flux d'approbation créé avec succès",
            life: 3000,
          });
          loadLoanApprovalWorkflows();
          setActiveIndex(1);
        }
      }
      hideDialog();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l'enregistrement du flux d'approbation",
        life: 3000,
      });
    }
  };

  const editLoanApprovalWorkflow = (loanApprovalWorkflow: LoanApprovalWorkflow) => {
    const workflowToEdit = {
      ...loanApprovalWorkflow,
      approvalLevelId: loanApprovalWorkflow.approvalLevel?.id || loanApprovalWorkflow.approvalLevelId,
    };
    setSelectedLoanApprovalWorkflow(workflowToEdit);
    setDisplayDialog(true);
  };

  const confirmDelete = (loanApprovalWorkflow: LoanApprovalWorkflow) => {
    setSelectedLoanApprovalWorkflow(loanApprovalWorkflow);
    setDeleteDialog(true);
  };

  const deleteLoanApprovalWorkflowAction = async () => {
    if (selectedLoanApprovalWorkflow?.id) {
      try {
        const response = await deleteLoanApprovalWorkflow({
          route: `/api/financial-products/loan-products/workflows/${selectedLoanApprovalWorkflow.id}/delete`,
          method: "DELETE",
        });

        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Flux d'approbation supprimé avec succès",
            life: 3000,
          });
          loadLoanApprovalWorkflows();
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Échec de la suppression du flux d'approbation",
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

  const actionBodyTemplate = (rowData: LoanApprovalWorkflow) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editLoanApprovalWorkflow(rowData)}
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

  const requiredBodyTemplate = (rowData: LoanApprovalWorkflow) => {
    return (
      <Tag
        value={rowData.isRequired ? "Requis" : "Optionnel"}
        severity={rowData.isRequired ? "warning" : "info"}
      />
    );
  };

  const amountRangeBodyTemplate = (rowData: LoanApprovalWorkflow) => {
    const formatter = new Intl.NumberFormat("fr-BI", {
      style: "currency",
      currency: "BIF",
      maximumFractionDigits: 0,
    });

    if (rowData.minAmount && rowData.maxAmount) {
      return `${formatter.format(rowData.minAmount)} - ${formatter.format(rowData.maxAmount)}`;
    } else if (rowData.minAmount) {
      return `Min: ${formatter.format(rowData.minAmount)}`;
    } else if (rowData.maxAmount) {
      return `Max: ${formatter.format(rowData.maxAmount)}`;
    }
    return "Tous";
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Gérer les Flux d&apos;Approbation</h4>
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
        onClick={deleteLoanApprovalWorkflowAction}
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
        <h5>Flux d&apos;Approbation du Produit de Crédit</h5>
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Nouveau" leftIcon="pi pi-plus mr-2">
            <LoanApprovalWorkflowForm
              visible={displayDialog}
              onHide={hideDialog}
              loanApprovalWorkflow={selectedLoanApprovalWorkflow}
              onSave={saveLoanApprovalWorkflow}
              productId={productId}
            />
            <Button
              label="Ajouter Flux"
              icon="pi pi-plus"
              className="p-button-success"
              onClick={openNew}
            />
          </TabPanel>

          <TabPanel header="Tous" leftIcon="pi pi-list mr-2">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
              ref={dt}
              value={loanApprovalWorkflows}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} flux"
              globalFilter={globalFilter}
              header={header}
              loading={loading}
              emptyMessage="Aucun flux trouvé"
              className="p-datatable-sm"
            >
              <Column field="sequenceNumber" header="Séquence" sortable />
              <Column
                field="approvalLevel.levelNameFr"
                header="Niveau d'Approbation"
                sortable
              />
              <Column header="Plage de Montant" body={amountRangeBodyTemplate} />
              <Column header="Requis" body={requiredBodyTemplate} sortable />
              <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: "8rem" }} />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>

      <LoanApprovalWorkflowForm
        visible={displayDialog}
        onHide={hideDialog}
        loanApprovalWorkflow={selectedLoanApprovalWorkflow}
        onSave={saveLoanApprovalWorkflow}
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
          {selectedLoanApprovalWorkflow && (
            <span>Êtes-vous sûr de vouloir supprimer ce flux?</span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default LoanApprovalWorkflowPage;
