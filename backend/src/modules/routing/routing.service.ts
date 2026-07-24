import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../shared/socket/redis.service';
import { ComputeRouteDto } from './dto/compute-route.dto';

const GOOGLE_ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const FIELD_MASK = [
  'routes.duration',
  'routes.staticDuration',
  'routes.distanceMeters',
  'routes.polyline.encodedPolyline',
  'routes.legs.steps.navigationInstruction.instructions',
].join(',');

type GoogleRoute = {
  duration?: string;
  staticDuration?: string;
  distanceMeters?: number;
  polyline?: { encodedPolyline?: string };
  legs?: Array<{ steps?: Array<{ navigationInstruction?: { instructions?: string } }> }>;
};

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly apiKey: string;
  private readonly cacheTtl: number;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly dailyQuota: number;

  constructor(
    config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.apiKey = config.get<string>('GOOGLE_ROUTES_API_KEY', '');
    this.cacheTtl = config.get<number>('GOOGLE_ROUTES_CACHE_TTL_SECONDS', 45);
    this.timeoutMs = config.get<number>('GOOGLE_ROUTES_TIMEOUT_MS', 7000);
    this.maxRetries = config.get<number>('GOOGLE_ROUTES_MAX_RETRIES', 3);
    this.dailyQuota = config.get<number>('GOOGLE_ROUTES_DAILY_QUOTA', 10000);
  }

  async computeRoute(dto: ComputeRouteDto) {
    if (!this.apiKey) {
      this.logger.error('GOOGLE_ROUTES_API_KEY is not configured');
      throw new ServiceUnavailableException('Routing is temporarily unavailable');
    }

    const travelMode = dto.travelMode === 'TWO_WHEELER' ? 'TWO_WHEELER' : 'DRIVE';
    const cacheKey = this.cacheKey(dto, travelMode);
    const cached = await this.redis.publisher.get(cacheKey);
    if (cached) return { ...JSON.parse(cached), cache: 'HIT' };

    await this.trackQuota();
    const payload = {
      origin: { location: { latLng: { latitude: dto.originLatitude, longitude: dto.originLongitude } } },
      destination: {
        location: { latLng: { latitude: dto.destinationLatitude, longitude: dto.destinationLongitude } },
      },
      travelMode,
      routingPreference: 'TRAFFIC_AWARE',
      polylineQuality: 'HIGH_QUALITY',
      polylineEncoding: 'ENCODED_POLYLINE',
      computeAlternativeRoutes: false,
      languageCode: 'en-IN',
      regionCode: 'IN',
      units: 'METRIC',
      routeModifiers: { avoidTolls: false, avoidHighways: false, avoidFerries: true },
    };

    const data = await this.requestWithRetry(payload);
    const route = data.routes?.[0];
    const encodedPolyline = route?.polyline?.encodedPolyline;
    if (!encodedPolyline) throw new ServiceUnavailableException('No route is currently available');

    const result = {
      encodedPolyline,
      distanceMeters: route.distanceMeters || 0,
      durationSeconds: this.durationSeconds(route.duration),
      staticDurationSeconds: this.durationSeconds(route.staticDuration),
      steps: route.legs?.[0]?.steps || [],
      travelMode,
      provider: 'google-routes-v2',
      trafficAware: true,
      generatedAt: new Date().toISOString(),
      cache: 'MISS',
    };
    await this.redis.publisher.set(cacheKey, JSON.stringify(result), 'EX', this.cacheTtl);
    return result;
  }

  private async requestWithRetry(body: unknown): Promise<{ routes?: GoogleRoute[] }> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await fetch(GOOGLE_ROUTES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': FIELD_MASK,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const data = (await response.json().catch(() => ({}))) as { routes?: GoogleRoute[]; error?: { message?: string } };
        if (response.ok) return data;
        if (response.status === 429 && attempt === this.maxRetries) {
          throw new HttpException('Routing capacity is temporarily exhausted', HttpStatus.TOO_MANY_REQUESTS);
        }
        if (response.status !== 429 && response.status < 500) {
          this.logger.warn(`Google Routes rejected a request with status ${response.status}`);
          throw new ServiceUnavailableException('No route is currently available');
        }
        lastError = new Error(`Google Routes status ${response.status}`);
      } catch (error) {
        if (error instanceof HttpException) throw error;
        lastError = error;
      } finally {
        clearTimeout(timer);
      }
      if (attempt < this.maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 180 * 2 ** attempt + Math.floor(Math.random() * 120)));
      }
    }
    this.logger.error(`Google Routes unavailable: ${lastError instanceof Error ? lastError.message : 'unknown error'}`);
    throw new ServiceUnavailableException('Routing is temporarily unavailable');
  }

  private cacheKey(dto: ComputeRouteDto, mode: string) {
    const point = (latitude: number, longitude: number) => `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
    return `routing:v2:${mode}:${point(dto.originLatitude, dto.originLongitude)}:${point(dto.destinationLatitude, dto.destinationLongitude)}`;
  }

  private durationSeconds(value?: string) {
    const parsed = Number.parseFloat(String(value || '').replace(/s$/, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private async trackQuota() {
    const day = new Date().toISOString().slice(0, 10);
    const key = `routing:google:quota:${day}`;
    const used = await this.redis.publisher.incr(key);
    if (used === 1) await this.redis.publisher.expire(key, 172800);
    const ratio = used / this.dailyQuota;
    if (ratio >= 1) {
      this.logger.error(`Google Routes daily quota threshold exceeded (${used}/${this.dailyQuota})`);
    } else if (ratio >= 0.8 && used % 100 === 0) {
      this.logger.warn(`Google Routes daily quota at ${Math.round(ratio * 100)}% (${used}/${this.dailyQuota})`);
    }
  }
}
