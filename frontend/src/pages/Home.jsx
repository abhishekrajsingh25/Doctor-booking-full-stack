import React from "react";
import Header from "../components/Header";
import SpecialityMenu from "../components/SpecialityMenu";
import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";
import AiDoctorRecommendation from "../components/AiDoctorRecommendation";

const Home = () => {
  return (
    <div>
      <Header />
      <AiDoctorRecommendation />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;
