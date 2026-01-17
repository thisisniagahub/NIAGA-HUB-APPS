export const taskTemplates = [
  {
    id: "landing-basic",
    type: "landing_page",
    description: "Create a landing page draft",
    payload: { pageSlug: "promo", content: { title: "Abang Colek Promo" } },
  },
  {
    id: "config-feature-flags",
    type: "app_config",
    description: "Update feature flags",
    payload: { appName: "abang-colek", configKey: "featureFlags", configValue: { luckyDraw: true } },
  },
  {
    id: "report-weekly",
    type: "report",
    description: "Generate weekly performance report",
    payload: { range: "7d" },
  },
];
