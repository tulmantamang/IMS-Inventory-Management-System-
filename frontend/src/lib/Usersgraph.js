import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../features/authSlice";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserRoleChart = () => {
  const { allUsers } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const staffCount = allUsers.filter(u => u.role?.trim().toUpperCase() === "STAFF" && u.status === 'ACTIVE').length;
  const adminCount = allUsers.filter(u => u.role?.trim().toUpperCase() === "ADMIN" && u.status === 'ACTIVE').length;

  const data = {
    labels: ["Staff", "Admin"],
    datasets: [
      {
        label: "Number of Active Users",
        data: [staffCount, adminCount],
        backgroundColor: ["#3b82f6", "#a855f7"],
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
