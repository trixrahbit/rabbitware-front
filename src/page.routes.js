// @mui material components
import Icon from "@mui/material/Icon";
import SalesByCountry from "layouts/dashboards/analytics/components/SalesByCountry";
import Sales from "layouts/dashboards/sales";


const pageRoutes = [
  {
    name: "pages",
    columns: 3,
    rowsPerColumn: 2,
    collapse: [
      {
        name: "account",
        icon: <Icon>account_balance</Icon>,
        collapse: [

          {
            name: "billing",
            route: "/pages/account/billing",
          },
          {
            name: "invoice",
            route: "/pages/account/invoice",
          },
        ],
      },
      {
        name: "profile",
        icon: <Icon>badge</Icon>,
        collapse: [
          {
            name: "profile overview",
            route: "/pages/profile/profile-overview",
          },

          {
            name: "all projects",
            route: "/pages/profile/all-projects",
          },
        ],
      },
    ],
  },
  {
    name: "authenticaton",
    collapse: [
      {
        name: "sign in",
        dropdown: true,
        icon: <Icon>login</Icon>,
        collapse: [
          {
            name: "basic",
            route: "/authentication/sign-in/basic",

          },
          {
            name: "cover",
            route: "/authentication/sign-in/cover",

          },
          {
            name: "illustration",
            route: "/authentication/sign-in/illustration",
          },
        ],
      },
      {
        name: "sign up",
        dropdown: true,
        icon: <Icon>assignment</Icon>,
        collapse: [
          {
            name: "cover",
            route: "/authentication/sign-up/cover"
          },
        ],
      },
      {
        name: "reset password",
        dropdown: true,
        icon: <Icon>restart_alt</Icon>,
        collapse: [
          {
            name: "cover",
            route: "/authentication/reset-password/cover",
          },
        ],
      },
    ],
  },

];

export default pageRoutes;
