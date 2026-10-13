 import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  public readonly client: SupabaseClient;

  constructor(config: ConfigService) {
    // aceita a URL com ou sem o /rest/v1 no final
    const url = config
      .getOrThrow<string>('SUPABASE_URL')
      .replace(/\/rest\/v1\/?$/, '')
      .replace(/\/+$/, '');

    this.client = createClient(url, config.getOrThrow<string>('SUPABASE_KEY'));
  }
}
