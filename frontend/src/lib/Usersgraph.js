import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { staffUser, adminUser } from "../features/authSlice";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserRoleChart = () => {
  const [userData, setUserData] = useState({ staff: 0, admin: 0 });
  const { staffuser, adminuser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(staffUser());
    dispatch(adminUser());
  }, [dispatch]);

  useEffect(() => {
    setUserData({
      staff: staffuser?.length || 0,
      admin: adminuser?.length || 0,
    });
  }, [staffuser, adminuser]);

  const data = {
    labels: ["Staff", "Admin"],
    datasets: [
      {
        label: "Number of Users",
        data: [userData.staff, userData.admin],
        backgroundColor: ["#3b82f6", "#a855f7"], // Blue for Staff, Purple for Admin
        borderColor: ["#2563eb", "#9333ea"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "User Roles Distribution" },
    },
  };

  return (
    <div style={{ width: "600px", margin: "auto" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default UserRoleChart;
