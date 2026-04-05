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
      searchIncidentById(incidentID).then((incident) =>
        retrieveIncidentName(incident)
      );
    }
    console.log(formData);
  }, [incidentID]); // Re-run when incidentID changes

  return (
    <form className="w-full p-10">
      <h1 className="text-3xl font-bold">Report Details</h1>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="formReportedBy">Reported By</FieldLabel>
          <Input
            id="formReportedBy"
            type="text"
            defaultValue={formData.reported_by}
            placeholder="-- Reported By --"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formIncidentType">Incident Type</FieldLabel>
          <Select value={formData.incident_name}>
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
          <FieldLabel htmlFor="formLocation">Location</FieldLabel>
          <Input
            id="formLocation"
            type="text"
            defaultValue={formData.location}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formLocDesc">Location Description</FieldLabel>
          <Textarea
            id="formLocDesc"
            defaultValue={formData.location_description}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formSeverity">Severity</FieldLabel>
          <Select value={formData.severity}>
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
          <FieldLabel htmlFor="formDescription">Description</FieldLabel>
          <Textarea id="formDescription" defaultValue={formData.description} />
        </Field>
        <Field>
          <FieldLabel htmlFor="formStatus">Status</FieldLabel>
          <Select value={formData.status}>
            <SelectTrigger id="formStatus">
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
          <FieldLabel htmlFor="formIncidentTime">Incident Time</FieldLabel>
          <Input
            id="formIncidentTime"
            type="datetime-local"
            defaultValue={formData.incident_time}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formCreatedOn">Created On</FieldLabel>
          <Input
            id="formCreatedOn"
            type="datetime-local"
            defaultValue={formData.created_at}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="formUpdatedOn">Updated On</FieldLabel>
          <Input
            id="formUpdatedOn"
            type="datetime-local"
            defaultValue={formData.updated_at}
          />
        </Field>
        <FieldGroup className="w-full">
          <Field orientation="horizontal" className="flex flex-1 w-full">
            <Button>Update Form</Button>
            <Button>Reset</Button>
          </Field>
        </FieldGroup>
      </FieldGroup>
    </form>
  );
}
