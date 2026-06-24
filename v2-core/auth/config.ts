export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
}

export function getCognitoConfig(): CognitoConfig {
  const region = process.env.AWS_REGION ?? process.env.COGNITO_REGION ?? 'eu-west-1';
  const userPoolId = process.env.COGNITO_USER_POOL_ID ?? '';
  const clientId = process.env.COGNITO_CLIENT_ID ?? '';

  return { region, userPoolId, clientId };
}

export function isCognitoConfigured(): boolean {
  const { userPoolId, clientId } = getCognitoConfig();
  return Boolean(userPoolId && clientId);
}

export function getJwtIssuer(config: CognitoConfig = getCognitoConfig()): string {
  return `https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`;
}
