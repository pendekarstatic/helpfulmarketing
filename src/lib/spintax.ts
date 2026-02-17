// Nested spintax processor
// Syntax: {option1|option2|{nested1|nested2}} 
// Processes innermost braces first, recursively

export function spinText(text: string): string {
  const regex = /\{([^{}]+)\}/;
  let result = text;
  let match;
  let safety = 0;
  while ((match = regex.exec(result)) !== null && safety < 500) {
    const options = match[1].split('|');
    const replacement = options[Math.floor(Math.random() * options.length)];
    result = result.replace(match[0], replacement);
    safety++;
  }
  return result;
}

// Validate spintax syntax - check for balanced braces
export function validateSpintax(text: string): { valid: boolean; error?: string } {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}') depth--;
    if (depth < 0) return { valid: false, error: `Unexpected closing brace at position ${i}` };
  }
  if (depth !== 0) return { valid: false, error: `${depth} unclosed brace(s) found` };
  
  // Check for empty options
  const emptyOption = /\{\||\|\}|\|\|/;
  if (emptyOption.test(text)) return { valid: false, error: 'Empty option found (e.g., {|text} or {text|})' };
  
  return { valid: true };
}

// Count total possible unique variations
export function countVariations(text: string): number {
  const regex = /\{([^{}]+)\}/;
  let result = text;
  let count = 1;
  let match;
  let safety = 0;
  while ((match = regex.exec(result)) !== null && safety < 200) {
    const options = match[1].split('|');
    count *= options.length;
    result = result.replace(match[0], options[0]);
    safety++;
  }
  return count;
}
