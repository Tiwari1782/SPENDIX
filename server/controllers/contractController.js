const pool = require('../db/connection');
const { parseContractText } = require('../services/groqService');
const path = require('path');
const fs = require('fs');

// GET /api/contracts/:companyId — All uploaded contracts
const getContracts = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const [rows] = await pool.execute(
      `SELECT c.*, t.tool_name FROM contracts c
       JOIN saas_tools t ON c.tool_id = t.id
       WHERE c.company_id = ?
       ORDER BY c.uploaded_at DESC`,
      [companyId]
    );

    res.json(rows.map(r => ({
      id: r.id,
      tool_id: r.tool_id,
      tool_name: r.tool_name,
      file_name: r.file_name,
      parse_status: r.parse_status,
      parsed_auto_renewal: r.parsed_auto_renewal !== null ? !!r.parsed_auto_renewal : null,
      parsed_notice_period_days: r.parsed_notice_period_days,
      parsed_price_escalation_percent: r.parsed_price_escalation_percent ? parseFloat(r.parsed_price_escalation_percent) : null,
      groq_summary: r.groq_summary,
      uploaded_at: r.uploaded_at
    })));
  } catch (err) {
    next(err);
  }
};

// GET /api/contracts/:contractId — Single contract with parsed data
const getContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;

    const [rows] = await pool.execute(
      `SELECT c.*, t.tool_name FROM contracts c
       JOIN saas_tools t ON c.tool_id = t.id
       WHERE c.id = ?`,
      [contractId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Contract not found', code: 404 });
    }

    const r = rows[0];
    res.json({
      id: r.id,
      tool_id: r.tool_id,
      tool_name: r.tool_name,
      file_name: r.file_name,
      file_path: r.file_path,
      parse_status: r.parse_status,
      parsed_auto_renewal: r.parsed_auto_renewal !== null ? !!r.parsed_auto_renewal : null,
      parsed_notice_period_days: r.parsed_notice_period_days,
      parsed_price_escalation_percent: r.parsed_price_escalation_percent ? parseFloat(r.parsed_price_escalation_percent) : null,
      parsed_penalty_clause: r.parsed_penalty_clause,
      parsed_support_sla: r.parsed_support_sla,
      parsed_termination_clause: r.parsed_termination_clause,
      groq_summary: r.groq_summary,
      uploaded_at: r.uploaded_at,
      uploaded_by: r.uploaded_by
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/contracts/upload — Upload contract PDF + trigger Groq parse
const uploadContract = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'No file uploaded', code: 400 });
    }

    const { tool_id, company_id } = req.body;

    if (!tool_id || !company_id) {
      return res.status(400).json({ error: true, message: 'tool_id and company_id are required', code: 400 });
    }