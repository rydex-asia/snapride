import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WebSocket } from 'ws';

const serverAuthOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
};

@Injectable()
export class SupabaseService {
  readonly admin: SupabaseClient;
  private readonly url: string;
  private readonly publishableKey: string;

  constructor(config: ConfigService) {
    this.url = config.getOrThrow<string>('SUPABASE_URL');
    this.publishableKey = config.getOrThrow<string>('SUPABASE_PUBLISHABLE_KEY');
    this.admin = createClient(
      this.url,
      config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: serverAuthOptions, realtime: { transport: WebSocket as any } },
    );
  }

  createAuthClient(): SupabaseClient {
    return createClient(this.url, this.publishableKey, {
      auth: serverAuthOptions,
      realtime: { transport: WebSocket as any },
    });
  }
}
