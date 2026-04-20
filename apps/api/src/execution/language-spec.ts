import { Language } from '@au/types';

/**
 * Metadata for each supported language:
 * - sourceFile: filename inside the workspace
 * - compile: optional compile command
 * - run: command executed with stdin piped in
 * - dockerImageKey: key into config.execution.dockerImages
 */
export interface LanguageSpec {
  sourceFile: string;
  compile?: string[];
  run: string[];
  dockerImageKey: keyof import('../config/env.config').AppConfig['execution']['dockerImages'];
}

export const LANGUAGE_SPECS: Record<Language, LanguageSpec> = {
  [Language.C]: {
    sourceFile: 'main.c',
    compile: ['sh', '-c', 'gcc -O2 -std=c11 -o /workspace/prog /workspace/main.c'],
    run: ['/workspace/prog'],
    dockerImageKey: 'C',
  },
  [Language.CPP]: {
    sourceFile: 'main.cpp',
    compile: ['sh', '-c', 'g++ -O2 -std=c++17 -o /workspace/prog /workspace/main.cpp'],
    run: ['/workspace/prog'],
    dockerImageKey: 'CPP',
  },
  [Language.PYTHON]: {
    sourceFile: 'main.py',
    run: ['python3', '/workspace/main.py'],
    dockerImageKey: 'PYTHON',
  },
  [Language.JAVASCRIPT]: {
    sourceFile: 'main.js',
    run: ['node', '/workspace/main.js'],
    dockerImageKey: 'JAVASCRIPT',
  },
};
