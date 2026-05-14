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

    // Insert contract record
    const [result] = await pool.execute(
        `INSERT INTO contracts (tool_id, company_id, file_name, file_path, parse_status, uploaded_by)
         VALUES (?, ?, ?, ?, 'pending', ?)`,
        [tool_id, company_id, req.file.originalname, req.file.path, req.user?.id || null]
      );
  
      const contractId = result.insertId;
  
      // Try to extract text from PDF and parse with Groq
      // For now, we handle text-based PDFs via raw body or extracted text
      let rawText = '';
      try {
        // Attempt to read raw text from the uploaded file
        // In production, use pdf-parse package to extract text
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        rawText = pdfData.text;
      } catch (pdfErr) {
        console.error('PDF text extraction failed:', pdfErr.message);
        // If pdf-parse is not installed or file is not text-extractable, mark as failed
        await pool.execute(
          "UPDATE contracts SET parse_status = 'failed', raw_text = 'PDF text extraction failed' WHERE id = ?",
          [contractId]
        );
        return res.status(201).json({
          success: true,
          contract_id: contractId,
          parse_status: 'failed',
          message: 'Contract uploaded but text extraction failed. Install pdf-parse package for PDF parsing.'
        });
      }
  
      // Store raw text
      await pool.execute('UPDATE contracts SET raw_text = ? WHERE id = ?', [rawText, contractId]);
  
      // Parse with Groq AI
      try {
        const parsed = await parseContractText(rawText);
  
        await pool.execute(
          `UPDATE contracts SET
           parsed_auto_renewal = ?, parsed_notice_period_days = ?,
           parsed_price_escalation_percent = ?, parsed_penalty_clause = ?,
           parsed_support_sla = ?, parsed_termination_clause = ?,
           groq_summary = ?, parse_status = 'parsed'
           WHERE id = ?`,
          [
            parsed.auto_renewal || false,
            parsed.notice_period_days || null,
            parsed.price_escalation_percent || null,
            parsed.penalty_clause || null,
            parsed.support_sla || null,
            parsed.termination_clause || null,
            parsed.summary || null,
            contractId
          ]
        );
  
        res.status(201).json({
          success: true,
          contract_id: contractId,
          parse_status: 'parsed',
          parsed,
          message: 'Contract uploaded and parsed successfully'
        });
      } catch (aiErr) {
        console.error('Groq contract parse failed:', aiErr.message);
        await pool.execute("UPDATE contracts SET parse_status = 'failed' WHERE id = ?", [contractId]);
        res.status(201).json({
          success: true,
          contract_id: contractId,
          parse_status: 'failed',
          message: 'Contract uploaded but AI parsing failed'
        });
      }
    } catch (err) {
      next(err);
    }
  };
  
  // DELETE /api/contracts/:contractId — Remove a contract
  const deleteContract = async (req, res, next) => {
    try {
      const { contractId } = req.params;
  
      // Get file path to delete from filesystem
      const [rows] = await pool.execute('SELECT file_path FROM contracts WHERE id = ?', [contractId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: true, message: 'Contract not found', code: 404 });
      }
  
      // Delete file if it exists
      if (rows[0].file_path) {
        try {
          fs.unlinkSync(rows[0].file_path);
        } catch (fsErr) {
          // File may already be deleted, continue
        }
      }
  
      await pool.execute('DELETE FROM contracts WHERE id = ?', [contractId]);
  
      res.json({ success: true, message: 'Contract deleted' });
    } catch (err) {
      next(err);
    }
  };
  
  module.exports = { getContracts, getContract, uploadContract, deleteContract };
  