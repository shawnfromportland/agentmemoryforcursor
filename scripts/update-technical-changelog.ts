import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const TECHNICAL_CHANGELOG_PATH = path.join(__dirname, '..', 'docs', 'ai', 'technical_changelog.md');
const CHANGELOG_HEADER_SEPARATOR = '---';

interface Args {
  contentFile?: string;
  performAmend?: boolean;
}

const parseArgs = (): Args => {
  const args: Args = { performAmend: false };
  const cliArgs = process.argv.slice(2);
  for (let i = 0; i < cliArgs.length; i++) {
    if (cliArgs[i] === '--contentFile' && i + 1 < cliArgs.length) {
      args.contentFile = cliArgs[i + 1];
      i++; 
    } else if (cliArgs[i] === '--perform-amend') {
      args.performAmend = true;
    } else {
      console.warn(`Unknown argument: ${cliArgs[i]}`);
    }
  }
  if (!args.contentFile) {
    console.error('Error: --contentFile argument is required, specifying the path to the Markdown content.');
    console.log('Usage: ts-node scripts/update-technical-changelog.ts --contentFile <path_to_markdown_file>');
    process.exit(1);
  }
  return args;
};

const readContentFromFile = (filePath: string): string => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read content from file: ${filePath}`, error);
    process.exit(1);
  }
}

const updateChangelogFile = (newEntryContent: string): void => {
  try {
    // Check if the changelog file exists
    if (!fs.existsSync(TECHNICAL_CHANGELOG_PATH)) {
      // If it doesn't exist, create it with a default header
      const defaultHeader = `# Technical Changelog
This changelog tracks significant technical changes, architectural decisions, and contributions to the project.
Each entry should be linked to the relevant commit for easy reference.

${CHANGELOG_HEADER_SEPARATOR}
`;
      fs.writeFileSync(TECHNICAL_CHANGELOG_PATH, defaultHeader, 'utf-8');
      console.log(`Created technical changelog file at: ${TECHNICAL_CHANGELOG_PATH}`);
    }

    const rawContent = fs.readFileSync(TECHNICAL_CHANGELOG_PATH, 'utf-8');
    const separatorIndex = rawContent.indexOf(`\n${CHANGELOG_HEADER_SEPARATOR}\n`);

    if (separatorIndex === -1) {
      console.error(`Error: Changelog separator "${CHANGELOG_HEADER_SEPARATOR}" not found in ${TECHNICAL_CHANGELOG_PATH}. Cannot determine where to insert new entry.`);
      console.error('Expected format: \n# Technical Changelog\n...intro...\n---\n(entries here)');
      process.exit(1);
    }

    const headerPart = rawContent.substring(0, separatorIndex + `\n${CHANGELOG_HEADER_SEPARATOR}\n`.length);
    const entriesPart = rawContent.substring(separatorIndex + `\n${CHANGELOG_HEADER_SEPARATOR}\n`.length);
    
    // Simplified title formatting - no dynamic URL or hash
    const entryLines = newEntryContent.trimEnd().split('\n');
    const titleLine = entryLines[0];
    if (titleLine && titleLine.startsWith('### ')) {
      const titleText = titleLine.substring(4); // Get text after '### '
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      entryLines[0] = `### (${currentDate}) ${titleText}`;
    }
    const newEntryFormatted = entryLines.join('\n') + '\n';
    // Ensure the new entry still ends with the separator if it was there
    if (newEntryContent.trimEnd().endsWith('- - -')) {
        // The AI will provide "---" so no need to add it again if it's already the last meaningful line.
        // However, the AI's provided content (from .cursor_ai_changelog_entry.md) already includes the trailing "---"
        // So, if entryLines.join('\n') already ends with it, we don't want to double it.
        // The newEntryFormatted already takes care of trimming and adding one newline.
        // Let's assume the AI provides "### Title\n...details...\n---"
        // entryLines.join('\n') will be "### [Title](link)\n...details...\n---"
        // newEntryFormatted will be "### [Title](link)\n...details...\n---\n" - which is correct.
    }

    const updatedContent = headerPart + newEntryFormatted + (entriesPart.trim() ? entriesPart : '');

    fs.writeFileSync(TECHNICAL_CHANGELOG_PATH, updatedContent, 'utf-8');
    console.log('Technical changelog file updated successfully.');
  } catch (error) {
    console.error('Failed to update technical changelog file:', error);
    process.exit(1);
  }
};

const amendCommit = (): void => {
  try {
    console.log('Staging updated technical changelog...');
    execSync(`git add ${TECHNICAL_CHANGELOG_PATH}`, { stdio: 'inherit' });
    console.log('Amending commit...');
    execSync('git commit --amend --no-edit', { stdio: 'inherit' });
    console.log('Commit amended successfully.');
  } catch (error) {
    console.error('Failed to amend commit:', error);
    process.exit(1);
  }
};

const main = () => {
  const args = parseArgs();
  const newEntryMarkdown = readContentFromFile(args.contentFile!);

  console.log('Starting technical changelog update process...');
  updateChangelogFile(newEntryMarkdown);

  // Delete the temporary content file after its content has been used
  try {
    fs.unlinkSync(args.contentFile!);
    console.log(`Successfully deleted temporary file: ${args.contentFile!}`);
  } catch (error) {
    console.warn(`Warning: Failed to delete temporary file ${args.contentFile!}:`, error);
    // Continue even if deletion fails, as the main operations might have succeeded
  }

  if (args.performAmend) {
    amendCommit();
  }
  console.log('Technical changelog update process completed.');
};

main(); 
