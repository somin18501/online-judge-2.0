import { Language } from '@au/types';

export const STARTER_CODE: Record<Language, string> = {
  [Language.C]: `#include <stdio.h>\n\nint main(void) {\n    // Read input from stdin and print output.\n    return 0;\n}\n`,
  [Language.CPP]: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    return 0;\n}\n`,
  [Language.PYTHON]: `import sys\n\ndef main() -> None:\n    data = sys.stdin.read().strip()\n    # TODO: solve\n    print(data)\n\nif __name__ == "__main__":\n    main()\n`,
  [Language.JAVASCRIPT]: `const input = require('fs').readFileSync(0, 'utf8').trim();\n// TODO: solve\nconsole.log(input);\n`,
};

export const MONACO_LANGUAGE_ID: Record<Language, string> = {
  [Language.C]: 'c',
  [Language.CPP]: 'cpp',
  [Language.PYTHON]: 'python',
  [Language.JAVASCRIPT]: 'javascript',
};
