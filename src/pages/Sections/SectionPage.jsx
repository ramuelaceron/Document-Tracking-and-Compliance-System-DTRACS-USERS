// src/pages/Sections/SectionPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FocalTaskCard from "../../components/FocalTaskCard/FocalTaskCard";
import { Outlet } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import "./SectionPage.css";
import config from "../../config";

const SectionPage = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const [focalMap, setFocalMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBack = () => navigate(-1);

  useEffect(() => {
    if (!sectionId) {
      setLoading(false);
      return;
    }

    const fetchFocalPersons = async () => {
      try {
        const fetchedMap = {};

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

  if (window.location.pathname.includes("task-list")) {
    return <Outlet />;
  }

  const fullName = focalMap[sectionId] || "No assigned yet";
  const isAssigned = fullName !== "No assigned yet";

  return (
    <div className="section-page-container">
      {/* ✅ Back button fixed to top-left */}
      <button className="section-back-btn" onClick={handleBack}>
        <IoChevronBackOutline className="icon-md" 
        /> Back
      </button>

      {/* ✅ Show states without page background — card only */}
      {loading ? (
        <div className="state-card-container">
          <div className="state-card">
            <div className="spinner"></div>
            <p>Loading focal person...</p>
          </div>
        </div>
      ) : error ? (
        <div className="state-card-container">
          <div className="state-card error-card">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      ) : isAssigned ? (
        <div className="state-card-container">
          <div className="state-card assigned-card">
            <FocalTaskCard
              key={sectionId}
              section_designation={sectionId}
              full_name={fullName}
              path="task-list"
            />
            <Outlet />
          </div>
        </div>
      ) : (
        <div className="state-card-container">
          <div className="state-card empty-card">
            <div className="empty-icon">📋</div>
            <h2>No Focal Person Assigned Yet</h2>
            <p className="empty-description">
              This section doesn’t have an assigned focal person.
              <br />
              Please contact your administrator to assign one.
            </p>
            <div className="empty-footer">
              <span className="section-label">Section:</span>
              <span className="section-name">{sectionId}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionPage;