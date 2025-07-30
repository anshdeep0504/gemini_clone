import { getGeminiAPI, isGeminiConfigured } from './gemini-api'

export async function generateMockResponse(userMessage: string): Promise<string> {
  // Try to use real Gemini API first
  if (isGeminiConfigured()) {
    try {
      const geminiAPI = getGeminiAPI()
      if (geminiAPI) {
        const response = await geminiAPI.generateResponse(userMessage)
        return response
      }
    } catch (error) {
      console.error('Gemini API failed, falling back to mock:', error)
      // Fall through to mock response
    }
  }

  // Simulate API delay - reduced to 100-300ms for very fast response
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

  const responses = [
    `Here's a comprehensive guide to help you with that:

## Getting Started

First, let's understand the basics:

1. **Installation**: Make sure you have the latest version
2. **Configuration**: Set up your environment
3. **Testing**: Verify everything works

### Code Example

\`\`\`javascript
// Example implementation
function example() {
  const data = {
    name: "Example",
    value: 42
  };
  
  return data;
}

console.log(example());
\`\`\`

### Key Points

- **Point 1**: This is important to remember
- **Point 2**: Another crucial aspect
- **Point 3**: Don't forget this detail

> **Pro Tip**: Always test your code before deploying to production.

Would you like me to elaborate on any of these points?`,

    `I can help you with that! Here's what you need to know:

## Overview

This is a common question that many developers face. Let me break it down for you:

### Step-by-Step Process

1. **Research**: Start by understanding the requirements
2. **Plan**: Create a detailed implementation plan
3. **Execute**: Follow the plan step by step
4. **Test**: Verify everything works as expected

### Example Implementation

\`\`\`python
def solve_problem(input_data):
    """
    A function to solve your specific problem
    """
    result = []
    
    for item in input_data:
        processed = process_item(item)
        result.append(processed)
    
    return result

# Usage
data = [1, 2, 3, 4, 5]
solution = solve_problem(data)
print(f"Result: {solution}")
\`\`\`

### Best Practices

- Always use meaningful variable names
- Add proper error handling
- Document your code
- Write unit tests

Let me know if you need any clarification!`,

    `Great question! Let me provide you with a detailed explanation:

## Understanding the Concept

This involves several key components:

### Core Components

1. **Component A**: Handles the primary functionality
2. **Component B**: Manages the secondary features
3. **Component C**: Provides additional utilities

### Implementation Example

\`\`\`typescript
interface Config {
  apiKey: string;
  endpoint: string;
  timeout: number;
}

class Service {
  private config: Config;
  
  constructor(config: Config) {
    this.config = config;
  }
  
  async process(data: any): Promise<any> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}
\`\`\`

### Important Notes

> **Warning**: Make sure to handle errors properly in production code.

**Key Takeaways:**
- Always validate input data
- Implement proper error handling
- Use TypeScript for better type safety
- Follow consistent coding standards

Would you like me to explain any specific part in more detail?`,

    `Here's a comprehensive answer to your question:

## Problem Analysis

The issue you're facing is quite common. Let me explain the solution:

### Root Cause

The problem typically occurs due to:
- Incorrect configuration
- Missing dependencies
- Version conflicts

### Solution Steps

1. **Check Dependencies**
   \`\`\`bash
   npm list
   npm audit
   \`\`\`

2. **Update Configuration**
   \`\`\`json
   {
     "name": "your-project",
     "version": "1.0.0",
     "dependencies": {
       "react": "^18.0.0",
       "next": "^13.0.0"
     }
   }
   \`\`\`

3. **Clear Cache**
   \`\`\`bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   \`\`\`

### Verification

After implementing these steps, test your application:

\`\`\`javascript
// Test script
function testFunctionality() {
  console.log('Testing...');
  // Add your test logic here
  return 'Success!';
}

testFunctionality();
\`\`\`

### Next Steps

- Monitor the application logs
- Check for any remaining errors
- Update documentation if needed

Let me know if you encounter any issues!`
  ]

  // Return a random response
  return responses[Math.floor(Math.random() * responses.length)]
} 