import "react-native-url-polyfill/auto";

import "react-native-get-random-values";

import AsyncStorage
from "@react-native-async-storage/async-storage";

import {
  createClient,
} from "@supabase/supabase-js";

const supabaseUrl =
  "https://uiprcbiervkcyantqjwc.supabase.co";

const supabaseAnonKey =
  "sb_publishable_2VvrmeB-gpUoD0XAmliLpQ_J67z8ZNQ";

export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );