const Groq = require('groq-sdk');
require('dotenv').config();

let groq = null;
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set. AI features are unavailable.');
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

/**
 * Parse raw invoice text and extract structured tool information.
 * @param {string} rawText - The raw invoice text
 * @returns {Object} { tool_name, amount, seats, renewal_date }
 */
async function parseInvoice(rawText) {
  const response = await getGroqClient().chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an invoice parsing assistant. Extract SaaS tool information from invoice text.
Return ONLY a valid JSON object with these fields:
- tool_name (string): the name of the SaaS tool
- amount (number): the monthly cost in INR (just the number, no currency symbol)
- seats (number or null): number of seats/users if mentioned
- renewal_date (string or null): next renewal/billing date in YYYY-MM-DD format if mentioned
Do not include any text outside the JSON object.`
      },
      {
        role: 'user',
        content: rawText
      }
    ],
    temperature: 0.1,
    max_tokens: 256
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from Groq');

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Failed to parse Groq response as JSON: ${content}`);
  }
}
/**
 * Categorize a tool by its name into a standard category.
 * @param {string} toolName - The name of the SaaS tool
 * @returns {string} Category string (e.g., 'communication', 'project_management')
 */
async function categorizeToolName(toolName) {
    const response = await getGroqClient().chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a SaaS tool categorization assistant. Given a tool name, return ONLY one of these exact category strings:
  communication, video_conferencing, project_management, crm, development, design, cloud_storage, hr, finance, security, analytics, marketing, other
  Return only the category string, nothing else.`
        },
        {
          role: 'user',
          content: toolName
        }
      ],
      temperature: 0,
      max_tokens: 32
    });
  
    const category = response.choices[0]?.message?.content?.trim().toLowerCase();
    const valid = [
      'communication', 'video_conferencing', 'project_management', 'crm',
      'development', 'design', 'cloud_storage', 'hr', 'finance', 'security',
      'analytics', 'marketing', 'other'
    ];
    return valid.includes(category) ? category : 'other';
  }
  
  /**
   * Generate a consolidation recommendation for overlapping tools.
   * @param {Array} tools - Array of { tool_name, monthly_cost } in the same category
   * @returns {string} Human-readable recommendation
   */
  async function generateOverlapRecommendation(tools) {
    const toolList = tools
      .map(t => `${t.tool_name}: Rs. ${t.monthly_cost?.toLocaleString('en-IN')}/month`)
      .join('\n');

      const response = await getGroqClient().chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a SaaS spend optimization advisor for Indian companies. Given a list of overlapping tools in the same category with their monthly costs, write a concise recommendation (2-3 sentences) explaining:
    1. Why these tools overlap
    2. Which one to keep
    3. How much money can be saved monthly by consolidating
    Use Rs. for currency. Be specific and actionable.`
          },
          {
            role: 'user',
            content: `These tools serve the same function:\n${toolList}`
          }
        ],
        temperature: 0.3,
        max_tokens: 256
      });
    
      return response.choices[0]?.message?.content?.trim() || 'Consolidation recommended to reduce costs.';
    }
    
    /**
     * Generate spend forecast for a tool based on historical snapshots.
     * @param {string} toolName - Name of the tool
     * @param {Array} snapshots - Array of { snapshot_month, actual_spend, seats_used }
     * @returns {Object} { projections: [{ month, projected_spend, confidence_level }], forecast_basis }
     */
    async function generateSpendForecast(toolName, snapshots) {
      const historyStr = snapshots
        .map(s => `${s.snapshot_month}: Rs. ${s.actual_spend} (${s.seats_used || 'N/A'} seats)`)
        .join('\n');
    
      const response = await getGroqClient().chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a SaaS spend forecasting analyst for Indian companies. Given historical monthly spend data for a tool, project the next 3 months of spend.
    Return ONLY a valid JSON object with:
    - projections: array of { month (YYYY-MM-DD first of month), projected_spend (number), confidence_level ("low"/"medium"/"high") }
    - forecast_basis: string explaining your reasoning in 2-3 sentences
    Do not include any text outside the JSON object.`
          },
          {
            role: 'user',
            content: `Tool: ${toolName}\nHistorical spend:\n${historyStr}`
          }
        ],
        temperature: 0.2,
        max_tokens: 512
      });
      const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from Groq');

  try {
    const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Failed to parse Groq forecast response: ${content}`);
  }
}

/**
 * Parse raw contract PDF text and extract key clauses.
 * @param {string} rawText - Extracted text from the contract PDF
 * @returns {Object} Parsed contract fields
 */
async function parseContractText(rawText) {
  const response = await getGroqClient().chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a contract analysis assistant for SaaS vendor agreements. Extract key terms from the contract text.
Return ONLY a valid JSON object with these fields:
- auto_renewal (boolean): whether the contract auto-renews
- notice_period_days (number or null): how many days notice required to cancel
- price_escalation_percent (number or null): annual price increase percentage
- penalty_clause (string or null): any early termination penalty
- support_sla (string or null): support response time commitments
- termination_clause (string or null): conditions for contract termination
- summary (string): a 3-4 sentence summary of the key contract terms
Do not include any text outside the JSON object.`
      },
      {
        role: 'user',
        content: rawText.substring(0, 8000) // Limit to avoid token overflow
      }
    ],
    temperature: 0.1,
    max_tokens: 1024
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from Groq');

  try {
    const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Failed to parse Groq contract response: ${content}`);
  }
}

/**
 * Generate provisioning/deprovisioning task list for an employee workflow.
 * @param {string} triggerType - 'onboarding', 'offboarding', or 'role_change'
 * @param {Object} employee - { name, department, job_title }
 * @param {Array} tools - Array of { tool_name, id } relevant to this employee
 * @returns {Array} Array of { tool_id, task_description, action_type, assigned_to_email }
 */
async function generateWorkflowTasks(triggerType, employee, tools) {
    const toolList = tools.map(t => `${t.tool_name} (ID: ${t.id})`).join(', ');
  
    const response = await getGroqClient().chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an IT workflow automation assistant. Generate a structured task list for employee ${triggerType}.
  Return ONLY a valid JSON array where each item has:
  - tool_id (number): the tool ID from the provided list
  - task_description (string): clear action description
  - action_type (string): one of "grant_access", "revoke_access", "transfer_data", "notify_vendor", "other"
  Do not include any text outside the JSON array.`
        },
        {
          role: 'user',
          content: `Trigger: ${triggerType}\nEmployee: ${employee.name}, ${employee.department}, ${employee.job_title}\nTools: ${toolList}`
        }
      ],
      temperature: 0.2,
      max_tokens: 1024
    });
  
    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty response from Groq');
  
    try {
      const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      throw new Error(`Failed to parse Groq workflow response: ${content}`);
    }
  }
  
  module.exports = {
    parseInvoice,
    categorizeToolName,
    generateOverlapRecommendation,
    generateSpendForecast,
    parseContractText,
    generateWorkflowTasks
  };
  