import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalRunner } from './runners/local.runner';
import { DockerRunner } from './runners/docker.runner';
import type { Runner } from './runner.interface';
import type { AppConfig } from '../config/env.config';

@Injectable()
export class RunnerFactory {
  private readonly logger = new Logger(RunnerFactory.name);

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly local: LocalRunner,
    private readonly docker: DockerRunner,
  ) {}

  get(): Runner {
    const mode = this.config.get('execution', { infer: true }).runner;
    if (mode === 'docker') return this.docker;
    if (this.config.get('nodeEnv', { infer: true }) === 'production') {
      this.logger.warn(
        'EXECUTION_RUNNER is "local" in production. Switching to docker is strongly recommended.',
      );
    }
    return this.local;
  }

  get timeoutMs(): number {
    return this.config.get('execution', { infer: true }).timeoutMs;
  }

  get memoryMb(): number {
    return this.config.get('execution', { infer: true }).memoryMb;
  }
}
