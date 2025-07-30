const fs = require('fs');

try {
  const content = fs.readFileSync('.env.local', 'utf8');
  console.log('Raw file contents:\n', content);
  console.log('File length:', content.length);
  console.log('Character codes:', Array.from(content).map(c => c.charCodeAt(0)));

  const lines = content.split(/\r?\n/);
  console.log('\nParsed lines:');
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      console.log(`Parsed: ${key} = ${value}`);
    }
  }
} catch (error) {
  console.error('Error reading .env.local:', error.message);
} 