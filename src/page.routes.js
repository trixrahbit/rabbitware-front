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
      // {
      //   name: "dashboards",
      //   icon: <Icon>dashboard</Icon>,
      //   collapse: [
      //     {
      //       name: "analytics",
      //       route: "/dashboards/analytics",
      //     },
      //     {
      //       name: "sales",
      //       route: "/dashboards/sales",
      //       component: <SalesByCountry />
      //     },
      //   ],
      // },
      // {
      //   name: "users",
      //   icon: <Icon>people</Icon>,
      //   collapse: [
      //     {
      //       name: "reports",
      //       route: "/pages/users/reports",
      //     },
      //   ],
      // },
      // {
      //   name: "extra",
      //   icon: <Icon>queue_play_next</Icon>,
      //   collapse: [
      //     {
      //       name: "pricing page",
      //       route: "/pages/pricing-page",
      //     },
      //     { name: "RTL", route: "/pages/rtl" },
      //     { name: "widgets", route: "/pages/widgets" },
      //     { name: "charts", route: "/pages/charts" },
      //     {
      //       name: "notfications",
      //       route: "/pages/notifications"
      //     },
      //   ],
      // },
      // {
      //   name: "projects",
      //   icon: <Icon>precision_manufacturing</Icon>,
      //   collapse: [
      //     {
      //       name: "timeline",
      //       route: "/pages/projects",
      //     },
      //   ],
      // },
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
  // {
  //   name: "application",
  //   collapse: [
  //     {
  //       name: "kanban",
  //       route: "/applications/kanban",
  //       icon: "widgets",
  //     },
  //     {
  //       name: "wizard",
  //       route: "/applications/wizard",
  //       icon: "import_contacts",
  //     },
  //     {
  //       name: "data tables",
  //       route: "/applications/data-tables",
  //       icon: "backup_table",
  //     },
  //     {
  //       name: "calendar",
  //       route: "/applications/calendar",
  //       icon: "event",
  //     },
  //   ],
  // },
  // {
  //   name: "docs",
  //   collapse: [
  //     {
  //       name: "getting started",
  //       href: "https://www.creative-tim.com/learning-lab/react/quick-start/material-dashboard/",
  //       description: "All about overview, quick start, license and contents",
  //       icon: <Icon>article</Icon>,
  //     },
  //     {
  //       name: "foundation",
  //       href: "https://www.creative-tim.com/learning-lab/react/colors/material-dashboard/",
  //       description: "See our colors, icons and typography",
  //       icon: <Icon>grading</Icon>,
  //     },
  //     {
  //       name: "components",
  //       href: "https://www.creative-tim.com/learning-lab/react/alerts/material-dashboard/",
  //       description: "Explore our collection of fully designed components",
  //       icon: <Icon>apps</Icon>,
  //     },
  //     {
  //       name: "plugins",
  //       href: "https://www.creative-tim.com/learning-lab/react/datepicker/material-dashboard/",
  //       description: "Check how you can integrate our plugins",
  //       icon: <Icon>extension</Icon>,
  //     },
  //   ],
  // },
];

export default pageRoutes;
