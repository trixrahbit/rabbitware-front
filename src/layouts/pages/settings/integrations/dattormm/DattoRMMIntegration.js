import React from "react";
import BaseIntegrationComponent from "../components/BaseIntegrationComponent";

const DattoRMMIntegration = ({ onSave }) => {
  const fields = [
    { label: "API Key", name: "apiKey" },
    { label: "API Secret", name: "apiSecret" },
  ];

  return (
    <BaseIntegrationComponent
      integrationName="Datto RMM"
      fields={fields}
      onSave={onSave}
    />
  );
};

export default DattoRMMIntegration;
