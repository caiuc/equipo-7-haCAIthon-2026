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
  "CESFAM La Florida": {
    username: "cesfam_la_florida",
    password: "password",
    healthCenterName: "CESFAM La Florida",
  },
  "CESFAM Los Castaños": {
    username: "cesfam_los_castanos",
    password: "password",
    healthCenterName: "CESFAM Los Castaños",
  },
  "CESFAM Bellavista": {
    username: "cesfam_bellavista",
    password: "password",
    healthCenterName: "CESFAM Bellavista",
  },
  "CESFAM Maffioletti": {
    username: "cesfam_maffioletti",
    password: "password",
    healthCenterName: "CESFAM Maffioletti",
  },
  "CESFAM Félix de Amesti": {
    username: "cesfam_felix_de_amesti",
    password: "password",
    healthCenterName: "CESFAM Félix de Amesti",
  },
  "CESFAM Santa Julia": {
    username: "cesfam_santa_julia",
    password: "password",
    healthCenterName: "CESFAM Santa Julia",
  },
  "CESFAM Padre Alberto Hurtado": {
    username: "cesfam_padre_alberto_hurtado",
    password: "password",
    healthCenterName: "CESFAM Padre Alberto Hurtado",
  },
  "CESFAM Padre Manuel Villaseca": {
    username: "cesfam_padre_manuel_villaseca",
    password: "password",
    healthCenterName: "CESFAM Padre Manuel Villaseca",
  },
  "CESFAM Bernardo Leighton": {
    username: "cesfam_bernardo_leighton",
    password: "password",
    healthCenterName: "CESFAM Bernardo Leighton",
  },
  "CESFAM Padre Esteban Gumucio": {
    username: "cesfam_padre_esteban_gumucio",
    password: "password",
    healthCenterName: "CESFAM Padre Esteban Gumucio",
  },
  "COSAM La Pintana": {
    username: "cosam_la_pintana",
    password: "password",
    healthCenterName: "COSAM La Pintana",
  },
  "COSAM Puente Alto": {
    username: "cosam_puente_alto",
    password: "password",
    healthCenterName: "COSAM Puente Alto",
  },
  "COSAM Ñuñoa": {
    username: "cosam_nunoa",
    password: "password",
    healthCenterName: "COSAM Ñuñoa",
  },
  "COSAM Santiago": {
    username: "cosam_santiago",
    password: "password",
    healthCenterName: "COSAM Santiago",
  },
  "SAPU La Florida": {
    username: "sapu_la_florida",
    password: "password",
    healthCenterName: "SAPU La Florida",
  },
  "SAR Los Castaños": {
    username: "sar_los_castanos",
    password: "password",
    healthCenterName: "SAR Los Castaños",
  },
  "SAPU Bernardo Leighton": {
    username: "sapu_bernardo_leighton",
    password: "password",
    healthCenterName: "SAPU Bernardo Leighton",
  },
  "SAPU Padre Esteban Gumucio": {
    username: "sapu_padre_esteban_gumucio",
    password: "password",
    healthCenterName: "SAPU Padre Esteban Gumucio",
  },
  "Hospital Sótero del Río": {
    username: "hospital_sotero_del_rio",
    password: "password",
    healthCenterName: "Hospital Sótero del Río",
  },
  "Hospital La Florida Dra. Eloísa Díaz": {
    username: "hospital_la_florida",
    password: "password",
    healthCenterName: "Hospital La Florida Dra. Eloísa Díaz",
  },
  "Hospital El Pino": {
    username: "hospital_el_pino",
    password: "password",
    healthCenterName: "Hospital El Pino",
  },
  "Hospital San José": {
    username: "hospital_san_jose",
    password: "password",
    healthCenterName: "Hospital San José",
  },
  "Hospital Dr. Félix Bulnes": {
    username: "hospital_felix_bulnes",
    password: "password",
    healthCenterName: "Hospital Dr. Félix Bulnes",
  },
  "Hospital El Carmen de Maipú": {
    username: "hospital_el_carmen_de_maipu",
    password: "password",
    healthCenterName: "Hospital El Carmen de Maipú",
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
  "CESFAM La Florida": ["CESFAM Los Castaños", "CESFAM Bellavista", "SAPU La Florida", "Hospital La Florida Dra. Eloísa Díaz"],
  "CESFAM Los Castaños": ["CESFAM La Florida", "SAR Los Castaños", "CESFAM Bellavista", "COSAM La Florida"],
  "CESFAM Bellavista": ["CESFAM La Florida", "CESFAM Los Castaños", "Hospital La Florida Dra. Eloísa Díaz"],
  "CESFAM Maffioletti": ["CESFAM La Florida", "COSAM La Florida", "Hospital La Florida Dra. Eloísa Díaz"],
  "CESFAM Félix de Amesti": ["COSAM Macul", "CESFAM Santa Julia", "CESFAM Padre Alberto Hurtado"],
  "CESFAM Santa Julia": ["COSAM Macul", "CESFAM Félix de Amesti", "CESFAM Padre Alberto Hurtado"],
  "CESFAM Padre Alberto Hurtado": ["COSAM Macul", "CESFAM Félix de Amesti", "COSAM Ñuñoa"],
  "CESFAM Padre Manuel Villaseca": ["CESFAM Bernardo Leighton", "COSAM Puente Alto", "Hospital Sótero del Río"],
  "CESFAM Bernardo Leighton": ["CESFAM Padre Manuel Villaseca", "SAPU Bernardo Leighton", "COSAM Puente Alto"],
  "CESFAM Padre Esteban Gumucio": ["SAPU Padre Esteban Gumucio", "COSAM La Pintana", "Hospital El Pino"],
  "COSAM La Pintana": ["CESFAM Padre Esteban Gumucio", "Hospital El Pino", "COSAM Puente Alto"],
  "COSAM Puente Alto": ["CESFAM Padre Manuel Villaseca", "CESFAM Bernardo Leighton", "Hospital Sótero del Río"],
  "COSAM Ñuñoa": ["CESFAM Padre Alberto Hurtado", "COSAM Macul", "Hospital San José"],
  "COSAM Santiago": ["Hospital San José", "Hospital Dr. Félix Bulnes", "Hospital Barros Luco Trudeau"],
  "SAPU La Florida": ["CESFAM La Florida", "CESFAM Los Castaños", "Hospital La Florida Dra. Eloísa Díaz"],
  "SAR Los Castaños": ["CESFAM Los Castaños", "CESFAM La Florida", "Hospital La Florida Dra. Eloísa Díaz"],
  "SAPU Bernardo Leighton": ["CESFAM Bernardo Leighton", "COSAM Puente Alto", "Hospital Sótero del Río"],
  "SAPU Padre Esteban Gumucio": ["CESFAM Padre Esteban Gumucio", "COSAM La Pintana", "Hospital El Pino"],
  "Hospital Sótero del Río": ["CESFAM Padre Manuel Villaseca", "CESFAM Bernardo Leighton", "COSAM Puente Alto"],
  "Hospital La Florida Dra. Eloísa Díaz": ["CESFAM La Florida", "CESFAM Bellavista", "SAPU La Florida", "SAR Los Castaños"],
  "Hospital El Pino": ["CESFAM Padre Esteban Gumucio", "COSAM La Pintana", "SAPU Padre Esteban Gumucio"],
  "Hospital San José": ["COSAM Santiago", "COSAM Ñuñoa", "Hospital Dr. Félix Bulnes"],
  "Hospital Dr. Félix Bulnes": ["COSAM Santiago", "Hospital San José", "Hospital El Carmen de Maipú"],
  "Hospital El Carmen de Maipú": ["Hospital Dr. Félix Bulnes", "Hospital El Pino", "COSAM Santiago"],
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
