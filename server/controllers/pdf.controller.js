const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { print } = require('pdf-to-printer');

// Uploads directory (inside server/uploads)
const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'pdfs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function getMonthlyUploadDir() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const monthDir = `${year}-${month}`;
  const monthlyDir = path.join(uploadsDir, monthDir);
  if (!fs.existsSync(monthlyDir)) {
    fs.mkdirSync(monthlyDir, { recursive: true });
    // console.log(`📁 [PDF] Created monthly folder: ${monthDir}`);
  }
  return monthlyDir;
}

function findPdfFile(fileName) {
  const mainPath = path.join(uploadsDir, fileName);
  if (fs.existsSync(mainPath)) return mainPath;
  
  const subdirs = fs.readdirSync(uploadsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  
  for (const sub of subdirs) {
    const filePath = path.join(uploadsDir, sub, fileName);
    if (fs.existsSync(filePath)) return filePath;
  }
  return null;
}

const templateDotsConfig = {
  mau_1: { full_name: '.......................................................', date_of_birth: '.......................', nation_no: '...............................', place_of_issue: '..................................', date_of_issue: '........................', address: '........................................', phone_number: '...............................', religion: '...............................', ethnicity: '...............................' },
  mau_4: { full_name: '&hellip;'.repeat(15), date_of_birth: '&hellip;'.repeat(10), nation_no: '&hellip;'.repeat(5), place_of_issue: '&hellip;'.repeat(12), date_of_issue: '&hellip;'.repeat(7), address: '&hellip;'.repeat(60), phone_number: '................................', religion: '...............................', ethnicity: '...............................' },
  mau_5: { full_name: '&hellip;'.repeat(10), date_of_birth: '&hellip;'.repeat(10), nation_no: '&hellip;'.repeat(9), place_of_issue: '&hellip;'.repeat(10), date_of_issue: '&hellip;'.repeat(7), address: '&hellip;'.repeat(60), phone_number: '................................', religion: '...............................', ethnicity: '...............................' },
  mau_7: { full_name: '&hellip;'.repeat(15), date_of_birth: '&hellip;'.repeat(10), nation_no: '&hellip;'.repeat(5), place_of_issue: '&hellip;'.repeat(10), date_of_issue: '&hellip;'.repeat(7), address: '&hellip;'.repeat(60), phone_number: '................................', religion: '...............................', ethnicity: '...............................' },
  mau_8: { full_name: '&hellip;'.repeat(30), date_of_birth: '&hellip;'.repeat(12), nation_no: '&hellip;'.repeat(24), place_of_issue: '&hellip;'.repeat(18), date_of_issue: '&hellip;'.repeat(8), address: '&hellip;'.repeat(70), phone_number: '................................', religion: '...............................', ethnicity: '...............................' },
  mau_nhht: { full_name: '&hellip;'.repeat(30), date_of_birth: '&hellip;'.repeat(24), nation_no: '&hellip;'.repeat(30), place_of_issue: '&hellip;'.repeat(18), date_of_issue: '&hellip;'.repeat(12), address: '&hellip;'.repeat(80), phone_number: '................................', religion: '...............................', ethnicity: '...............................' }
};

function processAllArrays(htmlContent, customerData) {
  let modifiedHtml = htmlContent;

  for (const [key, value] of Object.entries(customerData)) {
    if (!Array.isArray(value) || value.length === 0) continue;

    const arrayData = value;
    const keyUpper = key.toUpperCase();

    // =====================================================
    // ⭐ KIỂM TRA LOẠI ARRAY: primitives hay objects
    // =====================================================
    const isPrimitiveArray = typeof arrayData[0] !== 'object' || arrayData[0] === null;

    // =====================================================
    // ⭐ FORMAT ĐẶC BIỆT: ARRAY OF STRINGS/PRIMITIVES
    // =====================================================
    if (isPrimitiveArray) {
      // Join với separator " | " cho array of strings
      const joinedString = arrayData.join(' | ');
      modifiedHtml = modifiedHtml.replace(
        new RegExp(`\\{\\{${keyUpper}\\}\\}`, 'g'),
        joinedString
      );
      // console.log('SMS_SERVICES joined:', joinedString);
      continue; // Skip các FORMAT table cho objects
    }

    // =====================================================
    // FORMAT 1: TABLE ROWS với CSS tự động xuống dòng
    // =====================================================
    const tableRows = arrayData.map((item, index) => {
      const cells = Object.keys(item).map(field => {
        const cellValue = item[field] || '';
        return `<td style="border: 1px solid #000; padding: 8px; word-wrap: break-word; word-break: break-word; white-space: pre-line;">${cellValue}</td>`;
      }).join('');

      return `<tr>${cells}</tr>`;
    }).join('');

    modifiedHtml = modifiedHtml.replace(
      new RegExp(`\\{\\{${keyUpper}_TABLE_ROWS\\}\\}`, 'g'),
      tableRows
    );

    // =====================================================
    // FORMAT 2: TABLE HEADERS với CSS
    // =====================================================
    if (arrayData.length > 0) {
      const firstItem = arrayData[0];
      const tableHeaders = Object.keys(firstItem).map(field => {
        const headerName = field
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        return `<th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0; word-wrap: break-word; white-space: pre-line;">${headerName}</th>`;
      }).join('');

      modifiedHtml = modifiedHtml.replace(
        new RegExp(`\\{\\{${keyUpper}_TABLE_HEADERS\\}\\}`, 'g'),
        tableHeaders
      );
    }

    // =====================================================
    // FORMAT 3: FULL TABLE với CSS tự động xuống dòng
    // =====================================================
    if (arrayData.length > 0) {
      const firstItem = arrayData[0];
      const headers = Object.keys(firstItem).map(field => {
        const headerName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `<th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0; text-align: center; word-wrap: break-word; white-space: pre-line; vertical-align: middle;">${headerName}</th>`;
      }).join('');

      const rows = arrayData.map((item) => {
        const cells = Object.values(item).map(val => 
          `<td style="border: 1px solid #000; padding: 8px; word-wrap: break-word; word-break: break-word; white-space: pre-line; vertical-align: top;">${val || ''}</td>`
        ).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      const fullTable = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; table-layout: fixed;">
          <thead>
            <tr>${headers}</tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;

      modifiedHtml = modifiedHtml.replace(
        new RegExp(`\\{\\{${keyUpper}_FULL_TABLE\\}\\}`, 'g'),
        fullTable
      );
    }

    // =====================================================
    // FORMAT 4: ORDERED LIST
    // =====================================================
    const orderedList = `
      <ol style="line-height: 1.8;">
        ${arrayData.map(item => {
          const itemText = Object.entries(item)
            .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
            .join(', ');
          return `<li style="word-wrap: break-word; word-break: break-word;">${itemText}</li>`;
        }).join('')}
      </ol>
    `;

    modifiedHtml = modifiedHtml.replace(
      new RegExp(`\\{\\{${keyUpper}_ORDERED_LIST\\}\\}`, 'g'),
      orderedList
    );

    // =====================================================
    // FORMAT 5: CARD LIST
    // =====================================================
    const cardList = arrayData.map((item, index) => {
      const cardContent = Object.entries(item)
        .map(([k, v]) => `<p style="margin: 4px 0; word-wrap: break-word; word-break: break-word;"><strong>${k.replace(/_/g, ' ')}:</strong> ${v || 'N/A'}</p>`)
        .join('');
      
      return `
        <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; border-radius: 5px; background: #f9f9f9; word-wrap: break-word;">
          <h4 style="margin: 0 0 8px 0;">📋 ${key} #${index + 1}</h4>
          ${cardContent}
        </div>
      `;
    }).join('');

    modifiedHtml = modifiedHtml.replace(
      new RegExp(`\\{\\{${keyUpper}_CARD_LIST\\}\\}`, 'g'),
      cardList
    );

    // =====================================================
    // FORMAT 6: PLAIN TEXT
    // =====================================================
    const plainText = arrayData.map((item, i) => {
      const line = Object.entries(item)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      return `${i + 1}. ${line}`;
    }).join('\n');

    modifiedHtml = modifiedHtml.replace(
      new RegExp(`\\{\\{${keyUpper}_PLAIN_TEXT\\}\\}`, 'g'),
      plainText
    );

    // =====================================================
    // FORMAT 7: COUNT
    // =====================================================
    modifiedHtml = modifiedHtml.replace(
      new RegExp(`\\{\\{${keyUpper}_COUNT\\}\\}`, 'g'),
      arrayData.length
    );

    // =====================================================
    // FORMAT 8: JSON
    // =====================================================
    modifiedHtml = modifiedHtml.replace(
      new RegExp(`\\{\\{${keyUpper}_JSON\\}\\}`, 'g'),
      JSON.stringify(arrayData, null, 2)
    );

    // =====================================================
    // FORMAT 9: FIRST ITEM
    // =====================================================
    if (arrayData.length > 0) {
      const firstItem = arrayData[0];
      for (const [field, val] of Object.entries(firstItem)) {
        modifiedHtml = modifiedHtml.replace(
          new RegExp(`\\{\\{${keyUpper}_FIRST_${field.toUpperCase()}\\}\\}`, 'g'),
          val || ''
        );
      }
    }

    // =====================================================
    // FORMAT 10: INDEX ACCESS
    // =====================================================
    arrayData.forEach((item, idx) => {
      for (const [field, val] of Object.entries(item)) {
        modifiedHtml = modifiedHtml.replace(
          new RegExp(`\\{\\{${keyUpper}_${idx}_${field.toUpperCase()}\\}\\}`, 'g'),
          val || ''
        );
      }
    });
  }

  return modifiedHtml;
}

function replaceTemplateData(htmlContent, customerData, templateName) {
  let modifiedHtml = htmlContent;

  // Lấy config chấm
  const dotsConfig = templateDotsConfig[templateName] || templateDotsConfig['mau_1'];

  // 1. Xử lý giới tính
  const sexValue = customerData.SEX || customerData.sex || '';
  if (sexValue) {
    const sex = sexValue.toString().toLowerCase().trim();
    modifiedHtml = modifiedHtml
      .replace(/\{\{GENDER_NAM\}\}/g, (sex === 'nam' || sex === 'male') ? 'checked' : '')
      .replace(/\{\{GENDER_NU\}\}/g, (sex === 'nữ' || sex === 'nu' || sex === 'female') ? 'checked' : '');
  }

  // 2. ⭐ XỬ LÝ TẤT CẢ ARRAY TỰ ĐỘNG
  modifiedHtml = processAllArrays(modifiedHtml, customerData);

  // 3. Thay thế các trường cố định
  const fixedPairs = [
    ['NATION', 'nation'],
    ['EXPIRED_DATE', 'expired_date'],
    ['FULL_NAME', 'full_name'],
    ['DATE_OF_BIRTH', 'date_of_birth'],
    ['NATION_NO', 'nation_no'],
    ['PLACE_OF_ISSUE', 'place_of_issue'],
    ['DATE_OF_ISSUE', 'date_of_issue'],
    ['ADDRESS', 'address'],
    ['PHONE_NUMBER', 'phone_number'],
    ['ETHNICITY', 'ethnicity'],
    ['RELIGION', 'religion'],
    ['PLACE_OF_ISSUE_QR', 'place_of_issue_qr'],
    ['DATE_OF_ISSUE_QR', 'date_of_issue_qr'],
  ];

  for (const [placeholder, key] of fixedPairs) {
    if (customerData.hasOwnProperty(key)) {
      const value = customerData[key] ?? dotsConfig[key] ?? '';
      const re = new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g');
      modifiedHtml = modifiedHtml.replace(re, String(value));
    }
  }

  // 4. Tự động thay thế các trường còn lại (trừ array)
  for (const [key, value] of Object.entries(customerData)) {
    if (Array.isArray(value)) continue; // Đã xử lý ở bước 2
    const skippedKeys = fixedPairs.map(pair => pair[1]);
    if (skippedKeys.includes(key)) continue;

    const placeholder = `{{${key.toUpperCase()}}}`;
    const safeValue = (value !== null && value !== undefined) ? String(value) : '';
    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escapedPlaceholder, 'g');
    modifiedHtml = modifiedHtml.replace(re, safeValue);
  }

  return modifiedHtml;
}

// @route   GET /api/pdf/pdfs/:filename
// @desc    Serve PDF file
// @access  Public
exports.servePdf = (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = findPdfFile(filename);
    if (!filePath) return res.status(404).json({ error: 'PDF file not found' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendFile(filePath);
  } catch (e) {
    console.error('[PDF] serve error:', e);
    res.status(500).json({ error: 'Failed to serve PDF file' });
  }
};

// @route   GET /api/pdf/list-pdfs
// @desc    List PDF files by month
// @access  Public
exports.listPdfs = (req, res) => {
  try {
    const { month } = req.query;
    const targetDir = month ? path.join(uploadsDir, month) : getMonthlyUploadDir();
    
    if (!fs.existsSync(targetDir)) {
      return res.json({ success: true, month: month || 'current', files: [], message: 'No files found for this month' });
    }
    
    const files = fs.readdirSync(targetDir)
      .filter((f) => f.endsWith('.pdf'))
      .map((f) => {
        const fp = path.join(targetDir, f);
        const stats = fs.statSync(fp);
        return {
          fileName: f, filePath: fp, fileSize: stats.size, createdAt: stats.birthtime,
          pdfUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}/view-pdf/${f}`,
          directPdfUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}/pdfs/${f}`,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
    
    res.json({ success: true, month: month || 'current', directory: targetDir, fileCount: files.length, files });
  } catch (e) {
    console.error('[PDF] list error:', e);
    res.status(500).json({ error: 'Failed to list PDF files', details: e.message });
  }
};

// @route   POST /api/pdf/fill-template
// @desc    Fill template and generate PDF
// @access  Public
exports.fillTemplate = async (req, res) => {
  try {
    const { templateName, customerData = {} } = req.body || {};
    if (!templateName) return res.status(400).json({ error: 'templateName is required' });
    
    const htmlFileName = `${templateName}.html`;
    const htmlFilePath = path.join(__dirname, '..', '..', 'public', 'html', htmlFileName);
    // console.log('\nThư mục hiện tại:', __dirname);
    // console.log('Đường dẫn file HTML:', htmlFilePath);
    // console.log('File có tồn tại?:', require('fs').existsSync(htmlFilePath));
    if (!fs.existsSync(htmlFilePath)) {
      return res.status(404).json({ error: `Template file ${htmlFileName} not found` });
    }
    
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    if (Object.keys(customerData).length) {
      htmlContent = replaceTemplateData(htmlContent, customerData, templateName);
    }
    
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' } });
    await browser.close();
    
    const fileName = `pdf-${templateName}-${Date.now()}.pdf`;
    const monthlyDir = getMonthlyUploadDir();
    const filePath = path.join(monthlyDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    
    const hostBase = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    res.json({ 
      success: true, message: 'PDF generated successfully', template: templateName, customerData, fileName, filePath, 
      fileSize: pdfBuffer.length, pdfUrl: `${hostBase}/view-pdf/${fileName}`, directPdfUrl: `${hostBase}/pdfs/${fileName}` 
    });
  } catch (e) {
    console.error('[PDF] fill-template error:', e);
    res.status(500).json({ error: 'Failed to fill template', details: e.message });
  }
};

// @route   GET /api/pdf/view-pdf/:filename
// @desc    View PDF optimized for iframe
// @access  Public
exports.viewPdf = (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = findPdfFile(filename);
    if (!filePath) return res.status(404).json({ error: 'PDF file not found' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(filePath);
  } catch (e) {
    console.error('[PDF] view error:', e);
    res.status(500).json({ error: 'Failed to serve PDF file' });
  }
};

// @route   POST /api/pdf/convert-html-to-pdf
// @desc    Print an existing PDF by filename
// @access  Public
exports.convertHtmlToPdf = async (req, res) => {
  try {
    const { fileName, printOptions = {} } = req.body || {};
    if (!fileName) return res.status(400).json({ error: 'fileName is required' });
    
    const filePath = findPdfFile(fileName);
    if (!filePath) return res.status(404).json({ error: `PDF file ${fileName} not found in uploads directory` });
    
    try {
      const absolutePath = path.resolve(filePath);
      if (printOptions.printer) {
        await print(absolutePath, { printer: printOptions.printer });
      } else {
        await print(absolutePath);
      }
    } catch (printError) {
      return res.status(500).json({ error: 'Failed to print PDF file', details: printError.message, fileName });
    }
    
    const stats = fs.statSync(filePath);
    res.json({ 
      success: true, message: 'PDF file sent to printer successfully', fileName, filePath, fileSize: stats.size, 
      printStatus: 'sent_to_printer', pdfUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}/view-pdf/${fileName}`, 
      directPdfUrl: `${req.protocol}://${req.get('host')}${req.baseUrl}/pdfs/${fileName}` 
    });
  } catch (e) {
    console.error('[PDF] print error:', e);
    res.status(500).json({ error: 'Failed to print PDF file', details: e.message });
  }
};