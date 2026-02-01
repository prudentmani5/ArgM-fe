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
import Cookies from "js-cookie";
import { LoanProduct } from "./LoanProduct";
import LoanProductForm from "./LoanProductForm";
import { LoanProductFee } from "./fees/LoanProductFee";
import LoanProductFeeForm from "./fees/LoanProductFeeForm";
import { LoanProductGuarantee } from "./guarantees/LoanProductGuarantee";
import LoanProductGuaranteeForm from "./guarantees/LoanProductGuaranteeForm";
import { LoanApprovalWorkflow } from "./workflows/LoanApprovalWorkflow";
import LoanApprovalWorkflowForm from "./workflows/LoanApprovalWorkflowForm";
import useConsumApi from "@/hooks/fetchData/useConsumApi";
import { buildApiUrl } from "@/utils/apiConfig";
import { useRouter } from "next/navigation";

const BASE_URL = buildApiUrl("/api/financial-products/loan-products");

const LoanProductPage = () => {
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [selectedLoanProduct, setSelectedLoanProduct] = useState<LoanProduct | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);

  // Fees dialog states
  const [feesDialog, setFeesDialog] = useState(false);
  const [fees, setFees] = useState<LoanProductFee[]>([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [selectedFee, setSelectedFee] = useState<LoanProductFee | null>(null);
  const [feeFormDialog, setFeeFormDialog] = useState(false);
  const [deleteFeeDialog, setDeleteFeeDialog] = useState(false);

  // Guarantees dialog states
  const [guaranteesDialog, setGuaranteesDialog] = useState(false);
  const [guarantees, setGuarantees] = useState<LoanProductGuarantee[]>([]);
  const [guaranteesLoading, setGuaranteesLoading] = useState(false);
  const [selectedGuarantee, setSelectedGuarantee] = useState<LoanProductGuarantee | null>(null);
  const [guaranteeFormDialog, setGuaranteeFormDialog] = useState(false);
  const [deleteGuaranteeDialog, setDeleteGuaranteeDialog] = useState(false);

  // Workflows dialog states
  const [workflowsDialog, setWorkflowsDialog] = useState(false);
  const [workflows, setWorkflows] = useState<LoanApprovalWorkflow[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<LoanApprovalWorkflow | null>(null);
  const [workflowFormDialog, setWorkflowFormDialog] = useState(false);
  const [deleteWorkflowDialog, setDeleteWorkflowDialog] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<LoanProduct[]>>(null);
  const router = useRouter();

  const { data, loading, error, fetchData, callType } = useConsumApi("");
  const { processRequest } = useConsumApi("");

  // Get connected user from cookies
  const getConnectedUser = (): string => {
    const appUserCookie = Cookies.get("appUser");
    if (appUserCookie) {
      try {
        const appUser = JSON.parse(appUserCookie);
        return appUser.email || `${appUser.firstname || ""} ${appUser.lastname || ""}`.trim() || "Unknown";
      } catch {
        return "Unknown";
      }
    }
    return "Unknown";
  };

  useEffect(() => {
    loadLoanProducts();
  }, []);

  useEffect(() => {
    if (data) {
      switch (callType) {
        case "loadLoanProducts":
          const items = Array.isArray(data) ? data : data.content || [];
          setLoanProducts(items);
          break;
        case "create":
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Produit de crédit créé avec succès",
            life: 3000,
          });
          loadLoanProducts();
          hideDialog();
          setActiveIndex(1);
          break;
        case "update":
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Produit de crédit mis à jour avec succès",
            life: 3000,
          });
          loadLoanProducts();
          hideDialog();
          setActiveIndex(1);
          break;
        case "delete":
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Produit de crédit supprimé avec succès",
            life: 3000,
          });
          loadLoanProducts();
          break;
      }
    }
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: error.message || "Une erreur est survenue",
        life: 3000,
      });
    }
  }, [data, error, callType]);

  const loadLoanProducts = () => {
    fetchData(null, "GET", `${BASE_URL}/findall`, "loadLoanProducts");
  };

  const openNew = () => {
    setSelectedLoanProduct(null);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
    setSelectedLoanProduct(null);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedLoanProduct(null);
  };

  const saveLoanProduct = (loanProduct: LoanProduct) => {
    const loanProductToSave = { ...loanProduct, userAction: getConnectedUser() };

    if (loanProduct.id) {
      fetchData(loanProductToSave, "PUT", `${BASE_URL}/update/${loanProduct.id}`, "update");
    } else {
      fetchData(loanProductToSave, "POST", `${BASE_URL}/new`, "create");
    }
  };

  const editLoanProduct = (loanProduct: LoanProduct) => {
    setSelectedLoanProduct({ ...loanProduct });
    setDisplayDialog(true);
  };

  const confirmDelete = (loanProduct: LoanProduct) => {
    setSelectedLoanProduct(loanProduct);
    setDeleteDialog(true);
  };

  const showDetails = (loanProduct: LoanProduct) => {
    setSelectedLoanProduct(loanProduct);
    setDetailsDialog(true);
  };

  const hideDetailsDialog = () => {
    setDetailsDialog(false);
  };

  // ============ FEES MANAGEMENT ============
  const openFeesDialog = async (loanProduct: LoanProduct) => {
    setSelectedLoanProduct(loanProduct);
    setFeesDialog(true);
    await loadFees(loanProduct.id!);
  };

  const hideFeesDialog = () => {
    setFeesDialog(false);
    setFees([]);
    setSelectedFee(null);
  };

  const loadFees = async (productId: number) => {
    setFeesLoading(true);
    try {
      const response = await processRequest({
        route: `/api/financial-products/loan-products/${productId}/fees`,
        method: "GET",
      });
      if (response?.data) {
        setFees(response.data);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec du chargement des frais",
        life: 3000,
      });
    } finally {
      setFeesLoading(false);
    }
  };

  const openNewFee = () => {
    setSelectedFee(null);
    setFeeFormDialog(true);
  };

  const hideFeeFormDialog = () => {
    setFeeFormDialog(false);
    setSelectedFee(null);
  };

  const editFee = (fee: LoanProductFee) => {
    const feeToEdit = {
      ...fee,
      feeTypeId: fee.feeType?.id || fee.feeTypeId,
      calculationMethodId: fee.calculationMethod?.id || fee.calculationMethodId,
    };
    setSelectedFee(feeToEdit);
    setFeeFormDialog(true);
  };

  const confirmDeleteFee = (fee: LoanProductFee) => {
    setSelectedFee(fee);
    setDeleteFeeDialog(true);
  };

  const hideDeleteFeeDialog = () => {
    setDeleteFeeDialog(false);
    setSelectedFee(null);
  };

  const saveFee = async (fee: LoanProductFee) => {
    try {
      const dataToSend = {
        ...fee,
        product: { id: selectedLoanProduct?.id },
        feeType: { id: fee.feeTypeId },
        calculationMethod: { id: fee.calculationMethodId },
      };

      if (fee.id) {
        const response = await processRequest({
          route: `/api/financial-products/loan-products/fees/${fee.id}/update`,
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
        }
      } else {
        const response = await processRequest({
          route: `/api/financial-products/loan-products/${selectedLoanProduct?.id}/fees/new`,
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
        }
      }
      hideFeeFormDialog();
      await loadFees(selectedLoanProduct!.id!);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l'enregistrement du frais",
        life: 3000,
      });
    }
  };

  const deleteFeeAction = async () => {
    if (selectedFee?.id) {
      try {
        const response = await processRequest({
          route: `/api/financial-products/loan-products/fees/${selectedFee.id}/delete`,
          method: "DELETE",
        });
        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Frais supprimé avec succès",
            life: 3000,
          });
          await loadFees(selectedLoanProduct!.id!);
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Échec de la suppression du frais",
          life: 3000,
        });
      }
      hideDeleteFeeDialog();
    }
  };

  // ============ GUARANTEES MANAGEMENT ============
  const openGuaranteesDialog = async (loanProduct: LoanProduct) => {
    setSelectedLoanProduct(loanProduct);
    setGuaranteesDialog(true);
    await loadGuarantees(loanProduct.id!);
  };

  const hideGuaranteesDialog = () => {
    setGuaranteesDialog(false);
    setGuarantees([]);
    setSelectedGuarantee(null);
  };

  const loadGuarantees = async (productId: number) => {
    setGuaranteesLoading(true);
    try {
      const response = await processRequest({
        route: `/api/financial-products/loan-products/${productId}/guarantees`,
        method: "GET",
      });
      if (response?.data) {
        setGuarantees(response.data);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec du chargement des garanties",
        life: 3000,
      });
    } finally {
      setGuaranteesLoading(false);
    }
  };

  const openNewGuarantee = () => {
    setSelectedGuarantee(null);
    setGuaranteeFormDialog(true);
  };

  const hideGuaranteeFormDialog = () => {
    setGuaranteeFormDialog(false);
    setSelectedGuarantee(null);
  };

  const editGuarantee = (guarantee: LoanProductGuarantee) => {
    const guaranteeToEdit = {
      ...guarantee,
      guaranteeTypeId: guarantee.guaranteeType?.id || guarantee.guaranteeTypeId,
    };
    setSelectedGuarantee(guaranteeToEdit);
    setGuaranteeFormDialog(true);
  };

  const confirmDeleteGuarantee = (guarantee: LoanProductGuarantee) => {
    setSelectedGuarantee(guarantee);
    setDeleteGuaranteeDialog(true);
  };

  const hideDeleteGuaranteeDialog = () => {
    setDeleteGuaranteeDialog(false);
    setSelectedGuarantee(null);
  };

  const saveGuarantee = async (guarantee: LoanProductGuarantee) => {
    try {
      const dataToSend = {
        ...guarantee,
        product: { id: selectedLoanProduct?.id },
        guaranteeType: { id: guarantee.guaranteeTypeId },
      };

      if (guarantee.id) {
        const response = await processRequest({
          route: `/api/financial-products/loan-products/guarantees/${guarantee.id}/update`,
          method: "PUT",
          data: dataToSend,
        });
        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Garantie mise à jour avec succès",
            life: 3000,
          });
        }
      } else {
        const response = await processRequest({
          route: `/api/financial-products/loan-products/${selectedLoanProduct?.id}/guarantees/new`,
          method: "POST",
          data: dataToSend,
        });
        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Garantie créée avec succès",
            life: 3000,
          });
        }
      }
      hideGuaranteeFormDialog();
      await loadGuarantees(selectedLoanProduct!.id!);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l'enregistrement de la garantie",
        life: 3000,
      });
    }
  };

  const deleteGuaranteeAction = async () => {
    if (selectedGuarantee?.id) {
      try {
        const response = await processRequest({
          route: `/api/financial-products/loan-products/guarantees/${selectedGuarantee.id}/delete`,
          method: "DELETE",
        });
        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Garantie supprimée avec succès",
            life: 3000,
          });
          await loadGuarantees(selectedLoanProduct!.id!);
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Échec de la suppression de la garantie",
          life: 3000,
        });
      }
      hideDeleteGuaranteeDialog();
    }
  };

  // ============ WORKFLOWS MANAGEMENT ============
  const openWorkflowsDialog = async (loanProduct: LoanProduct) => {
    setSelectedLoanProduct(loanProduct);
    setWorkflowsDialog(true);
    await loadWorkflows(loanProduct.id!);
  };

  const hideWorkflowsDialog = () => {
    setWorkflowsDialog(false);
    setWorkflows([]);
    setSelectedWorkflow(null);
  };

  const loadWorkflows = async (productId: number) => {
    setWorkflowsLoading(true);
    try {
      const response = await processRequest({
        route: `/api/financial-products/loan-products/${productId}/workflows`,
        method: "GET",
      });
      if (response?.data) {
        setWorkflows(response.data);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec du chargement des flux d'approbation",
        life: 3000,
      });
    } finally {
      setWorkflowsLoading(false);
    }
  };

  const openNewWorkflow = () => {
    setSelectedWorkflow(null);
    setWorkflowFormDialog(true);
  };

  const hideWorkflowFormDialog = () => {
    setWorkflowFormDialog(false);
    setSelectedWorkflow(null);
  };

  const editWorkflow = (workflow: LoanApprovalWorkflow) => {
    const workflowToEdit = {
      ...workflow,
      approvalLevelId: workflow.approvalLevel?.id || workflow.approvalLevelId,
    };
    setSelectedWorkflow(workflowToEdit);
    setWorkflowFormDialog(true);
  };

  const confirmDeleteWorkflow = (workflow: LoanApprovalWorkflow) => {
    setSelectedWorkflow(workflow);
    setDeleteWorkflowDialog(true);
  };

  const hideDeleteWorkflowDialog = () => {
    setDeleteWorkflowDialog(false);
    setSelectedWorkflow(null);
  };

  const saveWorkflow = async (workflow: LoanApprovalWorkflow) => {
    try {
      const dataToSend = {
        ...workflow,
        product: { id: selectedLoanProduct?.id },
        approvalLevel: { id: workflow.approvalLevelId },
      };

      if (workflow.id) {
        const response = await processRequest({
          route: `/api/financial-products/loan-products/workflows/${workflow.id}/update`,
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
        }
      } else {
        const response = await processRequest({
          route: `/api/financial-products/loan-products/${selectedLoanProduct?.id}/workflows/new`,
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
        }
      }
      hideWorkflowFormDialog();
      await loadWorkflows(selectedLoanProduct!.id!);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Échec de l'enregistrement du flux d'approbation",
        life: 3000,
      });
    }
  };

  const deleteWorkflowAction = async () => {
    if (selectedWorkflow?.id) {
      try {
        const response = await processRequest({
          route: `/api/financial-products/loan-products/workflows/${selectedWorkflow.id}/delete`,
          method: "DELETE",
        });
        if (response) {
          toast.current?.show({
            severity: "success",
            summary: "Succès",
            detail: "Flux d'approbation supprimé avec succès",
            life: 3000,
          });
          await loadWorkflows(selectedLoanProduct!.id!);
        }
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Erreur",
          detail: "Échec de la suppression du flux d'approbation",
          life: 3000,
        });
      }
      hideDeleteWorkflowDialog();
    }
  };

  const deleteLoanProductAction = () => {
    if (selectedLoanProduct?.id) {
      fetchData(null, "DELETE", `${BASE_URL}/delete/${selectedLoanProduct.id}`, "delete");
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

  const actionBodyTemplate = (rowData: LoanProduct) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-outlined p-button-sm"
          onClick={() => showDetails(rowData)}
          tooltip="Voir Détails"
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editLoanProduct(rowData)}
          tooltip="Modifier"
        />
        <Button
          icon="pi pi-money-bill"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => openFeesDialog(rowData)}
          tooltip="Gérer les Frais"
        />
        <Button
          icon="pi pi-shield"
          className="p-button-rounded p-button-warning p-button-sm"
          onClick={() => openGuaranteesDialog(rowData)}
          tooltip="Gérer les Garanties"
        />
        <Button
          icon="pi pi-sitemap"
          className="p-button-rounded p-button-secondary p-button-sm"
          onClick={() => openWorkflowsDialog(rowData)}
          tooltip="Gérer les Flux"
        />
      </div>
    );
  };

  const statusBodyTemplate = (rowData: LoanProduct) => {
    const statusMap: Record<string, { severity: "success" | "warning" | "danger" | "info", label: string }> = {
      DRAFT: { severity: "info", label: "Brouillon" },
      ACTIVE: { severity: "success", label: "Actif" },
      SUSPENDED: { severity: "warning", label: "Suspendu" },
      DISCONTINUED: { severity: "danger", label: "Abandonné" },
    };

    const status = statusMap[rowData.status] || { severity: "info", label: rowData.status };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const amountBodyTemplate = (rowData: LoanProduct, field: "minAmount" | "maxAmount" | "defaultAmount") => {
    const value = rowData[field];
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("fr-BI", {
      style: "currency",
      currency: "BIF",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const interestRateBodyTemplate = (rowData: LoanProduct, field: "minInterestRate" | "maxInterestRate" | "defaultInterestRate") => {
    const value = rowData[field];
    if (value === null || value === undefined) return "-";
    return `${value.toFixed(2)}%`;
  };

  // Fee action template
  const feeActionBodyTemplate = (rowData: LoanProductFee) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editFee(rowData)}
          tooltip="Modifier"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDeleteFee(rowData)}
          tooltip="Supprimer"
        />
      </div>
    );
  };

  // Guarantee action template
  const guaranteeActionBodyTemplate = (rowData: LoanProductGuarantee) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editGuarantee(rowData)}
          tooltip="Modifier"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDeleteGuarantee(rowData)}
          tooltip="Supprimer"
        />
      </div>
    );
  };

  // Workflow action template
  const workflowActionBodyTemplate = (rowData: LoanApprovalWorkflow) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editWorkflow(rowData)}
          tooltip="Modifier"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDeleteWorkflow(rowData)}
          tooltip="Supprimer"
        />
      </div>
    );
  };

  // Workflow amount range template
  const workflowAmountRangeBodyTemplate = (rowData: LoanApprovalWorkflow) => {
    const formatter = new Intl.NumberFormat("fr-BI", {
      style: "currency",
      currency: "BIF",
      maximumFractionDigits: 0,
    });

    if (rowData.minLoanAmount && rowData.maxLoanAmount) {
      return `${formatter.format(rowData.minLoanAmount)} - ${formatter.format(rowData.maxLoanAmount)}`;
    } else if (rowData.minLoanAmount) {
      return `Min: ${formatter.format(rowData.minLoanAmount)}`;
    } else if (rowData.maxLoanAmount) {
      return `Max: ${formatter.format(rowData.maxLoanAmount)}`;
    }
    return "Tous";
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Gérer les Produits de Crédit</h4>
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
        onClick={deleteLoanProductAction}
        loading={loading && callType === "delete"}
      />
    </>
  );

  const handleTabChange = (e: { index: number }) => {
    setActiveIndex(e.index);
    if (e.index === 0) {
      setSelectedLoanProduct(null);
      setDisplayDialog(true);
    }
  };

  return (
    <div className="datatable-crud-demo">
      <Toast ref={toast} />

      <div className="card">
        <TabView activeIndex={activeIndex} onTabChange={handleTabChange}>
          <TabPanel header="Nouveau" leftIcon="pi pi-plus mr-2">
            <div className="flex align-items-center justify-content-center" style={{ minHeight: "200px" }}>
              <div className="text-center text-500">
                <i className="pi pi-file-edit mb-3" style={{ fontSize: "3rem" }}></i>
                <p>Cliquez sur cet onglet pour créer un nouveau produit de crédit</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Tous" leftIcon="pi pi-list mr-2">
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
              ref={dt}
              value={loanProducts}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} produits"
              globalFilter={globalFilter}
              header={header}
              loading={loading && callType === "loadLoanProducts"}
              emptyMessage="Aucun produit de crédit trouvé"
              className="p-datatable-sm"
            >
              <Column field="productCode" header="Code" sortable filter />
              <Column field="productNameFr" header="Nom" sortable filter />
              <Column
                field="productType.nameFr"
                header="Type"
                sortable
              />
              <Column
                field="currency.code"
                header="Devise"
                sortable
              />
              <Column field="targetClientele" header="Cible" sortable />
              <Column
                field="minAmount"
                header="Montant Min"
                body={(rowData) => amountBodyTemplate(rowData, "minAmount")}
                sortable
              />
              <Column
                field="maxAmount"
                header="Montant Max"
                body={(rowData) => amountBodyTemplate(rowData, "maxAmount")}
                sortable
              />
              <Column
                field="defaultInterestRate"
                header="Taux"
                body={(rowData) => interestRateBodyTemplate(rowData, "defaultInterestRate")}
                sortable
              />
              <Column
                field="status"
                header="Statut"
                body={statusBodyTemplate}
                sortable
              />
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "18rem" }}
              />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>

      <LoanProductForm
        visible={displayDialog}
        onHide={hideDialog}
        loanProduct={selectedLoanProduct}
        onSave={saveLoanProduct}
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
          {selectedLoanProduct && (
            <span>
              Êtes-vous sûr de vouloir supprimer <b>{selectedLoanProduct.productName}</b>?
            </span>
          )}
        </div>
      </Dialog>

      {/* Dialog Détails du Produit */}
      <Dialog
        visible={detailsDialog}
        style={{ width: "900px" }}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-info-circle" style={{ fontSize: "1.5rem" }}></i>
            <span>Détails du Produit de Crédit</span>
          </div>
        }
        modal
        onHide={hideDetailsDialog}
        footer={
          <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={hideDetailsDialog} />
        }
      >
        {selectedLoanProduct && (
          <div className="grid">
            {/* Informations Générales */}
            <div className="col-12">
              <div className="surface-100 border-round p-3 mb-3">
                <h5 className="m-0 mb-3 text-primary">
                  <i className="pi pi-info-circle mr-2"></i>Informations Générales
                </h5>
                <div className="grid">
                  <div className="col-6 md:col-3">
                    <label className="text-500 font-medium">Code</label>
                    <p className="mt-1 mb-0 font-semibold">{selectedLoanProduct.productCode}</p>
                  </div>
                  <div className="col-6 md:col-3">
                    <label className="text-500 font-medium">Nom</label>
                    <p className="mt-1 mb-0 font-semibold">{selectedLoanProduct.productNameFr || selectedLoanProduct.productName}</p>
                  </div>
                  <div className="col-6 md:col-3">
                    <label className="text-500 font-medium">Type</label>
                    <p className="mt-1 mb-0 font-semibold">{selectedLoanProduct.productType?.nameFr || "-"}</p>
                  </div>
                  <div className="col-6 md:col-3">
                    <label className="text-500 font-medium">Statut</label>
                    <p className="mt-1 mb-0">{statusBodyTemplate(selectedLoanProduct)}</p>
                  </div>
                  <div className="col-6 md:col-3">
                    <label className="text-500 font-medium">Devise</label>
                    <p className="mt-1 mb-0 font-semibold">{selectedLoanProduct.currency?.code || "-"}</p>
                  </div>
                  <div className="col-6 md:col-3">
                    <label className="text-500 font-medium">Clientèle Cible</label>
                    <p className="mt-1 mb-0 font-semibold">
                      {selectedLoanProduct.targetClientele === "INDIVIDUAL" ? "Individuel" :
                       selectedLoanProduct.targetClientele === "GROUP" ? "Groupe" :
                       selectedLoanProduct.targetClientele === "MIXED" ? "Mixte" : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Montants */}
            <div className="col-12 md:col-6">
              <div className="surface-100 border-round p-3 mb-3 h-full">
                <h5 className="m-0 mb-3 text-primary">
                  <i className="pi pi-wallet mr-2"></i>Montants
                </h5>
                <div className="grid">
                  <div className="col-6">
                    <label className="text-500 font-medium">Montant Minimum</label>
                    <p className="mt-1 mb-0 font-semibold text-lg">{amountBodyTemplate(selectedLoanProduct, "minAmount")}</p>
                  </div>
                  <div className="col-6">
                    <label className="text-500 font-medium">Montant Maximum</label>
                    <p className="mt-1 mb-0 font-semibold text-lg">{amountBodyTemplate(selectedLoanProduct, "maxAmount")}</p>
                  </div>
                  <div className="col-12">
                    <label className="text-500 font-medium">Montant par Défaut</label>
                    <p className="mt-1 mb-0 font-semibold text-lg text-primary">{amountBodyTemplate(selectedLoanProduct, "defaultAmount")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Durées */}
            <div className="col-12 md:col-6">
              <div className="surface-100 border-round p-3 mb-3 h-full">
                <h5 className="m-0 mb-3 text-primary">
                  <i className="pi pi-calendar mr-2"></i>Durées (en mois)
                </h5>
                <div className="grid">
                  <div className="col-6">
                    <label className="text-500 font-medium">Durée Minimum</label>
                    <p className="mt-1 mb-0 font-semibold text-lg">{selectedLoanProduct.minTermMonths} mois</p>
                  </div>
                  <div className="col-6">
                    <label className="text-500 font-medium">Durée Maximum</label>
                    <p className="mt-1 mb-0 font-semibold text-lg">{selectedLoanProduct.maxTermMonths} mois</p>
                  </div>
                  <div className="col-12">
                    <label className="text-500 font-medium">Durée par Défaut</label>
                    <p className="mt-1 mb-0 font-semibold text-lg text-primary">{selectedLoanProduct.defaultTermMonths} mois</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Taux d'intérêt */}
            <div className="col-12 md:col-6">
              <div className="surface-100 border-round p-3 mb-3 h-full">
                <h5 className="m-0 mb-3 text-primary">
                  <i className="pi pi-percentage mr-2"></i>Taux d&apos;Intérêt
                </h5>
                <div className="grid">
                  <div className="col-6">
                    <label className="text-500 font-medium">Taux Minimum</label>
                    <p className="mt-1 mb-0 font-semibold text-lg">{interestRateBodyTemplate(selectedLoanProduct, "minInterestRate")}</p>
                  </div>
                  <div className="col-6">
                    <label className="text-500 font-medium">Taux Maximum</label>
                    <p className="mt-1 mb-0 font-semibold text-lg">{interestRateBodyTemplate(selectedLoanProduct, "maxInterestRate")}</p>
                  </div>
                  <div className="col-6">
                    <label className="text-500 font-medium">Taux par Défaut</label>
                    <p className="mt-1 mb-0 font-semibold text-lg text-primary">{interestRateBodyTemplate(selectedLoanProduct, "defaultInterestRate")}</p>
                  </div>
                  <div className="col-6">
                    <label className="text-500 font-medium">Méthode de Calcul</label>
                    <p className="mt-1 mb-0 font-semibold">{selectedLoanProduct.interestCalculationMethod?.nameFr || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Paiements */}
            <div className="col-12 md:col-6">
              <div className="surface-100 border-round p-3 mb-3 h-full">
                <h5 className="m-0 mb-3 text-primary">
                  <i className="pi pi-credit-card mr-2"></i>Paiements
                </h5>
                <div className="grid">
                  <div className="col-6">
                    <label className="text-500 font-medium">Fréquence de Paiement</label>
                    <p className="mt-1 mb-0 font-semibold">{selectedLoanProduct.paymentFrequency?.nameFr || "-"}</p>
                  </div>
                  <div className="col-6">
                    <label className="text-500 font-medium">Type de Période de Grâce</label>
                    <p className="mt-1 mb-0 font-semibold">
                      {selectedLoanProduct.gracePeriodType === "NONE" ? "Aucune" :
                       selectedLoanProduct.gracePeriodType === "INTEREST_ONLY" ? "Intérêts Seulement" :
                       selectedLoanProduct.gracePeriodType === "PRINCIPAL_INTEREST" ? "Capital et Intérêts" :
                       selectedLoanProduct.gracePeriodType || "-"}
                    </p>
                  </div>
                  <div className="col-6">
                    <label className="text-500 font-medium">Période de Grâce Max</label>
                    <p className="mt-1 mb-0 font-semibold">{selectedLoanProduct.maxGracePeriodDays || 0} jours</p>
                  </div>
                  <div className="col-6">
                    <label className="text-500 font-medium">Remboursement Anticipé</label>
                    <p className="mt-1 mb-0">
                      <Tag
                        value={selectedLoanProduct.allowsEarlyRepayment ? "Autorisé" : "Non Autorisé"}
                        severity={selectedLoanProduct.allowsEarlyRepayment ? "success" : "danger"}
                      />
                    </p>
                  </div>
                  {selectedLoanProduct.allowsEarlyRepayment && (
                    <div className="col-12">
                      <label className="text-500 font-medium">Pénalité Remboursement Anticipé</label>
                      <p className="mt-1 mb-0 font-semibold">{selectedLoanProduct.earlyRepaymentPenaltyRate?.toFixed(2) || 0}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exigences */}
            <div className="col-12">
              <div className="surface-100 border-round p-3 mb-3">
                <h5 className="m-0 mb-3 text-primary">
                  <i className="pi pi-check-circle mr-2"></i>Exigences
                </h5>
                <div className="grid">
                  <div className="col-6 md:col-3">
                    <label className="text-500 font-medium">Garants Requis</label>
                    <p className="mt-1 mb-0">
                      <Tag
                        value={selectedLoanProduct.requiresGuarantors ? "Oui" : "Non"}
                        severity={selectedLoanProduct.requiresGuarantors ? "warning" : "info"}
                      />
                    </p>
                  </div>
                  {selectedLoanProduct.requiresGuarantors && (
                    <div className="col-6 md:col-3">
                      <label className="text-500 font-medium">Nombre Min. de Garants</label>
                      <p className="mt-1 mb-0 font-semibold">{selectedLoanProduct.minGuarantors || 0}</p>
                    </div>
                  )}
                  <div className="col-6 md:col-3">
                    <label className="text-500 font-medium">Garantie Requise</label>
                    <p className="mt-1 mb-0">
                      <Tag
                        value={selectedLoanProduct.requiresCollateral ? "Oui" : "Non"}
                        severity={selectedLoanProduct.requiresCollateral ? "warning" : "info"}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {(selectedLoanProduct.descriptionFr || selectedLoanProduct.description) && (
              <div className="col-12">
                <div className="surface-100 border-round p-3">
                  <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-align-left mr-2"></i>Description
                  </h5>
                  <p className="m-0 line-height-3">{selectedLoanProduct.descriptionFr || selectedLoanProduct.description}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Dialog Frais du Produit */}
      <Dialog
        visible={feesDialog}
        style={{ width: "1000px" }}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-money-bill" style={{ fontSize: "1.5rem" }}></i>
            <span>Frais du Produit: {selectedLoanProduct?.productNameFr || selectedLoanProduct?.productName}</span>
          </div>
        }
        modal
        onHide={hideFeesDialog}
        footer={
          <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={hideFeesDialog} />
        }
      >
        <div className="mb-3">
          <Button
            label="Ajouter un Frais"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={openNewFee}
          />
        </div>
        <DataTable
          value={fees}
          loading={feesLoading}
          emptyMessage="Aucun frais trouvé pour ce produit"
          className="p-datatable-sm"
          paginator
          rows={5}
        >
          <Column field="feeType.nameFr" header="Type de Frais" sortable />
          <Column field="calculationMethod.nameFr" header="Méthode de Calcul" sortable />
          <Column
            header="Montant"
            body={(rowData: LoanProductFee) => {
              if (rowData.fixedAmount) {
                return new Intl.NumberFormat("fr-BI", { style: "currency", currency: "BIF", maximumFractionDigits: 0 }).format(rowData.fixedAmount);
              } else if (rowData.percentageRate) {
                return `${rowData.percentageRate.toFixed(2)}%`;
              }
              return "-";
            }}
          />
          <Column field="collectionTime" header="Moment de Collecte" sortable />
          <Column
            header="Statut"
            body={(rowData: LoanProductFee) => (
              <Tag value={rowData.isActive ? "Actif" : "Inactif"} severity={rowData.isActive ? "success" : "danger"} />
            )}
          />
          <Column body={feeActionBodyTemplate} header="Actions" style={{ width: "120px" }} />
        </DataTable>
      </Dialog>

      {/* Fee Form Dialog */}
      <LoanProductFeeForm
        visible={feeFormDialog}
        onHide={hideFeeFormDialog}
        loanProductFee={selectedFee}
        onSave={saveFee}
        productId={selectedLoanProduct?.id || 0}
      />

      {/* Delete Fee Dialog */}
      <Dialog
        visible={deleteFeeDialog}
        style={{ width: "450px" }}
        header="Confirmer la suppression"
        modal
        footer={
          <>
            <Button label="Non" icon="pi pi-times" className="p-button-text" onClick={hideDeleteFeeDialog} />
            <Button label="Oui" icon="pi pi-check" className="p-button-text" onClick={deleteFeeAction} />
          </>
        }
        onHide={hideDeleteFeeDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
          <span>Êtes-vous sûr de vouloir supprimer ce frais?</span>
        </div>
      </Dialog>

      {/* Dialog Garanties du Produit */}
      <Dialog
        visible={guaranteesDialog}
        style={{ width: "1000px" }}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-shield" style={{ fontSize: "1.5rem" }}></i>
            <span>Garanties du Produit: {selectedLoanProduct?.productNameFr || selectedLoanProduct?.productName}</span>
          </div>
        }
        modal
        onHide={hideGuaranteesDialog}
        footer={
          <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={hideGuaranteesDialog} />
        }
      >
        <div className="mb-3">
          <Button
            label="Ajouter une Garantie"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={openNewGuarantee}
          />
        </div>
        <DataTable
          value={guarantees}
          loading={guaranteesLoading}
          emptyMessage="Aucune garantie trouvée pour ce produit"
          className="p-datatable-sm"
          paginator
          rows={5}
        >
          <Column field="guaranteeType.nameFr" header="Type de Garantie" sortable />
          <Column
            header="Couverture Min"
            body={(rowData: LoanProductGuarantee) => {
              if (rowData.minCoveragePercentage) {
                return `${rowData.minCoveragePercentage}%`;
              }
              return "-";
            }}
          />
          <Column
            header="Obligatoire"
            body={(rowData: LoanProductGuarantee) => (
              <Tag value={rowData.isMandatory ? "Obligatoire" : "Optionnel"} severity={rowData.isMandatory ? "warning" : "info"} />
            )}
          />
          <Column
            header="Statut"
            body={(rowData: LoanProductGuarantee) => (
              <Tag value={rowData.isActive ? "Actif" : "Inactif"} severity={rowData.isActive ? "success" : "danger"} />
            )}
          />
          <Column body={guaranteeActionBodyTemplate} header="Actions" style={{ width: "120px" }} />
        </DataTable>
      </Dialog>

      {/* Guarantee Form Dialog */}
      <LoanProductGuaranteeForm
        visible={guaranteeFormDialog}
        onHide={hideGuaranteeFormDialog}
        loanProductGuarantee={selectedGuarantee}
        onSave={saveGuarantee}
        productId={selectedLoanProduct?.id || 0}
      />

      {/* Delete Guarantee Dialog */}
      <Dialog
        visible={deleteGuaranteeDialog}
        style={{ width: "450px" }}
        header="Confirmer la suppression"
        modal
        footer={
          <>
            <Button label="Non" icon="pi pi-times" className="p-button-text" onClick={hideDeleteGuaranteeDialog} />
            <Button label="Oui" icon="pi pi-check" className="p-button-text" onClick={deleteGuaranteeAction} />
          </>
        }
        onHide={hideDeleteGuaranteeDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
          <span>Êtes-vous sûr de vouloir supprimer cette garantie?</span>
        </div>
      </Dialog>

      {/* Dialog Flux d'Approbation du Produit */}
      <Dialog
        visible={workflowsDialog}
        style={{ width: "1000px" }}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-sitemap" style={{ fontSize: "1.5rem" }}></i>
            <span>Flux d&apos;Approbation du Produit: {selectedLoanProduct?.productNameFr || selectedLoanProduct?.productName}</span>
          </div>
        }
        modal
        onHide={hideWorkflowsDialog}
        footer={
          <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={hideWorkflowsDialog} />
        }
      >
        <div className="mb-3">
          <Button
            label="Ajouter un Flux"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={openNewWorkflow}
          />
        </div>
        <DataTable
          value={workflows}
          loading={workflowsLoading}
          emptyMessage="Aucun flux trouvé pour ce produit"
          className="p-datatable-sm"
          paginator
          rows={5}
        >
          <Column field="sequenceOrder" header="Séquence" sortable />
          <Column field="approvalLevel.nameFr" header="Niveau d'Approbation" sortable />
          <Column header="Plage de Montant" body={workflowAmountRangeBodyTemplate} />
          <Column
            header="Statut"
            body={(rowData: LoanApprovalWorkflow) => (
              <Tag value={rowData.isActive ? "Actif" : "Inactif"} severity={rowData.isActive ? "success" : "danger"} />
            )}
          />
          <Column body={workflowActionBodyTemplate} header="Actions" style={{ width: "120px" }} />
        </DataTable>
      </Dialog>

      {/* Workflow Form Dialog */}
      <LoanApprovalWorkflowForm
        visible={workflowFormDialog}
        onHide={hideWorkflowFormDialog}
        loanApprovalWorkflow={selectedWorkflow}
        onSave={saveWorkflow}
        productId={selectedLoanProduct?.id || 0}
      />

      {/* Delete Workflow Dialog */}
      <Dialog
        visible={deleteWorkflowDialog}
        style={{ width: "450px" }}
        header="Confirmer la suppression"
        modal
        footer={
          <>
            <Button label="Non" icon="pi pi-times" className="p-button-text" onClick={hideDeleteWorkflowDialog} />
            <Button label="Oui" icon="pi pi-check" className="p-button-text" onClick={deleteWorkflowAction} />
          </>
        }
        onHide={hideDeleteWorkflowDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
          <span>Êtes-vous sûr de vouloir supprimer ce flux?</span>
        </div>
      </Dialog>
    </div>
  );
};

export default LoanProductPage;
