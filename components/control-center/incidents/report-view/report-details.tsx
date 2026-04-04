'use client';

import {
  fetchIncidentById,
  fetchIncidentTypeName,
  fetchResidentName,
  Incident,
} from '@/lib/supabase/reports';
import { convertTime, hexToCoordinates } from '@/lib/utils';
import React from 'react';

interface FormData {
  id: string;
  reported_by: string;
  incident_name: string | null;
  location: string;
  location_description: string;
  severity: string;
  description: string;
  status: string;
  incident_time: string;
  created_at: string;
  updated_at: string;
}

interface ReportDetailsProps {
  incidentID?: string | null;
}

async function searchIncidentById(
  incidentID: string
): Promise<Incident | null> {
  const incident = await fetchIncidentById(incidentID);
  return incident;
}

async function getIncidentName(
  incidentTypeID: string | null
): Promise<string | null> {
  let incidentName: string | null = '';
  if (incidentTypeID)
    incidentName = await fetchIncidentTypeName(incidentTypeID);
  return incidentName;
}

async function getResidentName(
  residentID: string | null
): Promise<string | null> {
  let residentName: string | null = '';
  if (residentID) residentName = await fetchResidentName(residentID);
  return residentName;
}

function getFormattedLocation(coordinates: string): string | null {
  console.log(coordinates);
  if (!coordinates) return null;

  return hexToCoordinates(coordinates);
}

export default function ReportDetails({ incidentID }: ReportDetailsProps) {
  const listStyle = 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white';
  const [formData, setFormData] = React.useState<FormData>({
    id: '',
    reported_by: '',
    incident_name: '',
    location: '',
    location_description: '',
    severity: '',
    description: '',
    status: '',
    incident_time: '',
    created_at: '',
    updated_at: '',
  });

  // TODO: refactor this block (ideally change query to automatically retrieve
  // respondent name and incident type name)
  function retrieveIncidentName(incident: Incident | null) {
    if (incident) {
      getIncidentName(incident.incident_type_id).then((incidentName) => {
        getResidentName(incident.reported_by).then((residentName) => {
          console.log(residentName);
          setFormData({
            id: incident.id ?? '',
            reported_by: residentName ?? '',
            incident_name: incidentName ?? '',
            location: getFormattedLocation(incident.location) ?? '',
            location_description: incident.location_description ?? '',
            severity: incident.severity ?? '',
            description: incident.description ?? '',
            status: incident.status ?? '',
            incident_time: convertTime(incident.incident_time) ?? '',
            created_at: convertTime(incident.created_at) ?? '',
            updated_at: convertTime(incident.updated_at) ?? '',
          });
        });
      });
    }
  }

  // Fetch incident data when incidentID changes
  React.useEffect(() => {
    if (incidentID) {
      searchIncidentById(incidentID).then((incident) =>
        retrieveIncidentName(incident)
      );
    }
  }, [incidentID]); // Re-run when incidentID changes

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Handle form submission here
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Report Details</h1>
      <h2 className="text-xl font-bold mb-6">Report ID: (#{formData.id})</h2>

      {/* ID (read-only or hidden) */}
      <div className="hidden">
        <input type="hidden" name="id" value={formData.id} />
      </div>

      {/* Reported By */}
      <div>
        <label htmlFor="reported_by" className="block text-sm font-medium mb-2">
          Reported By:
        </label>
        <input
          type="text"
          id="reported_by"
          name="reported_by"
          value={formData.reported_by}
          onChange={handleChange}
          placeholder="Enter Reporter Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* TODO: make selection update with more incident types*/}
      {/* Incident Type */}
      <div>
        <label
          htmlFor="incident_type_id"
          className="block text-sm font-medium mb-2"
        >
          Incident Type:
        </label>
        <select
          id="incident_type_id"
          name="incident_type_id"
          value={formData.incident_name ? formData.incident_name : ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
          required
        >
          <option value="" className={listStyle}>
            Select Incident Type
          </option>
          <option value="Traffic Accident" className={listStyle}>
            Traffic Accident
          </option>
          <option value="Flood" className={listStyle}>
            Flood
          </option>
          <option value="Fire" className={listStyle}>
            Fire
          </option>
          <option value="Earthquake" className={listStyle}>
            Earthquake
          </option>
          <option value="Landslide" className={listStyle}>
            Landslide
          </option>
          <option value="Storm" className={listStyle}>
            Storm
          </option>
          <option value="Medical Emergency" className={listStyle}>
            Medical Emergency
          </option>
        </select>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-2">
          Location (Point, 4326):
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Geographic Coordinates"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled
        />
      </div>

      {/* Location Description */}
      <div>
        <label
          htmlFor="location_description"
          className="block text-sm font-medium mb-2"
        >
          Location Description
        </label>
        <textarea
          id="location_description"
          name="location_description"
          value={formData.location_description}
          onChange={handleChange}
          placeholder="Describe the location in detail"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Severity */}
      <div>
        <label htmlFor="severity" className="block text-sm font-medium mb-2">
          Severity:
        </label>
        <select
          id="severity"
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
          required
        >
          <option value="" className={listStyle}>
            Select severity level
          </option>
          <option value="low" className={listStyle}>
            Low
          </option>
          <option value="moderate" className={listStyle}>
            Moderate
          </option>
          <option value="high" className={listStyle}>
            High
          </option>
          <option value="critical" className={listStyle}>
            Critical
          </option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description:
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide a detailed description of the incident"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-2">
          Status:
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="" className={listStyle}>
            Select status
          </option>
          <option value="new" className={listStyle}>
            New
          </option>
          <option value="validated" className={listStyle}>
            Validated
          </option>
          <option value="in_progress" className={listStyle}>
            In Progress
          </option>
          <option value="resolved" className={listStyle}>
            Resolved
          </option>
          <option value="dismissed" className={listStyle}>
            Dismissed
          </option>
        </select>
      </div>

      {/* Incident Time */}
      <div>
        <label
          htmlFor="incident_time"
          className="block text-sm font-medium mb-2"
        >
          Incident Time:
        </label>
        <input
          type="datetime-local"
          id="incident_time"
          name="incident_time"
          value={formData.incident_time}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Created At (read-only) */}
      <div>
        <label htmlFor="created_at" className="block text-sm font-medium mb-2">
          Created At:
        </label>
        <input
          type="datetime-local"
          id="created_at"
          name="created_at"
          value={formData.created_at}
          onChange={handleChange}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
        />
      </div>

      {/* Updated At (read-only) */}
      <div>
        <label htmlFor="updated_at" className="block text-sm font-medium mb-2">
          Updated At:
        </label>
        <input
          type="datetime-local"
          id="updated_at"
          name="updated_at"
          value={formData.updated_at}
          onChange={handleChange}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Close Incident
        </button>
        <button
          type="reset"
          onClick={() => {}}
          className="px-6 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400 transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
