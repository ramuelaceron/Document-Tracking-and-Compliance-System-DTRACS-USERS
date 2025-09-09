import React from 'react'
import './NoService.css'

const NoService = () => {
  return (
    <div className="no-service-container">
      <div className="no-service-content">
        <h2 className="no-service-message">Service not available yet</h2>
        <p className="no-service-submessage">This feature is currently under development</p>
      </div>
    </div>
  )
}

export default NoService