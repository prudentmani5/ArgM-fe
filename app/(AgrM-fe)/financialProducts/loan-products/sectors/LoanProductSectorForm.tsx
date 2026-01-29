"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { LoanProductSector } from "./LoanProductSector";
import useConsumApi from "@/hooks/fetchData/useConsumApi";

interface LoanProductSectorFormProps {
  visible: boolean;
  onHide: () => void;
  loanProductSector: LoanProductSector | null;
  onSave: (loanProductSector: LoanProductSector) => void;
  productId: number;
}

const LoanProductSectorForm: React.FC<LoanProductSectorFormProps> = ({
  visible,
  onHide,
  loanProductSector,
  onSave,
  productId,
}) => {
  const [formData, setFormData] = useState<LoanProductSector>(new LoanProductSector());
  const [submitted, setSubmitted] = useState(false);
  const [sectors, setSectors] = useState<any[]>([]);

  const { processRequest: loadSectors } = useConsumApi();

  useEffect(() => {
    if (loanProductSector) {
      setFormData({ ...loanProductSector });
    } else {
      const newSector = new LoanProductSector();
      newSector.productId = productId;
      setFormData(newSector);
    }
    setSubmitted(false);
  }, [loanProductSector, visible, productId]);

  useEffect(() => {
    loadActivitySectors();
  }, []);

  const loadActivitySectors = async () => {
    try {
      const response = await loadSectors({
        route: "/api/module-customer-group/activity-sectors/findall",
        method: "GET",
      });

      if (response?.data) {
        setSectors(response.data);
      }
    } catch (error) {
      console.error("Error loading activity sectors:", error);
    }
  };

  const handleChange = (field: keyof LoanProductSector, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!formData.sectorId) {
      return;
    }

    onSave(formData);
  };

  const renderDialogFooter = () => {
    return (
      <div>
        <Button
          label="Cancel / Annuler"
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
        />
        <Button
          label="Save / Enregistrer"
          icon="pi pi-check"
          onClick={handleSubmit}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "450px" }}
      header={
        loanProductSector?.id
          ? "Edit Loan Product Sector / Modifier Secteur de Produit"
          : "New Loan Product Sector / Nouveau Secteur de Produit"
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="sectorId">
            Activity Sector / Secteur d&apos;Activité *
          </label>
          <Dropdown
            id="sectorId"
            value={formData.sectorId}
            options={sectors}
            onChange={(e) => handleChange("sectorId", e.value)}
            optionLabel="sectorName"
            optionValue="id"
            placeholder="Select / Sélectionner"
            className={submitted && !formData.sectorId ? "p-invalid" : ""}
          />
          {submitted && !formData.sectorId && (
            <small className="p-error">
              Activity sector is required / Secteur d&apos;activité requis
            </small>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default LoanProductSectorForm;
