#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Box, render, Text, useApp, useInput } from 'ink';
import React, { useCallback, useEffect, useState } from 'react';

const REGISTRY_URL = 'https://redpanda-ui-registry.netlify.app';
const REGISTRY_JSON_URL = `${REGISTRY_URL}/r/registry.json`;

interface RegistryItem {
  name: string;
}

interface Registry {
  items: RegistryItem[];
}

interface ComponentFile {
  path: string;
  content: string;
  type: 'component' | 'hook' | 'lib' | 'style';
}

interface ComponentDetails {
  name: string;
  files: ComponentFile[];
}

type UpdateResult = 'updated' | 'skipped' | 'failed';

// Confirmation Component
const ConfirmationPrompt: React.FC<{
  message: string;
  onConfirm: (confirmed: boolean) => void;
}> = ({ message, onConfirm }) => {
  useInput((input, key) => {
    if (key.return || input.toLowerCase() === 'y' || input === '') {
      onConfirm(true);
    } else if (input.toLowerCase() === 'n') {
      onConfirm(false);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="yellow">⚠️ {message} (Y/n): </Text>
    </Box>
  );
};

// Utility functions

async function fetchComponentDetails(componentName: string): Promise<ComponentDetails> {
  const response = await fetch(`${REGISTRY_URL}/r/${componentName}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch component "${componentName}": ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

function generateDiff(localContent: string, registryContent: string, fileName: string): string {
  const localLines = localContent.split('\n');
  const registryLines = registryContent.split('\n');

  const diffLines: string[] = [];
  diffLines.push(`--- a/${fileName}`);
  diffLines.push(`+++ b/${fileName}`);

  // Simple diff algorithm - find changes line by line
  const maxLines = Math.max(localLines.length, registryLines.length);
  let hunkStart = -1;
  let hunkLocalStart = -1;
  let hunkRegistryStart = -1;
  let hunkLines: string[] = [];

  for (let i = 0; i < maxLines; i++) {
    const localLine = localLines[i] || '';
    const registryLine = registryLines[i] || '';

    if (localLine !== registryLine) {
      if (hunkStart === -1) {
        hunkStart = i;
        hunkLocalStart = i;
        hunkRegistryStart = i;
      }

      if (localLines[i] !== undefined) {
        hunkLines.push(`-${localLine}`);
      }
      if (registryLines[i] !== undefined) {
        hunkLines.push(`+${registryLine}`);
      }
    } else if (hunkStart !== -1) {
      // End of hunk
      const localCount = hunkLines.filter((line) => line.startsWith('-')).length;
      const registryCount = hunkLines.filter((line) => line.startsWith('+')).length;

      diffLines.push(`@@ -${hunkLocalStart + 1},${localCount} +${hunkRegistryStart + 1},${registryCount} @@`);
      diffLines.push(...hunkLines);

      hunkStart = -1;
      hunkLines = [];
    }
  }

  // Handle final hunk if it exists
  if (hunkStart !== -1) {
    const localCount = hunkLines.filter((line) => line.startsWith('-')).length;
    const registryCount = hunkLines.filter((line) => line.startsWith('+')).length;

    diffLines.push(`@@ -${hunkLocalStart + 1},${localCount} +${hunkRegistryStart + 1},${registryCount} @@`);
    diffLines.push(...hunkLines);
  }

  return diffLines.join('\n');
}

function getLocalFilePath(componentName: string, registryPath: string): string | null {
  // Map registry paths to local paths
  const pathMappings: { [key: string]: string } = {
    'registry/components': 'src/components',
    'registry/hooks': 'src/hooks',
    'registry/lib': 'src/lib',
    'registry/icons': 'src/components/icons',
  };

  let localPath = registryPath;

  // Replace registry path prefixes with local equivalents
  for (const [registryPrefix, localPrefix] of Object.entries(pathMappings)) {
    if (registryPath.startsWith(registryPrefix)) {
      localPath = registryPath.replace(registryPrefix, localPrefix);
      break;
    }
  }

  // Handle special cases
  if (registryPath.includes('index.tsx')) {
    // For components like button/index.tsx -> src/components/button.tsx
    const parts = localPath.split('/');
    const componentDir = parts[parts.length - 2];
    if (componentDir && componentDir !== 'components') {
      localPath = `src/components/${componentDir}.tsx`;
    }
  }

  try {
    const stat = statSync(localPath);
    if (stat.isFile()) {
      return localPath;
    }
  } catch {
    // File doesn't exist, try alternative paths
    const alternatives = [
      localPath.replace('.tsx', '.ts'),
      localPath.replace('.ts', '.tsx'),
      localPath.replace('src/components/', 'src/components/ui/'),
      `src/components/${componentName}.tsx`,
      `src/components/ui/${componentName}.tsx`,
    ];

    for (const alt of alternatives) {
      try {
        const stat = statSync(alt);
        if (stat.isFile()) {
          return alt;
        }
      } catch {
        // Continue to next alternative
      }
    }
  }

  return null;
}

async function fetchRegistryComponents(): Promise<string[]> {
  const response = await fetch(REGISTRY_JSON_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`);
  }
  const registry: Registry = await response.json();

  if (!registry.items || !Array.isArray(registry.items)) {
    throw new Error('Invalid registry format: missing items array');
  }

  return registry.items
    .map((item) => item.name)
    .filter((name) => !name.includes('-demo') && name !== 'index' && name !== 'theme');
}

function getExistingComponents(): string[] {
  const directories = [
    { path: './src/components', extensions: ['.tsx', '.json'] },
    { path: './src/icons', extensions: ['.tsx'] },
    { path: './src/hooks', extensions: ['.ts', '.tsx'] },
  ];
  const components: string[] = [];

  // Check directories for files
  for (const { path: dirPath, extensions } of directories) {
    try {
      const files = readdirSync(dirPath);

      for (const file of files) {
        const filePath = join(dirPath, file);
        const stat = statSync(filePath);

        if (stat.isFile()) {
          const matchingExtension = extensions.find((ext) => file.endsWith(ext));
          if (matchingExtension) {
            const componentName = file.replace(matchingExtension, '');
            if (componentName !== 'index') {
              components.push(componentName);
            }
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read, skip it
    }
  }

  // Check for theme in globals.css
  try {
    const globalsPath = './src/globals.css';
    const stat = statSync(globalsPath);
    if (stat.isFile()) {
      components.push('theme');
    }
  } catch {
    // globals.css doesn't exist
  }

  return components;
}

function verifyComponentMissing(componentName: string): boolean {
  const command = `bun x --bun shadcn@latest add "${REGISTRY_URL}/r/${componentName}" 2>&1`;

  try {
    const output = execSync(command, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    });

    // If files are skipped because they're identical, the component is already installed
    if (output.includes('Skipped') && output.includes('files might be identical')) {
      // Parse the skipped files to see if ALL files for this component are skipped
      const skippedFilesMatch = output.match(/Skipped (\d+) files:/);
      if (skippedFilesMatch) {
        const skippedCount = Number.parseInt(skippedFilesMatch[1]);
        // Extract file paths from the output - looking for lines that start with "  - "
        const filePathRegex = /^\s*-\s+(src\/[^\s]+)/gm;
        const filePaths: string[] = [];
        let match: RegExpExecArray | null;
        while ((match = filePathRegex.exec(output)) !== null) {
          filePaths.push(match[1]);
        }

        // If we have skipped files and they match the count, all files exist
        if (filePaths.length === skippedCount && skippedCount > 0) {
          return false; // Component is not missing - all files already exist
        }
      }
      // If files are skipped, component is likely already installed
      return false; // Component is not missing
    }

    // If it would install or update files, then it's missing
    return true;
  } catch (error) {
    // Log the verification error for debugging
    console.warn(
      `⚠️ Could not verify component "${componentName}":`,
      error instanceof Error ? error.message : 'Unknown error',
    );
    // If the command fails, assume it's missing to be safe
    return true;
  }
}

async function getVerifiedMissingComponents(
  registryComponents: string[],
  existingComponents: string[],
  onProgress?: (message: string) => void,
): Promise<string[]> {
  onProgress?.('📋 Analyzing component names...');

  // First, separate components by exact name match
  const exactMatches = registryComponents.filter((comp) => existingComponents.includes(comp));
  const potentialMismatches = registryComponents.filter((comp) => !existingComponents.includes(comp));

  onProgress?.(`✅ ${exactMatches.length} components found with exact name matches`);

  if (potentialMismatches.length === 0) {
    onProgress?.('🎉 All registry components have exact matches - no verification needed');
    return [];
  }

  onProgress?.(`🔍 Verifying ${potentialMismatches.length} components with potential name differences...`);

  const verifiedMissing: string[] = [];
  const alreadyInstalled: string[] = [];

  for (let i = 0; i < potentialMismatches.length; i++) {
    const component = potentialMismatches[i];
    onProgress?.(`🔄 Checking ${component} (${i + 1}/${potentialMismatches.length})`);

    if (verifyComponentMissing(component)) {
      verifiedMissing.push(component);
    } else {
      alreadyInstalled.push(component);
    }
  }

  // Report components that are already installed but under different names
  if (alreadyInstalled.length > 0) {
    console.log(`✅ Found ${alreadyInstalled.length} components already installed (but under different names):`);
    alreadyInstalled.forEach((comp) => {
      console.log(`   - ${comp}: already added`);
    });
    console.log();
  }

  onProgress?.(
    `📊 Verification complete: ${verifiedMissing.length} missing, ${alreadyInstalled.length} already installed`,
  );
  return verifiedMissing;
}

function updateComponent(componentName: string, forceOverwrite = false): UpdateResult {
  const overwriteFlag = forceOverwrite ? '--overwrite' : '--overwrite';
  const command = `bun x --bun shadcn@latest add "${REGISTRY_URL}/r/${componentName}" ${overwriteFlag}`;

  try {
    const output = execSync(command, {
      stdio: 'pipe',
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    if (output.includes('Skipped') && output.includes('files might be identical')) {
      return 'skipped';
    }

    if (output.includes('Updated') || output.includes('Installing dependencies')) {
      return 'updated';
    }

    return 'updated';
  } catch (error) {
    // Log the error for debugging
    console.error(
      `❌ Failed to update component "${componentName}":`,
      error instanceof Error ? error.message : 'Unknown error',
    );
    return 'failed';
  }
}

// Loading Component
const LoadingSpinner: React.FC<{
  message: string;
  progressMessages?: string[];
}> = ({ message, progressMessages = [] }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`));
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 30000); // Increased timeout for verification process

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Box flexDirection="column">
      <Text color="blue">
        🔍 {message}
        {dots}
      </Text>
      {progressMessages.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {progressMessages.slice(-5).map((msg, index) => (
            <Text key={index} color="gray">
              {msg}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Component Update with Confirmation
const ComponentUpdateWithConfirmation: React.FC<{
  components: string[];
  onComplete: (results: Array<{ name: string; result: UpdateResult }>) => void;
}> = ({ components, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<{ name: string; result: UpdateResult }>>([]);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(true);

  const isForce = process.argv.includes('--force');

  const handleConfirmation = (confirmed: boolean) => {
    const component = components[currentIndex];
    let result: UpdateResult;

    if (confirmed) {
      result = updateComponent(component, isForce);
    } else {
      result = 'skipped';
    }

    setResults((prev) => [...prev, { name: component, result }]);
    setCurrentIndex((prev) => prev + 1);
    setAwaitingConfirmation(true);
  };

  useEffect(() => {
    if (currentIndex >= components.length) {
      onComplete(results);
    }
  }, [currentIndex, components.length, results, onComplete]);

  if (currentIndex >= components.length) {
    return null;
  }

  if (awaitingConfirmation) {
    return (
      <Box flexDirection="column">
        <Text color="cyan" bold>
          🔄 Component Update Confirmation ({currentIndex + 1}/{components.length})
        </Text>
        <Text />
        <ConfirmationPrompt
          message={`Update component "${components[currentIndex]}"?`}
          onConfirm={(confirmed) => {
            handleConfirmation(confirmed);
            setAwaitingConfirmation(false);
          }}
        />
        <Text />
        <Text color="gray">
          Progress: {results.length}/{components.length} completed
        </Text>
        {results.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            {results.slice(-3).map(({ name, result }) => (
              <Text key={name} color={result === 'updated' ? 'green' : result === 'skipped' ? 'yellow' : 'red'}>
                {result === 'updated' ? '✅' : result === 'skipped' ? '⏭️' : '❌'} {name}
              </Text>
            ))}
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

// Batch Update Progress Component (for --add-missing and --add-all flags)
const UpdateProgressComponent: React.FC<{
  components: string[];
  onComplete: (results: Array<{ name: string; result: UpdateResult }>) => void;
  isAddAll?: boolean;
}> = ({ components, onComplete, isAddAll = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<{ name: string; result: UpdateResult }>>([]);

  useEffect(() => {
    if (currentIndex < components.length) {
      const component = components[currentIndex];
      const result = updateComponent(component, true); // Always force overwrite in batch mode

      setResults((prev) => [...prev, { name: component, result }]);
      setCurrentIndex((prev) => prev + 1);
    } else if (results.length === components.length) {
      onComplete(results);
    }
  }, [currentIndex, components, results, onComplete]);

  const progress = Math.round((results.length / components.length) * 100);
  const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));

  return (
    <Box flexDirection="column">
      <Text color="cyan" bold>
        🔄 {isAddAll ? 'Installing All Registry Components' : 'Installing Missing Components'}
      </Text>
      <Text />

      <Text>
        Progress: [{progressBar}] {progress}%
      </Text>
      <Text>
        Processed: {results.length}/{components.length}
      </Text>
      <Text />

      {currentIndex < components.length && <Text color="yellow">Currently installing: {components[currentIndex]}</Text>}

      <Box flexDirection="column" marginTop={1}>
        {results.slice(-5).map(({ name, result }) => (
          <Text key={name} color={result === 'updated' ? 'green' : result === 'skipped' ? 'yellow' : 'red'}>
            {result === 'updated' ? '✅' : result === 'skipped' ? '⏭️' : '❌'} {name}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

// Diff Component
const DiffComponent: React.FC<{
  componentName: string;
  diffs: Array<{ fileName: string; diff: string; localPath: string | null }>;
}> = ({ componentName, diffs }) => {
  const { exit } = useApp();

  useEffect(() => {
    exit();
  }, [exit]);

  const hasDifferences = diffs.some((d) => d.diff.includes('@@'));

  return (
    <Box flexDirection="column">
      <Text color="cyan" bold>
        🔍 Component Diff: {componentName}
      </Text>
      <Text color="gray">
        Registry: {REGISTRY_URL}/r/{componentName}.json
      </Text>
      <Text />

      {!hasDifferences ? (
        <Text color="green">✅ No differences found - your local component matches the registry version!</Text>
      ) : (
        <Box flexDirection="column">
          <Text color="yellow">📝 Found differences between local and registry versions:</Text>
          <Text />

          {diffs.map(({ fileName, diff, localPath }) => (
            <Box key={fileName} flexDirection="column" marginBottom={1}>
              <Text color="magenta" bold>
                📄 {fileName}
              </Text>
              {localPath ? (
                <Text color="gray">Local: {localPath}</Text>
              ) : (
                <Text color="red">⚠️ Local file not found</Text>
              )}
              <Text />
              {diff.includes('@@') ? (
                <Box flexDirection="column">
                  {diff
                    .split('\n')
                    .slice(2)
                    .map((line, index) => {
                      if (line.startsWith('@@')) {
                        return (
                          <Text key={index} color="cyan">
                            {line}
                          </Text>
                        );
                      }
                      if (line.startsWith('-')) {
                        return (
                          <Text key={index} color="red">
                            {line}
                          </Text>
                        );
                      }
                      if (line.startsWith('+')) {
                        return (
                          <Text key={index} color="green">
                            {line}
                          </Text>
                        );
                      }
                      return (
                        <Text key={index} color="gray">
                          {line}
                        </Text>
                      );
                    })}
                </Box>
              ) : (
                <Text color="green">No differences in content</Text>
              )}
              <Text />
            </Box>
          ))}

          <Text color="blue">💡 To update your component, run:</Text>
          <Text color="gray"> bun run shadcn:ui {componentName}</Text>
        </Box>
      )}
    </Box>
  );
};

// Results Component
const ResultsComponent: React.FC<{
  results: Array<{ name: string; result: UpdateResult }>;
}> = ({ results }) => {
  const { exit } = useApp();
  const updated = results.filter((r) => r.result === 'updated');
  const skipped = results.filter((r) => r.result === 'skipped');
  const failed = results.filter((r) => r.result === 'failed');

  useEffect(() => {
    exit();
  }, [exit]);

  return (
    <Box flexDirection="column">
      <Text color="green" bold>
        📊 Installation Complete!
      </Text>
      <Text />

      {updated.length > 0 && <Text color="green">✅ Successfully installed: {updated.length} components</Text>}
      {skipped.length > 0 && <Text color="yellow">⏭️ Skipped (already up-to-date): {skipped.length} components</Text>}
      {failed.length > 0 && (
        <>
          <Text color="red">❌ Failed to install: {failed.length} components</Text>
          <Text color="red"> Failed components: {failed.map((f) => f.name).join(', ')}</Text>
        </>
      )}

      <Text>📦 Total components processed: {results.length}</Text>
      <Text />

      {failed.length === 0 ? (
        <Text color="green">🎉 All components are now synced with your custom Redpanda UI registry!</Text>
      ) : (
        <Box flexDirection="column">
          <Text color="yellow">⚠️ Some components were processed successfully, but others failed.</Text>
          <Text color="gray">Check the console output above for detailed error messages.</Text>
        </Box>
      )}
    </Box>
  );
};

// Registry Breakdown Component
const RegistryBreakdown: React.FC<{
  registryComponents: string[];
  existingComponents: string[];
  missingComponents: string[];
}> = ({ registryComponents, existingComponents, missingComponents }) => {
  const { exit } = useApp();
  const components = registryComponents.filter(
    (name) => !name.startsWith('use-') && !name.endsWith('-icon') && name !== 'theme',
  );
  const hooks = registryComponents.filter((name) => name.startsWith('use-'));
  const icons = registryComponents.filter((name) => name.endsWith('-icon'));
  const theme = registryComponents.filter((name) => name === 'theme');

  // Calculate truly missing components by category
  const missingComponentsByCategory = {
    components: components.filter((comp) => missingComponents.includes(comp)),
    hooks: hooks.filter((hook) => missingComponents.includes(hook)),
    icons: icons.filter((icon) => missingComponents.includes(icon)),
    theme: theme.filter((t) => missingComponents.includes(t)),
  };

  useEffect(() => {
    // Auto-exit after displaying the information
    exit();
  }, [exit]);

  return (
    <Box flexDirection="column">
      <Text color="magenta" bold>
        🎯 Shadcn Component Registry
      </Text>
      <Text color="gray">Registry: {REGISTRY_URL}</Text>
      <Text />
      <Text color="cyan" bold>
        📊 Registry Breakdown:
      </Text>
      <Text />
      <Text> Total: {registryComponents.length} items</Text>
      <Text />
      <Text>
        {' '}
        - 🧩 Components: {components.length} ({missingComponentsByCategory.components.length} available to install)
      </Text>
      <Text>
        {' '}
        - 🪝 Hooks: {hooks.length} ({missingComponentsByCategory.hooks.length} available to install)
      </Text>
      <Text />
      <Text> Currently Installed: </Text>
      <Text />
      {existingComponents.length > 0 && (
        <>
          <Text>
            {' '}
            - ✅ {existingComponents.slice(0, 15).join(', ')}
            {existingComponents.length > 15 ? `... (${existingComponents.length - 15} more)` : ''}
          </Text>
          <Text />
        </>
      )}
      <Text> Verified Missing: {missingComponents.length} items</Text>
      <Text />
      {missingComponents.length > 0 && (
        <>
          <Text color="green">Available components: {missingComponents.join(', ')}</Text>
          <Text />
          <Text color="green">
            Run with --add-missing to install missing components or --add-all to see what would be installed.
          </Text>
          <Text color="yellow">
            💡 Use --add-all --force to actually install and overwrite all existing components with latest versions.
          </Text>
        </>
      )}
    </Box>
  );
};

// Main App Component
const App: React.FC = () => {
  const { exit } = useApp();
  const [registryComponents, setRegistryComponents] = useState<string[]>([]);
  const [existingComponents, setExistingComponents] = useState<string[]>([]);
  const [missingComponents, setMissingComponents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'installing' | 'confirming' | 'results' | 'diff'>('view');
  const [updateResults, setUpdateResults] = useState<Array<{ name: string; result: UpdateResult }>>([]);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [diffResults, setDiffResults] = useState<Array<{ fileName: string; diff: string; localPath: string | null }>>(
    [],
  );

  const isAddMissing = process.argv.includes('--add-missing');
  const isAddAll = process.argv.includes('--add-all');
  const isForce = process.argv.includes('--force');
  const isDiff = process.argv.includes('--diff');

  // Check if user specified a specific component to update
  const componentArg = process.argv.find(
    (arg) => !arg.startsWith('-') && arg !== process.argv[0] && arg !== process.argv[1],
  );

  // Check if command was run without any arguments or flags
  const hasNoArgs = process.argv.length <= 2;

  const addProgressMessage = useCallback((message: string) => {
    setProgressMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    if (error) {
      exit();
    }
  }, [error, exit]);

  useEffect(() => {
    const loadData = async () => {
      try {
        addProgressMessage('🌐 Fetching registry components...');
        const [regComponents, exComponents] = await Promise.all([
          fetchRegistryComponents(),
          Promise.resolve(getExistingComponents()),
        ]);

        addProgressMessage(`📦 Found ${regComponents.length} registry components`);
        addProgressMessage(`💾 Found ${exComponents.length} local components`);

        setRegistryComponents(regComponents);
        setExistingComponents(exComponents);

        // Verify missing components
        const verifiedMissing = await getVerifiedMissingComponents(regComponents, exComponents, addProgressMessage);
        setMissingComponents(verifiedMissing);

        addProgressMessage('✨ Analysis complete');
        setLoading(false);

        // If --add-all flag is present, show what would be installed (dry run unless --force)
        if (isAddAll) {
          if (regComponents.length > 0) {
            if (isForce) {
              // Actually install all components
              setMissingComponents(regComponents); // Set all components as "missing" to install them all
              setMode('installing');
            } else {
              // Dry run - show what would be installed
              console.log('🔍 DRY RUN: --add-all flag detected');
              console.log('');
              console.log(`📦 Would install ${regComponents.length} registry components:`);
              console.log('');

              // Group components by type
              const components = regComponents.filter(
                (name) => !name.startsWith('use-') && !name.endsWith('-icon') && name !== 'theme',
              );
              const hooks = regComponents.filter((name) => name.startsWith('use-'));
              const icons = regComponents.filter((name) => name.endsWith('-icon'));
              const theme = regComponents.filter((name) => name === 'theme');

              if (components.length > 0) {
                console.log(`🧩 Components (${components.length}): ${components.join(', ')}`);
              }
              if (hooks.length > 0) {
                console.log(`🪝 Hooks (${hooks.length}): ${hooks.join(', ')}`);
              }
              if (icons.length > 0) {
                console.log(`🎨 Icons (${icons.length}): ${icons.join(', ')}`);
              }
              if (theme.length > 0) {
                console.log(`🎭 Theme (${theme.length}): ${theme.join(', ')}`);
              }

              console.log('');
              console.log('💡 To actually install all components, run:');
              console.log('   bun scripts/shadcn-ui.tsx --add-all --force');
              console.log('');
              console.log('⚠️  This will overwrite all existing components with registry versions!');
              exit();
            }
          } else {
            console.log('❌ No registry components found to install!');
            exit();
          }
        }
        // If --add-missing flag is present, start batch installation
        else if (isAddMissing) {
          if (verifiedMissing.length > 0) {
            setMode('installing');
          } else {
            // No missing components, show message and exit
            console.log('✨ All registry components are already installed!');
            exit();
          }
        }
        // If specific component is provided, handle diff or install mode
        else if (componentArg) {
          if (regComponents.includes(componentArg)) {
            if (isDiff) {
              // Show diff for the specific component
              addProgressMessage(`🔍 Fetching component details for "${componentArg}"...`);
              try {
                const componentDetails = await fetchComponentDetails(componentArg);
                const diffs: Array<{ fileName: string; diff: string; localPath: string | null }> = [];

                for (const file of componentDetails.files) {
                  const localPath = getLocalFilePath(componentArg, file.path);
                  let localContent = '';

                  if (localPath) {
                    try {
                      localContent = readFileSync(localPath, 'utf8');
                    } catch {
                      localContent = '';
                    }
                  }

                  const diff = generateDiff(localContent, file.content, file.path);
                  diffs.push({
                    fileName: file.path,
                    diff,
                    localPath,
                  });
                }

                setDiffResults(diffs);
                setMode('diff');
              } catch (error) {
                setError(`Failed to fetch component details: ${(error as Error).message}`);
              }
            } else if (isForce) {
              // Skip confirmation and install directly with --force
              console.log(`🔄 Installing component "${componentArg}" with --force...`);
              const result = updateComponent(componentArg, true);
              if (result === 'failed') {
                console.log(`❌ Component "${componentArg}" installation failed. Check the error messages above.`);
              } else {
                console.log(`✅ Component "${componentArg}" installation result: ${result}`);
              }
              setUpdateResults([{ name: componentArg, result }]);
              setMode('results');
            } else {
              setMode('confirming');
            }
          } else {
            console.log(`❌ Component "${componentArg}" not found in registry`);
            console.log(`Available components: ${regComponents.join(', ')}`);
            exit();
          }
        }
        // If no arguments provided, show registry breakdown
        else if (!hasNoArgs) {
          // Exit if unknown arguments/flags are provided
          console.log('❌ Unknown arguments or flags provided');
          console.log(
            'Usage: bun scripts/shadcn-ui.tsx [component-name] [--add-missing] [--add-all] [--force] [--diff]',
          );
          console.log('  --diff: Show differences between local and registry versions');
          console.log('  --add-missing: Install all missing components');
          console.log('  --add-all: Show what components would be installed (dry run)');
          console.log('  --add-all --force: Install all registry components (overwriting existing ones)');
          console.log('  --force: Install without confirmation');
          exit();
        }
      } catch (error) {
        setError((error as Error).message);
        setLoading(false);
      }
    };

    loadData();
  }, [isAddMissing, isAddAll, isForce, isDiff, componentArg, hasNoArgs, exit, addProgressMessage]);

  if (loading) {
    return <LoadingSpinner message="Fetching and verifying registry components" progressMessages={progressMessages} />;
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">❌ Error: {error}</Text>
        <Text color="gray">Check your internet connection and try again.</Text>
      </Box>
    );
  }

  const handleUpdateComplete = (results: Array<{ name: string; result: UpdateResult }>) => {
    setUpdateResults(results);
    setMode('results');
  };

  // Render different modes
  switch (mode) {
    case 'installing':
      return (
        <UpdateProgressComponent components={missingComponents} onComplete={handleUpdateComplete} isAddAll={isAddAll} />
      );

    case 'confirming': {
      const componentsToUpdate = componentArg ? [componentArg] : missingComponents;
      return <ComponentUpdateWithConfirmation components={componentsToUpdate} onComplete={handleUpdateComplete} />;
    }

    case 'results':
      return <ResultsComponent results={updateResults} />;

    case 'diff':
      return <DiffComponent componentName={componentArg || ''} diffs={diffResults} />;

    default:
      // Only show registry breakdown if no arguments were provided
      if (hasNoArgs) {
        return (
          <RegistryBreakdown
            registryComponents={registryComponents}
            existingComponents={existingComponents}
            missingComponents={missingComponents}
          />
        );
      }
      return null;
  }
};

// Validate command line arguments before rendering
const isForce = process.argv.includes('--force');
const isDiff = process.argv.includes('--diff');

// Check if user specified a specific component to update
const componentArg = process.argv.find(
  (arg) => !arg.startsWith('-') && arg !== process.argv[0] && arg !== process.argv[1],
);

// Validate that --force flag requires a component name (unless used with --add-all)
const isAddAll = process.argv.includes('--add-all');
if (isForce && !componentArg && !isAddAll) {
  console.log('❌ Error: --force flag requires a component name');
  console.log('Usage: bun run shadcn:ui:force <component-name>');
  console.log('Example: bun run shadcn:ui:force button');
  console.log('Or use: bun scripts/shadcn-ui.tsx --add-all --force');
  process.exit(1);
}

// Validate that --diff flag requires a component name
if (isDiff && !componentArg) {
  console.log('❌ Error: --diff flag requires a component name');
  console.log('Usage: bun run shadcn:ui:diff <component-name>');
  console.log('Example: bun run shadcn:ui:diff button');
  process.exit(1);
}

render(<App />);
