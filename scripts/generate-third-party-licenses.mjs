import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const lockPath = resolve(root, 'app', 'package-lock.json');
const outputPath = resolve(root, 'THIRD_PARTY_LICENSES.md');
const pluginOutputPath = resolve(root, 'plugins', 'o-brain', 'THIRD_PARTY_LICENSES.md');
const checkOnly = process.argv.includes('--check');

const lock = JSON.parse(await readFile(lockPath, 'utf8'));
const entries = Object.entries(lock.packages ?? {})
  .filter(([packagePath]) => packagePath.startsWith('node_modules/'))
  .map(([packagePath, metadata]) => ({
    packagePath,
    name: packagePath.split('/node_modules/').at(-1),
    version: metadata.version ?? 'UNKNOWN',
    license: metadata.license ?? 'UNKNOWN',
    optional: Boolean(metadata.optional),
    development: Boolean(metadata.dev),
  }))
  .sort((a, b) =>
    a.name.localeCompare(b.name) ||
    a.version.localeCompare(b.version) ||
    a.packagePath.localeCompare(b.packagePath));

const missing = entries.filter((entry) => entry.license === 'UNKNOWN').length;
const lgpl = entries.filter((entry) => entry.license.includes('LGPL')).length;
const runtime = entries.filter((entry) => !entry.development).length;
const development = entries.length - runtime;
const optional = entries.filter((entry) => entry.optional).length;
const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

const escapeCell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const rows = entries.map((entry) =>
  `| ${escapeCell(entry.name)} | ${escapeCell(entry.version)} | ${escapeCell(entry.license)} | ${entry.development ? 'development' : 'runtime'} | ${entry.optional ? 'yes' : 'no'} | \`${escapeCell(entry.packagePath)}\` |`
).join('\n');

const document = `# Third-Party License Inventory / 제3자 라이선스 목록

> Generated from \`app/package-lock.json\` on ${date}. This metadata inventory is not legal advice and does not replace the license text and notices supplied by each package.
>
> ${date} 기준 \`app/package-lock.json\` 메타데이터에서 생성했습니다. 이 목록은 법률 자문이 아니며 각 패키지가 제공하는 라이선스 본문과 고지를 대신하지 않습니다.

- Lockfile dependency entries / 잠금 파일 의존성 항목: **${entries.length}**
- Runtime entries / 런타임 항목: **${runtime}**
- Development-only entries / 개발 전용 항목: **${development}**
- Optional entries / 선택 설치 항목: **${optional}**
- Missing license metadata / 라이선스 메타데이터 누락: **${missing}**
- Entries containing LGPL / LGPL 포함 항목: **${lgpl}**
- Source of truth / 정본: \`app/package-lock.json\`
- This table includes repeated package names when the lockfile resolves multiple paths or versions / 잠금 파일이 여러 경로나 버전을 해석한 경우 같은 패키지명이 반복될 수 있습니다.
- Exact shipped files and license texts must be checked for every release / 실제 배포 파일과 라이선스 본문은 릴리스마다 다시 확인해야 합니다.

| Package | Version | License metadata | Scope | Optional | Lockfile path |
|---|---:|---|---|:---:|---|
${rows}

## LGPL review set / LGPL 검토 대상

The lockfile contains optional \`sharp\`/\`libvips\` platform artifacts with LGPL metadata. Their presence in the lockfile does not prove that every artifact is shipped. Any packaged \`node_modules\`, installer, executable, archive, container, or client delivery must be checked against the exact installed files and the license texts/notices included with those files. **Legal/professional review is required for binary redistribution.**

잠금 파일에는 LGPL 메타데이터가 있는 선택적 \`sharp\`/\`libvips\` 플랫폼 산출물이 있습니다. 잠금 파일에 있다는 사실만으로 모든 산출물이 실제 배포된다는 뜻은 아닙니다. \`node_modules\`·설치 프로그램·실행 파일·압축 파일·컨테이너·고객 납품물은 실제 포함 파일과 그 파일에 동봉된 라이선스 본문·고지를 기준으로 다시 확인해야 합니다. **바이너리 재배포는 법무/전문가 검토 필요**입니다.

## Interpretation boundary / 해석 범위

No package entry is treated as approved merely because metadata is present. Expressions such as \`OR\`, \`AND\`, \`LGPL\`, \`CC0\`, \`WTFPL\`, and \`BlueOak\` must be interpreted from the package's actual license files for the exact distributed artifact.

메타데이터가 있다는 이유만으로 해당 패키지를 배포 승인된 것으로 판단하지 않습니다. \`OR\`, \`AND\`, \`LGPL\`, \`CC0\`, \`WTFPL\`, \`BlueOak\` 같은 표현은 실제 배포 산출물에 포함된 패키지의 라이선스 파일을 기준으로 해석해야 합니다.
`;
for (const path of [outputPath, pluginOutputPath]) {
  if (checkOnly) {
    const current = await readFile(path, 'utf8');
    if (current !== document) {
      console.error(`OUTDATED: ${path}`);
      process.exitCode = 1;
    }
  } else {
    await writeFile(path, document, 'utf8');
    console.log(`WROTE: ${path}`);
  }
}
if (checkOnly && !process.exitCode) {
  console.log(`OK: ${entries.length} dependency entries, ${missing} missing license metadata`);
}
