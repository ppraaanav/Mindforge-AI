import api from "./api";

export const fetchAnalyticsOverview = async () => {
  const { data } = await api.get("/analytics/overview");
  return data;
};
