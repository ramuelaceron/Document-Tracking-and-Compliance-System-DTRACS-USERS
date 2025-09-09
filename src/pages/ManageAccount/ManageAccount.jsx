// src/pages/ManageAccount/ManageAccount.jsx
import React, { useState, useRef, useEffect } from 'react';
import './ManageAccount.css';

// Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import EditLinks from '../../components/EditLinks/EditLinks';
import ProfileInfoCard from '../../components/ProfileInfoCard/ProfileInfoCard';
import ProfileAvatar from '../../components/ProfileAvatar/ProfileAvatar';

const ManageAccount = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  // ✅ Unified temp state for all editable fields
  const [tempProfile, setTempProfile] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    contact_number: "",
  });

  // ✅ Load user data from sessionStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedUser = sessionStorage.getItem("currentUser");
        if (!savedUser) {
          toast.error("Not logged in. Redirecting...");
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
          return;
        }

        const currentUser = JSON.parse(savedUser);
        
        // Set default user data structure
        const userData = {
          user_id: currentUser.user_id || "123",
          first_name: currentUser.first_name || "John",
          last_name: currentUser.last_name || "Doe",
          middle_name: currentUser.middle_name || "",
          email: currentUser.email || "john.doe@example.com",
          contact_number: currentUser.contact_number || "+1234567890",
          avatar: currentUser.avatar || null,
          role: currentUser.role || "school",
          school_name: currentUser.school_name || "Sample School",
          school_address: currentUser.school_address || "123 Main St, City",
          position: currentUser.position || "Teacher",
          office: currentUser.office || "Education",
          section_designation: currentUser.section_designation || "Elementary"
        };

        setUserData(userData);
        setAvatar(userData.avatar);

        // Initialize tempProfile with current data
        setTempProfile({
          first_name: userData.first_name,
          middle_name: userData.middle_name,
          last_name: userData.last_name,
          email: userData.email,
          contact_number: userData.contact_number,
        });

      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load user data. Please login again.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    };

    loadUserData();
  }, []);

  if (!userData) {
    return <div className="manage-account-app">Loading user data...</div>;
  }

  // Check if any field has changed
  const hasChanges = () => {
    return (
      tempProfile.first_name.trim() !== userData.first_name.trim() ||
      tempProfile.middle_name.trim() !== userData.middle_name.trim() ||
      tempProfile.last_name.trim() !== userData.last_name.trim() ||
      tempProfile.email.trim() !== userData.email.trim() ||
      tempProfile.contact_number.trim() !== userData.contact_number.trim()
    );
  };

  // Confirm discard
  const confirmDiscard = () => {
    if (!hasChanges()) {
      setIsEditing(false);
    } else {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
      if (confirmed) {
        // Reset tempProfile to original values
        setTempProfile({
          first_name: userData.first_name,
          middle_name: userData.middle_name,
          last_name: userData.last_name,
          email: userData.email,
          contact_number: userData.contact_number,
        });
        toast.info("Changes discarded.", { autoClose: 1500 });
        setIsEditing(false);
      } else {
        toast.info("Edit cancelled. Your changes are safe.", { autoClose: 1500 });
      }
    }
  };

  // Unified save handler — frontend only
  const handleSaveProfile = () => {
    // Validate required fields
    if (!tempProfile.first_name.trim() || !tempProfile.last_name.trim()) {
      toast.warn("First and last name are required.");
      return;
    }

    if (!tempProfile.email || !tempProfile.email.includes("@")) {
      toast.warn("Please enter a valid email.");
      return;
    }

    if (!tempProfile.contact_number?.trim()) {
      toast.warn("Please enter a contact number.");
      return;
    }

    try {
      // ✅ Update local state only (frontend simulation)
      const updatedData = { 
        ...userData, 
        first_name: tempProfile.first_name.trim(),
        middle_name: tempProfile.middle_name?.trim() || '',
        last_name: tempProfile.last_name.trim(),
        email: tempProfile.email.trim(),
        contact_number: tempProfile.contact_number.trim(),
      };
      
      setUserData(updatedData);

      // ✅ Update session storage (simulated persistence)
      sessionStorage.setItem("currentUser", JSON.stringify(updatedData));

      toast.success("✅ Profile updated successfully! (Frontend simulation)");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("❌ Failed to update profile. Please try again.");
    }
  };

  // Handle image upload (frontend only)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPG, PNG, GIF)");
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Max 5MB allowed.");
        e.target.value = '';
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Image = reader.result;
          setAvatar(base64Image);
          
          // Update session storage
          const savedUser = JSON.parse(sessionStorage.getItem("currentUser") || '{}');
          const updatedUser = { ...savedUser, avatar: base64Image };
          sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
          
          setUserData(prev => ({ ...prev, avatar: base64Image }));
          
          toast.info("Profile picture updated!", { autoClose: 1500 });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error("Failed to process image. Please try again.");
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      confirmDiscard();
    } else {
      setIsEditing(true);
      toast.info("Edit mode enabled. Make your changes!", { autoClose: 2000 });
    }
  };

  return (
    <div className="manage-account-app">
      <main className="manage-account-main">
        {/* Profile Section */}
        <div className="profile-section">
          <ProfileAvatar
            avatar={avatar}
            isEditing={isEditing}
            onButtonClick={handleButtonClick}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            userName={`${userData.first_name} ${userData.middle_name} ${userData.last_name}`}
          />

          <ProfileInfoCard
            userData={userData}
            isEditing={isEditing}
            toggleEditMode={toggleEditMode}
          />
        </div>

        {/* Edit Links — shows when in edit mode */}
        {isEditing && (
          <EditLinks
            tempProfile={tempProfile}
            setTempProfile={setTempProfile}
            handleSaveProfile={handleSaveProfile}
            confirmDiscard={confirmDiscard}
            hasChanges={hasChanges}
          />
        )}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ManageAccount;