import Layout from "../components/Layout";
import WeatherWidget from "../components/WeatherWidget";

export default function RestaurantPage(params) {
  return (
    <Layout>
      <h3>식당페이지</h3>
      <WeatherWidget></WeatherWidget>
    </Layout>
  );
}
