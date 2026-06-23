const fs = require('fs');
const path = require('path');

// Directories to search for React files
const SEARCH_DIRS = [
  path.join(__dirname, '../client/src/pages'),
  path.join(__dirname, '../client/src/components')
];

// File extensions to process
const FILE_EXTENSIONS = ['.jsx', '.js', '.tsx', '.ts'];

// Patterns to replace
const PATTERNS = [
  { from: /\.JPG/g, to: '.webp' },
  { from: /\.jpg/g, to: '.webp' },
  { from: /\.jpeg/g, to: '.webp' },
  { from: /\.JPEG/g, to: '.webp' },
  { from: /\.png/g, to: '.webp' },
  { from: /\.PNG/g, to: '.webp' }
];

let filesModified = 0;
let totalReplacements = 0;

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function updateFileReferences(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fileReplacements = 0;

  PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, pattern.to);
      fileReplacements += matches.length;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplacements += fileReplacements;
    console.log(`✅ ${path.relative(__dirname, filePath)} - ${fileReplacements} replacements`);
  }

  return modified;
}

function main() {
  console.log('🔍 Searching for image references to update...\n');
  
  let allFiles = [];
  SEARCH_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(getAllFiles(dir));
    }
  });

  console.log(`📁 Found ${allFiles.length} files to scan\n`);
  console.log('━'.repeat(80));

  allFiles.forEach(file => {
    updateFileReferences(file);
  });

  console.log('━'.repeat(80));
  console.log('\n📊 Summary:');
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Total replacements: ${totalReplacements}`);
  
  if (filesModified === 0) {
    console.log('\n✨ No image references found to update.');
    console.log('   Your code might already be using the correct extensions,');
    console.log('   or images are loaded dynamically.\n');
  } else {
    console.log('\n✨ Image references updated successfully!');
    console.log('   Review the changes and test your application.\n');
  }
}

main();
