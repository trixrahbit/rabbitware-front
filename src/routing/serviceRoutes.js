import Ticketing from "layouts/pages/service/tickets";
import Icon from "@mui/material/Icon";

const serviceRoutes = [
  {
    type: "title",
    title: "Service",
    key: "service",
  },
  {
    type: "collapse",
    name: "Tickets",
    key: "tickets",
    icon: <Icon fontSize="medium">confirmation_number</Icon>,
    collapse: [
      {
        name: "Ticketing",
        key: "ticketing",
        route: "/service/tickets",
        component: <Ticketing />,
        protected: true,
      },
    ],
  },
];

export default serviceRoutes;
