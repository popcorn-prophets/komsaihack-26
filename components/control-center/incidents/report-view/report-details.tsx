'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchIncidentById,
  fetchIncidentTypeName,
  fetchResidentName,
  Incident,
  updateIncidentEntry,
} from '@/lib/supabase/reports';
import { convertTime, hexToCoordinates } from '@/lib/utils';
import React from 'react';

interface FormData {
  id: string;
  reported_by: string;
  incident_name: string;
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
  if (!coordinates) return null;
  return hexToCoordinates(coordinates);
}

export default function ReportDetails({ incidentID }: ReportDetailsProps) {
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

  const [selectedIncident, setSelectedIncident] =
    React.useState<Incident | null>(null);

  /*
  TODO: refactor this block (ideally change query to automatically retrieve
  respondent name and incident type name)

  possible performance improvement by reducing async awaits by 2
  */
  function retrieveIncidentName(incident: Incident | null) {
    if (incident) {
      getIncidentName(incident.incident_type_id).then((incidentName) => {
        getResidentName(incident.reported_by).then((residentName) => {
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
      searchIncidentById(incidentID).then((incident) => {
        retrieveIncidentName(incident);
        setSelectedIncident(incident);
      });
    }
  }, [incidentID]); // Re-run when incidentID changes

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Select changes
  const handleSelectChange = (fieldName: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  async function updateIncident() {
    if (selectedIncident) {
      const updatedIncident: Incident = {
        ...selectedIncident,
        status: formData.status,
        severity: formData.severity,
        location_description: formData.location_description,
        description: formData.description,
      };

      const success: boolean = await updateIncidentEntry(updatedIncident);
      if (success) {
        setSelectedIncident(updatedIncident);
      }
    }
  }

  function resetForm() {
    if (selectedIncident) {
      setFormData((prev) => ({
        ...prev,
        status: selectedIncident.status,
        severity: selectedIncident.severity,
        location_description: selectedIncident.location_description ?? '',
        description: selectedIncident.description ?? '',
      }));
    }
  }

  return (
    <form className="w-full p-10">
      <h1 className="text-3xl font-bold my-2">Report Details</h1>
      <h2 className="text-xl my-2 mb-8">Report ID: {formData.id}</h2>
      <FieldGroup className="w-full mb-8">
        <Field orientation="horizontal" className="flex flex-1 w-full">
          <Button
            onClick={updateIncident}
            type="button"
            className="flex flex-1"
          >
            Update
          </Button>
          <Button onClick={resetForm} type="button" className="flex flex-1">
            Reset
          </Button>
        </Field>
      </FieldGroup>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="formStatus">Status</FieldLabel>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger id="formStatus" name="status">
              <SelectValue placeholder="--Select Severity--" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="validated">Validated</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="formSeverity">Severity</FieldLabel>
          <Select
            value={formData.severity}
            onValueChange={(value) => handleSelectChange('severity', value)}
            name="severity"
          >
            <SelectTrigger id="formSeverity">
              <SelectValue placeholder="--Select Status--" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="formIncidentType">Incident Type</FieldLabel>
          <Select
            value={formData.incident_name}
            onValueChange={(value) =>
              handleSelectChange('incident_name', value)
            }
            name="incident_name"
            disabled
          >
            <SelectTrigger className="w-full" id="formIncidentType">
              <SelectValue placeholder="--Select Incident Type--" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Medical Emergency">
                  Medical Emergency
                </SelectItem>
                <SelectItem value="Fire">Fire</SelectItem>
                <SelectItem value="Flood">Flood</SelectItem>
                <SelectItem value="Earthquake">Earthquake</SelectItem>
                <SelectItem value="Landslide">Landslide</SelectItem>
                <SelectItem value="Traffic Accident">
                  Traffic Accidient
                </SelectItem>
                <SelectItem value="Storm">Storm</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="formReportedBy">Reported By</FieldLabel>
          <Input
            id="formReportedBy"
            type="text"
            defaultValue={formData.reported_by}
            placeholder="-- Reported By --"
            onChange={handleInputChange}
            name="reported_by"
            disabled
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formLocation">Location</FieldLabel>
          <Input
            id="formLocation"
            type="text"
            defaultValue={formData.location}
            disabled
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formLocationDescription">
            Location Description
          </FieldLabel>
          <Textarea
            id="formLocationDescription"
            value={formData.location_description}
            onChange={handleInputChange}
            name="location_description"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formDescription">Description</FieldLabel>
          <Textarea
            id="formDescription"
            value={formData.description}
            onChange={handleInputChange}
            name="description"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formIncidentTime">Incident Time</FieldLabel>
          <Input
            id="formIncidentTime"
            type="datetime-local"
            defaultValue={formData.incident_time}
            onChange={handleInputChange}
            disabled
            name="incident_time"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formUpdatedOn">Last Updated On</FieldLabel>
          <Input
            id="formUpdatedOn"
            type="datetime-local"
            defaultValue={formData.updated_at}
            disabled
            name="updated_at"
          />
        </Field>
      </FieldGroup>
    </form>
  );
}
