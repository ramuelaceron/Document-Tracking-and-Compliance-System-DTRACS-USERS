	// src/components/EditLinks/EditLinks.jsx
	import React from 'react';
	import './EditLinks.css';

	const EditLinks = ({
		tempProfile,
		setTempProfile,
		handleSaveProfile,
		confirmDiscard,
		hasChanges,
	}) => {
		return (
			<div className="edit-links">
				{/* Name Section */}
				<div className="edit-link show-form">
					<button className="edit-link-button">
						Name
					</button>
					<div className="edit-form">
						<div className="form-row">
							<div className="form-group">
								<label>First Name</label>
								<input
									type="text"
									value={tempProfile.first_name}
									onChange={(e) => setTempProfile({ ...tempProfile, first_name: e.target.value })}
								/>
							</div>
							<div className="form-group">
								<label>Middle Name</label>
								<input
									type="text"
									value={tempProfile.middle_name}
									onChange={(e) => setTempProfile({ ...tempProfile, middle_name: e.target.value })}
								/>
							</div>
							<div className="form-group">
								<label>Last Name</label>
								<input
									type="text"
									value={tempProfile.last_name}
									onChange={(e) => setTempProfile({ ...tempProfile, last_name: e.target.value })}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Email Section */}
				<div className="edit-link show-form">
					<button className="edit-link-button">
						Email
					</button>
					<div className="edit-form">
						<div className="form-group">
							<label>Email Address</label>
							<input
								type="email"
								value={tempProfile.email}
								onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
							/>
						</div>
					</div>
				</div>

				{/* Contact Section */}
				<div className="edit-link show-form">
					<button className="edit-link-button">
						Contact Number
					</button>
					<div className="edit-form">
						<div className="form-group">
							<label>Contact Number</label>
							<input
								type="text"
								value={tempProfile.contact_number}
								onChange={(e) => setTempProfile({ ...tempProfile, contact_number: e.target.value })}
							/>
						</div>
					</div>
				</div>

				{/* Unified Save/Cancel Buttons */}
				<div className="form-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
					<button className="acc-save-btn" onClick={handleSaveProfile}>
						💾 Save All Changes
					</button>
				</div>
			</div>
		);
	};

	export default EditLinks;