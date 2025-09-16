// src/pages/Sections/SectionPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FocalTaskCard from "../../components/FocalTaskCard/FocalTaskCard";
import { Outlet } from "react-router-dom";
import "./SectionPage.css";
import config from "../../config";

const SectionPage = () => {
  const { sectionId } = useParams();
  const [focalMap, setFocalMap] = useState({}); // { section_designation: full_name }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch focal persons for each section_designation
  useEffect(() => {
    if (!sectionId) {
      setLoading(false);
      return;
    }

    const fetchFocalPersons = async () => {
      try {
        const fetchedMap = {};

        // Fetch focal persons for this sectionId
        const response = await fetch(
          `${config.API_BASE_URL}/school/office/section?section_designation=${encodeURIComponent(sectionId)}`
        );

        if (!response.ok) {
          console.warn(`Failed to fetch focal for: ${sectionId}`);
          fetchedMap[sectionId] = "No assigned yet";
        } else {
          const data = await response.json();
          if (data && data.length > 0) {
            const firstFocal = data[0];
            const fullName = `${firstFocal.first_name} ${firstFocal.middle_name ? firstFocal.middle_name + " " : ""}${firstFocal.last_name}`.trim();
            fetchedMap[sectionId] = fullName;
          } else {
            fetchedMap[sectionId] = "No assigned yet";
          }
        }

        setFocalMap(fetchedMap);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching focal persons:", err);
        setError("Failed to load focal persons.");
        setLoading(false);
      }
    };

    fetchFocalPersons();
  }, [sectionId]);

  // If on task-list route, render Outlet only
  if (window.location.pathname.includes("task-list")) {
    return <Outlet />;
  }

  // Show loading state
  if (loading) {
    return <div className="loading">Loading focal persons...</div>;
  }

  // Show error state
  if (error) {
    return <div className="error">⚠️ {error}</div>;
  }

  return (
    <div className="focal-container">
      <FocalTaskCard
        key={sectionId}
        section_designation={sectionId}
        full_name={focalMap[sectionId] || "No assigned yet"}
        path="task-list"
      />
      <Outlet />
    </div>
  );
};

export default SectionPage;