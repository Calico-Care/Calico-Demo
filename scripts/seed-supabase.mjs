import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL;

const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing Supabase credentials. Set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ACCESS_TOKEN) and SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const patientsSeed = [
  {
    email: "james.bond@example.com",
    first_name: "James",
    last_name: "Bond",
    phone: "(555) 123-4567",
    date_of_birth: "1968-10-21",
    time_zone: "EST",
    primary_condition: "CHF",
  },
  {
    email: "mihaelaeprod1.cazanprod1@example.com",
    first_name: "Honey",
    last_name: "Badger",
    phone: "(555) 234-5678",
    date_of_birth: "1955-05-10",
    time_zone: "PST",
    primary_condition: "COPD",
  },
];

const healthMetricSeed = [
  {
    patientEmail: "james.bond@example.com",
    recorded_at: "2024-01-20T10:00:00Z",
    weight_lbs: 175,
    systolic: 120,
    diastolic: 80,
    spo2: 98,
    heart_rate: 72,
  },
  {
    patientEmail: "james.bond@example.com",
    recorded_at: "2024-01-21T10:00:00Z",
    weight_lbs: 174,
    systolic: 118,
    diastolic: 78,
    spo2: 97,
    heart_rate: 70,
  },
  {
    patientEmail: "mihaelaeprod1.cazanprod1@example.com",
    recorded_at: "2024-01-20T14:00:00Z",
    weight_lbs: 160,
    systolic: 135,
    diastolic: 85,
    spo2: 94,
    heart_rate: 85,
  },
];

const main = async () => {
  console.log("Seeding Supabase with starter patients...");

  const { data: upsertedPatients, error: patientError } = await supabase
    .from("patients")
    .upsert(patientsSeed, { onConflict: "email" })
    .select("id,email");

  if (patientError) {
    throw patientError;
  }

  const emailToId = Object.fromEntries(
    (upsertedPatients ?? []).map((row) => [row.email, row.id])
  );

  const metricPayload = [];

  for (const metric of healthMetricSeed) {
    const patientId = emailToId[metric.patientEmail];
    if (!patientId) continue;

    const { count, error } = await supabase
      .from("health_metrics")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("recorded_at", metric.recorded_at);

    if (error) {
      throw error;
    }

    if ((count ?? 0) > 0) {
      continue;
    }

    metricPayload.push({
      patient_id: patientId,
      recorded_at: metric.recorded_at,
      weight_lbs: metric.weight_lbs,
      systolic: metric.systolic,
      diastolic: metric.diastolic,
      spo2: metric.spo2,
      heart_rate: metric.heart_rate,
    });
  }

  if (metricPayload.length > 0) {
    const { error: metricError } = await supabase
      .from("health_metrics")
      .insert(metricPayload);
    if (metricError) {
      throw metricError;
    }
  }

  console.log("✔ Supabase seed complete.");
};

main().catch((error) => {
  console.error("Failed to seed Supabase:", error.message ?? error);
  process.exit(1);
});
