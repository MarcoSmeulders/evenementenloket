// @vitest-environment node
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
// A path inside apps/web/src, so the project's real lint config applies. The file
// does not exist: the fixtures below are linted as text.
const fixturePath = `${repoRoot}apps/web/src/components/LintFixture.tsx`;

async function lintRuleMessages(code: string) {
  const eslint = new ESLint({ cwd: repoRoot });
  const [result] = await eslint.lintText(code, { filePath: fixturePath });
  return (result?.messages ?? []).filter(
    (message) => message.ruleId === "i18next/no-literal-string",
  );
}

describe("quality-gates: No hard-coded interface text", () => {
  test("literal text in JSX fails lint", async () => {
    const code = `export function SaveButton() {
  return <button type="submit">Opslaan</button>;
}
`;
    const messages = await lintRuleMessages(code);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ severity: 2, line: 2 });
  });

  test("translated text passes lint", async () => {
    const code = `import { useTranslation } from 'react-i18next';

export function SaveButton() {
  const { t } = useTranslation();
  return <button type="submit">{t('form.save')}</button>;
}
`;
    const messages = await lintRuleMessages(code);

    expect(messages).toHaveLength(0);
  });
});
