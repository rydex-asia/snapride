import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthService } from './supabase-auth.service';

@Global()
@Module({
  providers: [SupabaseService, SupabaseAuthService],
  exports: [SupabaseService, SupabaseAuthService],
})
export class SupabaseModule {}
