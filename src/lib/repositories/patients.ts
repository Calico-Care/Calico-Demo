import { supabase } from "@/lib/supabaseClient";
import type { Patient, PrimaryCondition } from "@/lib/types";

interface PatientRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string;
  time_zone: string | null;
  primary_condition: PrimaryCondition;
  created_at: string;
}

const mapPatient = (row: PatientRow): Patient => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone ?? undefined,
  dateOfBirth: new Date(row.date_of_birth),
  timeZone: row.time_zone ?? undefined,
  primaryCondition: row.primary_condition,
  createdAt: new Date(row.created_at),
});

export type CreatePatientPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  timeZone?: string;
  primaryCondition: PrimaryCondition;
};

export type UpdatePatientPayload = Partial<Omit<CreatePatientPayload, "dateOfBirth">> & {
  dateOfBirth?: Date;
};

const formatDateOnly = (date: Date): string =>
  date.toISOString().split("T")[0];

export const patientRepository = {
  async list(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapPatient);
  },

  async getById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle<PatientRow>();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapPatient(data) : null;
  },

  async create(payload: CreatePatientPayload): Promise<Patient> {
    const insertPayload = {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      phone: payload.phone ?? null,
      date_of_birth: formatDateOnly(payload.dateOfBirth),
      time_zone: payload.timeZone ?? null,
      primary_condition: payload.primaryCondition,
    };

    const { data, error } = await supabase
      .from("patients")
      .insert(insertPayload)
      .select("*")
      .single<PatientRow>();

    if (error) {
      throw new Error(error.message);
    }

    return mapPatient(data);
  },

  async update(id: string, updates: UpdatePatientPayload): Promise<Patient> {
    const patch: Record<string, unknown> = {};

    if (updates.firstName !== undefined) patch.first_name = updates.firstName;
    if (updates.lastName !== undefined) patch.last_name = updates.lastName;
    if (updates.email !== undefined) patch.email = updates.email;
    if (updates.phone !== undefined) patch.phone = updates.phone ?? null;
    if (updates.dateOfBirth) {
      patch.date_of_birth = formatDateOnly(updates.dateOfBirth);
    }
    if (updates.timeZone !== undefined) {
      patch.time_zone = updates.timeZone ?? null;
    }
    if (updates.primaryCondition !== undefined) {
      patch.primary_condition = updates.primaryCondition;
    }

    const { data, error } = await supabase
      .from("patients")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single<PatientRow>();

    if (error) {
      throw new Error(error.message);
    }

    return mapPatient(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  },
};
