import client from "prom-client";

export const register = new client.Registry();

// collect default Node.js metrics
client.collectDefaultMetrics({ register });

// custom metrics
export const auditEventsTotal = new client.Counter({
  name: "audit_events_total",
  help: "Total audit events consumed from Kafka",
  labelNames: ["event_type"],
});

export const auditInsertFailuresTotal = new client.Counter({
  name: "audit_insert_failures_total",
  help: "Total failed audit inserts",
});

register.registerMetric(auditEventsTotal);
register.registerMetric(auditInsertFailuresTotal);
