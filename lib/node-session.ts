export type NodeCredentials = {
  username: string;
  password: "password";
  healthCenterName: string;
};

export type SupplyRelation = "CURRENT" | "IN_NETWORK" | "OUT_OF_NETWORK";

const credentialsByCenterName: Record<string, NodeCredentials> = {
  "CESFAM A": {
    username: "cesfam_a",
    password: "password",
    healthCenterName: "CESFAM A",
  },
  "CESFAM B": {
    username: "cesfam_b",
    password: "password",
    healthCenterName: "CESFAM B",
  },
  "CESFAM C": {
    username: "cesfam_c",
    password: "password",
    healthCenterName: "CESFAM C",
  },
  "COSAM San Joaquin": {
    username: "cosam_san_joaquin",
    password: "password",
    healthCenterName: "COSAM San Joaquin",
  },
  "COSAM La Florida": {
    username: "cosam_la_florida",
    password: "password",
    healthCenterName: "COSAM La Florida",
  },
  "COSAM Macul": {
    username: "cosam_macul",
    password: "password",
    healthCenterName: "COSAM Macul",
  },
  "SAPU San Miguel": {
    username: "sapu_san_miguel",
    password: "password",
    healthCenterName: "SAPU San Miguel",
  },
  "Hospital Barros Luco Trudeau": {
    username: "hospital_barros_luco_trudeau",
    password: "password",
    healthCenterName: "Hospital Barros Luco Trudeau",
  },
};

const supplyNetworkByCenterName: Record<string, string[]> = {
  "CESFAM A": ["CESFAM B", "COSAM San Joaquin", "COSAM La Florida"],
  "CESFAM B": ["CESFAM A", "COSAM San Joaquin", "COSAM Macul"],
  "CESFAM C": ["COSAM San Joaquin", "SAPU San Miguel", "Hospital Barros Luco Trudeau"],
  "COSAM San Joaquin": ["CESFAM A", "CESFAM B", "CESFAM C", "COSAM Macul"],
  "COSAM La Florida": ["CESFAM A", "COSAM Macul"],
  "COSAM Macul": ["CESFAM B", "COSAM San Joaquin", "COSAM La Florida"],
  "SAPU San Miguel": ["CESFAM C", "Hospital Barros Luco Trudeau"],
  "Hospital Barros Luco Trudeau": ["SAPU San Miguel", "CESFAM C"],
};

export const NODE_PASSWORD = "password";

export function getNodeCredentials() {
  return Object.values(credentialsByCenterName).sort((left, right) =>
    left.healthCenterName.localeCompare(right.healthCenterName),
  );
}

export function getCredentialsForCenter(healthCenterName: string) {
  return credentialsByCenterName[healthCenterName] ?? null;
}

export function getHealthCenterNameForUsername(username?: string | null) {
  if (!username) {
    return null;
  }

  return (
    getNodeCredentials().find((credentials) => credentials.username === username)
      ?.healthCenterName ?? null
  );
}

export function getSupplyNetworkForCenter(healthCenterName: string) {
  return supplyNetworkByCenterName[healthCenterName] ?? [];
}

export function getSupplyRelation(params: {
  activeCenterName?: string | null;
  candidateCenterName: string;
}): SupplyRelation | null {
  if (!params.activeCenterName) {
    return null;
  }

  if (params.activeCenterName === params.candidateCenterName) {
    return "CURRENT";
  }

  return getSupplyNetworkForCenter(params.activeCenterName).includes(
    params.candidateCenterName,
  )
    ? "IN_NETWORK"
    : "OUT_OF_NETWORK";
}
