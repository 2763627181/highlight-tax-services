import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Files and directories to include
const includePatterns = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  'components.json',
  '.gitignore',
  'replit.md',
  'DEPLOYMENT.md',
  'API_DOCUMENTATION.md',
  'CODE_ARCHITECTURE.md',
  'SECURITY.md',
  'design_guidelines.md',
  'client/',
  'server/',
  'shared/',
];

// Files/dirs to exclude
const excludePatterns = [
  'node_modules',
  '.git',
  'dist',
  '.replit',
  'replit.nix',
  '.cache',
  'scripts/',
  'uploads/',
  '.upm',
  '.config',
];

function shouldInclude(filePath: string): boolean {
  const relativePath = filePath.replace(/^\.\//, '');
  
  for (const pattern of excludePatterns) {
    if (relativePath.startsWith(pattern) || relativePath.includes('/' + pattern)) {
      return false;
    }
  }
  
  for (const pattern of includePatterns) {
    if (relativePath === pattern || relativePath.startsWith(pattern)) {
      return true;
    }
  }
  
  return false;
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const relativePath = fullPath.replace(/^\.\//, '');
      
      let shouldSkip = false;
      for (const pattern of excludePatterns) {
        if (relativePath.startsWith(pattern) || file === pattern) {
          shouldSkip = true;
          break;
        }
      }
      if (shouldSkip) continue;
      
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          getAllFiles(fullPath, arrayOfFiles);
        } else if (stat.isFile() && shouldInclude(relativePath)) {
          arrayOfFiles.push(relativePath);
        }
      } catch (e) {}
    }
  } catch (e) {}
  
  return arrayOfFiles;
}

async function main() {
  try {
    console.log('Connecting to GitHub...');
    const octokit = await getUncachableGitHubClient();
    
    const { data: user } = await octokit.users.getAuthenticated();
    const owner = user.login;
    const repo = 'highlight-tax-services';
    
    console.log(`Pushing to: ${owner}/${repo}`);
    
    // Step 1: Create initial README to initialize repo
    console.log('Initializing repository with README...');
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: 'README.md',
        message: 'Initial commit',
        content: Buffer.from('# Highlight Tax Services\n\nProfessional Tax Preparation Web Application').toString('base64')
      });
      console.log('README created successfully');
    } catch (e: any) {
      if (e.status === 422) {
        console.log('README already exists, continuing...');
      } else {
        throw e;
      }
    }
    
    // Wait a moment for GitHub to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Get the latest commit SHA
    console.log('Getting latest commit...');
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main'
    });
    const latestCommitSha = ref.object.sha;
    console.log(`Latest commit: ${latestCommitSha}`);
    
    // Step 3: Get all files
    const files = getAllFiles('.');
    console.log(`Found ${files.length} files to upload`);
    
    // Step 4: Create blobs for each file
    const treeItems: any[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      process.stdout.write(`\r[${i + 1}/${files.length}] Uploading: ${filePath.padEnd(60)}`);
      
      try {
        const content = fs.readFileSync(filePath);
        const base64Content = content.toString('base64');
        
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: base64Content,
          encoding: 'base64'
        });
        
        treeItems.push({
          path: filePath,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });
      } catch (e: any) {
        console.log(`\n  Skipped: ${filePath} - ${e.message}`);
      }
    }
    
    console.log(`\n\nCreating tree with ${treeItems.length} files...`);
    
    // Step 5: Get the base tree
    const { data: baseCommit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha
    });
    
    // Step 6: Create new tree
    const { data: tree } = await octokit.git.createTree({
      owner,
      repo,
      tree: treeItems,
      base_tree: baseCommit.tree.sha
    });
    
    // Step 7: Create commit
    console.log('Creating commit...');
    const { data: commit } = await octokit.git.createCommit({
      owner,
      repo,
      message: 'Add Highlight Tax Services application code',
      tree: tree.sha,
      parents: [latestCommitSha]
    });
    
    // Step 8: Update main branch
    console.log('Updating main branch...');
    await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: commit.sha
    });
    
    console.log('\n=== SUCCESS ===');
    console.log(`Repository: https://github.com/${owner}/${repo}`);
    console.log('All files have been pushed to GitHub!');
    
  } catch (error: any) {
    console.error('\nError:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

main();
