import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RiskTolerance } from '@/constants/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface OnboardingProfileData {
  name: string;
  email: string;
  preferredMode: 'financial' | 'personal' | 'both';
  monthlyIncome: number;
  householdSize: number;
  primaryGoals: string[];
  riskTolerance: RiskTolerance;
  personalInterests: string[];
  dailyRoutineStart?: string;
  dailyRoutineEnd?: string;
  focusAreas: string[];
}

export async function createProfileDirect(
  userId: string,
  data: OnboardingProfileData
): Promise<boolean> {
  try {
    console.log('Creating profile for user:', userId);
    
    const { error } = await supabase.from('profiles').insert({
      user_id: userId,
      email: data.email,
      name: data.name,
      preferred_mode: data.preferredMode,
      monthly_income: data.monthlyIncome,
      household_size: data.householdSize,
      primary_goals: data.primaryGoals,
      risk_tolerance: data.riskTolerance,
      personal_interests: data.personalInterests,
      daily_routine_start: data.dailyRoutineStart,
      daily_routine_end: data.dailyRoutineEnd,
      preferred_activity_categories: [],
      focus_areas: data.focusAreas,
      currency: 'JD',
      has_completed_onboarding: true,
    });

    if (error) {
      console.error('Error creating profile:', error);
      return false;
    }

    console.log('Profile created successfully');
    return true;
  } catch (error) {
    console.error('Error creating profile:', error);
    return false;
  }
}
