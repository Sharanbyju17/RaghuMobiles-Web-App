export type UserRole = "admin" | "staff" | "customer";

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  fullName?: string;
  city?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export const MOCK_OTP = "123456";
const API_BASE = "http://localhost:8000/api/v1";

export class AuthService {
  static async sendOTP(phone: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to send OTP", error);
      return false;
    }
  }

  static async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; user?: User; isNewUser?: boolean; token?: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false };
      }

      if (data.is_new_user) {
        return { success: true, isNewUser: true };
      }

      return { 
        success: true, 
        isNewUser: false, 
        user: {
          id: data.user.id,
          phone: data.user.phone,
          role: data.user.role as UserRole,
          fullName: data.user.full_name,
          city: data.user.city
        },
        token: data.tokens.access_token
      };
    } catch (error) {
      console.error("Failed to verify OTP", error);
      return { success: false };
    }
  }

  static async registerUser(data: { phone: string; otp: string; fullName: string; city: string }): Promise<{ success: boolean; user?: User; token?: string; isNewUser?: boolean }> {
    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: data.phone, 
          otp: data.otp,
          full_name: data.fullName,
          city: data.city
        }),
      });
      
      const resData = await response.json();
      if (!response.ok) {
        return { success: false };
      }

      return { 
        success: true, 
        user: {
          id: resData.user.id,
          phone: resData.user.phone,
          role: resData.user.role as UserRole,
          fullName: resData.user.full_name,
          city: resData.user.city
        },
        token: resData.tokens.access_token
      };
    } catch (error) {
      console.error("Failed to register user", error);
      return { success: false };
    }
  }
}

