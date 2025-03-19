import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useClients } from "../../../../../context/ClientsContext";

const ClientsList = ({ onSelectClient, selectedClient }) => {
  const { clients } = useClients();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {clients.map((client) => (
        <Card
          key={client.id}
          sx={{
            padding: 2,
            cursor: "pointer",
            backgroundColor: selectedClient?.id === client.id ? "#AED581" : "#fff",
            "&:hover": { backgroundColor: "#C5E1A5" },
            transition: "0.3s",
          }}
          onClick={() => onSelectClient(client)}
        >
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              {client.name}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ClientsList;
