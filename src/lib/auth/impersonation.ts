import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.PAYLOAD_SECRET || 'super-secret-jwt-key-for-tenant-saas'
);

export interface ImpersonationSession {
  impersonatorId: string;
  impersonatorEmail: string;
  targetTenantId: string;
  tenantDomain?: string;
  isImpersonating: boolean;
}

export async function getImpersonationSession(): Promise<ImpersonationSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('impersonation_token')?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      impersonatorId: payload.impersonatorId as string,
      impersonatorEmail: payload.impersonatorEmail as string,
      targetTenantId: payload.targetTenantId as string,
      tenantDomain: payload.tenantDomain as string,
      isImpersonating: Boolean(payload.isImpersonating),
    };
  } catch (err) {
    // টোকেন এরর বা এক্সপায়ার হলে নাল রিটার্ন করবে
    return null;
  }
}
