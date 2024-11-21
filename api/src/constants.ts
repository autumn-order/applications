export const AUTUMN_CORPORATION_IDS: number[] = [98785281, 98784256];

export const USER_AGENT = (): string => {
  const application_name = process.env.APPLICATION_NAME;
  const application_email = process.env.APPLICATION_EMAIL;

  if (!application_name) {
    throw new Error("APPLICATION_NAME is not set");
  }

  if (!application_email) {
    throw new Error("APPLICATION_EMAIL is not set");
  }

  return `${application_name} (${application_email})`;
};
